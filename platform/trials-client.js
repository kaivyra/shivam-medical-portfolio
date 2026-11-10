/* KAIVYRA trials client (v5). Extends window.KVResearch with an advanced ClinicalTrials.gov API v2 layer.
 * Source: ClinicalTrials.gov API v2 (https://clinicaltrials.gov/api/v2). Registry data is submitted by sponsors and is not verified by KAIVYRA.
 * Everything here is either copied from the registry response or labelled as KAIVYRA-derived (rule-based).
 * The pure functions (query building, parsing, flags, statistics) have no DOM dependency and are unit-tested in node
 * (tests/trials-client.test.js). Only documented API parameters are used; the `fields` parameter is deliberately not used. */
(function (root) {
  'use strict';
  var R = root.KVResearch || {};
  var CTG = 'https://clinicaltrials.gov/api/v2';
  var NCT_RE = /^NCT\d{8}$/i, PMID_RE = /^\d{1,9}$/;
  var TTL = 24 * 3600 * 1000, MIN_GAP = 130, MAX_CACHE = 40, MAX_ENTRY = 300000, lastCall = 0;
  var DAY = 86400000;

  function arr(x) { return x == null ? [] : Array.isArray(x) ? x : [x]; }
  function str(x) { return x == null ? '' : String(x); }
  function clean(x, n) { return str(x).replace(/[\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n || 300); }

  /* ---------- enumerations (values are the registry's own enum names) ---------- */
  var STATUS = { RECRUITING: 'Recruiting', NOT_YET_RECRUITING: 'Not yet recruiting', ENROLLING_BY_INVITATION: 'Enrolling by invitation', ACTIVE_NOT_RECRUITING: 'Active, not recruiting', COMPLETED: 'Completed', TERMINATED: 'Terminated', WITHDRAWN: 'Withdrawn', SUSPENDED: 'Suspended', UNKNOWN: 'Unknown status' };
  var PHASES = [
    { code: 'EP1', label: 'Early Phase 1', all: ['EARLY_PHASE1'] }, { code: 'P1', label: 'Phase 1', all: ['PHASE1'] }, { code: 'P12', label: 'Phase 1/2', all: ['PHASE1', 'PHASE2'] },
    { code: 'P2', label: 'Phase 2', all: ['PHASE2'] }, { code: 'P23', label: 'Phase 2/3', all: ['PHASE2', 'PHASE3'] }, { code: 'P3', label: 'Phase 3', all: ['PHASE3'] },
    { code: 'P4', label: 'Phase 4', all: ['PHASE4'] }, { code: 'NA', label: 'Not applicable', all: ['NA'] }];
  var PHASE_BY = {}; PHASES.forEach(function (p) { PHASE_BY[p.code] = p; });
  var STUDY_TYPES = { INTERVENTIONAL: 'Interventional', OBSERVATIONAL: 'Observational', EXPANDED_ACCESS: 'Expanded access' };
  var ALLOCATIONS = { RANDOMIZED: 'Randomized', NON_RANDOMIZED: 'Non-randomized' };
  var INTERVENTION_TYPES = { DRUG: 'Drug', BIOLOGICAL: 'Biological', DEVICE: 'Device', PROCEDURE: 'Procedure', BEHAVIORAL: 'Behavioral', DIETARY_SUPPLEMENT: 'Dietary supplement', RADIATION: 'Radiation', GENETIC: 'Genetic', COMBINATION_PRODUCT: 'Combination product', DIAGNOSTIC_TEST: 'Diagnostic test', OTHER: 'Other' };
  var AGE_GROUPS = { CHILD: 'Child (birth to 17)', ADULT: 'Adult (18 to 64)', OLDER_ADULT: 'Older adult (65+)' };
  var SEXES = { FEMALE: 'Female', MALE: 'Male' };
  var SPONSOR_CLASSES = { INDUSTRY: 'Industry', NIH: 'NIH', FED: 'Other U.S. federal agency', NETWORK: 'Network', OTHER: 'Other (university, hospital, individual)' };
  var SORTS = { upd: ['LastUpdatePostDate:desc', 'Last update posted (newest)'], enr: ['EnrollmentCount:desc', 'Enrollment (largest first)'], start: ['StartDate:desc', 'Start date (newest)'] };
  var PAGE_SIZES = [10, 20, 50], DEFAULT_PS = 20;
  var LABEL_OVERRIDE = { NA: 'Not applicable', NON_RANDOMIZED: 'Non-randomized', NONE: 'None (open label)', NIH: 'NIH', FED: 'Other U.S. federal agency', OTHER_GOV: 'Other government', INDIV: 'Individual', AMBIG: 'Ambiguous', UNKNOWN: 'Unknown', INDUSTRY: 'Industry', OLDER_ADULT: 'Older adult', BACKGROUND: 'Background', RESULT: 'Result', DERIVED: 'Derived', EARLY_PHASE1: 'Early Phase 1' };
  function enumLabel(x) {
    x = str(x); if (!x) return ''; if (STATUS[x]) return STATUS[x]; if (LABEL_OVERRIDE[x]) return LABEL_OVERRIDE[x];
    var s = x.replace(/_/g, ' ').toLowerCase(); return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function phaseLabel(phases) {
    var p = arr(phases).filter(Boolean); if (!p.length) return 'Phase not listed';
    if (p.length === 1) { var x = p[0]; if (x === 'NA') return 'Not applicable'; if (x === 'EARLY_PHASE1') return 'Early Phase 1'; var m = /^PHASE(\d)$/.exec(x); return m ? 'Phase ' + m[1] : enumLabel(x); }
    var nums = p.map(function (x) { var m = /^PHASE(\d)$/.exec(x); return m ? m[1] : null; });
    if (nums.every(Boolean)) return 'Phase ' + nums.join('/');
    return p.map(enumLabel).join(' / ');
  }

  /* ---------- search state <-> URL <-> API query ---------- */
  function isoDate(s) {
    s = str(s).trim(); var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s); if (!m) return '';
    var y = +m[1], mo = +m[2], d = +m[3], t = new Date(Date.UTC(y, mo - 1, d));
    return (y >= 1900 && y <= 2100 && t.getUTCFullYear() === y && t.getUTCMonth() === mo - 1 && t.getUTCDate() === d) ? s : '';
  }
  function pick(list, allowed) { var out = []; arr(list).forEach(function (v) { v = str(v).trim(); if (allowed.indexOf(v) >= 0 && out.indexOf(v) < 0) out.push(v); }); return out; }
  function one(v, allowed) { v = str(v).trim(); return allowed.indexOf(v) >= 0 ? v : ''; }
  function emptyState() { return sanitize({}); }
  function sanitize(s) {
    s = s || {}; var ps = parseInt(s.pageSize, 10);
    return {
      cond: clean(s.cond, 200), intr: clean(s.intr, 200), locn: clean(s.locn, 120), term: clean(s.term, 300),
      status: pick(s.status, Object.keys(STATUS)), phases: pick(s.phases, PHASES.map(function (p) { return p.code; })),
      studyType: one(s.studyType, Object.keys(STUDY_TYPES)), alloc: one(s.alloc, Object.keys(ALLOCATIONS)),
      itype: pick(s.itype, Object.keys(INTERVENTION_TYPES)), ages: pick(s.ages, Object.keys(AGE_GROUPS)), sex: one(s.sex, Object.keys(SEXES)),
      healthy: s.healthy === true || s.healthy === '1' || s.healthy === 1, hasResults: s.hasResults === true || s.hasResults === '1' || s.hasResults === 1,
      sponsor: pick(s.sponsor, Object.keys(SPONSOR_CLASSES)),
      startFrom: isoDate(s.startFrom), startTo: isoDate(s.startTo), pcFrom: isoDate(s.pcFrom), pcTo: isoDate(s.pcTo), upd: isoDate(s.upd),
      sort: one(s.sort, Object.keys(SORTS)), pageSize: PAGE_SIZES.indexOf(ps) >= 0 ? ps : DEFAULT_PS, view: s.view === 'table' ? 'table' : 'cards'
    };
  }
  function stateFromParams(p) {
    function list(k) { var v = p.get(k); return v ? v.split(',').map(function (x) { return x.trim(); }).filter(Boolean) : []; }
    return sanitize({ cond: p.get('cond'), intr: p.get('intr'), locn: p.get('locn'), term: p.get('term'), status: list('st'), phases: list('ph'), studyType: p.get('ty'), alloc: p.get('al'), itype: list('it'), ages: list('ag'), sex: p.get('sx'),
      healthy: p.get('hv') === '1', hasResults: p.get('res') === '1', sponsor: list('sp'), startFrom: p.get('sfrom'), startTo: p.get('sto'), pcFrom: p.get('pcfrom'), pcTo: p.get('pcto'), upd: p.get('upd'), sort: p.get('sort'), pageSize: p.get('ps'), view: p.get('view') });
  }
  function stateToParams(s) {
    s = sanitize(s); var p = new URLSearchParams();
    ['cond', 'intr', 'locn', 'term'].forEach(function (k) { if (s[k]) p.set(k, s[k]); });
    if (s.status.length) p.set('st', s.status.join(',')); if (s.phases.length) p.set('ph', s.phases.join(','));
    if (s.studyType) p.set('ty', s.studyType); if (s.alloc) p.set('al', s.alloc); if (s.itype.length) p.set('it', s.itype.join(',')); if (s.ages.length) p.set('ag', s.ages.join(','));
    if (s.sex) p.set('sx', s.sex); if (s.healthy) p.set('hv', '1'); if (s.hasResults) p.set('res', '1'); if (s.sponsor.length) p.set('sp', s.sponsor.join(','));
    if (s.startFrom) p.set('sfrom', s.startFrom); if (s.startTo) p.set('sto', s.startTo); if (s.pcFrom) p.set('pcfrom', s.pcFrom); if (s.pcTo) p.set('pcto', s.pcTo); if (s.upd) p.set('upd', s.upd);
    if (s.sort) p.set('sort', s.sort); if (s.pageSize !== DEFAULT_PS) p.set('ps', String(s.pageSize)); if (s.view === 'table') p.set('view', 'table');
    return p;
  }
  function hasFilters(s) { s = sanitize(s); return !!(s.status.length || s.phases.length || s.studyType || s.alloc || s.itype.length || s.ages.length || s.sex || s.healthy || s.hasResults || s.sponsor.length || s.startFrom || s.startTo || s.pcFrom || s.pcTo || s.upd); }
  function hasCriteria(s) { s = sanitize(s); return !!(s.cond || s.intr || s.locn || s.term || hasFilters(s)); }
  function advancedCount(s) { s = sanitize(s); return [s.phases.length, s.studyType, s.alloc, s.itype.length, s.ages.length, s.sex, s.healthy, s.hasResults, s.sponsor.length, s.startFrom || s.startTo, s.pcFrom || s.pcTo, s.upd].filter(Boolean).length; }

  function orArea(field, vals) { return vals.length > 1 ? 'AREA[' + field + ']' + '(' + vals.join(' OR ') + ')' : 'AREA[' + field + ']' + vals[0]; }
  function range(field, from, to) { return (from || to) ? 'AREA[' + field + ']RANGE[' + (from || 'MIN') + ',' + (to || 'MAX') + ']' : null; }
  /* Essie expressions for filter.advanced. Only whitelisted enum values and validated ISO dates ever reach this string. */
  function essieList(s) {
    s = sanitize(s); var ex = [];
    if (s.phases.length) {
      var ph = s.phases.map(function (c) { var p = PHASE_BY[c]; return p.all.length > 1 ? '(' + p.all.map(function (v) { return 'AREA[Phase]' + v; }).join(' AND ') + ')' : 'AREA[Phase]' + p.all[0]; });
      ex.push(ph.length > 1 ? '(' + ph.join(' OR ') + ')' : ph[0]);
    }
    if (s.studyType) ex.push('AREA[StudyType]' + s.studyType);
    if (s.alloc) ex.push('AREA[DesignAllocation]' + s.alloc);
    if (s.itype.length) ex.push(orArea('InterventionType', s.itype));
    if (s.ages.length) ex.push(orArea('StdAge', s.ages));
    if (s.sex) ex.push('AREA[Sex](' + s.sex + ' OR ALL)');
    if (s.healthy) ex.push('AREA[HealthyVolunteers]true');
    if (s.hasResults) ex.push('AREA[HasResults]true');
    if (s.sponsor.length) ex.push(orArea('LeadSponsorClass', s.sponsor));
    [range('StartDate', s.startFrom, s.startTo), range('PrimaryCompletionDate', s.pcFrom, s.pcTo), range('LastUpdatePostDate', s.upd, '')].forEach(function (r) { if (r) ex.push(r); });
    return ex;
  }
  function buildUrl(s, token) {
    s = sanitize(s); var p = [];
    if (s.term) p.push('query.term=' + encodeURIComponent(s.term));
    if (s.cond) p.push('query.cond=' + encodeURIComponent(s.cond));
    if (s.intr) p.push('query.intr=' + encodeURIComponent(s.intr));
    if (s.locn) p.push('query.locn=' + encodeURIComponent(s.locn));
    if (s.status.length) p.push('filter.overallStatus=' + encodeURIComponent(s.status.join(',')));
    var ex = essieList(s); if (ex.length) p.push('filter.advanced=' + encodeURIComponent(ex.join(' AND ')));
    if (s.sort) p.push('sort=' + encodeURIComponent(SORTS[s.sort][0]));
    p.push('pageSize=' + s.pageSize); p.push('countTotal=true');
    if (token) p.push('pageToken=' + encodeURIComponent(token));
    return CTG + '/studies?' + p.join('&');
  }
  var CHIP_LABELS = { cond: 'Condition', intr: 'Intervention', locn: 'Location', term: 'Terms', st: 'Status', ph: 'Phase', ty: 'Study type', al: 'Allocation', it: 'Intervention type', ag: 'Age group', sx: 'Sex', hv: 'Healthy volunteers', res: 'Results', sp: 'Lead sponsor class', sfrom: 'Start from', sto: 'Start to', pcfrom: 'Primary completion from', pcto: 'Primary completion to', upd: 'Updated since' };
  function describeChips(s) {
    s = sanitize(s); var c = [];
    function add(key, val, text) { c.push({ key: key, val: val, text: CHIP_LABELS[key] + ': ' + text }); }
    ['cond', 'intr', 'locn', 'term'].forEach(function (k) { if (s[k]) add(k, s[k], s[k]); });
    s.status.forEach(function (v) { add('st', v, STATUS[v]); }); s.phases.forEach(function (v) { add('ph', v, PHASE_BY[v].label); });
    if (s.studyType) add('ty', s.studyType, STUDY_TYPES[s.studyType]); if (s.alloc) add('al', s.alloc, ALLOCATIONS[s.alloc]);
    s.itype.forEach(function (v) { add('it', v, INTERVENTION_TYPES[v]); }); s.ages.forEach(function (v) { add('ag', v, AGE_GROUPS[v]); });
    if (s.sex) add('sx', s.sex, SEXES[s.sex]); if (s.healthy) add('hv', '1', 'accepted'); if (s.hasResults) add('res', '1', 'posted');
    s.sponsor.forEach(function (v) { add('sp', v, SPONSOR_CLASSES[v]); });
    if (s.startFrom) add('sfrom', s.startFrom, s.startFrom); if (s.startTo) add('sto', s.startTo, s.startTo);
    if (s.pcFrom) add('pcfrom', s.pcFrom, s.pcFrom); if (s.pcTo) add('pcto', s.pcTo, s.pcTo); if (s.upd) add('upd', s.upd, s.upd);
    return c;
  }
  function removeFilter(s, key, val) {
    s = sanitize(s);
    var arrays = { st: 'status', ph: 'phases', it: 'itype', ag: 'ages', sp: 'sponsor' }, scalar = { cond: 'cond', intr: 'intr', locn: 'locn', term: 'term', ty: 'studyType', al: 'alloc', sx: 'sex', sfrom: 'startFrom', sto: 'startTo', pcfrom: 'pcFrom', pcto: 'pcTo', upd: 'upd' };
    if (arrays[key]) s[arrays[key]] = s[arrays[key]].filter(function (v) { return v !== val; });
    else if (scalar[key]) s[scalar[key]] = '';
    else if (key === 'hv') s.healthy = false; else if (key === 'res') s.hasResults = false;
    return s;
  }
  function clearAll(s) { var e = emptyState(); e.sort = sanitize(s).sort; e.pageSize = sanitize(s).pageSize; e.view = sanitize(s).view; return e; }
  function searchLabel(s) {
    var c = describeChips(s).map(function (x) { return x.key === 'cond' || x.key === 'intr' || x.key === 'locn' || x.key === 'term' ? x.val : x.text.replace(/^[^:]+:\s*/, ''); });
    return ('Trials: ' + (c.join(' · ') || 'all studies')).slice(0, 160);
  }

  /* ---------- dates, data-quality flags ---------- */
  /* Registry dates can be 'YYYY', 'YYYY-MM' or 'YYYY-MM-DD'. start/end are the first and last instants of the period. */
  function parseRegDate(x) {
    x = str(x).trim(); var m = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(x); if (!m) return null;
    var y = +m[1], mo = m[2] ? +m[2] : null, d = m[3] ? +m[3] : null; if (mo !== null && (mo < 1 || mo > 12)) return null;
    var start = Date.UTC(y, mo ? mo - 1 : 0, d || 1), end;
    if (d) { var chk = new Date(start); if (chk.getUTCMonth() !== mo - 1) return null; end = start + DAY - 1; } else if (mo) end = Date.UTC(y, mo, 1) - 1; else end = Date.UTC(y + 1, 0, 1) - 1;
    return { text: x, start: start, end: end, mid: Math.round((start + end) / 2), precision: d ? 'day' : mo ? 'month' : 'year' };
  }
  function ymd(ts) { return new Date(ts).toISOString().slice(0, 10); }
  function qualityFlags(t, now) {
    now = now == null ? Date.now() : now; var f = [], st = t.status, pc = parseRegDate(t.primaryCompletion), sd = parseRegDate(t.start), cd = parseRegDate(t.completion);
    function add(id, label, rule, sev) { f.push({ id: id, label: label, rule: rule, severity: sev || 'warn' }); }
    if ((st === 'RECRUITING' || st === 'ENROLLING_BY_INVITATION') && pc && pc.end < now)
      add('stale-recruiting', 'Listed as ' + enumLabel(st).toLowerCase() + ' but the primary completion date has passed', 'Rule: overall status is Recruiting or Enrolling by invitation and the registered primary completion date (' + pc.text + ') is already in the past. The record may not have been updated.');
    if (st === 'NOT_YET_RECRUITING' && sd && sd.end < now)
      add('stale-not-yet', 'Listed as not yet recruiting but the start date has passed', 'Rule: overall status is Not yet recruiting and the registered start date (' + sd.text + ') is already in the past. The record may not have been updated.');
    var ref = cd || pc;
    if (st === 'COMPLETED' && !t.hasResults && ref && now - ref.end > 365 * DAY)
      add('completed-no-results', 'Completed more than 12 months ago with no results posted in the registry', 'Rule: overall status is Completed, no results are posted, and the ' + (cd ? 'study completion' : 'primary completion') + ' date (' + ref.text + ') is more than 12 months ago. Reporting requirements and timing vary by jurisdiction and study type, and results may exist elsewhere (for example in a journal).', 'info');
    if (st === 'UNKNOWN') add('status-unknown', 'Status unknown', 'Rule: the registry lists this study as "Unknown status". ClinicalTrials.gov uses that value for a study last known to be recruiting, not yet recruiting or enrolling by invitation whose completion date has passed and whose status has not been verified within the past 2 years. Current status is therefore not known.');
    if (st === 'TERMINATED' || st === 'WITHDRAWN' || st === 'SUSPENDED')
      add('stopped', enumLabel(st) + (t.whyStopped ? ': ' + t.whyStopped : ': no reason registered'), 'Rule: overall status is Terminated, Withdrawn or Suspended. The reason shown is the sponsor-registered "why stopped" text, if any.', 'info');
    if (sd && pc && pc.end < sd.start) add('dates-order', 'Primary completion date is earlier than the start date', 'Rule: the registered primary completion date (' + pc.text + ') is before the registered start date (' + sd.text + '). One of the dates may be an entry error.');
    return f;
  }

  /* ---------- normalisation (superset of KVResearch.normalizeCtg; every module may be absent) ---------- */
  function outc(o) { o = o || {}; return { measure: str(o.measure), description: str(o.description), time: str(o.timeFrame) }; }
  function normalize(s) {
    s = s || {}; var ps = s.protocolSection || {}, id = ps.identificationModule || {}, st = ps.statusModule || {}, sp = ps.sponsorCollaboratorsModule || {}, ds = ps.descriptionModule || {}, cm = ps.conditionsModule || {},
      dm = ps.designModule || {}, am = ps.armsInterventionsModule || {}, om = ps.outcomesModule || {}, el = ps.eligibilityModule || {}, cl = ps.contactsLocationsModule || {}, rf = ps.referencesModule || {},
      ip = ps.ipdSharingStatementModule || {}, ov = ps.oversightModule || {}, dv = s.derivedSection || {}, di = dm.designInfo || {}, mk = di.maskingInfo || {}, rp = sp.responsibleParty || {};
    var nct = str(id.nctId).toUpperCase(), en = dm.enrollmentInfo || {}, cnt = en.count != null && isFinite(Number(en.count)) ? Number(en.count) : null;
    function ds2(k) { var d = st[k]; return d && d.date ? { date: str(d.date), type: str(d.type) } : { date: null, type: '' }; }
    var sdt = ds2('startDateStruct'), pdt = ds2('primaryCompletionDateStruct'), cdt = ds2('completionDateStruct');
    var t = {
      nct: nct, link: NCT_RE.test(nct) ? 'https://clinicaltrials.gov/study/' + nct : null, title: id.briefTitle || null, officialTitle: id.officialTitle || null, acronym: id.acronym || null,
      orgStudyId: (id.orgStudyIdInfo && id.orgStudyIdInfo.id) || null, orgName: (id.organization && id.organization.fullName) || null,
      status: st.overallStatus || null, statusLabel: STATUS[st.overallStatus] || st.overallStatus || null, lastKnownStatus: st.lastKnownStatus || null, whyStopped: st.whyStopped || null, verifiedDate: st.statusVerifiedDate || null,
      start: sdt.date, startType: sdt.type, primaryCompletion: pdt.date, primaryCompletionType: pdt.type, completion: cdt.date, completionType: cdt.type,
      firstSubmitted: st.studyFirstSubmitDate || null, firstPosted: (st.studyFirstPostDateStruct && st.studyFirstPostDateStruct.date) || null,
      resultsFirstPosted: (st.resultsFirstPostDateStruct && st.resultsFirstPostDateStruct.date) || null, lastUpdate: (st.lastUpdatePostDateStruct && st.lastUpdatePostDateStruct.date) || null,
      sponsor: (sp.leadSponsor && sp.leadSponsor.name) || null, sponsorClass: (sp.leadSponsor && sp.leadSponsor.class) || null,
      collaborators: arr(sp.collaborators).map(function (c) { return { name: str(c && c.name), cls: str(c && c.class) }; }).filter(function (c) { return c.name; }),
      responsible: rp.type ? { type: str(rp.type), name: str(rp.investigatorFullName), title: str(rp.investigatorTitle), affiliation: str(rp.investigatorAffiliation) } : null,
      dmc: ov.oversightHasDmc === true ? true : ov.oversightHasDmc === false ? false : null,
      summary: ds.briefSummary || null, detailed: ds.detailedDescription || null, conditions: arr(cm.conditions).map(str), keywords: arr(cm.keywords).map(str),
      studyType: dm.studyType || null, phases: arr(dm.phases).map(str), enrollment: cnt, enrollmentType: en.type || null,
      design: { allocation: di.allocation || null, model: di.interventionModel || null, modelDescription: di.interventionModelDescription || null, primaryPurpose: di.primaryPurpose || null,
        observationalModel: di.observationalModel || null, timePerspective: di.timePerspective || null, masking: mk.masking || null, maskingDescription: mk.maskingDescription || null, whoMasked: arr(mk.whoMasked).map(str) },
      arms: arr(am.armGroups).map(function (a) { a = a || {}; return { label: str(a.label), type: str(a.type), description: str(a.description), interventions: arr(a.interventionNames).map(str) }; }),
      interventions: arr(am.interventions).map(function (i) { i = i || {}; return { type: str(i.type), name: str(i.name), description: str(i.description), arms: arr(i.armGroupLabels).map(str), otherNames: arr(i.otherNames).map(str) }; }),
      primaryOutcomes: arr(om.primaryOutcomes).map(outc), secondaryOutcomes: arr(om.secondaryOutcomes).map(outc), otherOutcomes: arr(om.otherOutcomes).map(outc),
      eligibility: { criteria: el.eligibilityCriteria || null, minAge: el.minimumAge || null, maxAge: el.maximumAge || null, sex: el.sex || null, healthy: el.healthyVolunteers, stdAges: arr(el.stdAges).map(str), population: el.studyPopulation || null, sampling: el.samplingMethod || null },
      contacts: arr(cl.centralContacts).map(function (c) { c = c || {}; return { name: str(c.name), role: str(c.role), phone: str(c.phone), email: str(c.email) }; }),
      officials: arr(cl.overallOfficials).map(function (o) { o = o || {}; return { name: str(o.name), affiliation: str(o.affiliation), role: str(o.role) }; }),
      locations: arr(cl.locations).map(function (l) { l = l || {}; return { facility: str(l.facility), city: str(l.city), state: str(l.state), country: str(l.country), status: str(l.status) }; }),
      references: arr(rf.references).map(function (r) { r = r || {}; return { pmid: str(r.pmid), type: str(r.type), citation: str(r.citation) }; }).filter(function (r) { return r.citation || r.pmid; }),
      seeAlso: arr(rf.seeAlsoLinks).map(function (l) { l = l || {}; return { label: str(l.label), url: str(l.url) }; }).filter(function (l) { return /^https?:\/\//i.test(l.url); }),
      ipd: ip.ipdSharing ? { sharing: str(ip.ipdSharing), description: str(ip.description), infoTypes: arr(ip.infoTypes).map(str), timeFrame: str(ip.timeFrame), accessCriteria: str(ip.accessCriteria), url: /^https?:\/\//i.test(str(ip.url)) ? str(ip.url) : '' } : null,
      meshConditions: arr(dv.conditionBrowseModule && dv.conditionBrowseModule.meshes).map(function (m) { return str(m && m.term); }).filter(Boolean),
      meshInterventions: arr(dv.interventionBrowseModule && dv.interventionBrowseModule.meshes).map(function (m) { return str(m && m.term); }).filter(Boolean),
      hasResults: !!s.hasResults, resultsSection: s.resultsSection || null
    };
    t.flags = qualityFlags(t);
    return t;
  }

  /* ---------- eligibility parsing: split only when explicit headings exist; otherwise return the raw text ---------- */
  function splitItems(seg) {
    var items = [], bullet = /^\s*(?:[*\u2022\u2013\u2014-]|\d{1,2}[.)])\s+(.*)$/, open = false;
    str(seg).split(/\r?\n/).forEach(function (line) {
      if (!line.trim()) { open = false; return; }
      var b = bullet.exec(line);
      if (b) { items.push(b[1].trim()); open = true; }
      else if (open && items.length) items[items.length - 1] += ' ' + line.trim();
      else { items.push(line.trim()); open = true; }
    });
    return items.filter(Boolean);
  }
  function parseEligibility(text) {
    var raw = str(text), out = { parsed: false, raw: raw, inclusion: [], exclusion: [], preamble: '' };
    if (!raw.trim()) return out;
    var re = /(^|\n)[ \t]*(?:key[ \t]+)?(inclusion|exclusion)[ \t]+criteria\b[ \t]*:?[ \t]*/gi, marks = [], m;
    while ((m = re.exec(raw))) marks.push({ kind: m[2].toLowerCase(), start: m.index + m[1].length, end: re.lastIndex });
    if (!marks.length) return out;
    out.preamble = raw.slice(0, marks[0].start).trim();
    marks.forEach(function (mk, i) { var items = splitItems(raw.slice(mk.end, i + 1 < marks.length ? marks[i + 1].start : raw.length)); (mk.kind === 'inclusion' ? out.inclusion : out.exclusion).push.apply(out[mk.kind === 'inclusion' ? 'inclusion' : 'exclusion'], items); });
    out.parsed = out.inclusion.length + out.exclusion.length > 0;
    return out;
  }

  /* ---------- locations ---------- */
  function groupLocations(locs) {
    var by = Object.create(null), order = [];
    arr(locs).forEach(function (l) { var c = str(l.country).trim() || 'Country not listed'; if (!by[c]) { by[c] = { country: c, n: 0, recruiting: 0, sites: [] }; order.push(c); } by[c].n++; if (l.status === 'RECRUITING') by[c].recruiting++; by[c].sites.push(l); });
    return order.map(function (c) { return by[c]; }).sort(function (a, b) { return b.n - a.n || a.country.localeCompare(b.country); });
  }
  function countryCount(t) { var s = Object.create(null); arr(t.locations).forEach(function (l) { if (str(l.country).trim()) s[l.country.trim()] = 1; }); return Object.keys(s).length; }

  /* ---------- timeline layout (pure; rendered by the detail page) ---------- */
  function timelineModel(t, now, width) {
    now = now == null ? Date.now() : now; width = width || 720; var pad = 48, pts = [];
    [['start', 'Start', t.start, t.startType], ['pc', 'Primary completion', t.primaryCompletion, t.primaryCompletionType], ['end', 'Study completion', t.completion, t.completionType]].forEach(function (a) {
      var d = parseRegDate(a[2]); if (d) pts.push({ key: a[0], label: a[1], text: d.text, precision: d.precision, type: a[3] || '', ts: d.mid, from: d.start, to: d.end });
    });
    var ts = pts.map(function (p) { return p.ts; }).concat([now]), min = Math.min.apply(null, ts), max = Math.max.apply(null, ts);
    if (max - min < 30 * DAY) { min -= 30 * DAY; max += 30 * DAY; }
    function x(v) { return Math.round((pad + (v - min) / (max - min) * (width - 2 * pad)) * 10) / 10; }
    pts.forEach(function (p) { p.x = x(p.ts); p.x1 = x(p.from); p.x2 = x(p.to); });
    var y1 = new Date(min).getUTCFullYear(), y2 = new Date(max).getUTCFullYear(), maxT = Math.max(2, Math.floor((width - 2 * pad) / 64)), step = Math.max(1, Math.ceil((y2 - y1 + 1) / maxT)), ticks = [];
    for (var y = y1; y <= y2 + 1; y += step) { var tt = Date.UTC(y, 0, 1); if (tt >= min && tt <= max) ticks.push({ x: x(tt), label: String(y) }); }
    return { points: pts, todayX: x(now), todayText: ymd(now), drawable: pts.length >= 1, width: width, pad: pad, min: min, max: max, ticks: ticks };
  }

  /* ---------- page statistics, CSV rows, comparison rows, related links ---------- */
  function median(a) { if (!a.length) return null; var s = a.slice().sort(function (x, y) { return x - y; }), m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
  function tally(list, keyFn, labelFn, limit) {
    var c = Object.create(null), order = []; list.forEach(function (x) { var k = keyFn(x); if (k == null || k === '') return; if (!(k in c)) { c[k] = 0; order.push(k); } c[k]++; });
    var r = order.map(function (k) { return { k: k, label: labelFn ? labelFn(k) : k, n: c[k] }; }).sort(function (a, b) { return b.n - a.n || String(a.label).localeCompare(String(b.label)); });
    return limit ? r.slice(0, limit) : r;
  }
  function pageStats(trials) {
    trials = arr(trials); var en = trials.map(function (t) { return t.enrollment; }).filter(function (v) { return typeof v === 'number' && isFinite(v); }), cset = Object.create(null);
    var countryList = []; trials.forEach(function (t) { var seen = Object.create(null); arr(t.locations).forEach(function (l) { var c = str(l.country).trim(); if (c && !seen[c]) { seen[c] = 1; countryList.push(c); } }); });
    countryList.forEach(function (c) { cset[c] = 1; });
    return {
      n: trials.length, statuses: tally(trials, function (t) { return t.status || 'NOT_LISTED'; }, function (k) { return k === 'NOT_LISTED' ? 'Status not listed' : (STATUS[k] || k); }),
      phases: tally(trials, function (t) { return phaseLabel(t.phases); }), enrollment: { n: en.length, median: median(en), min: en.length ? Math.min.apply(null, en) : null, max: en.length ? Math.max.apply(null, en) : null },
      sponsors: tally(trials, function (t) { return t.sponsor; }, null, 5), countries: tally(countryList, function (c) { return c; }, null, 8), countryTotal: Object.keys(cset).length,
      withResults: trials.filter(function (t) { return t.hasResults; }).length
    };
  }
  function interventionNames(t) { return arr(t.interventions).map(function (i) { return i.name; }).filter(Boolean); }
  function csvRows(trials) {
    var head = ['NCT ID', 'Title', 'Status', 'Phase', 'Study type', 'Allocation', 'Masking', 'Enrollment', 'Enrollment type', 'Lead sponsor', 'Sponsor class', 'Conditions', 'Interventions', 'Countries', 'Start', 'Primary completion', 'Completion', 'Last update posted', 'Results posted', 'Registry data notes (KAIVYRA-derived)', 'Registry URL'];
    return [head].concat(arr(trials).map(function (t) {
      var d = t.design || {};
      return [t.nct, t.title || '', t.statusLabel || '', phaseLabel(t.phases), enumLabel(t.studyType), enumLabel(d.allocation), enumLabel(d.masking), t.enrollment == null ? '' : t.enrollment, enumLabel(t.enrollmentType), t.sponsor || '', enumLabel(t.sponsorClass),
        arr(t.conditions).join('; '), interventionNames(t).join('; '), countryCount(t), t.start || '', t.primaryCompletion || '', t.completion || '', t.lastUpdate || '', t.hasResults ? 'Yes' : 'No', qualityFlags(t).map(function (f) { return f.label; }).join(' | '), t.link || ''];
    }));
  }
  function compareRows(trials) {
    trials = arr(trials);
    function row(label, fn) { return { label: label, cells: trials.map(function (t) { var v = fn(t); return v == null || v === '' ? 'Not listed' : String(v); }) }; }
    return [
      row('Status', function (t) { return t.statusLabel; }), row('Phase', function (t) { return phaseLabel(t.phases); }), row('Study type', function (t) { return enumLabel(t.studyType); }),
      row('Allocation', function (t) { return enumLabel(t.design && t.design.allocation); }), row('Intervention model', function (t) { return enumLabel(t.design && t.design.model); }),
      row('Masking', function (t) { var d = t.design || {}; return d.masking ? enumLabel(d.masking) + (d.whoMasked && d.whoMasked.length ? ' (' + d.whoMasked.map(enumLabel).join(', ') + ')' : '') : ''; }),
      row('Enrollment', function (t) { return t.enrollment == null ? '' : t.enrollment.toLocaleString('en-US') + (t.enrollmentType ? ' (' + t.enrollmentType.toLowerCase() + ')' : ''); }),
      row('Start', function (t) { return t.start; }), row('Primary completion', function (t) { return t.primaryCompletion; }), row('Study completion', function (t) { return t.completion; }),
      row('Lead sponsor', function (t) { return t.sponsor ? t.sponsor + (t.sponsorClass ? ' (' + enumLabel(t.sponsorClass) + ')' : '') : ''; }),
      row('Conditions', function (t) { return arr(t.conditions).join('; '); }), row('Interventions', function (t) { return interventionNames(t).join('; '); }),
      row('Primary outcomes', function (t) { return arr(t.primaryOutcomes).map(function (o) { return o.measure + (o.time ? ' (' + o.time + ')' : ''); }).join('; '); }),
      row('Sites / countries', function (t) { return arr(t.locations).length ? arr(t.locations).length + ' sites in ' + countryCount(t) + ' countries' : ''; }),
      row('Results posted', function (t) { return t.hasResults ? 'Yes' : 'No'; }),
      row('Registry data notes', function (t) { return qualityFlags(t).map(function (f) { return f.label; }).join('; ') || 'None'; })
    ];
  }
  function quoteTerm(s) { return '"' + clean(s, 80).replace(/["\\]/g, '') + '"'; }
  function relatedQuery(t) {
    var c = arr(t.conditions)[0], i = interventionNames(t)[0], parts = [];
    if (c) parts.push(quoteTerm(c)); if (i) parts.push(quoteTerm(i.replace(/\s*\([^)]*\)\s*/g, ' ')));
    return parts.filter(function (p) { return p !== '""'; }).join(' AND ');
  }
  function relatedUrl(t) { var q = relatedQuery(t); return q ? '/research/?q=' + encodeURIComponent(q) : null; }
  function aiLabUrl(t) {
    var c = clean(arr(t.conditions)[0], 80), i = clean((interventionNames(t)[0] || '').replace(/\s*\([^)]*\)\s*/g, ' '), 80);
    if (!c && !i) return null; var q = i && c ? 'What does the evidence say about ' + i + ' in ' + c + '?' : 'What does the evidence say about ' + (i || c) + '?';
    return '/ai-lab/?q=' + encodeURIComponent(q);
  }

  /* ---------- results section summary (defensive; sponsor-reported, structure only) ---------- */
  function groupMap(list) { var m = Object.create(null), out = []; arr(list).forEach(function (g) { if (g && g.id) { m[g.id] = str(g.title) || g.id; out.push({ id: g.id, title: m[g.id] }); } }); return { map: m, list: out }; }
  function summarizeResults(rs) {
    if (!rs || typeof rs !== 'object') return null; var out = { flow: null, baseline: null, outcomes: [], moreOutcomes: 0, adverse: null };
    var pf = rs.participantFlowModule; if (pf && arr(pf.groups).length) {
      var gm = groupMap(pf.groups);
      out.flow = { groups: gm.list, periods: arr(pf.periods).slice(0, 5).map(function (p) { return { title: str(p && p.title), rows: arr(p && p.milestones).concat(arr(p && p.dropWithdraws)).slice(0, 12).map(function (ms) { var c = Object.create(null); arr(ms && ms.achievements).forEach(function (a) { if (a && a.groupId) c[a.groupId] = a.numSubjects; }); return { label: enumLabel(ms && (ms.type || '')) || str(ms && ms.type), counts: c }; }) }; }) };
    }
    var bl = rs.baselineCharacteristicsModule; if (bl && arr(bl.groups).length) {
      var bm = groupMap(bl.groups), n = Object.create(null); var d0 = arr(bl.denoms)[0]; if (d0) arr(d0.counts).forEach(function (c) { if (c && c.groupId) n[c.groupId] = c.value; });
      out.baseline = { groups: bm.list, n: n, units: d0 ? str(d0.units) : '' };
    }
    var om = rs.outcomeMeasuresModule, all = arr(om && om.outcomeMeasures); out.moreOutcomes = Math.max(0, all.length - 12);
    out.outcomes = all.slice(0, 12).map(function (m) {
      m = m || {}; var gm2 = groupMap(m.groups), values = null, classes = arr(m.classes);
      if (classes.length === 1 && arr(classes[0].categories).length === 1) {
        values = Object.create(null); arr(classes[0].categories[0].measurements).forEach(function (x) { if (!x || !x.groupId) return; var v = str(x.value); if (x.spread != null && x.spread !== '') v += ' (' + str(x.spread) + ')'; else if (x.lowerLimit != null && x.upperLimit != null) v += ' [' + str(x.lowerLimit) + ' to ' + str(x.upperLimit) + ']'; values[x.groupId] = v; });
      }
      var an = arr(m.analyses).slice(0, 3).map(function (a) { a = a || {}; return [a.paramType && a.paramValue != null ? str(a.paramType) + ' ' + str(a.paramValue) : '', a.ciLowerLimit != null && a.ciUpperLimit != null ? (a.ciPctValue ? str(a.ciPctValue) + '% CI ' : 'CI ') + str(a.ciLowerLimit) + ' to ' + str(a.ciUpperLimit) : '', a.pValue ? 'p ' + str(a.pValue) : '', a.statisticalMethod ? str(a.statisticalMethod) : ''].filter(Boolean).join(' · '); }).filter(Boolean);
      return { type: enumLabel(m.type), title: str(m.title), unit: str(m.unitOfMeasure), timeFrame: str(m.timeFrame), param: [m.paramType ? enumLabel(m.paramType) : '', m.dispersionType ? enumLabel(m.dispersionType) : ''].filter(Boolean).join(', '), groups: gm2.list, values: values, analyses: an };
    });
    var ae = rs.adverseEventsModule; if (ae && arr(ae.eventGroups).length) {
      out.adverse = { timeFrame: str(ae.timeFrame), groups: arr(ae.eventGroups).map(function (g) { g = g || {}; return { title: str(g.title) || str(g.id), deaths: g.deathsNumAffected, deathsAtRisk: g.deathsNumAtRisk, serious: g.seriousNumAffected, seriousAtRisk: g.seriousNumAtRisk, other: g.otherNumAffected, otherAtRisk: g.otherNumAtRisk }; }) };
    }
    return (out.flow || out.baseline || out.outcomes.length || out.adverse) ? out : null;
  }

  /* ---------- compare tray (sessionStorage; shared by the search and detail pages) ---------- */
  var TRAY_KEY = 'kv_trial_tray', TRAY_MAX = 4;
  function trayGet() { try { var a = JSON.parse(root.sessionStorage.getItem(TRAY_KEY) || '[]'); return Array.isArray(a) ? a.filter(function (x) { return NCT_RE.test(x); }).map(function (x) { return x.toUpperCase(); }).slice(0, TRAY_MAX) : []; } catch (e) { return []; } }
  function traySet(a) { try { root.sessionStorage.setItem(TRAY_KEY, JSON.stringify(a.slice(0, TRAY_MAX))); } catch (e) { /* optional */ } return a; }
  function trayHas(n) { return trayGet().indexOf(str(n).toUpperCase()) >= 0; }
  function trayAdd(n) { n = str(n).toUpperCase(); if (!NCT_RE.test(n)) return { ok: false, full: false, list: trayGet() }; var a = trayGet(); if (a.indexOf(n) >= 0) return { ok: true, full: false, list: a }; if (a.length >= TRAY_MAX) return { ok: false, full: true, list: a }; a.push(n); traySet(a); return { ok: true, full: false, list: a }; }
  function trayRemove(n) { n = str(n).toUpperCase(); return traySet(trayGet().filter(function (x) { return x !== n; })); }
  function trayClear() { return traySet([]); }

  /* ---------- network (same cache format and etiquette as research-client.js) ---------- */
  function KVError(kind, msg, status) { var e = new Error(msg); e.kind = kind; e.status = status || 0; return e; }
  function cacheGet(k) { try { var r = root.localStorage.getItem('kv_c:' + k); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
  function cacheSet(k, v) {
    try {
      var body = JSON.stringify({ t: Date.now(), v: v }); if (body.length > MAX_ENTRY) return;
      var keys = [], ls = root.localStorage; for (var i = 0; i < ls.length; i++) { var n = ls.key(i); if (n && n.indexOf('kv_c:') === 0) keys.push(n); }
      if (keys.length >= MAX_CACHE) keys.map(function (n) { var o = null; try { o = JSON.parse(ls.getItem(n)); } catch (e) { /* ignore */ } return [n, o ? o.t : 0]; }).sort(function (a, b) { return a[1] - b[1]; }).slice(0, keys.length - MAX_CACHE + 5).forEach(function (p) { ls.removeItem(p[0]); });
      ls.setItem('kv_c:' + k, body);
    } catch (e) { /* quota or privacy mode: caching is optional */ }
  }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  async function getJSON(url, opt) {
    opt = opt || {}; var hit = cacheGet(url);
    if (hit && !opt.fresh && Date.now() - hit.t < TTL) return { data: hit.v, retrievedAt: hit.t, fromCache: true };
    var wait = lastCall + MIN_GAP - Date.now(); if (wait > 0) await sleep(wait); lastCall = Date.now(); var res;
    try { res = await root.fetch(url, { headers: { Accept: 'application/json' }, signal: opt.signal }); }
    catch (e) { if (e && e.name === 'AbortError') throw e; if (hit) return { data: hit.v, retrievedAt: hit.t, fromCache: true, stale: true }; throw KVError('network', 'Network request failed (offline, blocked by the browser, or the source is not reachable).'); }
    if (res.status === 429) { if (hit) return { data: hit.v, retrievedAt: hit.t, fromCache: true, stale: true }; throw KVError('rate', 'The data source is rate limiting requests. Wait a minute and try again.', 429); }
    if (res.status === 400) throw KVError('badquery', 'ClinicalTrials.gov could not run this search (HTTP 400). Check quotes, brackets and AND/OR/NOT in the text fields.', 400);
    if (!res.ok) { if (hit) return { data: hit.v, retrievedAt: hit.t, fromCache: true, stale: true }; throw KVError('http', 'The data source returned HTTP ' + res.status + '.', res.status); }
    var data; try { data = await res.json(); } catch (e) { throw KVError('parse', 'The data source returned a response that could not be read.'); }
    cacheSet(url, data); return { data: data, retrievedAt: Date.now(), fromCache: false };
  }
  async function search(state, opt) {
    var s = sanitize(state), url = buildUrl(s, state && state.token), r = await getJSON(url, opt), d = r.data || {};
    if (!Array.isArray(d.studies)) throw KVError('parse', 'Unexpected response shape from ClinicalTrials.gov.');
    return { total: d.totalCount != null ? d.totalCount : null, nextToken: d.nextPageToken || null, trials: d.studies.map(normalize), retrievedAt: r.retrievedAt, fromCache: !!r.fromCache, stale: !!r.stale, url: url };
  }
  async function getStudy(nct, opt) {
    if (!NCT_RE.test(str(nct))) throw KVError('input', 'Invalid NCT identifier.');
    var url = CTG + '/studies/' + str(nct).toUpperCase(), r = await getJSON(url, opt);
    return { trial: normalize(r.data || {}), retrievedAt: r.retrievedAt, fromCache: !!r.fromCache, stale: !!r.stale, url: url };
  }

  var T = {
    CTG: CTG, NCT_RE: NCT_RE, PMID_RE: PMID_RE, STATUS: STATUS, PHASES: PHASES, STUDY_TYPES: STUDY_TYPES, ALLOCATIONS: ALLOCATIONS, INTERVENTION_TYPES: INTERVENTION_TYPES, AGE_GROUPS: AGE_GROUPS, SEXES: SEXES, SPONSOR_CLASSES: SPONSOR_CLASSES,
    SORTS: SORTS, PAGE_SIZES: PAGE_SIZES, DEFAULT_PAGE_SIZE: DEFAULT_PS, TRAY_MAX: TRAY_MAX,
    enumLabel: enumLabel, phaseLabel: phaseLabel, emptyState: emptyState, sanitize: sanitize, stateFromParams: stateFromParams, stateToParams: stateToParams, hasFilters: hasFilters, hasCriteria: hasCriteria, advancedCount: advancedCount,
    essieList: essieList, buildUrl: buildUrl, describeChips: describeChips, removeFilter: removeFilter, clearAll: clearAll, searchLabel: searchLabel,
    parseRegDate: parseRegDate, qualityFlags: qualityFlags, normalize: normalize, parseEligibility: parseEligibility, groupLocations: groupLocations, countryCount: countryCount, timelineModel: timelineModel,
    median: median, pageStats: pageStats, csvRows: csvRows, compareRows: compareRows, interventionNames: interventionNames, relatedQuery: relatedQuery, relatedUrl: relatedUrl, aiLabUrl: aiLabUrl, summarizeResults: summarizeResults,
    trayGet: trayGet, trayHas: trayHas, trayAdd: trayAdd, trayRemove: trayRemove, trayClear: trayClear, search: search, getStudy: getStudy
  };
  root.KVTrials = T;
  if (root.KVResearch) { R.searchTrialsAdvanced = search; R.getStudyAdvanced = getStudy; R.trialsAdvanced = T; }
  if (typeof module !== 'undefined' && module.exports) module.exports = T;
})(typeof window !== 'undefined' ? window : globalThis);
