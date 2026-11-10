/* Research Domain Atlas: 50 domains / 519 topics. Filters, A-Z index, deep link #dNN. */
(function () {
  'use strict';
  var A = window.KVAtlas, U = window.KVUtil, esc = U.esc, $ = function (i) { return document.getElementById(i); };
  var c = A.counts(), P = new URLSearchParams(location.search);
  var st = { g: A.groupById[P.get('g')] ? P.get('g') : '', q: (P.get('q') || '').slice(0, 80), view: P.get('view') === 'az' ? 'az' : 'dom' };
  $('at-lead').textContent = A.data.universeIntro.text + ' ' + c.domains + ' domains, ' + c.topics + ' topics in ' + c.groups + ' groups. Topics in domains 47–50 (' + c.addedTopics + ') were added by KAIVYRA to complete the map.';
  $('aq').value = st.q;
  function url() { var p = new URLSearchParams(); if (st.g) p.set('g', st.g); if (st.q) p.set('q', st.q); if (st.view === 'az') p.set('view', 'az'); var s = p.toString(); history.replaceState(null, '', location.pathname + (s ? '?' + s : '') + location.hash); }
  function matchDomain(d) {
    if (st.g && d.g !== st.g) return null; var q = A.norm(st.q);
    if (!q) return d.s.map(function (t, i) { return i; });
    var dn = A.norm(d.t + ' ' + d.d); if (dn.indexOf(q) >= 0) return d.s.map(function (t, i) { return i; });
    var idx = []; d.s.forEach(function (t, i) { if (A.norm(t).indexOf(q) >= 0) idx.push(i); }); return idx.length ? idx : null;
  }
  function groups() {
    $('agroups').innerHTML = '<button type="button" data-g="" aria-pressed="' + (!st.g) + '">All groups <span>' + c.domains + '</span></button>' + A.groups.map(function (g) { return '<button type="button" data-g="' + g.id + '" aria-pressed="' + (st.g === g.id) + '">' + esc(g.n) + ' <span>' + g.ids.length + '</span></button>'; }).join('');
  }
  var openSet = {};
  function domCard(d, idx) {
    var open = openSet[d.id] || (st.q && idx.length < d.s.length) || ('#d' + d.id === location.hash);
    return '<details class="kv-card kn-dom" id="d' + d.id + '"' + (open ? ' open' : '') + ' data-d="' + d.id + '"><summary><span class="kn-id">' + d.id + '</span><h3>' + esc(d.t) + '</h3><span class="kn-ct">' + (idx.length === d.s.length ? d.s.length : idx.length + '/' + d.s.length) + ' topics</span><p class="kn-ds">' + esc(d.d) + '</p></summary><div class="kn-topics">' +
      idx.map(function (i) { return '<a href="' + A.topicHref(d.id, i) + '"' + (d.x ? ' class="x" title="Added by KAIVYRA to complete this domain"' : '') + '>' + esc(d.s[i]) + '</a>'; }).join('') + '</div></details>';
  }
  function render() {
    groups(); var out = '', shown = 0, nd = 0;
    $('v-dom').setAttribute('aria-pressed', st.view === 'dom'); $('v-az').setAttribute('aria-pressed', st.view === 'az');
    $('aexp').hidden = $('acol').hidden = st.view === 'az';
    if (st.view === 'dom') {
      A.groups.forEach(function (g) {
        var cards = '', n = 0;
        g.ids.forEach(function (id) { var d = A.byId[id], idx = matchDomain(d); if (idx) { cards += domCard(d, idx); n++; nd++; shown += idx.length; } });
        if (n) out += '<section class="kn-group"><h2 class="kv-h2">' + esc(g.n) + ' <small>' + n + ' domain' + (n > 1 ? 's' : '') + '</small></h2><div class="kn-doms">' + cards + '</div></section>';
      });
    } else {
      var q = A.norm(st.q), by = {};
      A.allTopics().forEach(function (t) {
        if (st.g && A.byId[t.d].g !== st.g) return; if (q && A.norm(t.name + ' ' + t.domain).indexOf(q) < 0) return;
        var L = (t.name[0] || '#').toUpperCase(); (by[L] = by[L] || []).push(t); shown++;
      });
      Object.keys(by).sort().forEach(function (L) { by[L].sort(function (a, b) { return a.name < b.name ? -1 : a.name > b.name ? 1 : 0; }); out += '<div class="kn-az-block"><h3>' + L + '</h3><ul>' + by[L].map(function (t) { return '<li><a href="' + t.href + '">' + esc(t.name) + '</a><small>' + esc(t.domain) + '</small></li>'; }).join('') + '</ul></div>'; });
      out = '<div class="kn-az">' + out + '</div>';
    }
    $('aout').innerHTML = out || '<div class="kv-empty">No topic matches. <a href="/research/?q=' + encodeURIComponent(st.q) + '" style="color:var(--kv-cyan)">Search the literature for “' + esc(st.q) + '”</a>.</div>';
    $('acount').textContent = 'Showing ' + shown + ' of ' + c.topics + ' topics' + (st.view === 'dom' ? ' in ' + nd + ' of ' + c.domains + ' domains' : '') + '.';
    url();
  }
  $('agroups').addEventListener('click', function (e) { var b = e.target.closest('button[data-g]'); if (b) { st.g = b.getAttribute('data-g'); render(); } });
  $('aq').addEventListener('input', U.debounce(function () { st.q = $('aq').value.trim().slice(0, 80); render(); }, 120));
  $('v-dom').onclick = function () { st.view = 'dom'; render(); }; $('v-az').onclick = function () { st.view = 'az'; render(); };
  $('aexp').onclick = function () { document.querySelectorAll('.kn-dom').forEach(function (d) { d.open = true; openSet[d.getAttribute('data-d')] = 1; }); };
  $('acol').onclick = function () { openSet = {}; document.querySelectorAll('.kn-dom').forEach(function (d) { d.open = false; }); };
  $('aout').addEventListener('toggle', function (e) { var d = e.target; if (d.classList && d.classList.contains('kn-dom')) { if (d.open) openSet[d.getAttribute('data-d')] = 1; else delete openSet[d.getAttribute('data-d')]; } }, true);
  render();
  function jump() { var m = /^#d(\d\d)$/.exec(location.hash); if (m && A.byId[m[1]]) { st.view = 'dom'; st.g = ''; st.q = ''; $('aq').value = ''; openSet[m[1]] = 1; render(); var el = $('d' + m[1]); if (el) { el.open = true; el.scrollIntoView({ block: 'start' }); } } }
  window.addEventListener('hashchange', jump); jump();
})();
