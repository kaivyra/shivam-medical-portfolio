(function () {
  'use strict';
  var R = KVResearch, ui = KVUI, E = KVEvidence, esc = R.esc, $ = function (i) { return document.getElementById(i); };
  var qs = new URLSearchParams(location.search), src = qs.get('src') || '', id = qs.get('id') || '';
  if (document.referrer && /\/research\/(\?|$)/.test(document.referrer)) $('back').addEventListener('click', function (e) { e.preventDefault(); history.back(); });

  function row(k, v) { return v ? '<tr><th scope="row">' + esc(k) + '</th><td>' + v + '</td></tr>' : ''; }
  function ext(u, t) { return '<a class="kv-link" href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">' + esc(t) + '</a>'; }

  function render(res) {
    var p = res.paper, L = p.links; ui.register(p); document.title = (p.title || 'Paper') + ' | KAIVYRA';
    var note = E.NOTES[p.study.group] || E.NOTES.unk, h = '';
    h += '<p class="kv-eyebrow">Paper details</p><h1 class="kv-h1" style="font-size:clamp(22px,3.2vw,30px)">' + esc(p.title || 'Title not provided by source') + '</h1>';
    h += '<div class="kv-tags" style="margin:0 0 12px">' + ui.studyBadge(p) + ' ' + ui.flags(p) + '</div>';
    if (p.retracted) h += '<div class="kv-note err" role="alert"><strong>Retraction flag.</strong> The source lists this record as a retracted publication or retraction notice. Do not rely on its findings. Check the original source for details.</div><br>';
    if (p.isPreprint) h += '<div class="kv-note"><strong>Preprint.</strong> This work has not completed peer review and may change or be withdrawn.</div><br>';
    h += '<div class="kv-note info"><strong>Provenance.</strong> The metadata and abstract below come from the source (Europe PMC). The study-type label is either listed by the source or inferred by KAIVYRA from wording (marked “inferred”). KAIVYRA has <strong>not</strong> editorially reviewed this record.</div>';

    h += '<h2 class="kv-h2">Source record <span class="kv-badge src">Source-derived</span></h2><div class="kv-table-wrap"><table class="kv-table"><tbody>';
    h += row('Authors', p.authors.length ? esc(p.authors.join(', ')) : '<span style="color:var(--kv-mute)">Not listed by source</span>');
    h += row('Journal', esc([p.journal, p.volume && 'vol. ' + p.volume, p.issue && '(' + p.issue + ')', p.pages].filter(Boolean).join(' ')) || '<span style="color:var(--kv-mute)">Not listed</span>');
    h += row('Publication date', esc(p.date || p.year || '') || '<span style="color:var(--kv-mute)">Not listed</span>');
    h += row('Identifiers', ui.idLine(p));
    h += row('Publication types (source)', p.pubTypes.length ? p.pubTypes.map(function (t) { return '<span class="kv-chip">' + esc(t) + '</span>'; }).join(' ') : '<span style="color:var(--kv-mute)">None listed</span>');
    h += row('Language', esc(p.language || ''));
    h += row('Cited by (Europe PMC count)', p.citedBy != null ? esc(p.citedBy) : '');
    h += row('License (as listed)', esc(p.license || ''));
    var lk = []; if (L.pubmed) lk.push(ext(L.pubmed, 'PubMed')); if (L.pmc) lk.push(ext(L.pmc, 'PubMed Central')); if (L.doi) lk.push(ext(L.doi, 'Publisher (DOI)')); if (L.europepmc) lk.push(ext(L.europepmc, 'Europe PMC'));
    (p.fullText || []).slice(0, 4).forEach(function (f) { lk.push(ext(f.url, (f.free ? 'Free full text' : 'Full text') + (f.site ? ' (' + f.site + ')' : ''))); });
    h += row('Original source links', lk.join(' · '));
    h += '</tbody></table></div>';
    h += '<p class="kv-meta" style="margin-top:8px">' + esc(R.retrievalLine(res, 'Europe PMC')) + '</p>';

    h += '<h2 class="kv-h2">Abstract <span class="kv-badge src">Source-derived</span></h2>';
    if (p.abstract.sections.length) h += p.abstract.sections.map(function (s) { return '<p class="kv-abs">' + (s.label ? '<strong>' + esc(s.label) + '.</strong> ' : '') + esc(s.text) + '</p>'; }).join('');
    else if (p.abstract.text) h += '<p class="kv-abs">' + esc(p.abstract.text) + '</p>';
    else h += '<div class="kv-empty">The source provides no abstract for this record. Use the links above to read the original.</div>';
    h += '<p class="kv-meta">Abstracts belong to their publishers and are shown here for identification. Read the original publication for full methods and results.</p>';

    var ss = R.sampleSizes(p.abstract.text);
    h += '<h2 class="kv-h2">Study design and how to read it <span class="kv-badge inf">KAIVYRA-derived · automatic</span></h2><div class="kv-card"><p><strong>' + esc(p.study.label) + '</strong>: ' + esc(p.study.why) + '</p>';
    h += '<p style="margin-top:8px"><strong>' + esc(note.name) + ':</strong> ' + esc(note.what) + '</p><p style="margin-top:8px"><strong>General limitations of this kind of study</strong> (not an assessment of this particular paper):</p><ul style="margin:6px 0 0 18px;color:var(--kv-mute);font-size:13.5px">' + note.limits.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
    h += '<p style="margin-top:10px;font-size:13px"><strong>Sample size mentioned in abstract (pattern match, verify in the paper):</strong> ' + (ss.length ? ss.map(function (x) { return esc(x.value.toLocaleString()) + ' <span style="color:var(--kv-mute)">(“…' + esc(x.snippet) + '…”)</span>'; }).join('; ') : 'none detected') + '</p></div>';
    h += '<p class="kv-meta">No confidence score is given. Evidence quality depends on how a study was conducted, which needs expert appraisal of the full text. See the <a class="kv-link" href="/evidence-lab/">Evidence Lab</a> checklist.</p>';

    if (p.mesh.length || (p.keywords || []).length) h += '<h2 class="kv-h2">Subject terms <span class="kv-badge src">Source-derived</span></h2><div class="kv-tags">' + p.mesh.slice(0, 20).map(function (m) { return '<a class="kv-chip" href="/research/?q=' + encodeURIComponent('MESH:"' + m.name + '"') + '">' + esc(m.name) + (m.major ? ' ★' : '') + '</a>'; }).join('') + (p.keywords || []).slice(0, 12).map(function (k) { return '<span class="kv-chip">' + esc(k) + '</span>'; }).join('') + '</div>';

    h += '<h2 class="kv-h2">Workspace and citation</h2><div class="kv-row"><span id="sv">' + ui.saveBtn(p) + '</span><button class="kv-btn ghost sm" id="cb" type="button">Copy BibTeX</button><button class="kv-btn ghost sm" id="cc" type="button">Copy citation</button></div>';
    h += '<div class="kv-field" style="margin-top:12px"><label for="nt">Private note on this paper (stored in this browser only)</label><textarea class="kv-textarea" id="nt" maxlength="5000"></textarea></div><div class="kv-row" style="margin-top:8px"><button class="kv-btn sm" id="ns" type="button">Save note</button><span id="nm" class="kv-meta" role="status"></span></div>';
    h += '<div class="kv-note" style="margin-top:22px"><strong>Editorial review status:</strong> none. Educational information, not medical advice.</div>';
    $('root').innerHTML = h;

    function copy(t, ok) { (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { ui.announce(ok); }, function () { window.prompt('Copy:', t); }); }
    $('cb').onclick = function () { copy(R.toBibtex(p), 'BibTeX copied'); };
    $('cc').onclick = function () { copy(R.citeLine(p), 'Citation copied'); };
    $('ns').onclick = function () {
      var t = $('nt').value.trim(); if (!t) { $('nm').textContent = 'Write something first.'; return; }
      if (!KVWorkspace.isSaved(p.key)) KVWorkspace.savePaper(p);
      KVWorkspace.addNote(t, p.key); $('nt').value = ''; $('nm').textContent = 'Note saved in this browser (paper added to Saved papers).'; $('sv').innerHTML = ui.saveBtn(p);
    };
  }

  async function init() {
    if (!/^[A-Z]{2,4}$/.test(src) || !/^[A-Za-z0-9._-]+$/.test(id)) { $('root').innerHTML = '<div class="kv-note err">This page needs a valid record reference. <a class="kv-link" href="/research/">Search for a paper</a> and open it from the results.</div>'; return; }
    // Prefer an offline copy if the user saved it and the network fails
    try {
      var res = await R.getPaper(src, id);
      if (!res) { $('root').innerHTML = '<div class="kv-empty"><strong>Record not found.</strong><br>Europe PMC returned no record for ' + esc(src + ':' + id) + '.</div>'; return; }
      render(res);
    } catch (e) {
      var saved = KVWorkspace.get().papers[src + ':' + id];
      if (saved) { saved.links = saved.links || R.links(saved); render({ paper: saved, retrievedAt: saved.retrievedAt, fromCache: true, stale: true }); return; }
      $('root').innerHTML = '<div class="kv-note err" role="alert">' + R.friendlyError(e, 'Europe PMC', 'https://europepmc.org/article/' + src + '/' + id) + '</div>';
    }
  }
  init();
})();
