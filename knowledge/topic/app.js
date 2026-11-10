/* Atlas topic page: /knowledge/topic/?d=03&t=07 */
(function () {
  'use strict';
  var A = window.KVAtlas, U = window.KVUtil, esc = U.esc, root = document.getElementById('root'), W = window.KVWorkspace;
  var P = new URLSearchParams(location.search), d = A.byId[P.get('d')], ti = parseInt(P.get('t'), 10) - 1;
  if (!d || !(ti >= 0 && ti < d.s.length)) {
    root.innerHTML = '<div class="kv-empty"><p><strong>Topic not found.</strong> The link may be incomplete.</p><p><a class="kv-btn" href="/knowledge/atlas/">Browse the Research Domain Atlas</a></p></div>'; document.title = 'Topic not found | KAIVYRA'; return;
  }
  var name = d.s[ti], tid = A.topicId(d.id, ti), href = A.topicHref(d.id, ti), grp = A.groupById[d.g];
  document.title = name + ' | Research Domain Atlas | KAIVYRA';
  var q0 = A.topicQuery(name), sibs = d.s;
  function lensLinks() { return A.lenses.map(function (l) { return '<a href="' + A.lensHref(l.id, name) + '"><small>' + esc(l.k) + '</small>' + esc(l.q) + '</a>'; }).join(''); }
  function view() {
    var q = document.getElementById('tq') ? document.getElementById('tq').value : q0, tools = A.toolsFor(d.id), pv = A.presets(q || q0);
    var prev = ti > 0 ? '<a class="kv-btn ghost sm" href="' + A.topicHref(d.id, ti - 1) + '" rel="prev">‹ ' + esc(d.s[ti - 1]) + '</a>' : '<span></span>', next = ti < d.s.length - 1 ? '<a class="kv-btn ghost sm" href="' + A.topicHref(d.id, ti + 1) + '" rel="next">' + esc(d.s[ti + 1]) + ' ›</a>' : '<span></span>';
    return '<nav class="kv-crumbs" aria-label="Breadcrumb"><a href="/knowledge/">Knowledge Hub</a><span aria-hidden="true">›</span><a href="/knowledge/atlas/">Research Domain Atlas</a><span aria-hidden="true">›</span><a href="/knowledge/atlas/#d' + d.id + '">' + esc(d.t) + '</a><span aria-hidden="true">›</span><span aria-current="page">' + esc(name) + '</span></nav>' +
      '<p class="kv-eyebrow">Atlas topic ' + tid + ' <span class="kv-badge inf">' + esc(grp.n) + '</span>' + (d.x ? ' <span class="kv-badge soon">Added by KAIVYRA</span>' : '') + '</p>' +
      '<h1 class="kv-h1">' + esc(name) + '</h1><p class="kv-lead"><strong>' + esc(d.t) + '.</strong> ' + esc(d.d) + '</p>' +
      '<div class="kv-toolbar"><div><button type="button" class="kv-btn" id="tsave"></button> <button type="button" class="kv-btn ghost" id="tlink">Copy link</button></div><span class="kv-chip">KAIVYRA has not written an article on this topic: use the searches below</span></div>' +
      '<h2 class="kv-h2">Search the literature</h2><div class="kn-qbox"><div class="kv-field"><label for="tq">Query (editable; Europe PMC syntax: AND, OR, quotes)</label><input class="kv-input" id="tq" value="' + esc(q || q0) + '" maxlength="300"></div>' +
      '<div class="kv-row"><a class="kv-btn" id="go-r" href="' + esc(A.researchUrl(q || q0)) + '">Run in Research</a><a class="kv-btn ghost" id="go-t" href="' + esc(A.trialsUrl(q || q0)) + '">Find registered trials</a><a class="kv-btn ghost" id="go-a" href="' + esc(A.aiUrl(q || q0)) + '">Build an evidence brief (AI Lab)</a></div></div>' +
      '<div class="kn-presets" id="presets">' + pv.map(function (p) { return '<a href="' + esc(p.href) + '"><b>' + esc(p.label) + '</b><span>' + esc(p.desc) + '</span></a>'; }).join('') + '</div>' +
      (tools.length ? '<h2 class="kv-h2">Tools on this platform for this area</h2><div class="kv-grid c3">' + tools.map(function (t) { return '<a class="kv-card kn-entry" href="' + esc(t.href) + '"><h3>' + esc(t.label) + '</h3><p>' + esc(t.why) + '</p></a>'; }).join('') + '</div>' : '') +
      '<h2 class="kv-h2">Inquire across 15 lenses</h2><p class="kv-lead" style="margin-bottom:8px">Open the Medical Inquiry Framework with “' + esc(name) + '” as the subject.</p><div class="kn-lenses" id="lenses">' + lensLinks() + '</div>' +
      '<h2 class="kv-h2">Other topics in ' + esc(d.t) + '</h2><div class="kv-tags">' + sibs.map(function (s, i) { return i === ti ? '<span class="kv-chip" aria-current="true" style="border:1px solid var(--kv-cyan);color:var(--kv-text)">' + esc(s) + '</span>' : '<a class="kv-chip" href="' + A.topicHref(d.id, i) + '">' + esc(s) + '</a>'; }).join('') + '</div>' +
      '<h2 class="kv-h2">Your note</h2><div class="kv-field"><label for="tn">Add a private note about this topic (saved in this browser only)</label><textarea class="kv-textarea" id="tn" rows="3" maxlength="2000"></textarea></div><p><button type="button" class="kv-btn ghost sm" id="tnb">Save note to Workspace</button> <a class="kv-chip" href="/workspace/">Open Workspace</a></p>' +
      '<div class="kn-step">' + prev + next + '</div>' +
      '<p class="kv-lead" style="font-size:12px;margin-top:22px">Provenance: topic ' + tid + ' of the KAIVYRA Research Domain Atlas, a navigation taxonomy curated by KAIVYRA (not MeSH, not an official classification). Search queries are keyword combinations; they do not validate or summarise any finding. Not medical advice.</p>';
  }
  root.innerHTML = view();
  function syncSave() { var b = document.getElementById('tsave'), on = W && W.isTopicSaved(tid); b.textContent = on ? 'Saved ✓ (remove)' : 'Save topic'; b.setAttribute('aria-pressed', !!on); }
  function wire() {
    var tq = document.getElementById('tq');
    tq.addEventListener('input', function () {
      var q = tq.value.trim() || q0; document.getElementById('go-r').href = A.researchUrl(q); document.getElementById('go-t').href = A.trialsUrl(q); document.getElementById('go-a').href = A.aiUrl(q);
      document.getElementById('presets').innerHTML = A.presets(q).map(function (p) { return '<a href="' + esc(p.href) + '"><b>' + esc(p.label) + '</b><span>' + esc(p.desc) + '</span></a>'; }).join('');
    });
    document.getElementById('tsave').onclick = function () { if (!W) return; if (W.isTopicSaved(tid)) W.removeTopic(tid); else W.saveTopic({ id: tid, label: name, kind: 'topic', path: d.t, url: href }); syncSave(); U.toast(W.isTopicSaved(tid) ? 'Topic saved to Workspace' : 'Topic removed'); };
    document.getElementById('tlink').onclick = function () { U.copy(location.origin + href, 'Link copied'); };
    document.getElementById('tnb').onclick = function () { var t = document.getElementById('tn').value.trim(); if (!t) { U.toast('Write a note first'); return; } W.addNote('[' + name + '] ' + t); document.getElementById('tn').value = ''; U.toast('Note saved to Workspace'); };
    syncSave();
  }
  wire();
})();
