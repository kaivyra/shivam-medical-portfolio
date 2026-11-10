/* Knowledge Hub landing: counts, universal search over atlas + framework, saved topics. */
(function () {
  'use strict';
  var A = window.KVAtlas, U = window.KVUtil, esc = U.esc, $ = function (i) { return document.getElementById(i); };
  var c = A.counts();
  $('kkpis').innerHTML = [[c.domains, 'research domains'], [c.topics, 'atlas topics'], [c.lenses, 'inquiry lenses'], [c.dimensions, 'inquiry dimensions']].map(function (k) { return '<div class="kv-kpi"><div class="n">' + k[0] + '</div><div class="l">' + k[1] + '</div></div>'; }).join('');
  $('kcounts').textContent = c.domains + ' domains, ' + c.topics + ' topics (' + c.addedTopics + ' added by KAIVYRA to domains 47-50), ' + c.lenses + ' lenses, ' + c.dimensions + ' dimensions. Taxonomy curated by KAIVYRA; not MeSH.';
  $('kn-a').textContent = c.domains + ' domains · ' + c.topics + ' topics'; $('kn-f').textContent = c.lenses + ' lenses · ' + c.dimensions + ' dimensions';
  var TYPE = { domain: 'Domain', topic: 'Topic', lens: 'Lens', dimension: 'Dimension' }, inp = $('ks'), list = $('kr'), sel = -1, cur = [];
  function render() {
    var q = inp.value; cur = q.trim().length > 1 ? A.search(q, 24) : []; sel = -1;
    list.innerHTML = cur.map(function (r, i) { return '<li role="presentation"><a role="option" id="kr' + i + '" href="' + esc(r.href) + '"><span class="kn-type">' + TYPE[r.type] + '</span><span style="flex:1">' + esc(r.label) + '</span><small>' + esc(r.path) + '</small></a></li>'; }).join('');
    if (q.trim().length > 1 && !cur.length) list.innerHTML = '<li style="padding:10px;color:var(--kv-mute);font-size:13px">No atlas or framework entry matches “' + esc(q) + '”. <a href="/research/?q=' + encodeURIComponent(q) + '" style="color:var(--kv-cyan)">Search the literature for it</a>.</li>';
    inp.setAttribute('aria-expanded', cur.length ? 'true' : 'false');
  }
  function mark(n) { var as = list.querySelectorAll('a[role=option]'); as.forEach(function (a) { a.removeAttribute('aria-selected'); }); if (as[n]) { as[n].setAttribute('aria-selected', 'true'); as[n].scrollIntoView({ block: 'nearest' }); inp.setAttribute('aria-activedescendant', as[n].id); } sel = n; }
  inp.addEventListener('input', U.debounce(render, 80));
  inp.addEventListener('keydown', function (e) {
    var n = list.querySelectorAll('a[role=option]').length;
    if (e.key === 'ArrowDown') { e.preventDefault(); mark(Math.min(n - 1, sel + 1)); } else if (e.key === 'ArrowUp') { e.preventDefault(); mark(Math.max(0, sel - 1)); }
    else if (e.key === 'Enter') { var a = list.querySelectorAll('a[role=option]')[Math.max(sel, 0)]; if (a) { e.preventDefault(); location.href = a.getAttribute('href'); } }
    else if (e.key === 'Escape') { inp.value = ''; render(); }
  });
  function saved() {
    var t = window.KVWorkspace ? KVWorkspace.listTopics() : [], el = $('saved');
    el.innerHTML = t.length ? t.map(function (x) { return '<a href="' + esc(x.url || '#') + '">' + esc(x.label) + '</a>'; }).join('') : '<span style="color:var(--kv-mute);font-size:13px">Nothing saved yet. Open any topic and choose “Save topic”. Saved items stay in this browser only.</span>';
  }
  saved(); window.addEventListener('kv-workspace-change', saved);
})();
