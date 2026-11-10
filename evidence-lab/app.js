(function () {
  'use strict';
  var R = KVResearch, E = KVEvidence, esc = R.esc, $ = function (i) { return document.getElementById(i); }, last = null;

  /* tabs */
  var tabs = [['t-cmp', 'p-cmp'], ['t-chk', 'p-chk'], ['t-gd', 'p-gd']];
  function show(id) { tabs.forEach(function (t) { var on = t[0] === id; $(t[0]).setAttribute('aria-selected', on); $(t[0]).className = 'kv-btn sm' + (on ? '' : ' ghost'); $(t[1]).hidden = !on; }); }
  tabs.forEach(function (t) { $(t[0]).addEventListener('click', function () { show(t[0]); }); $(t[0]).addEventListener('keydown', function (e) { var i = tabs.findIndex(function (x) { return x[0] === t[0]; }); if (e.key === 'ArrowRight') { var n = tabs[(i + 1) % 3][0]; show(n); $(n).focus(); } if (e.key === 'ArrowLeft') { var m = tabs[(i + 2) % 3][0]; show(m); $(m).focus(); } }); });

  /* picker */
  function papers() { var p = KVWorkspace.get().papers; return Object.keys(p).map(function (k) { return p[k]; }).sort(function (a, b) { return b.savedAt - a.savedAt; }); }
  function renderPick() {
    var ps = papers();
    $('pick').innerHTML = ps.length ? ps.map(function (p, i) { return '<label class="kv-card" style="display:flex;gap:10px;cursor:pointer"><input type="checkbox" name="pp" value="' + esc(p.key) + '"><span><strong style="font-size:13.5px">' + esc(p.title || 'Untitled') + '</strong><br><span class="kv-meta">' + esc([(p.authors || [])[0], p.year].filter(Boolean).join(' · ')) + '</span></span></label>'; }).join('') : '<div class="kv-empty">No saved papers yet. <a class="kv-link" href="/research/">Search for papers</a> and save two or more to compare them here.</div>';
  }
  renderPick(); window.addEventListener('storage', renderPick);
  $('pick').addEventListener('change', function () { var n = document.querySelectorAll('input[name=pp]:checked').length; $('cm').textContent = n > 4 ? 'Choose at most 4 papers.' : n + ' selected'; });

  function sec(p, role) {
    var s = (p.abstract && p.abstract.sections || []).filter(function (x) { return E.role(x.label) === role; });
    // "Methods" role also catches Participants/Population labels. Background is treated as question only when no Objective exists.
    if (role === 'question') { var o = (p.abstract.sections || []).filter(function (x) { return /objective|aim|purpose|question/i.test(x.label); }); if (o.length) s = o; }
    return s.map(function (x) { return x.text; }).join(' ');
  }
  function cell(t, empty) { if (!t) return '<span style="color:var(--kv-mute)">' + esc(empty) + '</span>'; return t.length > 520 ? '<details><summary>' + esc(t.slice(0, 260)) + '…</summary>' + esc(t) + '</details>' : esc(t); }

  function whyDiffer(ps) {
    var n = [], g = {}, yrs = ps.map(function (p) { return parseInt(p.year, 10); }).filter(Boolean);
    ps.forEach(function (p) { g[p.study.label] = 1; });
    if (Object.keys(g).length > 1) n.push('The studies use different designs (' + Object.keys(g).map(esc).join('; ') + '). They answer different kinds of questions and are subject to different biases, so results are not directly interchangeable.');
    if (yrs.length > 1 && Math.max.apply(null, yrs) - Math.min.apply(null, yrs) >= 8) n.push('The publications span ' + (Math.max.apply(null, yrs) - Math.min.apply(null, yrs)) + ' years. Standard care, diagnostic criteria and outcome definitions may have changed in between.');
    var sizes = ps.map(function (p) { var s = R.sampleSizes(p.abstract.text); return s.length ? s[0].value : null; }).filter(Boolean);
    if (sizes.length > 1 && Math.max.apply(null, sizes) / Math.min.apply(null, sizes) >= 10) n.push('Detected sample sizes differ by about ' + Math.round(Math.max.apply(null, sizes) / Math.min.apply(null, sizes)) + '-fold (pattern match, verify). Smaller studies give less precise estimates.');
    if (ps.some(function (p) { return p.isPreprint; })) n.push('At least one record is a preprint (not peer reviewed).');
    if (ps.some(function (p) { return p.retracted; })) n.push('At least one record carries a retraction flag from the source.');
    n.push('Always check, in the full text: who was studied (age, severity, setting), what exactly was given or exposed and at what dose, what the comparator was, how outcomes were defined and measured, and how long people were followed. Differences in any of these can produce different results without any study being “wrong”.');
    return n;
  }

  $('go').addEventListener('click', function () {
    var keys = Array.prototype.map.call(document.querySelectorAll('input[name=pp]:checked'), function (c) { return c.value; });
    if (keys.length < 2 || keys.length > 4) { $('cm').textContent = 'Select between 2 and 4 papers.'; return; }
    var store = KVWorkspace.get().papers, ps = keys.map(function (k) { var p = store[k]; if (!p.study) p.study = R.classifyStudy(p); return p; });
    var rows = [
      ['Title', function (p) { return '<a class="kv-link" href="/research/paper/?src=' + encodeURIComponent(p.source) + '&id=' + encodeURIComponent(p.id) + '">' + esc(p.title || 'Untitled') + '</a>'; }],
      ['Journal and date', function (p) { return esc([p.journal, p.date || p.year].filter(Boolean).join(' · ') || 'Not listed'); }],
      ['Identifiers', function (p) { return KVUI.idLine(Object.assign({ links: R.links(p) }, p)); }],
      ['Study design', function (p) { return KVUI.studyBadge(p) + '<br><span class="kv-meta">' + esc(p.study.why) + '</span>'; }],
      ['Research question', function (p) { return cell(sec(p, 'question'), 'No objective section in this abstract'); }],
      ['Population, intervention, comparator, methods', function (p) { return cell(sec(p, 'methods'), 'Not separated in this abstract. Read the full text'); }],
      ['Sample size (auto-detected, verify)', function (p) { var s = R.sampleSizes(p.abstract.text); return s.length ? s.map(function (x) { return esc(x.value.toLocaleString()); }).join(', ') : '<span style="color:var(--kv-mute)">Not detected in abstract</span>'; }],
      ['Main findings', function (p) { return cell(sec(p, 'results'), 'No results section in this abstract'); }],
      ['Authors’ conclusions', function (p) { return cell(sec(p, 'conclusions'), 'No conclusions section in this abstract'); }],
      ['Limitations stated in abstract', function (p) { return cell(sec(p, 'limitations'), 'Not stated in abstract'); }],
      ['Flags', function (p) { return KVUI.flags(p) || '<span style="color:var(--kv-mute)">None</span>'; }]
    ];
    var h = '<div class="kv-table-wrap"><table class="kv-table"><caption class="kv-sr">Side-by-side comparison of selected studies</caption><thead><tr><th scope="col">Field</th>' + ps.map(function (p, i) { return '<th scope="col">Study ' + (i + 1) + '</th>'; }).join('') + '</tr></thead><tbody>';
    rows.forEach(function (r) { h += '<tr><th scope="row">' + esc(r[0]) + '</th>' + ps.map(function (p) { return '<td>' + r[1](p) + '</td>'; }).join('') + '</tr>'; });
    h += '</tbody></table></div><p class="kv-meta">Fields come from each paper’s abstract and are shown as written. A blank means the abstract does not separate that item, not that the paper lacks it. Intervention, comparator and outcomes are usually inside the methods text.</p>';
    h += '<h2 class="kv-h2">Why these studies may give different answers <span class="kv-badge inf">KAIVYRA-derived · rule-based</span></h2><ul>' + whyDiffer(ps).map(function (t) { return '<li style="margin:6px 0">' + (t.indexOf('<') >= 0 ? t : esc(t)) + '</li>'; }).join('') + '</ul>';
    $('cmp').innerHTML = h; $('csv').hidden = false; last = { ps: ps, rows: rows };
  });
  $('csv').addEventListener('click', function () {
    if (!last) return; function plain(h) { return R.plain(String(h).replace(/<br\s*\/?>/g, ' ')); }
    var lines = [['Field'].concat(last.ps.map(function (p, i) { return 'Study ' + (i + 1); }))].concat(last.rows.map(function (r) { return [r[0]].concat(last.ps.map(function (p) { return plain(r[1](p)); })); }));
    var csv = lines.map(function (l) { return l.map(function (c) { var s = String(c).replace(/"/g, '""'); if (/^[=+\-@]/.test(s)) s = "'" + s; return '"' + s + '"'; }).join(','); }).join('\r\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv' })); a.download = 'kaivyra-comparison.csv'; a.click();
  });

  /* checklist */
  function renderChecklist() {
    var qs = E.CHECKLISTS[$('cd').value];
    $('cq').innerHTML = qs.map(function (q, i) { return '<fieldset style="border:1px solid var(--kv-line);border-radius:10px;padding:8px 12px;margin:0 0 8px"><legend style="font-size:13.5px;padding:0 4px">' + (i + 1) + '. ' + esc(q) + '</legend><label><input type="radio" name="c' + i + '" value="y"> Yes</label> &nbsp; <label><input type="radio" name="c' + i + '" value="n"> No</label> &nbsp; <label><input type="radio" name="c' + i + '" value="u" checked> Unclear / not reported</label></fieldset>'; }).join('') + '<button class="kv-btn sm" id="cs" type="button">List points to examine</button>';
    $('co').innerHTML = '';
    $('cs').addEventListener('click', function () {
      var pts = qs.filter(function (q, i) { var c = document.querySelector('input[name=c' + i + ']:checked'); return !c || c.value !== 'y'; });
      $('co').innerHTML = pts.length ? '<div class="kv-note"><strong>Points to examine further (' + pts.length + ' of ' + qs.length + '):</strong><ul style="margin:6px 0 0 18px">' + pts.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul></div><p class="kv-meta">Answering “Yes” to everything does not make a study reliable, and “No” does not make it worthless. This list is a prompt for careful reading.</p>' : '<div class="kv-note info">You answered “Yes” to every question. That is your assessment only. Formal appraisal still needs the full text and a trained reviewer.</div>';
    });
  }
  $('cd').addEventListener('change', renderChecklist); renderChecklist();

  /* guide */
  $('guide').innerHTML = ['sr', 'rct', 'ct', 'obs', 'case', 'review', 'preclin', 'guideline', 'nonres', 'unk'].map(function (k) { var n = E.NOTES[k]; return '<div class="kv-card"><h3>' + esc(n.name) + '</h3><p>' + esc(n.what) + '</p><ul style="margin:8px 0 0 18px;color:var(--kv-mute);font-size:13px">' + n.limits.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul></div>'; }).join('');
})();
