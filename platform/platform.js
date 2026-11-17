/* KAIVYRA global navigation v4. One definition of the site map, injected into every page.
 * Structure follows the platform workflow shown on the homepage: Discover, Evidence, Clinical, then Arena, Workspace, About.
 * Features: grouped mega-menus, hover intent, gliding indicator, roving keyboard menubar, live search suggestions,
 * recent searches and saved-item count (read from this browser's own workspace), prefetch, mobile drawer. No external dependencies. */
(function () {
  'use strict';
  var CLINICAL = [
    ['command-center', 'Clinical Command Center', 'Overview and quick actions'],
    ['anatomy-atlas', 'Human Anatomy Atlas', 'Interactive anatomy'],
    ['symptom-checker', 'Symptom Triage & Organ Atlas', 'Warning signs, not a diagnosis'],
    ['cellular-electrophys', 'Cellular Electrophysiology Lab', 'GHK and action potential model'],
    ['rx-formulary', 'Drug Formulary & Rx Intelligence', 'Education only'],
    ['physician-finance', 'Physician Finance & Career Hub', 'RVU and compensation simulator'],
    ['telemetry', 'ICU Telemetry', 'Simulated rhythms'],
    ['pvloop', 'Pressure–Volume Loop & Cardiac Mechanics', 'Simulation'],
    ['calculators', 'Clinical Calculators & ABG Analysis', 'ABG, eGFR, QTc'],
    ['pkpd', 'Pharmacokinetics & Pharmacodynamics', 'Simulation'],
    ['score-suite', 'Clinical Score Suite', 'SOFA, MELD-Na and others'],
    ['clinical-atlas', 'Clinical Reference Atlas', 'Reference material'],
    ['cloud-repo', 'Clinical Cloud Vault', 'Local to this browser']
  ];
  var CHEV = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var LOGO = '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21.5" fill="none" stroke="#2dd4bf" stroke-width="3"/><path d="M17 11Q24 24 17 37M31 11Q24 24 31 37" fill="none" stroke="#2dd4bf" stroke-width="2.6" stroke-linecap="round"/><g fill="#2dd4bf"><circle cx="17" cy="11" r="2.4"/><circle cx="17" cy="37" r="2.4"/><circle cx="31" cy="11" r="2.4"/><circle cx="31" cy="37" r="2.4"/></g></svg>';
  var ICONS = {
    research: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    trials: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM9 13l2 2 4-4"/>',
    hub: '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5zM20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z"/>',
    atlas: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c3 3.2 3 13.8 0 17M12 3.5c-3 3.2-3 13.8 0 17"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5zM3 12.5l9 5 9-5M3 16.5l9 5 9-5"/>',
    ai: '<rect x="6" y="6" width="12" height="12" rx="2.5"/><path d="M9 2.5V6M15 2.5V6M9 18v3.5M15 18v3.5M2.5 9H6M2.5 15H6M18 9h3.5M18 15h3.5"/>',
    scale: '<path d="M12 4v16M7 20h10M5 7h14M5 7l-2.5 6a3 3 0 0 0 5 0zM19 7l-2.5 6a3 3 0 0 0 5 0z"/>',
    analyzer: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>',
    arena: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><path d="M12 12h.01"/>',
    folder: '<path d="M3.5 7a2 2 0 0 1 2-2H10l2 2.5h6.5a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>',
    calc: '<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8.5 7.5h7M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01"/>',
    score: '<path d="M4 17a8 8 0 1 1 16 0M12 17l4-5"/>',
    rx: '<path d="M10.5 5.5l8 8a3.5 3.5 0 0 1-5 5l-8-8a3.5 3.5 0 0 1 5-5zM8 11l5 5"/>',
    money: '<circle cx="12" cy="12" r="8.5"/><path d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1 0-2-.5-2.5-1.5M12 6.5V8M12 16v1.5"/>',
    wave: '<path d="M3 15c3 0 3-8 6-8s2 10 5 10 3-5 7-5"/>',
    ecg: '<path d="M3 12h4l2-6 3 12 2-6h7"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    drop: '<path d="M12 3.5s6 6.2 6 10.5a6 6 0 0 1-12 0c0-4.3 6-10.5 6-10.5z"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
    body: '<circle cx="12" cy="5.5" r="2.5"/><path d="M12 9v6M7 11l5-2 5 2M9.5 21l2.5-6 2.5 6"/>',
    alert: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17.2v.01"/>',
    book: '<path d="M6 3.5h11a1.5 1.5 0 0 1 1.5 1.5v15.5H7.5A1.5 1.5 0 0 1 6 19z"/><path d="M6 19a1.5 1.5 0 0 1 1.5-1.5h11"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.01"/>',
    flow: '<circle cx="6" cy="6" r="2.2"/><circle cx="18" cy="12" r="2.2"/><circle cx="6" cy="18" r="2.2"/><path d="M8 6.5c5 0 5 5.5 8 5.5M8 17.5c5 0 5-5.5 8-5.5"/>',
    shield: '<path d="M12 3.5l7 2.5v5.5c0 4.4-3 7.8-7 9-4-1.2-7-4.6-7-9V6z"/>',
    users: '<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c.5-3.2 2.7-5 5.5-5s5 1.8 5.5 5M16 6a3 3 0 0 1 0 5.5M17.5 14.2c1.6.6 2.8 2.2 3 4.8"/>',
    cap: '<path d="M2.5 9.5L12 5l9.5 4.5L12 14zM6.5 11.5v4c0 1.2 2.5 2.5 5.5 2.5s5.5-1.3 5.5-2.5v-4"/>',
    map: '<path d="M3.5 6.5l5.5-2 6 2 5.5-2v13l-5.5 2-6-2-5.5 2zM9 4.5v13M15 6.5v13"/>',
    mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M4 7l8 6 8-6"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    flask: '<path d="M9 3h6"/><path d="M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/><path d="M7.5 15h9"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    dot: '<circle cx="12" cy="12" r="3"/>'
  };
  function icon(n) { return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[n] || ICONS.dot) + '</svg>'; }
  function panel(k, n, label, sub, ic) { return { href: '/?panel=' + k + ':' + n, open: k + ':' + n, label: label, sub: sub, ic: ic }; }
  var CIC = { 'command-center': 'grid', 'anatomy-atlas': 'body', 'symptom-checker': 'alert', 'cellular-electrophys': 'wave', 'rx-formulary': 'rx', 'physician-finance': 'money', telemetry: 'ecg', pvloop: 'heart', calculators: 'calc', pkpd: 'drop', 'score-suite': 'score', 'clinical-atlas': 'book', 'cloud-repo': 'lock' };
  var CBD = { 'cellular-electrophys': 'SIM', pvloop: 'SIM', telemetry: 'SIM', pkpd: 'SIM', 'rx-formulary': 'EDU', 'cloud-repo': 'LOCAL' };
  function clin(id) { var c = CLINICAL.filter(function (x) { return x[0] === id; })[0]; return { href: '/clinical/#' + id, label: c[1], sub: c[2], ic: CIC[id], badge: CBD[id] }; }

  var MOD = /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent || '') ? '\u2318' : 'Ctrl';
  var EXAMPLES = [['sepsis fluid resuscitation', 'Sepsis fluids'], ['atrial fibrillation anticoagulation', 'AF anticoagulation'], ['SGLT2 inhibitors heart failure', 'SGLT2 and heart failure']];

  /* Site map: 6 items + search + language = 8 controls. */
  var NAV = [
    { id: 'discover', label: 'Discover', w: 800, rail: 'discover', groups: [
      { h: 'Search the literature', items: [
        { href: '/research/', label: 'Research', sub: 'Search real publications via Europe PMC', ic: 'research', badge: 'LIVE' },
        { href: '/trials/', label: 'Clinical Trials', sub: 'Registered studies from ClinicalTrials.gov', ic: 'trials', badge: 'LIVE' } ] },
      { h: 'Map a field', items: [
        { href: '/knowledge/', label: 'Knowledge Hub', sub: 'Search 519 topics and 450 inquiry prompts', ic: 'hub' },
        { href: '/knowledge/atlas/', label: 'Research Domain Atlas', sub: '50 domains, 519 topics', ic: 'atlas' },
        { href: '/knowledge/framework/', label: 'Medical Inquiry Framework', sub: '15 lenses, 450 dimensions', ic: 'layers' } ] } ] },
    { id: 'evidence', label: 'Evidence', w: 700, rail: 'evidence', groups: [
      { h: 'Retrieve and appraise', items: [
        { href: '/ai-lab/', label: 'AI Lab', sub: 'Retrieval-first answers with sources', ic: 'ai', badge: 'RETRIEVAL' },
        { href: '/evidence-lab/', label: 'Evidence Lab', sub: 'Compare and appraise studies', ic: 'scale' } ] },
      { h: 'Read a report', items: [
        { href: '/analyzer/', label: 'Report Analyzer', sub: 'Plain-language lab report reading', ic: 'analyzer', badge: 'EN \u00b7 HI' } ] } ] },
    { id: 'clinical', label: 'Clinical', w: 1020, rail: 'clinical', groups: [
      { h: 'Overview and reference', items: ['command-center', 'anatomy-atlas', 'symptom-checker', 'clinical-atlas', 'cloud-repo'].map(clin) },
      { h: 'Calculate and score', items: ['calculators', 'score-suite', 'rx-formulary', 'physician-finance'].map(clin) },
      { h: 'Simulate', items: ['cellular-electrophys', 'pvloop', 'telemetry', 'pkpd'].map(clin) } ] },
    { id: 'emergency-lab', label: 'Emergency Virtual Room', href: '/emergency-lab/', tip: 'Advanced Emergency & Critical Care Simulation Lab' },
    { id: 'arena', label: 'Medical Arena', href: '/arena/', tip: 'Daily cases, campaigns and practice' },
    { id: 'workspace', label: 'Workspace', href: '/workspace/', tip: 'Saved papers and notes, private to this browser', count: true },
    { id: 'about', label: 'About', w: 920, rail: 'about', groups: [
      { h: 'About KAIVYRA', items: [
        panel('about', 0, 'Mission', 'Evidence you can trace', 'info'), panel('about', 1, 'Method', 'Retrieval before generation', 'flow'),
        panel('about', 2, 'Principles', 'Integrity over polish', 'shield'), panel('about', 3, 'Audience', 'For people who read the evidence', 'users') ] },
      { h: 'Where we focus', items: [
        panel('focus', 0, 'Evidence synthesis', 'From many studies to one picture', 'layers'), panel('focus', 1, 'Clinical decision science', 'Numbers that show their work', 'calc'),
        panel('focus', 2, 'Medical AI', 'Assistive, auditable, humble', 'ai'), panel('focus', 3, 'Clinical trials', 'See what is being studied', 'trials'),
        panel('focus', 4, 'Medical education', 'Learn the reasoning, not the answer', 'cap'), panel('focus', 5, 'Digital health access', 'Useful on any device', 'phone') ] } ] }
  ];
  var PARENT = { research: 'discover', trials: 'discover', knowledge: 'discover', 'ai-lab': 'evidence', 'evidence-lab': 'evidence', analyzer: 'evidence', clinical: 'clinical', arena: 'arena', workspace: 'workspace', future: 'about' };

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function normPath(p) { return String(p || '').replace(/index\.html$/, ''); }
  function activeId() {
    var d = document.body && document.body.getAttribute('data-kv-section');
    var m = location.pathname.match(/^\/([^\/]+)/);
    var id = d || (m ? m[1] : '');
    return PARENT[id] || id;
  }
  /* Reads this browser's own workspace (same-origin localStorage). Never sent anywhere. */
  function ws() { try { var s = JSON.parse(localStorage.getItem('kv_ws_v1') || 'null'); return s && typeof s === 'object' ? s : null; } catch (e) { return null; } }
  function wsCount() { var s = ws(); if (!s) return 0; try { return Object.keys(s.papers || {}).length + Object.keys(s.trials || {}).length + Object.keys(s.topics || {}).length + (Array.isArray(s.notes) ? s.notes.length : 0); } catch (e) { return 0; } }
  function recents() {
    var s = ws(), out = [], seen = {};
    if (s && Array.isArray(s.history) && !(s.prefs && s.prefs.history === 'off')) s.history.forEach(function (h) {
      if (out.length < 4 && h && h.type === 'search' && typeof h.q === 'string' && h.q && h.q.charAt(0) !== '(' && !seen[h.q]) { seen[h.q] = 1; out.push(h.q); }
    });
    return out;
  }
  function chip(q, text) { return '<a class="kvb-chip" href="/research/?q=' + encodeURIComponent(q) + '">' + esc(text || q) + '</a>'; }
  function kbd() { return '<kbd>' + MOD + '</kbd><kbd>K</kbd>'; }
  function railHTML(kind) {
    var h = '<aside class="kvb-rail">';
    if (kind === 'discover') {
      var r = recents();
      h += '<h5>' + (r.length ? 'Your recent searches' : 'Try a search') + '</h5><div class="kvb-chips">' +
        (r.length ? r.map(function (q) { return chip(q); }).join('') : EXAMPLES.map(function (e) { return chip(e[0], e[1]); }).join('')) + '</div>' +
        '<button type="button" class="kvb-pal" data-kvp>Jump to any module or topic ' + kbd() + '</button>';
    } else if (kind === 'evidence') {
      h += '<h5>How AI Lab answers</h5><p>It retrieves real abstracts first, shows the exact query it ran, and states what the evidence does and does not support. No generative model writes the answer.</p>' +
        '<a class="kvb-more" role="menuitem" href="/?panel=about:1" data-open="about:1">Read the method <span aria-hidden="true">\u2192</span></a>';
    } else if (kind === 'clinical') {
      h += '<h5>13 interactive modules</h5><p>Calculators, simulations and reference tools. Educational aids, not for diagnosis or treatment decisions.</p>' +
        '<a class="kvb-more" role="menuitem" href="/clinical/">Open the full Clinical suite <span aria-hidden="true">\u2192</span></a>';
    } else if (kind === 'about') {
      h += '<h5>Roadmap</h5><p>What is built, what is planned and what is not yet built.</p><a class="kvb-more" role="menuitem" href="/future/">See the roadmap <span aria-hidden="true">\u2192</span></a>' +
        '<h5 class="kvb-sp">Contact</h5><a class="kvb-more" role="menuitem" href="mailto:the.kaivyra@gmail.com">the.kaivyra@gmail.com <span aria-hidden="true">\u2192</span></a>';
    }
    return h + '</aside>';
  }
  function itemHTML(m, page, i) {
    var cur = normPath(m.href) === page ? ' aria-current="page"' : '';
    return '<a class="kvb-it" role="menuitem" style="--i:' + i + '" href="' + esc(m.href) + '"' + (m.open ? ' data-open="' + m.open + '"' : '') + cur + '>' +
      '<span class="kvb-ic">' + icon(m.ic) + '</span><span class="kvb-tx"><b>' + esc(m.label) + '</b>' + (m.sub ? '<small>' + esc(m.sub) + '</small>' : '') + '</span>' +
      (m.badge ? '<em class="kvb-bd">' + esc(m.badge) + '</em>' : '') + '</a>';
  }
  function menuHTML(n, page) {
    var i = 0, h = '<div class="kvb-panel' + (n.rail ? ' has-rail' : '') + '"><div class="kvb-cols" style="--n:' + n.groups.length + '">';
    n.groups.forEach(function (g) {
      h += '<div class="kvb-grp"><h4>' + esc(g.h) + '</h4>';
      g.items.forEach(function (m) { h += itemHTML(m, page, i++); });
      h += '</div>';
    });
    h += '</div>' + (n.rail ? railHTML(n.rail) : '') + '</div>';
    return h;
  }
  function flat() {
    var out = [];
    NAV.forEach(function (n) {
      if (n.groups) n.groups.forEach(function (g) { g.items.forEach(function (m) { out.push(m); }); });
      else out.push({ href: n.href, label: n.label, sub: n.tip || '', ic: n.id === 'arena' ? 'arena' : 'folder' });
    });
    return out;
  }


  /* Detailed drawer tree: [href,label,sub] ; ['-',heading] = sub-heading ; sub numbers = chapter counts */
  function drawerTree() {
    var cl = function (g) { return g.items.map(function (m) { return [m.href, m.label, m.sub]; }); };
    function grp(id) { return NAV.filter(function (n) { return n.id === id; })[0]; }
    function flat(id) { var o = []; grp(id).groups.forEach(function (g) { o.push(['-', g.h]); cl(g).forEach(function (x) { o.push(x); }); }); return o; }
    return [
      { l: 'Global Medical News', ic: 'atlas', href: '/#desk', items: [['-', 'Live news desk'], ['/#news-all', 'All News', 'Latest indexed headlines'], ['/#news-research', 'Research', 'New journal articles'], ['/#news-diseases', 'Diseases', 'Outbreaks and epidemiology'], ['/#news-vaccines', 'Vaccines', 'Vaccination and immunization'], ['/#news-public', 'Public Health', 'Population-level health'], ['/#news-tech', 'Medical Technology', 'Devices, AI and digital health'], ['-', 'On the page'], ['/#desk', 'Live Medical Updates', 'Refreshes automatically'], ['/#desk', 'Quick Facts', 'Live counts from Europe PMC']] },
      { l: 'Medical Learning', ic: 'book', href: '/all-in-one/', items: [['-', 'Start'], ['/all-in-one/', 'Open Medical Learning', 'All subjects in one place'], ['/all-in-one/quiz.html', 'Practice Quiz', 'Test yourself'], ['-', '20 subjects (chapters)'], ['/all-in-one/','Human Anatomy','10'],['/all-in-one/','Human Physiology','8'],['/all-in-one/','Medical Biochemistry','7'],['/all-in-one/','Cell & Molecular Biology','5'],['/all-in-one/','Histology & Embryology','6'],['/all-in-one/','Genetics & Genomics','4'],['/all-in-one/','Pathology','8'],['/all-in-one/','Microbiology & Immunology','7'],['/all-in-one/','Pharmacology','7'],['/all-in-one/','Forensic Medicine & Toxicology','4'],['/all-in-one/','Community Medicine & Public Health','5'],['/all-in-one/','General Medicine & Allied Clinical Sciences','7'],['/all-in-one/','General Surgery & Allied Surgical Sciences','5'],['/all-in-one/','Obstetrics & Gynaecology','4'],['/all-in-one/','Paediatrics','3'],['/all-in-one/','Orthopaedics','2'],['/all-in-one/','Ophthalmology','2'],['/all-in-one/','ENT / Otorhinolaryngology','2'],['/all-in-one/','Psychiatry & Behavioural Sciences','2'],['/all-in-one/','Radiology, Anaesthesiology, Emergency & Critical Care','2']] },
      { l: 'Report Analyzer', ic: 'analyzer', href: '/analyzer/', items: [['/analyzer/', 'Open Report Analyzer', 'Plain-language lab report reading'], ['/analyzer/', 'English and Hindi', 'Read results in your language'], ['/legal/', 'Not medical advice', 'Read the disclaimer']] },
      { l: 'Public Health', ic: 'shield', href: '/research/?q=public+health', items: [['-', 'Search the literature'], ['/research/?q=public+health', 'Public health'], ['/research/?q=epidemiology', 'Epidemiology'], ['/research/?q=vaccination+coverage', 'Vaccination'], ['/research/?q=infectious+disease+outbreak', 'Infectious disease outbreaks'], ['/research/?q=maternal+and+child+health', 'Maternal and child health'], ['/research/?q=nutrition+and+malnutrition', 'Nutrition'], ['/research/?q=non-communicable+diseases', 'Non-communicable diseases'], ['/research/?q=mental+health', 'Mental health'], ['/trials/', 'Clinical Trials', 'Registered studies']] },
      { l: 'Science Explained', ic: 'flask', href: '/knowledge/', items: [['/knowledge/', 'Knowledge Hub', 'Search 519 topics and 450 inquiry prompts'], ['/knowledge/atlas/', 'Research Domain Atlas', '50 domains, 519 topics'], ['/knowledge/framework/', 'Medical Inquiry Framework', '15 lenses, 450 dimensions']] },
      { l: 'Discover', ic: 'research', href: '/research/', items: flat('discover') },
      { l: 'Evidence', ic: 'scale', href: '/evidence-lab/', items: flat('evidence').concat([['-', 'Inside Evidence Lab'], ['/evidence-lab/', 'Compare studies'], ['/evidence-lab/', 'Appraisal checklist'], ['/evidence-lab/', 'Study design guide'], ['/evidence-lab/', 'Conflicting evidence']]) },
      { l: 'Clinical', ic: 'rx', href: '/clinical/', items: flat('clinical') },
      { l: 'Medical Arena', ic: 'arena', href: '/arena/', items: [['/arena/', 'Daily Gauntlet', 'A new challenge each day'], ['/arena/', 'Blitz Duel', 'Fast head-to-head rounds'], ['/arena/', 'Diagnosis Detective', 'Case-based reasoning'], ['/arena/', 'Drug Match', 'Pharmacology practice'], ['/arena/', 'Academy', 'Guided practice']] },
      { l: 'Emergency Virtual Room', ic: 'ecg', href: '/emergency-lab/', items: [['/emergency-lab/', 'Open the virtual room', 'Live monitor, exam, tests, treatment'], ['/emergency-lab/', 'Case library', 'Emergency and critical-care cases'], ['/emergency-lab/', 'Student, Junior Dr, Senior Dr modes', 'Choose how much guidance you get'], ['/emergency-lab/', 'Scored debrief', 'Review what you did and when']] },
      { l: 'Workspace', ic: 'folder', href: '/workspace/', items: [['/workspace/', 'Saved papers and notes', 'Private to this browser']] },
      { l: 'About', ic: 'info', href: '/?panel=about:0', items: flat('about').concat([['-', 'More'], ['/future/', 'What is not built yet'], ['/legal/', 'Disclaimer, sources and takedown policy']]) }
    ];
  }

  function drawerHTML(page) {
    var L = [['/', 'Home', 'home'], ['/#desk', 'Global Medical News', 'atlas'], ['/knowledge/', 'Science Explained', 'flask'], ['/research/?q=public+health', 'Public Health', 'shield'],
      ['/all-in-one/', 'Medical Learning', 'book'], ['/clinical/', 'Clinical Knowledge', 'rx'], ['/evidence-lab/', 'Evidence vs Myths', 'scale'], ['/knowledge/atlas/', 'Knowledge Lab', 'chart'], ['/legal/', 'References', 'layers']];
    var h = '<div class="kvb-dh"><a class="kvb-dbrand" href="/" aria-label="KAIVYRA home">' + LOGO + '<span><b>KAIVYRA</b><small>Medical Knowledge Hub</small></span></a><button type="button" class="kvb-dx" aria-label="Close menu">×</button></div>';
    h += '<a class="kvb-feat" href="/emergency-lab/"><i>' + icon('ecg') + '</i><span><b>Advanced Emergency Virtual Room</b><small>Emergency and critical-care simulation lab</small></span></a>';
    h += '<ul class="kvb-dl">' + L.map(function (x) { return '<li><a href="' + x[0] + '"' + (normPath(x[0]) === page && x[0].indexOf('#') < 0 ? ' aria-current="page"' : '') + '>' + icon(x[2]) + x[1] + '</a></li>'; }).join('') + '</ul>';
    h += '<h6>Explore everything</h6><div class="kvb-dg">';
    drawerTree().forEach(function (g) {
      h += '<details><summary><i>' + icon(g.ic) + '</i><span>' + esc(g.l) + '</span>' + CHEV + '</summary><div>';
      h += '<a class="kvb-all" href="' + esc(g.href) + '">' + esc('Open') + ' ' + esc(g.l) + ' →</a>';
      g.items.forEach(function (m) {
        if (m[0] === '-') { h += '<p>' + esc(m[1]) + '</p>'; return; }
        h += '<a href="' + esc(m[0]) + '"><b>' + esc(m[1]) + '</b>' + (m[2] ? (/^\d+$/.test(m[2]) ? '<em>' + m[2] + '</em>' : '<small>' + esc(m[2]) + '</small>') : '') + '</a>';
      });
      h += '</div></details>';
    });
    h += '</div>';
    h += '<div class="kvb-promo"><p>Advancing<b>Medical Science</b>Together</p></div>';
    h += '<div class="kvb-dfoot"><div class="kvb-seg" role="group" aria-label="Language"><button type="button" data-lang="en" lang="en">English</button><button type="button" data-lang="hi" lang="hi">हिन्दी</button></div>' +
      '<div class="kvb-seg kvb-th" role="group" aria-label="Colour theme"><button type="button" data-theme-btn="light" aria-label="Light theme">' + icon('sun') + '</button><button type="button" data-theme-btn="dark" aria-label="Dark theme">' + icon('moon') + '</button></div></div>';
    return h;
  }

  /* The full navigation belongs to the home page only (body.kv-home). Inner pages never get a second bar:
     they use their own navigation (if they have one) or none. Back + Home come from /platform/kv-dock.js on every page. */
  var SHOW_INNER_BAR = false;
  function renderInner(host) {
    document.documentElement.classList.add('kv-inner');
    if (!SHOW_INNER_BAR) { host.style.display = 'none'; document.documentElement.classList.add('kv-nobar'); return; }
    host.classList.add('kvb-inner');
    host.innerHTML = '<nav class="kvs" aria-label="KAIVYRA"><a class="kvs-brand" href="/" aria-label="KAIVYRA home">' + LOGO + '<span>KAIVYRA</span></a><a class="kvs-home" href="/">\u2190 Home</a></nav>';
  }

  function build() {
    var host = document.getElementById('kv-global-bar');
    if (!host) { host = document.createElement('div'); host.id = 'kv-global-bar'; document.body.insertBefore(host, document.body.firstChild); }
    if (!document.body.classList.contains('kv-home')) { renderInner(host); return; }
    var act = activeId(), page = normPath(location.pathname), html = '', MENUS = [], coarse = false;
    html += '<nav class="kvb" aria-label="KAIVYRA"><button class="kvb-ham" type="button" id="kvb-burger" aria-label="Open menu" aria-expanded="false" aria-controls="kvb-drawer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button><a class="kvb-brand" href="/" aria-label="KAIVYRA home">' + LOGO + '<span>KAIVYRA</span></a>';
    html += '<ul class="kvb-nav" id="kvb-nav">';
    NAV.forEach(function (n) {
      html += '<li>';
      if (n.groups) {
        html += '<button class="kvb-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="kvm-' + n.id + '" data-menu="' + n.id + '"' + (act === n.id ? ' aria-current="true"' : '') + '>' + esc(n.label) + CHEV + '</button>';
        html += '<div class="kvb-menu nav-dropdown" id="kvm-' + n.id + '" role="menu" aria-label="' + esc(n.label) + '">' + menuHTML(n, page) + '</div>';
      } else {
        html += '<a class="kvb-link" href="' + n.href + '"' + (act === n.id ? ' aria-current="page"' : '') + (n.tip ? ' title="' + esc(n.tip) + '"' : '') + ' data-link="' + n.id + '">' + esc(n.label) + (n.count ? '<span class="kvb-count" hidden></span>' : '') + '</a>';
      }
      html += '</li>';
    });
    html += '</ul><div class="kvb-tools">';
    html += '<button class="kvb-sbtn" type="button" id="kvb-sbtn" aria-label="Search research" aria-expanded="false"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M14 14l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>';
    html += '<form class="kvb-search" id="kvb-form" role="search" action="/research/" method="get"><label class="kv-sr" for="kvb-q" style="position:absolute;left:-9999px">Search medical research</label><input id="kvb-q" name="q" type="search" placeholder="Search PubMed-indexed research" autocomplete="off" maxlength="200" role="combobox" aria-expanded="false" aria-controls="kvb-sug" aria-autocomplete="list"><div class="kvb-sug" id="kvb-sug" role="listbox" hidden></div><p class="kvb-sh">Press Enter to search publications. Jump anywhere with ' + kbd() + '</p></form>';
    html += '<button class="kvb-lang" type="button" id="kvb-lang" aria-haspopup="true" aria-expanded="false" aria-label="Language">EN' + CHEV + '</button>';
    html += '<div class="kvb-menu kvb-lm" id="kvb-lm" role="menu"><div class="kvb-panel kvb-simple"><a role="menuitem" href="#" data-lang="en" lang="en">English</a><a role="menuitem" href="#" data-lang="hi" lang="hi">\u0939\u093f\u0928\u094d\u0926\u0940</a></div></div>';
    html += '</div><a class="kvb-cta" id="kvb-ai" href="/ai-lab/" title="KAIVYRA AI" aria-label="Open KAIVYRA AI">' + LOGO.replace('<svg ', '<svg class="kvb-logo" ') + '<span>KAIVYRA AI</span></a></nav>';
    html += '<span class="kvb-ind" aria-hidden="true"></span><span class="kvb-prog" aria-hidden="true"></span>';
    host.innerHTML = html;

    var bar = host.querySelector('.kvb'), burger = document.getElementById('kvb-burger'), ind = host.querySelector('.kvb-ind'), prog = host.querySelector('.kvb-prog');
    var sform = document.getElementById('kvb-form'), sbtn = document.getElementById('kvb-sbtn'), sq = document.getElementById('kvb-q'), sug = document.getElementById('kvb-sug');
    var lbtn = document.getElementById('kvb-lang'), lmenu = document.getElementById('kvb-lm');
    var tops = Array.prototype.slice.call(host.querySelectorAll('.kvb-nav > li > .kvb-btn, .kvb-nav > li > .kvb-link'));
    var hoverT = null, closeT = null, sugItems = [], sugI = -1, pref = {}, nprefetch = 0;
    function mobile() { return window.innerWidth <= 1040; }

    NAV.forEach(function (n) { if (n.groups) MENUS.push({ id: n.id, n: n, el: document.getElementById('kvm-' + n.id), btn: host.querySelector('[data-menu="' + n.id + '"]'), w: n.w, pinned: false, byHover: false }); });
    MENUS.push({ id: 'lang', el: lmenu, btn: lbtn, pinned: false, byHover: false });
    function byId(id) { return MENUS.filter(function (m) { return m.id === id; })[0]; }

    /* ---- gliding indicator ---- */
    function moveInd(el) {
      if (!el || mobile()) { ind.style.opacity = '0'; return; }
      var r = el.getBoundingClientRect(), b = host.getBoundingClientRect();
      ind.style.opacity = '1'; ind.style.width = Math.max(0, r.width - 30) + 'px';
      ind.style.transform = 'translate(' + (r.left - b.left + 15) + 'px,' + (r.bottom - b.top - 4) + 'px)';
    }
    function settle() {
      var t = null;
      MENUS.forEach(function (m) { if (m.id !== 'lang' && m.el.classList.contains('open')) t = m.btn; });
      moveInd(t || host.querySelector('.kvb-nav [aria-current]'));
    }

    /* ---- menus ---- */
    function place(m) {
      if (m.id === 'lang') return;
      if (mobile()) { m.el.style.left = ''; m.el.style.width = ''; return; }
      var w = Math.min(m.w, window.innerWidth - 32), br = host.getBoundingClientRect(), r = m.btn.getBoundingClientRect();
      var left = r.left - br.left + r.width / 2 - w / 2; left = Math.max(16 - br.left, Math.min(left, window.innerWidth - w - 16 - br.left));
      m.el.style.width = w + 'px'; m.el.style.left = left + 'px';
    }
    function closeMenu(m) { m.el.classList.remove('open'); m.btn.setAttribute('aria-expanded', 'false'); m.pinned = false; m.byHover = false; }
    function closeMenus(except) { MENUS.forEach(function (m) { if (m !== except) closeMenu(m); }); settle(); }
    function closeSearch() { sform.classList.remove('open'); sbtn.setAttribute('aria-expanded', 'false'); hideSug(); }
    function openMenu(m, hover) {
      closeSearch(); closeMenus(m);
      if (m.id === 'discover') { var rl = m.el.querySelector('.kvb-rail'); if (rl) rl.outerHTML = railHTML('discover'); }
      m.el.classList.add('open'); m.btn.setAttribute('aria-expanded', 'true'); m.byHover = !!hover; m.pinned = !hover;
      place(m); settle();
    }
    function focusFirst(m) { var f = m.el.querySelector('a'); if (f) f.focus(); }
    function closeMobile() { if (document.body.classList.contains('kvb-dopen') && window.__kvSetDrawer) window.__kvSetDrawer(false); }

    MENUS.forEach(function (m) {
      if (m.id === 'lang') {
        m.btn.addEventListener('click', function (e) { e.stopPropagation(); closeSearch(); var o = !m.el.classList.contains('open'); closeMenus(m); if (o) { m.el.classList.add('open'); m.btn.setAttribute('aria-expanded', 'true'); m.pinned = true; } else closeMenu(m); });
        m.el.addEventListener('click', function (e) { e.preventDefault(); var a = e.target.closest('a[data-lang]'); if (a && window.KVI18N) window.KVI18N.set(a.getAttribute('data-lang')); closeMenus(); });
        return;
      }
      var li = m.btn.parentNode;
      li.addEventListener('pointerenter', function (e) {
        if (e.pointerType !== 'mouse' || mobile()) return;
        clearTimeout(closeT); clearTimeout(hoverT);
        if (m.el.classList.contains('open')) return;
        var any = MENUS.some(function (x) { return x.id !== 'lang' && x.el.classList.contains('open'); });
        hoverT = setTimeout(function () { openMenu(m, true); }, any ? 0 : 90);
      });
      li.addEventListener('pointerleave', function (e) {
        if (e.pointerType !== 'mouse' || mobile()) return;
        clearTimeout(hoverT);
        if (m.el.classList.contains('open') && !m.pinned) { closeT = setTimeout(function () { closeMenu(m); settle(); }, 190); }
      });
      m.btn.addEventListener('click', function (e) {
        e.stopPropagation(); clearTimeout(hoverT); clearTimeout(closeT); closeSearch();
        var isOpen = m.el.classList.contains('open');
        if (isOpen && m.byHover) { m.pinned = true; m.byHover = false; }
        else if (isOpen) { closeMenu(m); settle(); }
        else { openMenu(m, false); if (e.detail === 0) focusFirst(m); }
      });
      m.btn.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') { e.preventDefault(); if (!m.el.classList.contains('open')) openMenu(m, false); focusFirst(m); }
      });
      m.el.addEventListener('keydown', function (e) {
        var items = Array.prototype.slice.call(m.el.querySelectorAll('a')), i = items.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
        else if (e.key === 'Escape') { e.stopPropagation(); closeMenus(); m.btn.focus(); }
        else if (e.key === 'Home') { e.preventDefault(); items[0].focus(); }
        else if (e.key === 'End') { e.preventDefault(); items[items.length - 1].focus(); }
        else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !mobile()) { e.preventDefault(); stepTop(m.btn, e.key === 'ArrowRight' ? 1 : -1, true); }
      });
      m.el.addEventListener('click', function (e) {
        var pal = e.target.closest('[data-kvp]');
        if (pal) { closeMenus(); closeMobile(); if (window.KVPalette) window.KVPalette.open(); return; }
        var a = e.target.closest('a[data-open]');
        if (a && typeof window.KVOpenPanel === 'function') { e.preventDefault(); window.KVOpenPanel(a.getAttribute('data-open')); }
        closeMenus(); closeMobile();
      });
    });

    /* roving menubar: Left/Right/Home/End across top-level controls */
    function stepTop(from, dir, openIt) {
      var i = tops.indexOf(from); if (i < 0) return;
      var t = tops[(i + dir + tops.length) % tops.length], m = byId(t.getAttribute('data-menu'));
      if (m && openIt) { openMenu(m, false); focusFirst(m); } else { closeMenus(); t.focus(); }
    }
    tops.forEach(function (t) {
      t.addEventListener('keydown', function (e) {
        if (mobile()) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); stepTop(t, 1, false); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); stepTop(t, -1, false); }
        else if (e.key === 'Home') { e.preventDefault(); closeMenus(); tops[0].focus(); }
        else if (e.key === 'End') { e.preventDefault(); closeMenus(); tops[tops.length - 1].focus(); }
      });
      t.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse' && !mobile()) moveInd(t); });
      t.addEventListener('focus', function () { moveInd(t); });
    });
    host.querySelector('.kvb-nav').addEventListener('pointerleave', function () { setTimeout(settle, 200); });
    host.addEventListener('focusout', function (e) { if (e.relatedTarget && !host.contains(e.relatedTarget)) { closeMenus(); closeSearch(); } });

    /* ---- search with live suggestions ---- */
    var FLAT = flat();
    function hideSug() { sug.hidden = true; sug.innerHTML = ''; sugItems = []; sugI = -1; sq.setAttribute('aria-expanded', 'false'); sq.removeAttribute('aria-activedescendant'); }
    function renderSug() {
      var q = sq.value.trim(); if (!q) { hideSug(); return; }
      var ql = q.toLowerCase(), enc = encodeURIComponent(q), rows = [
        { label: 'Search publications for \u201c' + q + '\u201d', sub: 'Europe PMC, PubMed-indexed', href: '/research/?q=' + enc, ic: 'research' },
        { label: 'Search trials for \u201c' + q + '\u201d', sub: 'ClinicalTrials.gov', href: '/trials/?cond=' + enc, ic: 'trials' }];
      FLAT.forEach(function (m) { if (rows.length < 7 && m.href.indexOf('mailto:') !== 0 && (m.label + ' ' + (m.sub || '')).toLowerCase().indexOf(ql) >= 0) rows.push(m); });
      sugItems = rows; sugI = -1;
      sug.innerHTML = rows.map(function (m, i) { return '<a role="option" id="kvs-' + i + '" href="' + esc(m.href) + '"' + (m.open ? ' data-open="' + m.open + '"' : '') + '><span class="kvb-ic">' + icon(m.ic) + '</span><span class="kvb-tx"><b>' + esc(m.label) + '</b>' + (m.sub ? '<small>' + esc(m.sub) + '</small>' : '') + '</span></a>'; }).join('');
      sug.hidden = false; sq.setAttribute('aria-expanded', 'true');
    }
    function markSug(i) {
      var els = sug.querySelectorAll('a'); Array.prototype.forEach.call(els, function (a, j) { a.classList.toggle('on', j === i); a.setAttribute('aria-selected', String(j === i)); });
      if (i >= 0) sq.setAttribute('aria-activedescendant', 'kvs-' + i); else sq.removeAttribute('aria-activedescendant');
    }
    sq.addEventListener('input', renderSug);
    sq.addEventListener('keydown', function (e) {
      if (!sugItems.length) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); sugI = (sugI + 1) % sugItems.length; markSug(sugI); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sugI = (sugI - 1 + sugItems.length) % sugItems.length; markSug(sugI); }
      else if (e.key === 'Enter' && sugI >= 0) { e.preventDefault(); var a = sug.querySelectorAll('a')[sugI]; if (a) a.click(); }
    });
    sug.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-open]');
      if (a && typeof window.KVOpenPanel === 'function') { e.preventDefault(); window.KVOpenPanel(a.getAttribute('data-open')); closeSearch(); }
    });
    sbtn.addEventListener('click', function (e) {
      e.stopPropagation(); closeMenus(); var o = !sform.classList.contains('open'); sform.classList.toggle('open', o); sbtn.setAttribute('aria-expanded', String(o));
      if (o) { sq.focus(); renderSug(); } else hideSug();
    });
    sform.addEventListener('click', function (e) { e.stopPropagation(); });

    /* ---- workspace count (this browser only) ---- */
    function refreshCount() {
      var c = wsCount(), a = host.querySelector('[data-link="workspace"]'); if (!a) return;
      var b = a.querySelector('.kvb-count');
      if (c > 0) { b.hidden = false; b.textContent = c > 99 ? '99+' : String(c); a.setAttribute('aria-label', 'Workspace, ' + c + ' saved item' + (c === 1 ? '' : 's')); }
      else { b.hidden = true; b.textContent = ''; a.removeAttribute('aria-label'); }
    }
    refreshCount();
    addEventListener('storage', refreshCount); addEventListener('focus', refreshCount); document.addEventListener('visibilitychange', refreshCount);
    host.addEventListener('pointerenter', refreshCount);

    /* ---- prefetch same-origin pages on intent ---- */
    function prefetch(e) {
      var a = e.target.closest && e.target.closest('a[href^="/"]'); if (!a || a.hasAttribute('data-open') || nprefetch >= 8) return;
      var c = navigator.connection; if (c && (c.saveData || /2g/.test(c.effectiveType || ''))) return;
      var u = a.getAttribute('href').split('#')[0]; if (!u || u === location.pathname + location.search || pref[u] || u.indexOf('/?panel=') === 0) return;
      pref[u] = 1; nprefetch++; var l = document.createElement('link'); l.rel = 'prefetch'; l.href = u; document.head.appendChild(l);
    }
    host.addEventListener('pointerover', prefetch); host.addEventListener('focusin', prefetch);

    /* ---- global handlers ---- */
    document.addEventListener('click', function (e) { if (!host.contains(e.target)) { closeMenus(); closeSearch(); } });
    /* ---- left drawer (hamburger): every section of the site, language and theme ---- */
    ['kvb-drawer', 'kvb-scrim'].forEach(function (id) { var o = document.getElementById(id); if (o) o.parentNode.removeChild(o); });
    var scrim = document.createElement('div'); scrim.className = 'kvb-scrim'; scrim.id = 'kvb-scrim';
    var dr = document.createElement('aside'); dr.className = 'kvb-drawer'; dr.id = 'kvb-drawer'; dr.setAttribute('aria-label', 'Site sections'); dr.innerHTML = drawerHTML(page);
    document.body.appendChild(scrim); document.body.appendChild(dr);
    function drawerOpen() { return document.body.classList.contains('kvb-dopen'); }
    function setDrawer(o) {
      document.body.classList.toggle('kvb-dopen', o);
      burger.setAttribute('aria-expanded', String(o)); burger.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
      if (o) { closeMenus(); closeSearch(); dr.classList.toggle('no-theme', !document.getElementById('kv-theme')); var a = dr.querySelector('.kvb-feat'); if (a) try { a.focus({ preventScroll: true }); } catch (e) { } }
    }
    window.__kvSetDrawer = setDrawer;
    /* KAIVYRA AI panel: loaded on first hover/focus/click so it never slows the page */
    var aiBtn = document.getElementById('kvb-ai'), aiLoad = null;
    function loadAI() {
      if (aiLoad) return aiLoad;
      aiLoad = new Promise(function (res, rej) {
        var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = '/platform/ai.css?v=5'; document.head.appendChild(l);
        var sc = document.createElement('script'); sc.src = '/platform/ai.js?v=5'; sc.onload = function () { res(window.KVAI); }; sc.onerror = function () { aiLoad = null; rej(); }; document.head.appendChild(sc);
      });
      return aiLoad;
    }
    if (aiBtn) {
      ['pointerenter', 'focus', 'touchstart'].forEach(function (ev) { aiBtn.addEventListener(ev, loadAI, { once: true, passive: true }); });
      aiBtn.addEventListener('click', function (e) { if (e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); setDrawer(false); loadAI().then(function (k) { k.open(); }).catch(function () { location.href = '/ai-lab/'; }); });
    }
    window.__kvOpenAI = function (q) { loadAI().then(function (k) { k.open(q); }); };
    burger.addEventListener('click', function (e) { e.stopPropagation(); setDrawer(!drawerOpen()); });
    scrim.addEventListener('click', function () { setDrawer(false); });
    dr.addEventListener('click', function (e) {
      if (e.target.closest('.kvb-dx')) { setDrawer(false); burger.focus(); return; }
      var lb = e.target.closest('[data-lang]'); if (lb) { if (window.KVI18N) window.KVI18N.set(lb.getAttribute('data-lang')); return; }
      var tb = e.target.closest('[data-theme-btn]'); if (tb) { var cur = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'; var t0 = document.getElementById('kv-theme'); if (t0 && cur !== tb.getAttribute('data-theme-btn')) t0.click(); syncDr(); return; }
      if (e.target.closest('a')) setDrawer(false);
    });
    function syncDr() {
      var l = window.KVI18N ? window.KVI18N.get() : 'en', th = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
      Array.prototype.forEach.call(dr.querySelectorAll('[data-lang]'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === l)); });
      Array.prototype.forEach.call(dr.querySelectorAll('[data-theme-btn]'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-theme-btn') === th)); });
      lbtn.innerHTML = (l === 'hi' ? 'हिं' : 'EN') + CHEV;
      Array.prototype.forEach.call(lmenu.querySelectorAll('[data-lang]'), function (a) { if (a.getAttribute('data-lang') === l) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    }
    document.addEventListener('kv:lang', syncDr);
    if (window.MutationObserver) new MutationObserver(syncDr).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    syncDr();
    document.addEventListener('click', function (e) { if (!host.contains(e.target)) { closeMenus(); closeSearch(); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeMenus(); closeSearch(); if (drawerOpen()) { setDrawer(false); burger.focus(); } } });
    var rz = null;
    addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (!mobile()) closeMobile(); MENUS.forEach(function (m) { if (m.el.classList.contains('open')) place(m); }); settle(); }, 80); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(settle);
    settle();

    var tick = false, lastY = window.pageYOffset, t0 = Date.now();
    host.addEventListener('focusin', function (e) { if (e.target.matches && e.target.matches(':focus-visible')) host.classList.remove('kvb-hide'); });
    function onScroll() {
      if (tick) return; tick = true;
      requestAnimationFrame(function () {
        tick = false; var y = window.pageYOffset, max = document.documentElement.scrollHeight - window.innerHeight;
        host.classList.toggle('kvb-scrolled', y > 6);
        // v9: any scroll (more than 4px) hides the bar at once, together with open menus; it returns only at the top of the page
        if (y > 4) { if (!host.classList.contains('kvb-hide')) { closeMenus(); closeSearch(); host.classList.add('kvb-hide'); } }
        else host.classList.remove('kvb-hide');
        lastY = y;
        prog.style.transform = 'scaleX(' + (max > 240 ? Math.min(1, y / max) : 0) + ')';
      });
    }
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  function footer() {
    // v10: the footer is now the same Connect band + footer as the main page, rendered by site-pro.js
    if (document.getElementById('kv-footer-skip')) return;
    if (!document.querySelector('link[href*="site-pro.css"]')) { var c = document.createElement('link'); c.rel = 'stylesheet'; c.href = '/platform/site-pro.css?v=1'; document.head.appendChild(c); }
    if (window.KVSitePro) { window.KVSitePro.mountFooter(); return; }
    if (!document.querySelector('script[data-kvs]')) { var j = document.createElement('script'); j.src = '/platform/site-pro.js?v=1'; j.setAttribute('data-kvs', '1'); document.head.appendChild(j); }
  }

  function init() {
    if (!document.querySelector('link[href*="Alegreya"]')) { var f2 = document.createElement('link'); f2.rel = 'stylesheet'; f2.href = 'https://fonts.googleapis.com/css2?family=Alegreya+SC:wght@500;700&family=Poppins:wght@600;700&display=swap'; document.head.appendChild(f2); }
    if (!document.querySelector('link[href*="fonts.googleapis.com/css2"]')) {
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap'; document.head.appendChild(l);
    }
    if (document.body.classList.contains('kv-page') && !document.querySelector('.kv-skip')) {
      var s = document.createElement('a'); s.className = 'kv-skip'; s.href = '#kv-main'; s.textContent = 'Skip to content'; document.body.insertBefore(s, document.body.firstChild);
    }
    if (!window.__kvDock && !document.querySelector('script[data-kv-dock]')) { var ds = document.createElement('script'); ds.src = '/platform/kv-dock.js?v=1'; ds.setAttribute('data-kv-dock', '1'); document.head.appendChild(ds); }
    build(); footer();
    if (!window.KVI18N && !document.querySelector('script[data-kvi]')) { var is = document.createElement('script'); is.src = '/platform/i18n.js?v=1'; is.setAttribute('data-kvi', '1'); is.async = false; document.head.appendChild(is); }
    if (!window.KVPalette && !document.querySelector('script[data-kvp-boot]')) { var ps = document.createElement('script'); ps.src = '/platform/palette.js?v=2'; ps.defer = true; ps.setAttribute('data-kvp-boot', '1'); document.head.appendChild(ps); }
    // Preserve a saved light/dark preference where the page supports it
    try { if (localStorage.getItem('kv_theme') === 'light') document.documentElement.classList.add('light'); } catch (e) {}
  }
  window.KVNav = { CLINICAL: CLINICAL, NAV: NAV, esc: esc };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
