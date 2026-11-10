(function () {
  'use strict';
  var R = KVResearch, esc = R.esc, $ = function (i) { return document.getElementById(i); }, nct = (new URLSearchParams(location.search).get('nct') || '').toUpperCase();
  function row(k, v) { return v ? '<tr><th scope="row">' + esc(k) + '</th><td>' + v + '</td></tr>' : ''; }
  function render(res) {
    var t = res.trial; document.title = (t.title || t.nct) + ' | KAIVYRA'; var h = '';
    h += '<p class="kv-eyebrow">Trial details · ' + esc(t.nct) + '</p><h1 class="kv-h1" style="font-size:clamp(22px,3.2vw,30px)">' + esc(t.title || 'Untitled study') + '</h1>';
    h += '<div class="kv-tags" style="margin-bottom:12px"><span class="kv-badge ' + (t.status === 'RECRUITING' ? 'live' : '') + '">' + esc(t.statusLabel || 'Status not listed') + '</span>' + (t.hasResults ? '<span class="kv-badge src">Results posted</span>' : '') + '</div>';
    h += '<div class="kv-note info"><strong>Registry entry, not evidence.</strong> Information is provided by the study sponsor to ClinicalTrials.gov and is not verified by KAIVYRA. A registered trial does not show that an intervention is safe or effective. Eligibility and enrollment are decided by the study team. This is not medical advice.</div>';
    if (t.whyStopped) h += '<br><div class="kv-note"><strong>Why stopped (as registered):</strong> ' + esc(t.whyStopped) + '</div>';
    h += '<h2 class="kv-h2">Overview</h2><div class="kv-table-wrap"><table class="kv-table"><tbody>';
    h += row('Official title', esc(t.officialTitle || '')) + row('Sponsor', esc(t.sponsor || '')) + row('Study type', esc(t.studyType || '')) + row('Phase', esc(t.phases.join(', ') || 'Not listed'));
    h += row('Conditions', esc(t.conditions.join('; '))) + row('Enrollment', t.enrollment != null ? esc(t.enrollment) + (t.enrollmentType ? ' (' + esc(t.enrollmentType.toLowerCase()) + ')' : '') : '');
    var d = t.design || {}, mk = d.maskingInfo || {}; h += row('Allocation', esc(d.allocation || '')) + row('Intervention model', esc(d.interventionModel || '')) + row('Masking', esc(mk.masking || ''));
    h += row('Start', esc(t.start || '')) + row('Primary completion', esc(t.primaryCompletion || '')) + row('Study completion', esc(t.completion || '')) + row('First posted', esc(t.firstPosted || '')) + row('Last update posted', esc(t.lastUpdate || ''));
    h += '</tbody></table></div>';
    if (t.summary) h += '<h2 class="kv-h2">Summary (as registered)</h2><p class="kv-abs" style="white-space:pre-line">' + esc(t.summary) + '</p>';
    if (t.interventions.length) h += '<h2 class="kv-h2">Interventions</h2><ul>' + t.interventions.map(function (i) { return '<li>' + esc(i.name || '') + ' <span class="kv-chip">' + esc(i.type || '') + '</span></li>'; }).join('') + '</ul>';
    if (t.primaryOutcomes.length) h += '<h2 class="kv-h2">Primary outcomes</h2><ul>' + t.primaryOutcomes.map(function (o) { return '<li>' + esc(o.measure || '') + (o.time ? ' <span style="color:var(--kv-mute)">(' + esc(o.time) + ')</span>' : '') + '</li>'; }).join('') + '</ul>';
    var e = t.eligibility; h += '<h2 class="kv-h2">Recruitment and eligibility</h2><div class="kv-table-wrap"><table class="kv-table"><tbody>' + row('Ages', esc([e.minAge, e.maxAge].filter(Boolean).join(' to '))) + row('Sex', esc(e.sex || '')) + row('Healthy volunteers', e.healthy === true ? 'Accepted' : e.healthy === false ? 'No' : '') + '</tbody></table></div>';
    if (e.criteria) h += '<details style="margin-top:10px"><summary style="cursor:pointer;color:var(--kv-cyan)">Eligibility criteria (as registered)</summary><p class="kv-abs" style="white-space:pre-line;margin-top:8px">' + esc(e.criteria) + '</p></details>';
    if (t.contacts.length) h += '<h2 class="kv-h2">Central contacts</h2><ul>' + t.contacts.map(function (c) { return '<li>' + esc(c.name || '') + ' ' + (c.email ? '· ' + esc(c.email) : '') + ' ' + (c.phone ? '· ' + esc(c.phone) : '') + '</li>'; }).join('') + '</ul>';
    if (t.locations.length) h += '<h2 class="kv-h2">Locations <span class="kv-badge">' + t.locations.length + '</span></h2><div class="kv-table-wrap"><table class="kv-table"><thead><tr><th>Facility</th><th>City</th><th>Country</th><th>Status</th></tr></thead><tbody>' + t.locations.slice(0, 60).map(function (l) { return '<tr><td>' + esc(l.facility || '') + '</td><td>' + esc([l.city, l.state].filter(Boolean).join(', ')) + '</td><td>' + esc(l.country || '') + '</td><td>' + esc(l.status || '') + '</td></tr>'; }).join('') + '</tbody></table></div>' + (t.locations.length > 60 ? '<p class="kv-meta">Showing 60 of ' + t.locations.length + '. See the registry for all sites.</p>' : '');
    h += '<p style="margin-top:18px">' + (t.link ? '<a class="kv-btn" style="text-decoration:none;display:inline-block" href="' + esc(t.link) + '" target="_blank" rel="noopener noreferrer">Open full record on ClinicalTrials.gov</a>' : '') + '</p><p class="kv-meta">' + esc(R.retrievalLine(res, 'ClinicalTrials.gov API v2')) + '</p>';
    $('root').innerHTML = h;
  }
  (async function () {
    if (!R.RE.nct.test(nct)) { $('root').innerHTML = '<div class="kv-note err">This page needs a valid NCT number (for example NCT followed by 8 digits). <a class="kv-link" href="/trials/">Search trials</a>.</div>'; return; }
    try { render(await R.getTrial(nct)); }
    catch (e) { $('root').innerHTML = '<div class="kv-note err" role="alert">' + R.friendlyError(e, 'ClinicalTrials.gov', 'https://clinicaltrials.gov/study/' + nct) + '</div>'; }
  })();
})();
