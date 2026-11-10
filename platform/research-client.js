/* KAIVYRA research client.
 * Sources: Europe PMC REST API (indexes PubMed/MEDLINE, PMC, preprints) and ClinicalTrials.gov API v2.
 * Nothing here invents records. Every field is either copied from the source response or marked as derived.
 */
(function () {
  'use strict';
  var EPMC = 'https://www.ebi.ac.uk/europepmc/webservices/rest';
  var CTG = 'https://clinicaltrials.gov/api/v2';
  var TTL = 24 * 3600 * 1000, MIN_GAP = 130, lastCall = 0, MAX_CACHE = 40;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function arr(x) { return x == null ? [] : Array.isArray(x) ? x : [x]; }
  function plain(html) {
    if (html == null) return '';
    var d = new DOMParser().parseFromString('<div>' + String(html) + '</div>', 'text/html');
    return (d.body.textContent || '').replace(/\s+/g, ' ').trim();
  }

  /* ---------- cache + http ---------- */
  function cacheGet(k) { try { var r = localStorage.getItem('kv_c:' + k); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
  function cacheSet(k, v) {
    try {
      var keys = []; for (var i = 0; i < localStorage.length; i++) { var n = localStorage.key(i); if (n && n.indexOf('kv_c:') === 0) keys.push(n); }
      if (keys.length >= MAX_CACHE) {
        keys.map(function (n) { var o = null; try { o = JSON.parse(localStorage.getItem(n)); } catch (e) {} return [n, o ? o.t : 0]; })
          .sort(function (a, b) { return a[1] - b[1]; }).slice(0, keys.length - MAX_CACHE + 5).forEach(function (p) { localStorage.removeItem(p[0]); });
      }
      localStorage.setItem('kv_c:' + k, JSON.stringify({ t: Date.now(), v: v }));
    } catch (e) { /* quota or privacy mode: caching is optional */ }
  }
  function KVError(kind, msg, status) { var e = new Error(msg); e.kind = kind; e.status = status || 0; return e; }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  async function getJSON(url, opt) {
    opt = opt || {};
    var hit = cacheGet(url);
    if (hit && !opt.fresh && Date.now() - hit.t < TTL) return { data: hit.v, retrievedAt: hit.t, fromCache: true };
    var wait = lastCall + MIN_GAP - Date.now(); if (wait > 0) await sleep(wait); lastCall = Date.now();
    var res;
    try { res = await fetch(url, { headers: { Accept: 'application/json' }, signal: opt.signal }); }
    catch (e) {
      if (e && e.name === 'AbortError') throw e;
      if (hit) return { data: hit.v, retrievedAt: hit.t, fromCache: true, stale: true };
      throw KVError('network', 'Network request failed (offline, blocked by the browser, or the source is not reachable).');
    }
    if (res.status === 429) { if (hit) return { data: hit.v, retrievedAt: hit.t, fromCache: true, stale: true }; throw KVError('rate', 'The data source is rate limiting requests. Wait a minute and try again.', 429); }
    if (!res.ok) { if (hit) return { data: hit.v, retrievedAt: hit.t, fromCache: true, stale: true }; throw KVError('http', 'The data source returned HTTP ' + res.status + '.', res.status); }
    var data;
    try { data = await res.json(); } catch (e) { throw KVError('parse', 'The data source returned a response that could not be read.'); }
    cacheSet(url, data);
    return { data: data, retrievedAt: Date.now(), fromCache: false };
  }

  /* ---------- identifiers and links (validated before building URLs) ---------- */
  var RE = { pmid: /^\d{1,9}$/, pmcid: /^PMC\d{1,10}$/i, doi: /^10\.\d{4,9}\/\S+$/, nct: /^NCT\d{8}$/i };
  function links(p) {
    var l = { pubmed: null, pmc: null, doi: null, europepmc: null, fullText: [] };
    if (p.pmid && RE.pmid.test(p.pmid)) l.pubmed = 'https://pubmed.ncbi.nlm.nih.gov/' + p.pmid + '/';
    if (p.pmcid && RE.pmcid.test(p.pmcid)) l.pmc = 'https://pmc.ncbi.nlm.nih.gov/articles/' + p.pmcid.toUpperCase() + '/';
    if (p.doi && RE.doi.test(p.doi)) l.doi = 'https://doi.org/' + encodeURI(p.doi).replace(/[#?]/g, function (c) { return encodeURIComponent(c); });
    if (p.source && p.id && /^[A-Z]{2,4}$/.test(p.source) && /^[A-Za-z0-9._-]+$/.test(p.id)) l.europepmc = 'https://europepmc.org/article/' + p.source + '/' + p.id;
    return l;
  }

  /* ---------- Europe PMC ---------- */
  var DESIGNS = {
    rct: 'Randomized Controlled Trial', meta: 'Meta-Analysis', sr: 'Systematic Review', guideline: 'Practice Guideline',
    ct: 'Clinical Trial', obs: 'Observational Study', review: 'Review', cases: 'Case Reports'
  };
  function buildEpmcQuery(o) {
    var parts = [], q = String(o.q || '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 400);
    if (q) parts.push('(' + q + ')');
    var from = parseInt(o.yearFrom, 10), to = parseInt(o.yearTo, 10);
    if (from > 1700 || to > 1700) parts.push('PUB_YEAR:[' + (from > 1700 ? from : 1700) + ' TO ' + (to > 1700 ? to : new Date().getFullYear() + 1) + ']');
    var ds = arr(o.designs).filter(function (d) { return DESIGNS[d]; });
    if (ds.length) parts.push('(' + ds.map(function (d) { return 'PUB_TYPE:"' + DESIGNS[d] + '"'; }).join(' OR ') + ')');
    if (o.openAccess) parts.push('OPEN_ACCESS:y');
    if (o.hasAbstract) parts.push('HAS_ABSTRACT:y');
    if (o.humans) parts.push('MESH:"Humans"');
    var src = o.sources || 'med';
    if (src === 'med') parts.push('SRC:MED'); else if (src === 'medpmc') parts.push('(SRC:MED OR SRC:PMC)'); else if (src === 'preprints') parts.push('(SRC:MED OR SRC:PMC OR SRC:PPR)');
    return parts.join(' AND ');
  }
  function epmcUrl(o) {
    var u = EPMC + '/search?query=' + encodeURIComponent(buildEpmcQuery(o)) + '&format=json&resultType=core&pageSize=' + Math.min(Math.max(parseInt(o.pageSize, 10) || 20, 1), 50) +
      '&cursorMark=' + encodeURIComponent(o.cursor || '*');
    if (o.sort === 'date') u += '&sort=' + encodeURIComponent('P_PDATE_D desc'); else if (o.sort === 'cited') u += '&sort=' + encodeURIComponent('CITED desc');
    return u;
  }

  function parseAbstract(html) {
    if (!html) return { text: '', sections: [] };
    var spaced = String(html).replace(/<\/(p|h4|title|sec|li|div)>|<br\s*\/?>/gi, ' $&');
    var d = new DOMParser().parseFromString('<div>' + spaced + '</div>', 'text/html'), root = d.body.firstChild, sections = [], cur = null;
    Array.prototype.forEach.call(root.childNodes, function (n) {
      var tag = (n.nodeName || '').toLowerCase();
      if (tag === 'h4' || tag === 'title') { cur = { label: (n.textContent || '').trim(), text: '' }; sections.push(cur); }
      else { var t = (n.textContent || ''); if (!cur) { cur = { label: '', text: '' }; sections.push(cur); } cur.text += t; }
    });
    sections = sections.map(function (s) { return { label: s.label, text: s.text.replace(/\s+/g, ' ').trim() }; }).filter(function (s) { return s.text; });
    var structured = sections.length > 1 || (sections[0] && sections[0].label);
    // Plain text is the section bodies joined with spaces (labels excluded), so headings never fuse with sentences.
    var text = sections.length ? sections.map(function (s) { return s.text; }).join(' ') : (root.textContent || '').replace(/\s+/g, ' ').trim();
    return { text: text, sections: structured ? sections : [] };
  }

  function normalizeEpmc(r) {
    var ji = r.journalInfo || {}, jr = ji.journal || {};
    var authors = arr(r.authorList && r.authorList.author).map(function (a) { return a.fullName || [a.firstName, a.lastName].filter(Boolean).join(' '); }).filter(Boolean);
    if (!authors.length && r.authorString) authors = String(r.authorString).replace(/\.$/, '').split(/,\s*/).filter(Boolean);
    var types = arr(r.pubTypeList && r.pubTypeList.pubType).map(String);
    var mesh = arr(r.meshHeadingList && r.meshHeadingList.meshHeading).map(function (m) { return { name: m.descriptorName, major: m.majorTopic_YN === 'Y' }; }).filter(function (m) { return m.name; });
    var p = {
      key: (r.source || 'MED') + ':' + r.id, source: r.source || 'MED', id: String(r.id || ''), pmid: r.pmid ? String(r.pmid) : (r.source === 'MED' ? String(r.id || '') : null),
      pmcid: r.pmcid || null, doi: r.doi || null, title: plain(r.title) || null, authors: authors, journal: jr.title || r.journalTitle || null,
      volume: ji.volume || null, issue: ji.issue || null, pages: r.pageInfo || null, year: r.pubYear || null,
      date: r.firstPublicationDate || ji.dateOfPublication || r.pubYear || null,
      abstract: parseAbstract(r.abstractText), pubTypes: types, mesh: mesh, keywords: arr(r.keywordList && r.keywordList.keyword).map(String),
      language: r.language || null, isOA: r.isOpenAccess === 'Y', citedBy: typeof r.citedByCount === 'number' ? r.citedByCount : null,
      license: r.license || null, isPreprint: r.source === 'PPR',
      retracted: types.some(function (t) { return /retract/i.test(t); }),
      fullText: arr(r.fullTextUrlList && r.fullTextUrlList.fullTextUrl).filter(function (u) { return u && /^https?:\/\//i.test(u.url || ''); })
        .map(function (u) { return { url: u.url, site: u.site || '', style: u.documentStyle || '', free: /^free|open/i.test(u.availability || '') }; })
    };
    p.links = links(p);
    p.study = classifyStudy(p);
    return p;
  }

  async function searchPapers(o, opt) {
    var url = epmcUrl(o), r = await getJSON(url, opt), d = r.data || {};
    if (!d.resultList) throw KVError('parse', 'Unexpected response shape from Europe PMC.');
    return {
      hitCount: d.hitCount || 0, nextCursor: d.nextCursorMark || null, papers: arr(d.resultList.result).map(normalizeEpmc),
      retrievedAt: r.retrievedAt, fromCache: !!r.fromCache, stale: !!r.stale, query: buildEpmcQuery(o), url: url
    };
  }
  async function getPaper(source, id, opt) {
    if (!/^[A-Z]{2,4}$/.test(source) || !/^[A-Za-z0-9._-]+$/.test(id)) throw KVError('input', 'Invalid record identifier.');
    var res = await searchPapers({ q: 'EXT_ID:' + id + ' AND SRC:' + source, sources: 'all', pageSize: 1 }, opt);
    if (!res.papers.length) return null;
    return { paper: res.papers[0], retrievedAt: res.retrievedAt, fromCache: res.fromCache, stale: res.stale };
  }

  /* ---------- study-type classification ---------- */
  var GROUPS = [
    ['guideline', 'Clinical guidelines'], ['sr', 'Systematic reviews and meta-analyses'], ['rct', 'Randomized controlled trials'], ['ct', 'Other clinical trials'],
    ['obs', 'Observational studies'], ['case', 'Case reports'], ['review', 'Reviews (narrative or unspecified)'], ['preclin', 'Animal, laboratory or preclinical'],
    ['nonres', 'Editorials, letters, comments'], ['unk', 'Not classified']
  ];
  function classifyStudy(p) {
    var t = (p.pubTypes || []).map(function (x) { return x.toLowerCase(); });
    function has(re) { return t.some(function (x) { return re.test(x); }); }
    function out(g, label, basis, why) { return { group: g, label: label, basis: basis, why: why }; }
    if (has(/meta-analysis/)) return out('sr', 'Meta-analysis', 'source', 'Publication type listed by the source');
    if (has(/systematic review/)) return out('sr', 'Systematic review', 'source', 'Publication type listed by the source');
    if (has(/randomized controlled trial/)) return out('rct', 'Randomized controlled trial', 'source', 'Publication type listed by the source');
    if (has(/practice guideline|^guideline/)) return out('guideline', 'Guideline', 'source', 'Publication type listed by the source');
    if (has(/clinical trial/)) return out('ct', 'Clinical trial (randomization not stated in type)', 'source', 'Publication type listed by the source');
    if (has(/observational study|cohort|case-control|cross-sectional/)) return out('obs', 'Observational study', 'source', 'Publication type listed by the source');
    if (has(/case reports?/)) return out('case', 'Case report', 'source', 'Publication type listed by the source');
    if (has(/^review$|review/)) return out('review', 'Review', 'source', 'Publication type listed by the source');
    if (has(/editorial|comment|letter|news|erratum|retract/)) return out('nonres', 'Editorial, letter or comment', 'source', 'Publication type listed by the source');
    var txt = ((p.title || '') + ' ' + ((p.abstract && p.abstract.text) || '')).toLowerCase(), names = (p.mesh || []).map(function (m) { return m.name; });
    var animalMesh = names.indexOf('Animals') >= 0 && names.indexOf('Humans') < 0;
    if (/\bmeta-?analy/.test(txt)) return out('sr', 'Possible meta-analysis', 'text', 'Inferred from title or abstract wording. Verify.');
    if (/systematic review/.test(txt)) return out('sr', 'Possible systematic review', 'text', 'Inferred from title or abstract wording. Verify.');
    if (/randomi[sz]ed/.test(txt) && /\b(trial|controlled)\b/.test(txt)) return out('rct', 'Possible randomized trial', 'text', 'Inferred from title or abstract wording. Verify.');
    if (/\b(cohort|case-control|cross-sectional)\b/.test(txt)) return out('obs', 'Possible observational study', 'text', 'Inferred from title or abstract wording. Verify.');
    if (animalMesh || /\b(mice|mouse|murine|rats?|rabbits?|zebrafish|in vitro|cell lines?)\b/.test(txt)) return out('preclin', 'Possible animal or laboratory study', animalMesh ? 'mesh' : 'text', animalMesh ? 'MeSH includes Animals without Humans. Verify.' : 'Inferred from wording. Verify.');
    return out('unk', 'Study type not stated', 'none', 'The source lists no publication type and the abstract gives no clear design wording.');
  }

  /* ---------- extractive helpers (no generative claims) ---------- */
  var STOP = 'a an and are as at be been by can could did do does for from had has have how if in into is it its may might more most no not of on or our should so such than that the their then there these they this to was were what when where which who whom why will with would you your i me my we us about after any between both each few other some than too very versus vs during effect effects role use used using patients patient'.split(' ');
  function terms(q) {
    var seen = {}, out = [];
    String(q || '').toLowerCase().replace(/[^a-z0-9\-\s]/g, ' ').split(/\s+/).forEach(function (w) {
      w = w.replace(/^-+|-+$/g, ''); if (w.length < 3 || STOP.indexOf(w) >= 0 || seen[w]) return; seen[w] = 1; out.push(w);
    });
    return out;
  }
  function questionToQuery(q) {
    var t = terms(q).slice(0, 7);
    return { terms: t, and: t.join(' AND '), or: t.join(' OR ') };
  }
  function sentences(text) { return String(text || '').split(/(?<=[.!?])\s+(?=[A-Z0-9])/).map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 25; }); }
  function stem(w) { return w.length > 5 ? w.slice(0, w.length - 2) : w; }
  function bestSentences(text, tm, k) {
    var stems = tm.map(stem);
    return sentences(text).map(function (s, i) {
      var low = s.toLowerCase(), hit = stems.filter(function (st) { return low.indexOf(st) >= 0; }).length;
      var concl = /\b(conclusion|results?|found|showed|demonstrated|reduced|increased|associated)\b/.test(low) ? 0.3 : 0;
      return { s: s, i: i, score: hit + concl };
    }).filter(function (x) { return x.score >= 1; }).sort(function (a, b) { return b.score - a.score || a.i - b.i; }).slice(0, k || 2).sort(function (a, b) { return a.i - b.i; }).map(function (x) { return x.s; });
  }
  function highlight(text, tm) {
    var s = esc(text);
    tm.map(stem).filter(function (x) { return x.length >= 3; }).sort(function (a, b) { return b.length - a.length; }).forEach(function (st) {
      s = s.replace(new RegExp('\\b(' + st.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[a-z0-9\\-]*)', 'gi'), '<mark>$1</mark>');
    });
    return s;
  }
  function sampleSizes(text) {
    var out = [], seen = {}, pats = [
      /\b[nN]\s*=\s*([\d][\d,]*)/g,
      /\b([\d][\d,]{1,})\s+(?:eligible\s+|adult\s+|pediatric\s+|paediatric\s+)?(?:patients|participants|subjects|adults|children|women|men|individuals|cases|people|infants|neonates|volunteers|pregnancies|veterans)\b/gi
    ];
    pats.forEach(function (re) {
      var m; while ((m = re.exec(text || '')) && out.length < 4) {
        var v = parseInt(m[1].replace(/,/g, ''), 10); if (!(v >= 5 && v < 10000000) || seen[v]) continue; seen[v] = 1;
        out.push({ value: v, snippet: text.slice(Math.max(0, m.index - 25), Math.min(text.length, m.index + m[0].length + 25)).trim() });
      }
    });
    return out;
  }

  /* ---------- citations ---------- */
  function bibKey(p) { var a = (p.authors[0] || 'anon').split(/\s+/); return (a[a.length > 1 ? 0 : 0] + (p.year || '')).replace(/[^A-Za-z0-9]/g, '') || 'ref'; }
  function bibEsc(s) { return String(s).replace(/[{}\\]/g, ''); }
  function toBibtex(p) {
    var f = []; if (p.title) f.push('  title = {' + bibEsc(p.title) + '}');
    if (p.authors.length) f.push('  author = {' + p.authors.map(bibEsc).join(' and ') + '}');
    if (p.journal) f.push('  journal = {' + bibEsc(p.journal) + '}'); if (p.year) f.push('  year = {' + bibEsc(p.year) + '}');
    if (p.volume) f.push('  volume = {' + bibEsc(p.volume) + '}'); if (p.issue) f.push('  number = {' + bibEsc(p.issue) + '}'); if (p.pages) f.push('  pages = {' + bibEsc(p.pages) + '}');
    if (p.doi) f.push('  doi = {' + bibEsc(p.doi) + '}'); if (p.pmid) f.push('  note = {PMID: ' + bibEsc(p.pmid) + '}');
    return '@article{' + bibKey(p) + ',\n' + f.join(',\n') + '\n}';
  }
  function citeLine(p) {
    var a = p.authors.length > 3 ? p.authors.slice(0, 3).join(', ') + ', et al.' : p.authors.join(', ');
    return [a, p.title, [p.journal, p.year].filter(Boolean).join(' '), p.doi ? 'doi:' + p.doi : '', p.pmid ? 'PMID ' + p.pmid : ''].filter(Boolean).join('. ');
  }

  /* ---------- ClinicalTrials.gov v2 ---------- */
  var STATUS = { RECRUITING: 'Recruiting', NOT_YET_RECRUITING: 'Not yet recruiting', ENROLLING_BY_INVITATION: 'Enrolling by invitation', ACTIVE_NOT_RECRUITING: 'Active, not recruiting', COMPLETED: 'Completed', TERMINATED: 'Terminated', WITHDRAWN: 'Withdrawn', SUSPENDED: 'Suspended', UNKNOWN: 'Unknown status' };
  function ctgUrl(o) {
    var p = [];
    if (o.term) p.push('query.term=' + encodeURIComponent(String(o.term).slice(0, 300)));
    if (o.cond) p.push('query.cond=' + encodeURIComponent(String(o.cond).slice(0, 200)));
    if (o.intr) p.push('query.intr=' + encodeURIComponent(String(o.intr).slice(0, 200)));
    if (o.locn) p.push('query.locn=' + encodeURIComponent(String(o.locn).slice(0, 120)));
    var st = arr(o.status).filter(function (s) { return STATUS[s]; }); if (st.length) p.push('filter.overallStatus=' + encodeURIComponent(st.join(',')));
    p.push('pageSize=' + Math.min(Math.max(parseInt(o.pageSize, 10) || 15, 1), 50)); p.push('countTotal=true');
    if (o.token) p.push('pageToken=' + encodeURIComponent(o.token));
    return CTG + '/studies?' + p.join('&');
  }
  function normalizeCtg(s) {
    var ps = s.protocolSection || {}, id = ps.identificationModule || {}, st = ps.statusModule || {}, sp = ps.sponsorCollaboratorsModule || {}, ds = ps.descriptionModule || {},
      cm = ps.conditionsModule || {}, dm = ps.designModule || {}, am = ps.armsInterventionsModule || {}, el = ps.eligibilityModule || {}, cl = ps.contactsLocationsModule || {}, om = ps.outcomesModule || {};
    var nct = id.nctId || '';
    return {
      nct: nct, link: RE.nct.test(nct) ? 'https://clinicaltrials.gov/study/' + nct.toUpperCase() : null,
      title: id.briefTitle || null, officialTitle: id.officialTitle || null, status: st.overallStatus || null, statusLabel: STATUS[st.overallStatus] || st.overallStatus || null,
      whyStopped: st.whyStopped || null, start: st.startDateStruct && st.startDateStruct.date, primaryCompletion: st.primaryCompletionDateStruct && st.primaryCompletionDateStruct.date,
      completion: st.completionDateStruct && st.completionDateStruct.date, firstPosted: st.studyFirstPostDateStruct && st.studyFirstPostDateStruct.date, lastUpdate: st.lastUpdatePostDateStruct && st.lastUpdatePostDateStruct.date,
      sponsor: sp.leadSponsor && sp.leadSponsor.name || null, summary: ds.briefSummary || null, conditions: arr(cm.conditions), studyType: dm.studyType || null, phases: arr(dm.phases),
      enrollment: dm.enrollmentInfo && dm.enrollmentInfo.count != null ? dm.enrollmentInfo.count : null, enrollmentType: dm.enrollmentInfo && dm.enrollmentInfo.type || null,
      design: dm.designInfo || null, interventions: arr(am.interventions).map(function (i) { return { type: i.type, name: i.name }; }),
      primaryOutcomes: arr(om.primaryOutcomes).map(function (o) { return { measure: o.measure, time: o.timeFrame }; }),
      eligibility: { criteria: el.eligibilityCriteria || null, minAge: el.minimumAge || null, maxAge: el.maximumAge || null, sex: el.sex || null, healthy: el.healthyVolunteers },
      contacts: arr(cl.centralContacts).map(function (c) { return { name: c.name, phone: c.phone, email: c.email }; }),
      locations: arr(cl.locations).map(function (l) { return { facility: l.facility, city: l.city, state: l.state, country: l.country, status: l.status }; }),
      hasResults: !!s.hasResults
    };
  }
  async function searchTrials(o, opt) {
    var url = ctgUrl(o), r = await getJSON(url, opt), d = r.data || {};
    if (!Array.isArray(d.studies)) throw KVError('parse', 'Unexpected response shape from ClinicalTrials.gov.');
    return { total: d.totalCount != null ? d.totalCount : null, nextToken: d.nextPageToken || null, trials: d.studies.map(normalizeCtg), retrievedAt: r.retrievedAt, fromCache: !!r.fromCache, stale: !!r.stale, url: url };
  }
  async function getTrial(nct, opt) {
    if (!RE.nct.test(nct)) throw KVError('input', 'Invalid NCT identifier.');
    var url = CTG + '/studies/' + nct.toUpperCase(), r = await getJSON(url, opt);
    return { trial: normalizeCtg(r.data || {}), retrievedAt: r.retrievedAt, fromCache: !!r.fromCache, stale: !!r.stale };
  }

  function fmtDate(ts) { try { return new Date(ts).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }); } catch (e) { return ''; } }
  function retrievalLine(r, name) { return 'Source: ' + name + '. Retrieved ' + fmtDate(r.retrievedAt) + (r.stale ? ' (cached copy shown because the live source could not be reached)' : r.fromCache ? ' (from this browser\u2019s cache, up to 24 h old)' : '') + '.'; }
  function friendlyError(e, srcName, openUrl) {
    var h = '<strong>Could not reach ' + esc(srcName) + '.</strong> ' + esc(e && e.message ? e.message : 'Unknown error') + ' Nothing has been invented to fill the gap.';
    if (openUrl) h += ' <a class="kv-link" href="' + esc(openUrl) + '" target="_blank" rel="noopener noreferrer">Search directly on the source site</a>.';
    return h;
  }

  window.KVResearch = {
    esc: esc, plain: plain, DESIGNS: DESIGNS, GROUPS: GROUPS, STATUS: STATUS, buildEpmcQuery: buildEpmcQuery, epmcUrl: epmcUrl, ctgUrl: ctgUrl,
    searchPapers: searchPapers, getPaper: getPaper, searchTrials: searchTrials, getTrial: getTrial, normalizeEpmc: normalizeEpmc, normalizeCtg: normalizeCtg,
    classifyStudy: classifyStudy, parseAbstract: parseAbstract, terms: terms, questionToQuery: questionToQuery, bestSentences: bestSentences, highlight: highlight, sampleSizes: sampleSizes,
    toBibtex: toBibtex, citeLine: citeLine, fmtDate: fmtDate, retrievalLine: retrievalLine, friendlyError: friendlyError, links: links, RE: RE
  };
})();
