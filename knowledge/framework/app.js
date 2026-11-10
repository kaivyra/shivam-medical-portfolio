/* Medical Inquiry Framework: 15 lenses x 30 dimensions, subject-driven search links, coverage tracker. */
(function () {
  'use strict';
  var A = window.KVAtlas, U = window.KVUtil, W = window.KVWorkspace, esc = U.esc, $ = function (i) { return document.getElementById(i); };
  var I = A.data.frameworkIntro, c = A.counts(), subject = '', done = {};
  $('f-eye').textContent = I.eyebrow + ' · Medical Inquiry Framework'; $('f-t').textContent = I.title; $('f-lead').textContent = I.text + ' ' + c.lenses + ' lenses, ' + c.dimensions + ' dimensions.';
  $('atl-dl').innerHTML = A.allTopics().map(function (t) { return '<option value="' + esc(t.name) + '"></option>'; }).join('');
  $('fex').innerHTML = ['type 2 diabetes', 'tuberculosis', 'breast cancer', 'sepsis', 'hypertension'].map(function (s) { return '<button type="button" class="kv-chip" data-s="' + esc(s) + '">' + esc(s) + '</button>'; }).join('');
  function spine() {
    $('spine').innerHTML = A.lenses.map(function (l) {
      return '<section class="kn-lens" id="l' + l.id + '" data-l="' + l.id + '" data-open="' + (l.id === '01' ? '1' : '0') + '"><button type="button" class="kn-lh" aria-expanded="' + (l.id === '01') + '" aria-controls="dm' + l.id + '"><span class="kn-lnum">' + l.id + '</span><span><span class="kn-lk">' + esc(l.k) + '</span><br><span class="kn-lq">' + esc(l.q) + '</span></span><span class="kn-lc" data-cc="' + l.id + '">0 / 30</span><span class="kn-ld">' + esc(l.d) + '</span><span class="kn-lp kv-progress" aria-hidden="true"><span data-pb="' + l.id + '" style="width:0%"></span></span></button><div class="kn-dims" id="dm' + l.id + '">' +
        l.m.map(function (m, i) { var k = l.id + ':' + m; return '<div class="kn-dim"><label><input type="checkbox" data-k="' + esc(k) + '"><span>' + esc(m) + '</span></label><span class="kn-go"><a data-r="' + esc(m) + '" href="#" aria-disabled="true">Search</a><a data-a="' + esc(m) + '" href="#" aria-disabled="true">AI Lab</a></span></div>'; }).join('') + '</div></section>';
    }).join('');
  }
  function links() {
    document.querySelectorAll('a[data-r]').forEach(function (a) { var on = !!subject; a.setAttribute('aria-disabled', on ? 'false' : 'true'); a.href = on ? A.researchUrl(A.dimQuery(subject, a.getAttribute('data-r')), { d: '', hum: 0 }) : '#'; a.title = on ? A.dimQuery(subject, a.getAttribute('data-r')) : 'Enter a subject first'; if (on) a.target = '_self'; });
    document.querySelectorAll('a[data-a]').forEach(function (a) { var on = !!subject; a.setAttribute('aria-disabled', on ? 'false' : 'true'); a.href = on ? A.aiUrl(A.dimQuery(subject, a.getAttribute('data-a'))) : '#'; });
    $('fhint').hidden = !!subject;
  }
  function paint() {
    var tot = 0;
    A.lenses.forEach(function (l) { var n = 0; l.m.forEach(function (m) { if (done[l.id + ':' + m]) n++; }); tot += n; document.querySelector('[data-cc="' + l.id + '"]').textContent = n + ' / 30'; document.querySelector('[data-pb="' + l.id + '"]').style.width = (n / 30 * 100) + '%'; });
    document.querySelectorAll('input[data-k]').forEach(function (i) { i.checked = !!done[i.getAttribute('data-k')]; });
    $('fcov').textContent = tot + ' / ' + c.dimensions + ' dimensions covered (' + Math.round(tot / c.dimensions * 100) + '%)'; $('fbar').style.width = (tot / c.dimensions * 100) + '%';
  }
  function persist() { if (subject && W) { var any = Object.keys(done).length; if (any) W.setInquiry(subject, done); else if (W.getInquiry(subject)) W.setInquiry(subject, {}); } }
  function saved() {
    var l = W ? W.listInquiries() : []; $('fsaved').innerHTML = l.length ? '<span style="color:var(--kv-mute);font-size:12.5px">Saved inquiries:</span>' + l.map(function (x) { var n = Object.keys(x.done || {}).length; return '<button type="button" data-s="' + esc(x.subject) + '">' + esc(x.subject) + ' (' + n + ')</button>'; }).join('') : '';
  }
  function setSubject(s, noHist) {
    subject = String(s || '').replace(/\s+/g, ' ').trim().slice(0, 120); $('subj').value = subject; var inq = subject && W ? W.getInquiry(subject) : null; done = inq && inq.done ? Object.assign({}, inq.done) : {};
    if (!noHist) { var p = new URLSearchParams(); if (subject) p.set('s', subject); history.replaceState(null, '', location.pathname + (subject ? '?' + p : '') + location.hash); }
    links(); paint(); saved();
  }
  spine();
  $('spine').addEventListener('click', function (e) {
    var b = e.target.closest('button.kn-lh'); if (b) { var s = b.parentNode, o = s.getAttribute('data-open') === '1'; s.setAttribute('data-open', o ? '0' : '1'); b.setAttribute('aria-expanded', !o); }
  });
  $('spine').addEventListener('change', function (e) { var k = e.target.getAttribute && e.target.getAttribute('data-k'); if (!k) return; if (!subject) { e.target.checked = false; U.toast('Enter a subject first to track coverage'); $('subj').focus(); return; } if (e.target.checked) done[k] = true; else delete done[k]; paint(); persist(); saved(); });
  $('spine').addEventListener('click', function (e) { var a = e.target.closest('a[aria-disabled=true]'); if (a) { e.preventDefault(); U.toast('Enter a subject first'); $('subj').focus(); } });
  $('fgo').onclick = function () { setSubject($('subj').value); if (!subject) $('subj').focus(); };
  $('subj').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); $('fgo').click(); } });
  $('subj').addEventListener('change', function () { setSubject($('subj').value); });
  document.addEventListener('click', function (e) { var b = e.target.closest('button[data-s]'); if (b) setSubject(b.getAttribute('data-s')); });
  function openAll(v) { document.querySelectorAll('.kn-lens').forEach(function (s) { s.setAttribute('data-open', v ? '1' : '0'); s.querySelector('button.kn-lh').setAttribute('aria-expanded', v ? 'true' : 'false'); }); }
  $('fexp').onclick = function () { openAll(true); }; $('fcol').onclick = function () { openAll(false); };
  function needSubject() { if (!subject) { U.toast('Enter a subject first'); $('subj').focus(); return true; } return false; }
  $('fmd').onclick = function () { if (needSubject()) return; U.download('inquiry-' + U.slug(subject) + '.md', A.planMarkdown(subject, done), 'text/markdown;charset=utf-8'); };
  $('fcp').onclick = function () { if (needSubject()) return; U.copy(A.planMarkdown(subject, done), 'Inquiry plan copied'); };
  $('fcsv').onclick = function () {
    if (needSubject()) return; var rows = [['Subject', 'Lens no.', 'Lens', 'Question', 'Dimension', 'Covered', 'Query']];
    A.lenses.forEach(function (l) { l.m.forEach(function (m) { rows.push([subject, l.id, l.k, l.q, m, done[l.id + ':' + m] ? 'yes' : 'no', A.dimQuery(subject, m)]); }); }); U.download('inquiry-' + U.slug(subject) + '.csv', U.toCSV(rows), 'text/csv;charset=utf-8');
  };
  $('frs').onclick = function () { if (needSubject()) return; if (Object.keys(done).length && !confirm('Clear all coverage ticks for “' + subject + '”?')) return; done = {}; paint(); persist(); saved(); };
  $('fdel').onclick = function () { if (needSubject()) return; if (W && W.getInquiry(subject) && confirm('Delete the saved inquiry for “' + subject + '” from this browser?')) { W.deleteInquiry(subject); done = {}; paint(); saved(); U.toast('Saved inquiry deleted'); } };
  var s0 = new URLSearchParams(location.search).get('s'); setSubject(s0 || '', true);
  function hash() { var m = /^#l(\d\d)$/.exec(location.hash); if (m) { var s = $('l' + m[1]); if (s) { s.setAttribute('data-open', '1'); s.querySelector('button.kn-lh').setAttribute('aria-expanded', 'true'); s.scrollIntoView({ block: 'start' }); } } }
  window.addEventListener('hashchange', hash); hash();
})();
