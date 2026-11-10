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

  function build() {
    var host = document.getElementById('kv-global-bar');
    if (!host) { host = document.createElement('div'); host.id = 'kv-global-bar'; document.body.insertBefore(host, document.body.firstChild); }
    var act = activeId(), page = normPath(location.pathname), html = '', MENUS = [], coarse = false;
    html += '<nav class="kvb" aria-label="KAIVYRA"><a class="kvb-brand" href="/" aria-label="KAIVYRA home">' + LOGO + '<span>KAIVYRA</span></a>';
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
    html += '<div class="kvb-menu kvb-lm" id="kvb-lm" role="menu"><div class="kvb-panel kvb-simple"><a role="menuitem" href="#" aria-current="true" data-lang="en">English</a><a role="menuitem" href="#" aria-disabled="true" tabindex="-1">\u0939\u093f\u0928\u094d\u0926\u0940 <small>Translation in progress</small></a></div></div>';
    html += '</div><button class="kvb-burger" type="button" aria-label="Open menu" aria-expanded="false" id="kvb-burger">\u2630</button></nav>';
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
      var left = r.left - br.left + r.width / 2 - w / 2; left = Math.max(16, Math.min(left, window.innerWidth - w - 16));
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
    function closeMobile() { host.classList.remove('kvb-mobopen'); bar.classList.remove('mob-open'); burger.setAttribute('aria-expanded', 'false'); burger.textContent = '\u2630'; document.documentElement.classList.remove('kvb-lock'); }

    MENUS.forEach(function (m) {
      if (m.id === 'lang') {
        m.btn.addEventListener('click', function (e) { e.stopPropagation(); closeSearch(); var o = !m.el.classList.contains('open'); closeMenus(m); if (o) { m.el.classList.add('open'); m.btn.setAttribute('aria-expanded', 'true'); m.pinned = true; } else closeMenu(m); });
        m.el.addEventListener('click', function (e) { e.preventDefault(); closeMenus(); });
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
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeMenus(); closeSearch(); if (bar.classList.contains('mob-open')) { closeMobile(); burger.focus(); } } });
    burger.addEventListener('click', function () {
      var o = !bar.classList.contains('mob-open'); bar.classList.toggle('mob-open', o); host.classList.toggle('kvb-mobopen', o); burger.setAttribute('aria-expanded', String(o)); burger.textContent = o ? '\u2715' : '\u2630';
      document.documentElement.classList.toggle('kvb-lock', o); if (!o) closeMenus();
    });
    var rz = null;
    addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (!mobile()) closeMobile(); MENUS.forEach(function (m) { if (m.el.classList.contains('open')) place(m); }); settle(); }, 80); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(settle);
    settle();

    var tick = false;
    function onScroll() {
      if (tick) return; tick = true;
      requestAnimationFrame(function () {
        tick = false; var y = window.pageYOffset, max = document.documentElement.scrollHeight - window.innerHeight;
        host.classList.toggle('kvb-scrolled', y > 6); prog.style.transform = 'scaleX(' + (max > 240 ? Math.min(1, y / max) : 0) + ')';
      });
    }
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  function footer() {
    if (document.getElementById('kv-footer-skip')) return;
    var f = document.getElementById('kv-footer'); if (!f) return;
    f.innerHTML = '<div class="in"><div><strong>KAIVYRA</strong>: scientific information and education. Not a substitute for professional medical care. Not for diagnosis or treatment decisions. ' +
      'In an emergency call your local emergency number (India: 112).</div><div><a href="/#kaivyra-policy-footer-box">Terms, Disclaimer & Privacy</a> · <a href="/future/">Roadmap</a> · <a href="mailto:the.kaivyra@gmail.com">the.kaivyra@gmail.com</a></div></div>';
  }

  function init() {
    if (!document.querySelector('link[href*="Alegreya"]')) { var f2 = document.createElement('link'); f2.rel = 'stylesheet'; f2.href = 'https://fonts.googleapis.com/css2?family=Alegreya+SC:wght@500;700&family=Poppins:wght@600;700&display=swap'; document.head.appendChild(f2); }
    if (!document.querySelector('link[href*="fonts.googleapis.com/css2"]')) {
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap'; document.head.appendChild(l);
    }
    if (document.body.classList.contains('kv-page') && !document.querySelector('.kv-skip')) {
      var s = document.createElement('a'); s.className = 'kv-skip'; s.href = '#kv-main'; s.textContent = 'Skip to content'; document.body.insertBefore(s, document.body.firstChild);
    }
    build(); footer();
    if (!window.KVPalette && !document.querySelector('script[data-kvp-boot]')) { var ps = document.createElement('script'); ps.src = '/platform/palette.js?v=2'; ps.defer = true; ps.setAttribute('data-kvp-boot', '1'); document.head.appendChild(ps); }
    // Preserve a saved light/dark preference where the page supports it
    try { if (localStorage.getItem('kv_theme') === 'light') document.documentElement.classList.add('light'); } catch (e) {}
  }
  window.KVNav = { CLINICAL: CLINICAL, NAV: NAV, esc: esc };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
