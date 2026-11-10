/* KAIVYRA atlas library (v5). Logic on top of platform/atlas-data.js (Research Domain Atlas + Medical Inquiry Framework).
 * Pure functions, no DOM. Works in the browser (window.KVAtlas) and in node (module.exports) for unit tests.
 * The atlas is a KAIVYRA-curated taxonomy: it is NOT MeSH and NOT an official classification.
 * Queries it builds are keyword combinations for Europe PMC / ClinicalTrials.gov, not validated search strategies. */
(function (root) {
  'use strict';
  var D = root.KVAtlasData || (typeof require !== 'undefined' ? (function () { var g = global; g.window = g.window || {}; require('./atlas-data.js'); return g.window.KVAtlasData; })() : null);
  if (!D) throw new Error('atlas-data.js must load before atlas-lib.js');
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var norm = function (s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim(); };
  var enc = encodeURIComponent;
  var byId = {}; D.domains.forEach(function (d) { byId[d.id] = d; });
  var lensBy = {}; D.lenses.forEach(function (l) { lensBy[l.id] = l; });
  var groupBy = {}; D.groups.forEach(function (g) { groupBy[g.id] = g; });
  function topicId(d, i) { return d + '-' + pad(i + 1); }
  function topicHref(d, i) { return '/knowledge/topic/?d=' + d + '&t=' + pad(i + 1); }
  function lensHref(id, subject) { return '/knowledge/framework/' + (subject ? '?s=' + enc(subject) : '') + '#l' + id; }

  /* Topic name -> Europe PMC keyword query. '/' = alternatives (OR); '&' = both concepts (AND); multi-word concepts are quoted. */
  function topicQuery(name) {
    var n = String(name || '').replace(/\([^)]*\)/g, ' ').replace(/["“”]/g, '').replace(/\s+/g, ' ').trim();
    if (!n) return '';
    var q = function (p) { p = p.trim(); return /\s/.test(p) ? '"' + p + '"' : p; };
    var alts = n.split(/\s*\/\s*/).map(function (alt) { return alt.split(/\s+&\s+/).map(q).filter(Boolean).join(' AND '); }).filter(Boolean);
    return alts.length > 1 ? alts.map(function (a) { return /\sAND\s/.test(a) ? '(' + a + ')' : a; }).join(' OR ') : alts[0] || '';
  }
  var STOP = { of: 1, and: 1, the: 1, in: 1, to: 1, for: 1, by: 1, a: 1, an: 1, on: 1, or: 1 };
  /* subject + framework dimension -> query. Short dimension names (<= 3 words) become quoted phrases; '&' = AND, '/' = OR; long ones AND their content words. */
  function dimQuery(subject, dim) {
    var s = String(subject || '').replace(/["\u201c\u201d]/g, '').replace(/\s+/g, ' ').trim();
    var d = String(dim || '').replace(/["\u201c\u201d]/g, '').replace(/[\u2013\u2014]/g, ' ').replace(/\s+/g, ' ').trim();
    var part = function (p) { p = p.trim(); if (!p) return ''; var w = p.split(/\s+/); return w.length <= 3 ? (w.length > 1 ? '"' + p + '"' : p) : w.filter(function (x) { return !STOP[x.toLowerCase()]; }).join(' AND '); };
    var alts = d.split(/\s*\/\s*/).map(function (alt) { return alt.split(/\s+&\s+/).map(part).filter(Boolean).join(' AND '); }).filter(Boolean);
    var dq = alts.length > 1 ? alts.map(function (a) { return /\sAND\s/.test(a) ? '(' + a + ')' : a; }).join(' OR ') : (alts[0] || '');
    var sq = /\s/.test(s) && !/\b(AND|OR|NOT)\b/.test(s) ? '"' + s + '"' : s;
    if (!sq) return dq; if (!dq) return sq;
    return sq + ' AND ' + (/\s(AND|OR)\s/.test(dq) ? '(' + dq + ')' : dq);
  }
  function researchUrl(q, o) {
    o = o || {}; var p = [];
    p.push('q=' + enc(q).replace(/%20/g, '+'));
    if (o.d) p.push('d=' + enc(o.d)); if (o.hum) p.push('hum=1'); if (o.oa) p.push('oa=1'); if (o.sort) p.push('sort=' + o.sort);
    return '/research/?' + p.join('&');
  }
  function trialsUrl(q) { return '/trials/?cond=' + enc(String(q || '').replace(/["()]/g, ' ').replace(/\s+(AND|OR)\s+/g, ' ').replace(/\s+/g, ' ').trim()).replace(/%20/g, '+'); }
  function aiUrl(q) { return '/ai-lab/?q=' + enc(q).replace(/%20/g, '+'); }
  var PRESETS = [
    { id: 'reviews', label: 'Reviews & meta-analyses', desc: 'Systematic reviews and meta-analyses, human studies.', o: { d: 'sr,meta', hum: 1 } },
    { id: 'guidelines', label: 'Practice guidelines', desc: 'Records labelled as practice guidelines.', o: { d: 'guideline' } },
    { id: 'rct', label: 'Randomized trials', desc: 'Randomized controlled trials, human studies.', o: { d: 'rct', hum: 1 } },
    { id: 'obs', label: 'Observational studies', desc: 'Cohort, case-control and cross-sectional records.', o: { d: 'obs', hum: 1 } },
    { id: 'latest', label: 'Latest publications', desc: 'Newest records first.', o: { sort: 'date' } },
    { id: 'cited', label: 'Most cited', desc: 'Sorted by citation count (older work is cited more).', o: { sort: 'cited' } },
    { id: 'oa', label: 'Open-access full text', desc: 'Records with open-access full text.', o: { oa: 1 } },
    { id: 'cases', label: 'Case reports', desc: 'Single-patient reports: hypothesis-generating only.', o: { d: 'cases' } }
  ];
  function presets(q) { return PRESETS.map(function (p) { return { id: p.id, label: p.label, desc: p.desc, href: researchUrl(q, p.o) }; }); }

  /* Honest mapping of atlas domains to tools that really exist on this platform. Domains without a real match get none. */
  var C = function (id, label, why) { return { label: label, href: '/clinical/#' + id, why: why }; };
  var SC = function (id, label, why) { return { label: label, href: '/clinical/?score=' + id + '#score-suite', why: why }; };
  var EV = function (h, label, why) { return { label: label, href: '/evidence-lab/#' + h, why: why }; };
  var TOOLS = {
    '01': [C('anatomy-atlas', 'Anatomy Atlas', 'Structure reference for the body systems'), C('cellular-electrophys', 'Cellular electrophysiology', 'Interactive ion-channel and membrane-potential models'), C('pkpd', 'PK/PD simulator', 'Introductory drug kinetics')],
    '02': [C('score-suite', 'Clinical Score Suite', 'Published decision rules used across internal medicine'), C('clinical-atlas', 'Case simulations & ICD-11 reference', 'Vignettes and classification reference')],
    '03': [C('telemetry', 'ICU telemetry simulator', 'Simulated waveforms (not patient data)'), C('pvloop', 'Pressure-volume loop lab', 'Cardiac mechanics model'), C('cellular-electrophys', 'Cardiac electrophysiology', 'Action-potential models'), SC('cha', 'CHA₂DS₂-VASc', 'AF stroke-risk rule'), SC('has', 'HAS-BLED', 'Bleeding-risk rule on anticoagulation')],
    '04': [C('calculators', 'ABG analyzer', 'Acid-base interpretation'), SC('curb', 'CURB-65', 'Pneumonia severity rule'), SC('wells', 'Wells PE', 'Pulmonary embolism pre-test probability')],
    '05': [C('score-suite', 'Clinical Score Suite', 'Scores for liver disease are listed here when available')],
    '06': [C('calculators', 'eGFR calculator', 'Kidney-function estimation')],
    '08': [C('anatomy-atlas', 'Anatomy Atlas', 'Nervous-system structures'), C('cellular-electrophys', 'Neuronal electrophysiology', 'Membrane and channel models')],
    '10': [C('anatomy-atlas', 'Anatomy Atlas', 'Musculoskeletal structures')],
    '17': [SC('qs', 'qSOFA', 'Bedside sepsis-related risk screen'), SC('curb', 'CURB-65', 'Pneumonia severity rule')],
    '21': [C('anatomy-atlas', 'Anatomy Atlas', 'Surgical anatomy reference')],
    '23': [C('pkpd', 'PK/PD simulator', 'Drug kinetics relevant to anaesthesia'), C('telemetry', 'ICU telemetry simulator', 'Simulated vital-sign monitoring'), C('calculators', 'ABG analyzer', 'Acid-base interpretation')],
    '25': [C('calculators', 'Laboratory calculators', 'ABG interpretation and eGFR')],
    '28': [C('telemetry', 'ICU telemetry simulator', 'Simulated monitoring'), C('calculators', 'ABG analyzer', 'Acid-base interpretation'), SC('qs', 'qSOFA', 'Sepsis-related risk screen'), SC('wells', 'Wells PE', 'Pulmonary embolism probability')],
    '36': [C('rx-formulary', 'Formulary', 'Drug reference'), C('pkpd', 'PK/PD simulator', 'Pharmacokinetic modelling')],
    '37': [EV('meta', 'Meta-analysis calculator', 'Pool effect sizes you supply'), EV('appraise', 'Appraisal instruments', 'RoB 2, ROBINS-I, AMSTAR 2 and reporting checklists'), EV('grade', 'GRADE worksheet', 'Document certainty of evidence'), { label: 'Clinical trial registry search', href: '/trials/', why: 'Search ClinicalTrials.gov' }],
    '47': [EV('grade', 'GRADE worksheet', 'Document certainty of evidence'), EV('appraise', 'Appraisal instruments', 'Risk-of-bias and quality tools'), EV('glossary', 'Bias & fallacy glossary', 'Definitions of common biases')],
    '48': [{ label: 'Clinical trial registry search', href: '/trials/', why: 'Registered trials across the translation pipeline' }, EV('grade', 'GRADE worksheet', 'Certainty of evidence for decisions')],
    '49': [EV('stats', 'Statistics toolkit', '2×2 measures, diagnostic accuracy, sample size'), EV('meta', 'Meta-analysis calculator', 'Heterogeneity and pooling'), EV('guide', 'Study design guide', 'Choosing and reading designs')]
  };
  function toolsFor(domainId) { return (TOOLS[domainId] || []).slice(); }

  function entries() {
    if (entries._c) return entries._c; var out = [];
    D.domains.forEach(function (d) {
      out.push({ type: 'domain', label: d.t, path: 'Research Domain Atlas', href: '/knowledge/atlas/#d' + d.id, n: norm(d.t + ' ' + d.d) });
      d.s.forEach(function (t, i) { out.push({ type: 'topic', label: t, path: d.t, href: topicHref(d.id, i), n: norm(t), nd: norm(d.t) }); });
    });
    D.lenses.forEach(function (l) {
      out.push({ type: 'lens', label: l.k + ' — ' + l.q, path: 'Medical Inquiry Framework', href: lensHref(l.id), n: norm(l.k + ' ' + l.q + ' ' + l.d) });
      l.m.forEach(function (m, i) { out.push({ type: 'dimension', label: m, path: l.k + ' › ' + l.q, href: lensHref(l.id), n: norm(m), nd: norm(l.k + ' ' + l.q) }); });
    });
    return (entries._c = out);
  }
  function search(text, limit) {
    var q = norm(text); if (!q) return []; var toks = q.split(' '), res = [];
    entries().forEach(function (e) {
      var s = 0;
      if (e.n === q) s = 120; else if (e.n.indexOf(q) === 0) s = 100; else if ((' ' + e.n).indexOf(' ' + q) >= 0) s = 75; else if (e.n.indexOf(q) >= 0) s = 45;
      else if (toks.length > 1 && toks.every(function (t) { return e.n.indexOf(t) >= 0 || (e.nd && e.nd.indexOf(t) >= 0); })) s = 30;
      if (s) { if (e.type === 'topic') s += 6; else if (e.type === 'domain') s += 4; else if (e.type === 'dimension') s -= 2; res.push({ type: e.type, label: e.label, path: e.path, href: e.href, score: s }); }
    });
    res.sort(function (a, b) { return b.score - a.score || a.label.length - b.label.length || (a.label < b.label ? -1 : 1); });
    return res.slice(0, limit || 30);
  }
  function paletteIndex() { return entries().map(function (e) { return [e.type, e.label, e.path, e.href]; }); }
  function counts() {
    var t = 0, x = 0; D.domains.forEach(function (d) { t += d.s.length; if (d.x) x += d.s.length; });
    return { domains: D.domains.length, topics: t, addedTopics: x, lenses: D.lenses.length, dimensions: D.lenses.reduce(function (a, l) { return a + l.m.length; }, 0), groups: D.groups.length };
  }
  function allTopics() { var o = []; D.domains.forEach(function (d) { d.s.forEach(function (t, i) { o.push({ d: d.id, i: i, name: t, domain: d.t, href: topicHref(d.id, i), x: !!d.x }); }); }); return o; }
  function planMarkdown(subject, done, o) {
    o = o || {}; var md = '# Medical Inquiry plan: ' + subject + '\n\nBuilt with the KAIVYRA Medical Inquiry Framework (structured prompts for planning literature searches). Queries are keyword combinations, not validated search strategies. Check each query in the database you cite.\n\n';
    D.lenses.forEach(function (l) {
      var n = l.m.filter(function (m) { return done && done[l.id + ':' + m]; }).length;
      md += '## ' + l.id + '. ' + l.k + ' — ' + l.q + ' (' + n + '/30)\n\n';
      l.m.forEach(function (m) { md += '- [' + (done && done[l.id + ':' + m] ? 'x' : ' ') + '] ' + m + (o.queries === false ? '' : ' — `' + dimQuery(subject, m) + '`') + '\n'; });
      md += '\n';
    });
    return md;
  }
  var A = { data: D, domains: D.domains, lenses: D.lenses, groups: D.groups, byId: byId, lensById: lensBy, groupById: groupBy, topicId: topicId, topicHref: topicHref, lensHref: lensHref, topicQuery: topicQuery, dimQuery: dimQuery,
    researchUrl: researchUrl, trialsUrl: trialsUrl, aiUrl: aiUrl, presets: presets, toolsFor: toolsFor, search: search, paletteIndex: paletteIndex, counts: counts, allTopics: allTopics, planMarkdown: planMarkdown, norm: norm, pad: pad };
  root.KVAtlas = A;
  if (typeof module !== 'undefined' && module.exports) module.exports = A;
})(typeof window !== 'undefined' ? window : globalThis);
