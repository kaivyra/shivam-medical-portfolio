/* Shared renderers. Everything from external sources goes through esc(). */
(function () {
  'use strict';
  var R = window.KVResearch, esc = R.esc, reg = {};
  var BASIS = { source: ['src', 'Type listed by source'], text: ['inf', 'Type inferred from text'], mesh: ['inf', 'Type inferred from MeSH'], none: ['soon', 'Type not stated'] };

  function paperUrl(p) { return '/research/paper/?src=' + encodeURIComponent(p.source) + '&id=' + encodeURIComponent(p.id); }
  function studyBadge(p) {
    var b = BASIS[p.study.basis] || BASIS.none;
    return '<span class="kv-badge ' + b[0] + '" title="' + esc(p.study.why) + '">' + esc(p.study.label) + '</span>';
  }
  function flags(p) {
    var h = '';
    if (p.retracted) h += '<span class="kv-badge warn" title="The source lists this record as retracted or a retraction notice">RETRACTION FLAG</span> ';
    if (p.isPreprint) h += '<span class="kv-badge warn" title="Preprints have not completed peer review">PREPRINT: NOT PEER REVIEWED</span> ';
    if (p.isOA) h += '<span class="kv-badge live">Open access</span> ';
    return h;
  }
  function authorLine(p) {
    if (!p.authors.length) return '<span>Authors not listed by source</span>';
    return '<span>' + esc(p.authors.slice(0, 4).join(', ')) + (p.authors.length > 4 ? ' et al.' : '') + '</span>';
  }
  function idLine(p) {
    var h = '';
    if (p.pmid) h += p.links.pubmed ? '<a class="kv-link" href="' + esc(p.links.pubmed) + '" target="_blank" rel="noopener noreferrer">PMID ' + esc(p.pmid) + '</a>' : '<span>PMID ' + esc(p.pmid) + '</span>';
    if (p.pmcid) h += (h ? ' ' : '') + (p.links.pmc ? '<a class="kv-link" href="' + esc(p.links.pmc) + '" target="_blank" rel="noopener noreferrer">' + esc(p.pmcid) + '</a>' : '<span>' + esc(p.pmcid) + '</span>');
    if (p.doi) h += (h ? ' ' : '') + (p.links.doi ? '<a class="kv-link" href="' + esc(p.links.doi) + '" target="_blank" rel="noopener noreferrer">DOI ' + esc(p.doi) + '</a>' : '<span>DOI ' + esc(p.doi) + '</span>');
    return h || '<span>No PMID, PMCID or DOI listed</span>';
  }
  function saveBtn(p) {
    var saved = window.KVWorkspace && KVWorkspace.isSaved(p.key);
    return '<button type="button" class="kv-btn ghost sm" data-kv-save="' + esc(p.key) + '" aria-pressed="' + (saved ? 'true' : 'false') + '">' + (saved ? '✓ Saved' : '+ Save to workspace') + '</button>';
  }
  function card(p, o) {
    o = o || {}; reg[p.key] = p;
    var abs = p.abstract && p.abstract.text, snippet = '';
    if (o.snippets && o.snippets.length) snippet = o.snippets.map(function (s) { return '<p class="kv-abs">“' + R.highlight(s, o.terms || []) + '”</p>'; }).join('');
    else if (abs) { var t = abs.length > 420 ? abs.slice(0, 420).replace(/\s+\S*$/, '') + '…' : abs; snippet = '<p class="kv-abs">' + R.highlight(t, o.terms || []) + '</p>'; }
    else snippet = '<p class="kv-abs" style="color:var(--kv-mute)">No abstract provided by the source.</p>';
    return '<article class="kv-result" aria-labelledby="t-' + esc(p.key.replace(/[^A-Za-z0-9]/g, '')) + '">' +
      '<h3 id="t-' + esc(p.key.replace(/[^A-Za-z0-9]/g, '')) + '">' + (o.n ? '<span class="kv-badge" style="margin-right:6px">[' + o.n + ']</span>' : '') + '<a href="' + esc(paperUrl(p)) + '">' + esc(p.title || 'Title not provided by source') + '</a></h3>' +
      '<div class="kv-meta">' + authorLine(p) + '<span>' + esc([p.journal, p.date || p.year].filter(Boolean).join(' · ') || 'Journal and date not listed') + '</span></div>' +
      '<div class="kv-meta">' + idLine(p) + '</div>' + snippet +
      '<div class="kv-tags">' + studyBadge(p) + ' ' + flags(p) + saveBtn(p) + ' <a class="kv-btn ghost sm" style="text-decoration:none" href="' + esc(paperUrl(p)) + '">Details</a></div></article>';
  }
  function announce(msg) { var a = document.getElementById('kv-live'); if (!a) { a = document.createElement('div'); a.id = 'kv-live'; a.className = 'kv-sr'; a.setAttribute('aria-live', 'polite'); document.body.appendChild(a); } a.textContent = msg; }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-kv-save]'); if (!b) return;
    var key = b.getAttribute('data-kv-save'), p = reg[key]; if (!p) return;
    if (KVWorkspace.isSaved(key)) { KVWorkspace.removePaper(key); b.textContent = '+ Save to workspace'; b.setAttribute('aria-pressed', 'false'); announce('Removed from workspace'); }
    else if (KVWorkspace.savePaper(p)) { b.textContent = '✓ Saved'; b.setAttribute('aria-pressed', 'true'); announce('Saved to workspace (this browser only)'); }
    else announce('Could not save: browser storage is full or disabled');
  });

  window.KVUI = { card: card, studyBadge: studyBadge, flags: flags, idLine: idLine, saveBtn: saveBtn, paperUrl: paperUrl, register: function (p) { reg[p.key] = p; }, announce: announce };
})();
