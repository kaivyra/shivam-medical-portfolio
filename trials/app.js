(function () {
  'use strict';
  var R = KVResearch, esc = R.esc, $ = function (i) { return document.getElementById(i); }, tokens = [''], page = 0, ctl = null;
  function read() {
    return { cond: $('cond').value.trim(), intr: $('intr').value.trim(), locn: $('locn').value.trim(), term: $('term').value.trim(),
      status: Array.prototype.map.call(document.querySelectorAll('input[name=st]:checked'), function (c) { return c.value; }), pageSize: 15 };
  }
  function toURL(s) { var p = new URLSearchParams(); ['cond', 'intr', 'locn', 'term'].forEach(function (k) { if (s[k]) p.set(k, s[k]); }); if (s.status.length) p.set('st', s.status.join(',')); return p.toString(); }
  function fromURL() {
    var p = new URLSearchParams(location.search); ['cond', 'intr', 'locn', 'term'].forEach(function (k) { $(k).value = p.get(k) || ''; });
    var st = (p.get('st') || '').split(','); document.querySelectorAll('input[name=st]').forEach(function (c) { c.checked = st.indexOf(c.value) >= 0; });
    return !!(p.get('cond') || p.get('intr') || p.get('locn') || p.get('term'));
  }
  function badge(t) { var cls = t.status === 'RECRUITING' ? 'live' : (t.status === 'TERMINATED' || t.status === 'WITHDRAWN' || t.status === 'SUSPENDED') ? 'warn' : ''; return '<span class="kv-badge ' + cls + '">' + esc(t.statusLabel || 'Status not listed') + '</span>'; }
  function item(t) {
    var ph = t.phases.length ? t.phases.map(function (x) { return x.replace('PHASE', 'Phase ').replace('NA', 'N/A').replace('EARLY_', 'Early '); }).join('/') : 'Phase not listed';
    return '<article class="kv-result"><h3><a href="/trials/study/?nct=' + encodeURIComponent(t.nct) + '">' + esc(t.title || 'Untitled study') + '</a></h3><div class="kv-meta"><span>' + esc(t.nct) + '</span><span>' + esc(t.sponsor || 'Sponsor not listed') + '</span><span>' + esc(ph) + '</span><span>' + (t.enrollment != null ? 'Enrollment ' + esc(t.enrollment) + (t.enrollmentType ? ' (' + esc(t.enrollmentType.toLowerCase()) + ')' : '') : 'Enrollment not listed') + '</span></div>' +
      '<div class="kv-meta"><span>' + esc(t.conditions.slice(0, 4).join('; ') || 'Conditions not listed') + '</span><span>Last update posted: ' + esc(t.lastUpdate || 'n/a') + '</span></div><div class="kv-tags">' + badge(t) + (t.hasResults ? '<span class="kv-badge src">Results posted</span>' : '') + '</div></article>';
  }
  async function run(reset) {
    var s = read(); if (reset) { tokens = ['']; page = 0; }
    if (!(s.cond || s.intr || s.locn || s.term)) { $('status').textContent = 'Enter at least one search field.'; return; }
    s.token = tokens[page]; if (ctl) ctl.abort(); ctl = new AbortController();
    history.replaceState(null, '', location.pathname + '?' + toURL(s));
    $('out').setAttribute('aria-busy', 'true'); $('out').innerHTML = '<div class="kv-skel"></div><div class="kv-skel"></div><div class="kv-skel"></div>'; $('status').textContent = 'Searching ClinicalTrials.gov…'; $('pager').hidden = true;
    var ext = 'https://clinicaltrials.gov/search?' + new URLSearchParams({ cond: s.cond, intr: s.intr, locStr: s.locn, term: s.term }).toString();
    try {
      var r = await R.searchTrials(s, { signal: ctl.signal });
      $('status').innerHTML = '<span><strong>' + (r.total != null ? Number(r.total).toLocaleString() : '?') + '</strong> studies match.</span><span>' + esc(R.retrievalLine(r, 'ClinicalTrials.gov API v2')) + '</span><a class="kv-link" href="' + esc(ext) + '" target="_blank" rel="noopener noreferrer">Open on ClinicalTrials.gov</a>';
      $('out').innerHTML = r.trials.length ? r.trials.map(item).join('') : '<div class="kv-empty"><strong>No studies matched.</strong><br>Try fewer terms or remove the status filter.</div>';
      $('out').setAttribute('aria-busy', 'false');
      if (r.nextToken) tokens[page + 1] = r.nextToken; else tokens.length = page + 1;
      $('pager').hidden = !(page > 0 || tokens[page + 1]); $('prev').disabled = page === 0; $('next').disabled = !tokens[page + 1]; $('pn').textContent = 'Page ' + (page + 1);
    } catch (e) {
      if (e && e.name === 'AbortError') return; $('out').setAttribute('aria-busy', 'false'); $('status').textContent = '';
      $('out').innerHTML = '<div class="kv-note err" role="alert">' + R.friendlyError(e, 'ClinicalTrials.gov', ext) + '</div>';
    }
  }
  $('tf').addEventListener('submit', function (e) { e.preventDefault(); run(true); });
  $('prev').addEventListener('click', function () { if (page > 0) { page--; run(false); window.scrollTo(0, 0); } });
  $('next').addEventListener('click', function () { if (tokens[page + 1]) { page++; run(false); window.scrollTo(0, 0); } });
  if (fromURL()) run(true);
})();
