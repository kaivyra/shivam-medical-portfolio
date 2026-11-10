/* KAIVYRA command palette (Ctrl/Cmd+K, or "/" outside inputs). Navigation only: modules, tools, Atlas topics, lenses.
 * atlas-data/atlas-lib (~45 KB) are loaded lazily on first open, same-origin, so every page stays light. */
(function () {
  'use strict';
  var BASE = '/platform/', loaded = null, items = null, box, inp, list, sel = 0, cur = [], lastFocus = null;
  var STATIC = [
    ['Module', 'Research', 'Search PubMed-indexed literature', '/research/'],
    ['Module', 'AI Lab', 'Retrieval-first evidence briefs', '/ai-lab/'],
    ['Module', 'Evidence Lab', 'Compare, appraise, statistics', '/evidence-lab/'],
    ['Module', 'Clinical Intelligence', 'Calculators and score suite', '/clinical/'],
    ['Module', 'Clinical Trials', 'Registered trials, live', '/trials/'],
    ['Module', 'Knowledge Hub', 'Atlas and inquiry framework', '/knowledge/'],
    ['Module', 'Research Domain Atlas', '50 domains, 519 topics', '/knowledge/atlas/'],
    ['Module', 'Medical Inquiry Framework', '15 lenses, 450 dimensions', '/knowledge/framework/'],
    ['Module', 'Report Analyzer', 'Plain-language lab report reading, EN/HI', '/analyzer/'],
    ['Module', 'Medical Arena', 'Daily cases, campaigns and practice', '/arena/'],
    ['Module', 'My Workspace', 'Saved items, private to this browser', '/workspace/'],
    ['Module', 'Roadmap', 'Built, planned, not yet built', '/future/'],
    ['Tool', 'Score Suite', 'CHA2DS2-VASc, HAS-BLED, Wells, CURB-65, qSOFA', '/clinical/#score-suite'],
    ['Tool', 'Meta-analysis and stats', 'Evidence Lab', '/evidence-lab/#meta'],
    ['Tool', 'Appraisal checklists', 'Evidence Lab', '/evidence-lab/#appraise']
  ];
  function el(t, a, h) { var e = document.createElement(t); for (var k in a) e.setAttribute(k, a[k]); if (h != null) e.innerHTML = h; return e; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function norm(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim(); }
  function js(src) { return new Promise(function (ok, no) { if (document.querySelector('script[data-kvp="' + src + '"]')) return ok(); var s = document.createElement('script'); s.src = BASE + src; s.setAttribute('data-kvp', src); s.onload = ok; s.onerror = no; document.head.appendChild(s); }); }
  function load() {
    if (loaded) return loaded;
    loaded = (window.KVAtlas ? Promise.resolve() : js('atlas-data.js').then(function () { return js('atlas-lib.js'); })).then(function () {
      items = STATIC.map(function (r) { return { type: r[0], label: r[1], path: r[2], href: r[3], n: norm(r[1] + ' ' + r[2]) }; });
      window.KVAtlas.paletteIndex().forEach(function (r) { items.push({ type: r[0][0].toUpperCase() + r[0].slice(1), label: r[1], path: r[2], href: r[3], n: norm(r[1] + ' ' + r[2]) }); });
    }).catch(function () { items = STATIC.map(function (r) { return { type: r[0], label: r[1], path: r[2], href: r[3], n: norm(r[1] + ' ' + r[2]) }; }); });
    return loaded;
  }
  function score(it, q, toks) {
    var n = it.n, l = norm(it.label), s = 0;
    if (l === q) s = 100; else if (l.indexOf(q) === 0) s = 80; else if ((' ' + l).indexOf(' ' + q) >= 0) s = 60; else if (n.indexOf(q) >= 0) s = 40; else if (toks.length > 1 && toks.every(function (t) { return n.indexOf(t) >= 0; })) s = 25;
    if (s && it.type === 'Module') s += 12; else if (s && it.type === 'Tool') s += 8; else if (s && it.type === 'Dimension') s -= 6;
    return s;
  }
  function find(q) {
    q = norm(q); if (!items) return [];
    if (!q) return items.filter(function (i) { return i.type === 'Module' || i.type === 'Tool'; }).slice(0, 14);
    var toks = q.split(' '), r = [];
    items.forEach(function (i) { var s = score(i, q, toks); if (s) r.push([s, i]); });
    r.sort(function (a, b) { return b[0] - a[0] || a[1].label.length - b[1].label.length; });
    return r.slice(0, 30).map(function (x) { return x[1]; });
  }
  function paint() {
    cur = find(inp.value); sel = 0; var q = inp.value.trim();
    list.innerHTML = cur.map(function (i, k) { return '<li role="presentation"><a role="option" id="kvpo' + k + '" href="' + esc(i.href) + '"' + (k === 0 ? ' aria-selected="true"' : '') + '><span class="t">' + esc(i.type) + '</span><span class="l">' + esc(i.label) + '</span><small>' + esc(i.path) + '</small></a></li>'; }).join('') +
      (q.length > 1 ? '<li role="presentation"><a role="option" id="kvpr" href="/research/?q=' + encodeURIComponent(q) + '"><span class="t">Search</span><span class="l">Search the literature for “' + esc(q) + '”</span><small>Europe PMC</small></a></li>' : '');
    if (cur.length === 0 && q.length > 1) { var f = list.querySelector('a'); if (f) f.setAttribute('aria-selected', 'true'); }
  }
  function mark(n) { var as = list.querySelectorAll('a[role=option]'); if (!as.length) return; n = Math.max(0, Math.min(as.length - 1, n)); as.forEach(function (a) { a.removeAttribute('aria-selected'); }); as[n].setAttribute('aria-selected', 'true'); as[n].scrollIntoView({ block: 'nearest' }); inp.setAttribute('aria-activedescendant', as[n].id); sel = n; }
  function build() {
    var st = el('style', {}, '#kvp-ov{position:fixed;inset:0;z-index:99999;background:rgba(2,6,15,.62);display:none;align-items:flex-start;justify-content:center;padding:12vh 16px 16px;backdrop-filter:blur(3px)}#kvp-ov.on{display:flex}' +
      '#kvp-box{width:min(640px,100%);background:var(--kv-panel,#0b1324);color:var(--kv-text,#eef2f9);border:1px solid var(--kv-line,#1d2c4b);border-radius:16px;box-shadow:0 30px 80px rgba(0,0,0,.55);overflow:hidden;font:14px/1.4 var(--kv-font,Inter,system-ui,sans-serif)}' +
      '#kvp-in{width:100%;box-sizing:border-box;border:0;border-bottom:1px solid var(--kv-line,#1d2c4b);background:transparent;color:inherit;font:inherit;font-size:16px;padding:16px 18px;outline:none}' +
      '#kvp-ls{list-style:none;margin:0;padding:6px;max-height:min(52vh,420px);overflow:auto}#kvp-ls a{display:flex;gap:10px;align-items:baseline;padding:9px 11px;border-radius:9px;color:inherit;text-decoration:none}' +
      '#kvp-ls a[aria-selected=true],#kvp-ls a:hover{background:rgba(34,211,238,.15)}#kvp-ls .t{flex:0 0 78px;font:600 10px ui-monospace,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase;color:#22d3ee}#kvp-ls .l{flex:1}#kvp-ls small{color:var(--kv-mute,#93a3bd);font-size:11.5px;text-align:right}' +
      '#kvp-ft{display:flex;justify-content:space-between;gap:10px;padding:8px 14px;border-top:1px solid var(--kv-line,#1d2c4b);color:var(--kv-mute,#93a3bd);font-size:11.5px}html.light #kvp-box{background:#fff;color:#0f172a}' +
      '@media(max-width:520px){#kvp-ls small{display:none}#kvp-ls .t{flex-basis:64px}}');
    document.head.appendChild(st);
    box = el('div', { id: 'kvp-ov', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Quick navigation' }, '<div id="kvp-box"><input id="kvp-in" type="text" role="combobox" aria-expanded="true" aria-controls="kvp-ls" aria-autocomplete="list" autocomplete="off" spellcheck="false" placeholder="Jump to a module, tool, Atlas topic or lens…" aria-label="Quick navigation search"><ul id="kvp-ls" role="listbox" aria-label="Results"></ul><div id="kvp-ft"><span>↑↓ move · Enter open · Esc close</span><span>Navigation only. Nothing is sent anywhere.</span></div></div>');
    document.body.appendChild(box); inp = document.getElementById('kvp-in'); list = document.getElementById('kvp-ls');
    inp.addEventListener('input', paint);
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); mark(sel + 1); } else if (e.key === 'ArrowUp') { e.preventDefault(); mark(sel - 1); }
      else if (e.key === 'Enter') { var a = list.querySelectorAll('a[role=option]')[sel]; if (a) { e.preventDefault(); location.href = a.getAttribute('href'); } }
      else if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'Tab') { e.preventDefault(); }
    });
    box.addEventListener('mousedown', function (e) { if (e.target === box) close(); });
  }
  function open() {
    if (!box) build(); lastFocus = document.activeElement; box.classList.add('on'); inp.value = ''; inp.focus();
    items = items || STATIC.map(function (r) { return { type: r[0], label: r[1], path: r[2], href: r[3], n: norm(r[1] + ' ' + r[2]) }; }); paint();
    load().then(function () { if (box.classList.contains('on')) paint(); });
  }
  function close() { if (box) box.classList.remove('on'); if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {} }
  document.addEventListener('keydown', function (e) {
    var k = (e.key || '').toLowerCase();
    if ((e.ctrlKey || e.metaKey) && k === 'k') { e.preventDefault(); (box && box.classList.contains('on')) ? close() : open(); return; }
    if (k === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) { var t = e.target, tag = t && t.tagName; if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return; e.preventDefault(); open(); }
  });
  window.KVPalette = { open: open, close: close };
})();
