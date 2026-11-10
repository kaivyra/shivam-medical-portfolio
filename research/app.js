(function () {
  'use strict';
  var R = KVResearch, ui = KVUI, $ = function (i) { return document.getElementById(i); }, esc = R.esc;
  var cursors = ['*'], page = 0, ctl = null, PAGE = 20;

  function wrapField(q, f) { q = q.trim(); if (!q || f === 'all') return q; var c = q.replace(/["\u0000-\u001f]/g, ''); return (f === 'author' ? 'AUTH' : f === 'journal' ? 'JOURNAL' : 'TITLE') + ':"' + c + '"'; }
  function read() {
    return { q: wrapField($('q').value, $('field').value), raw: $('q').value.trim(), field: $('field').value,
      designs: Array.prototype.map.call(document.querySelectorAll('input[name=design]:checked'), function (c) { return c.value; }),
      yearFrom: $('yf').value, yearTo: $('yt').value, sources: $('src').value, sort: $('sort').value, openAccess: $('oa').checked, hasAbstract: $('abs').checked, humans: $('hum').checked, pageSize: PAGE };
  }
  function toURL(s) {
    var p = new URLSearchParams(); if (s.raw) p.set('q', s.raw); if (s.field !== 'all') p.set('f', s.field); if (s.designs.length) p.set('d', s.designs.join(','));
    if (s.yearFrom) p.set('from', s.yearFrom); if (s.yearTo) p.set('to', s.yearTo); if (s.sources !== 'med') p.set('src', s.sources); if (s.sort !== 'relevance') p.set('sort', s.sort);
    if (s.openAccess) p.set('oa', '1'); if (s.hasAbstract) p.set('abs', '1'); if (s.humans) p.set('hum', '1'); return p.toString();
  }
  function fromURL() {
    var p = new URLSearchParams(location.search); $('q').value = p.get('q') || ''; $('field').value = ['title', 'author', 'journal'].indexOf(p.get('f')) >= 0 ? p.get('f') : 'all';
    var d = (p.get('d') || '').split(','); document.querySelectorAll('input[name=design]').forEach(function (c) { c.checked = d.indexOf(c.value) >= 0; });
    $('yf').value = /^\d{4}$/.test(p.get('from') || '') ? p.get('from') : ''; $('yt').value = /^\d{4}$/.test(p.get('to') || '') ? p.get('to') : '';
    $('src').value = ['medpmc', 'preprints'].indexOf(p.get('src')) >= 0 ? p.get('src') : 'med'; $('sort').value = ['date', 'cited'].indexOf(p.get('sort')) >= 0 ? p.get('sort') : 'relevance';
    $('oa').checked = p.get('oa') === '1'; $('abs').checked = p.get('abs') === '1'; $('hum').checked = p.get('hum') === '1';
    if (d[0] || p.get('from') || p.get('to') || p.get('src') || p.get('oa') || p.get('abs') || p.get('hum') || p.get('sort')) $('adv').open = true;
    return !!(p.get('q') || d[0]);
  }
  function groupHTML(papers, terms) {
    var by = {}; papers.forEach(function (p) { (by[p.study.group] = by[p.study.group] || []).push(p); });
    return R.GROUPS.filter(function (g) { return by[g[0]]; }).map(function (g) {
      return '<h2 class="kv-h2">' + esc(g[1]) + ' <span class="kv-badge">' + by[g[0]].length + '</span></h2>' + by[g[0]].map(function (p) { return ui.card(p, { terms: terms }); }).join('');
    }).join('');
  }
  async function run(resetPage) {
    var s = read(); if (resetPage) { cursors = ['*']; page = 0; }
    if (!s.q && !s.designs.length) { $('status').textContent = 'Enter a search term or choose a study type.'; return; }
    if (ctl) ctl.abort(); ctl = new AbortController();
    history.replaceState(null, '', location.pathname + (toURL(s) ? '?' + toURL(s) : ''));
    $('out').setAttribute('aria-busy', 'true'); $('out').innerHTML = '<div class="kv-skel"></div><div class="kv-skel"></div><div class="kv-skel"></div>'; $('status').textContent = 'Searching Europe PMC…'; $('pager').hidden = true;
    s.cursor = cursors[page];
    var ext = 'https://europepmc.org/search?query=' + encodeURIComponent(s.q), pm = 'https://pubmed.ncbi.nlm.nih.gov/?term=' + encodeURIComponent(s.raw);
    try {
      var r = await R.searchPapers(s, { signal: ctl.signal }), terms = R.terms(s.raw);
      if (resetPage && page === 0) KVWorkspace.pushHistory('search', s.raw || '(filters only)', { n: r.hitCount });
      $('status').innerHTML = '<span><strong>' + r.hitCount.toLocaleString() + '</strong> records match.</span><span>' + esc(R.retrievalLine(r, 'Europe PMC (PubMed/MEDLINE, PMC)')) + '</span><a class="kv-link" href="' + esc(ext) + '" target="_blank" rel="noopener noreferrer">Open this search on Europe PMC</a><a class="kv-link" href="' + esc(pm) + '" target="_blank" rel="noopener noreferrer">Search PubMed</a>';
      if (!r.papers.length) {
        $('out').innerHTML = '<div class="kv-empty"><strong>No records matched.</strong><br>Try fewer words, remove filters (especially study type and year), or check spelling. KAIVYRA shows only what the source returns.</div>';
      } else {
        $('out').innerHTML = ($('grp').checked ? groupHTML(r.papers, terms) : r.papers.map(function (p) { return ui.card(p, { terms: terms }); }).join(''));
      }
      $('out').setAttribute('aria-busy', 'false');
      if (r.nextCursor && r.nextCursor !== cursors[page] && r.papers.length > 0) cursors[page + 1] = r.nextCursor; else cursors.length = page + 1;
      $('pager').hidden = !(page > 0 || cursors[page + 1]); $('prev').disabled = page === 0; $('next').disabled = !cursors[page + 1]; $('pn').textContent = 'Page ' + (page + 1);
    } catch (e) {
      if (e && e.name === 'AbortError') return;
      $('out').setAttribute('aria-busy', 'false'); $('status').textContent = '';
      $('out').innerHTML = '<div class="kv-note err" role="alert">' + R.friendlyError(e, 'Europe PMC', ext) + '</div>';
    }
  }
  $('sf').addEventListener('submit', function (e) { e.preventDefault(); run(true); });
  $('prev').addEventListener('click', function () { if (page > 0) { page--; run(false); window.scrollTo(0, 0); } });
  $('next').addEventListener('click', function () { if (cursors[page + 1]) { page++; run(false); window.scrollTo(0, 0); } });
  $('grp').addEventListener('change', function () { if ($('out').querySelector('.kv-result')) run(false); });
  if (fromURL()) run(true);
})();
