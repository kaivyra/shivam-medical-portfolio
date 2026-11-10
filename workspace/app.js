(function () {
  'use strict';
  var R = KVResearch, W = KVWorkspace, esc = R.esc, $ = function (i) { return document.getElementById(i); }, cur = 'papers';
  var TABS = [['papers', 'Saved papers'], ['collections', 'Collections'], ['notes', 'Notes'], ['history', 'History'], ['projects', 'Projects'], ['settings', 'Export and settings']];
  function d(t) { return new Date(t).toLocaleDateString(); }
  function tabs() { $('tabs').innerHTML = TABS.map(function (t) { var on = t[0] === cur; return '<button type="button" role="tab" aria-selected="' + on + '" data-t="' + t[0] + '" class="kv-btn sm' + (on ? '' : ' ghost') + '">' + t[1] + '</button>'; }).join(''); }
  function paperLine(p) { return '<a class="kv-link" href="/research/paper/?src=' + encodeURIComponent(p.source) + '&id=' + encodeURIComponent(p.id) + '">' + esc(p.title || 'Untitled') + '</a>'; }
  function render() {
    tabs(); var s = W.get(), ps = Object.keys(s.papers).map(function (k) { return s.papers[k]; }).sort(function (a, b) { return b.savedAt - a.savedAt; }), h = '';
    if (cur === 'papers') {
      h = ps.length ? ps.map(function (p) {
        var cs = Object.keys(s.collections).map(function (c) { var on = (p.collections || []).indexOf(c) >= 0; return '<label class="kv-chip"><input type="checkbox" data-col="' + esc(c) + '" data-key="' + esc(p.key) + '"' + (on ? ' checked' : '') + '> ' + esc(s.collections[c].name) + '</label>'; }).join(' ');
        return '<article class="kv-result"><h3>' + paperLine(p) + '</h3><div class="kv-meta"><span>' + esc((p.authors || []).slice(0, 3).join(', ')) + '</span><span>' + esc([p.journal, p.year].filter(Boolean).join(' · ')) + '</span><span>Saved ' + d(p.savedAt) + '</span></div><div class="kv-tags">' + KVUI.studyBadge(p) + ' ' + KVUI.flags(p) + cs + '<button class="kv-btn ghost sm" data-rm="' + esc(p.key) + '" type="button">Remove</button></div></article>';
      }).join('') : '<div class="kv-empty">No saved papers. <a class="kv-link" href="/research/">Search the literature</a> and press “Save to workspace”.</div>';
    } else if (cur === 'collections') {
      h = '<form id="cf" class="kv-row"><div class="kv-field" style="flex:1 1 240px"><label for="cn">New collection</label><input class="kv-input" id="cn" maxlength="80" required></div><button class="kv-btn" type="submit">Create</button></form><div style="margin-top:14px">';
      var ids = Object.keys(s.collections); h += ids.length ? ids.map(function (c) { var m = ps.filter(function (p) { return (p.collections || []).indexOf(c) >= 0; }); return '<div class="kv-card" style="margin-bottom:10px"><div class="kv-row" style="justify-content:space-between"><h3>' + esc(s.collections[c].name) + ' <span class="kv-badge">' + m.length + '</span></h3><button class="kv-btn ghost sm" data-dc="' + esc(c) + '" type="button">Delete collection</button></div>' + (m.length ? '<ul style="margin:8px 0 0 18px">' + m.map(function (p) { return '<li>' + paperLine(p) + '</li>'; }).join('') + '</ul>' : '<p>Empty. Assign papers from Saved papers.</p>') + '</div>'; }).join('') : '<div class="kv-empty">No collections yet.</div>'; h += '</div>';
    } else if (cur === 'notes') {
      h = '<form id="nf"><div class="kv-field"><label for="nt">New note</label><textarea class="kv-textarea" id="nt" maxlength="5000" required></textarea></div><button class="kv-btn sm" style="margin-top:8px" type="submit">Add note</button></form><div style="margin-top:14px">' +
        (s.notes.length ? s.notes.map(function (n) { var p = n.paperKey && s.papers[n.paperKey]; return '<div class="kv-card" style="margin-bottom:10px"><p style="white-space:pre-line;color:var(--kv-text)">' + esc(n.text) + '</p><div class="kv-meta" style="margin-top:6px"><span>' + d(n.created) + '</span>' + (p ? '<span>On: ' + paperLine(p) + '</span>' : '') + '<button class="kv-btn ghost sm" data-dn="' + esc(n.id) + '" type="button">Delete</button></div></div>'; }).join('') : '<div class="kv-empty">No notes yet.</div>') + '</div>';
    } else if (cur === 'history') {
      h = '<div class="kv-row" style="justify-content:space-between"><label><input type="checkbox" id="hoff"' + (s.prefs.history === 'off' ? ' checked' : '') + '> Do not record history</label><button class="kv-btn ghost sm" id="hclr" type="button">Clear history</button></div>' + (s.history.length ? '<ul style="list-style:none;padding:0;margin-top:10px">' + s.history.map(function (x) { var u = x.type === 'search' ? '/research/?q=' + encodeURIComponent(x.q) : '/ai-lab/'; return '<li class="kv-result"><a class="kv-link" href="' + esc(u) + '">' + esc(x.q) + '</a> <span class="kv-badge">' + (x.type === 'ai' ? 'AI Lab question' : 'Search') + '</span> <span class="kv-meta">' + d(x.t) + (x.n != null ? ' · ' + Number(x.n).toLocaleString() + ' matches' : '') + '</span></li>'; }).join('') + '</ul>' : '<div class="kv-empty" style="margin-top:12px">No history.</div>');
    } else if (cur === 'projects') {
      h = '<form id="pf" class="kv-row"><div class="kv-field" style="flex:1 1 240px"><label for="pn">Project name</label><input class="kv-input" id="pn" maxlength="100" required></div><div class="kv-field" style="flex:2 1 300px"><label for="pd">Description</label><input class="kv-input" id="pd" maxlength="500"></div><button class="kv-btn" type="submit">Create</button></form><div style="margin-top:14px">' + (s.projects.length ? s.projects.map(function (p) { return '<div class="kv-card" style="margin-bottom:10px"><div class="kv-row" style="justify-content:space-between"><h3>' + esc(p.name) + '</h3><button class="kv-btn ghost sm" data-dp="' + esc(p.id) + '" type="button">Delete</button></div><p>' + esc(p.description || '') + '</p><p class="kv-meta">Created ' + d(p.created) + '. Project tools (linking papers and questions) are not built yet.</p></div>'; }).join('') : '<div class="kv-empty">No projects yet.</div>') + '</div>';
    } else {
      h = '<div class="kv-card"><h3>Export and import</h3><p>Download everything (papers, collections, notes, history, projects) as a JSON file. Import merges a previous export; it never overwrites existing items.</p><div class="kv-row" style="margin-top:10px"><button class="kv-btn" id="ej" type="button">Export JSON</button><button class="kv-btn ghost" id="eb" type="button">Export BibTeX (saved papers)</button><label class="kv-btn ghost" style="cursor:pointer">Import JSON<input id="ij" type="file" accept="application/json,.json" hidden></label></div><p id="im" class="kv-meta" role="status" style="margin-top:8px"></p></div><div class="kv-card" style="margin-top:12px"><h3>Delete all workspace data</h3><p>Removes everything stored by KAIVYRA in this browser, including cached search results.</p><button class="kv-btn ghost" id="wipe" type="button" style="margin-top:8px">Delete everything</button></div>';
    }
    $('view').innerHTML = h;
  }
  function dl(name, text, type) { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: type })); a.download = name; a.click(); }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t) return;
    if (t.dataset.t) { cur = t.dataset.t; render(); }
    else if (t.dataset.rm) { W.removePaper(t.dataset.rm); render(); }
    else if (t.dataset.dc) { if (confirm('Delete this collection? Papers stay saved.')) { W.deleteCollection(t.dataset.dc); render(); } }
    else if (t.dataset.dn) { W.deleteNote(t.dataset.dn); render(); }
    else if (t.dataset.dp) { W.deleteProject(t.dataset.dp); render(); }
    else if (t.id === 'hclr') { W.clearHistory(); render(); }
    else if (t.id === 'ej') dl('kaivyra-workspace.json', W.exportJSON(), 'application/json');
    else if (t.id === 'eb') { var s = W.get(); dl('kaivyra-saved.bib', Object.keys(s.papers).map(function (k) { var p = s.papers[k]; return R.toBibtex(p); }).join('\n\n'), 'text/plain'); }
    else if (t.id === 'wipe') { if (confirm('Delete all KAIVYRA data in this browser? This cannot be undone.')) { Object.keys(localStorage).filter(function (k) { return k.indexOf('kv_') === 0 || k.indexOf('kaivyra_') === 0; }).forEach(function (k) { localStorage.removeItem(k); }); render(); } }
  });
  document.addEventListener('change', function (e) {
    var c = e.target; if (c.dataset && c.dataset.col) W.toggleInCollection(c.dataset.key, c.dataset.col);
    else if (c.id === 'hoff') W.setPref('history', c.checked ? 'off' : 'on');
    else if (c.id === 'ij' && c.files[0]) { var f = c.files[0]; if (f.size > 5e6) { $('im').textContent = 'File too large (max 5 MB).'; return; } var r = new FileReader(); r.onload = function () { var o = W.importJSON(String(r.result)); render(); if (cur === 'settings') $('im').textContent = o.ok ? 'Imported and merged.' : (o.error || 'Import failed (storage may be full).'); }; r.readAsText(f); }
  });
  document.addEventListener('submit', function (e) {
    var f = e.target.id; if (['cf','nf','pf'].indexOf(f) < 0) return; e.preventDefault();
    if (f === 'cf') { W.addCollection($('cn').value); render(); } else if (f === 'nf') { W.addNote($('nt').value, null); render(); } else if (f === 'pf') { W.addProject($('pn').value, $('pd').value); render(); }
  });
  window.addEventListener('kv-workspace-change', function () { /* external changes are rendered on next action */ });
  render();
})();
