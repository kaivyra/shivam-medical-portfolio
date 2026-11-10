(function () {
  'use strict';
  var R = KVResearch, ui = KVUI, $ = function (i) { return document.getElementById(i); }, esc = R.esc, TIER = { guideline: 0, sr: 1, rct: 2, ct: 3, obs: 4, case: 5, review: 6, preclin: 7, nonres: 8, unk: 9 };
  var EMERG = /\b(chest pain|can'?t breathe|cannot breathe|difficulty breathing|overdose|suicid|kill myself|stroke|severe bleeding|unconscious|seizure now|anaphyla)/i;
  var PERSONAL = /\b(should i|can i take|my (child|son|daughter|mother|father|wife|husband|dose|symptoms?|medication)|i have|i am (pregnant|taking))\b/i;

  function sectionText(p, re) { var s = p.abstract.sections.filter(function (x) { return re.test(x.label); }); return s.map(function (x) { return x.text; }).join(' '); }
  function excerptFor(p, terms) {
    var prefer = sectionText(p, /conclusion|result|finding|interpretation/i), ex = prefer ? R.bestSentences(prefer, terms, 2) : [];
    if (!ex.length) ex = R.bestSentences(p.abstract.text, terms, 2);
    return ex;
  }
  function verdict(papers, total) {
    var withAbs = papers.filter(function (p) { return p.abstract.text; }), hi = papers.filter(function (p) { return p.study.group === 'sr' || p.study.group === 'rct'; });
    var sr = papers.filter(function (p) { return p.study.group === 'sr'; }).length, rct = papers.filter(function (p) { return p.study.group === 'rct'; }).length;
    if (!papers.length) return ['err', 'No records were retrieved. The literature search gave nothing to ground an answer. KAIVYRA will not answer from memory.'];
    if (withAbs.length < 3) return ['err', 'Insufficient evidence retrieved: only ' + withAbs.length + ' of the ' + papers.length + ' retrieved records have an abstract (at least 3 are needed), so there is not enough source text to show. Try rephrasing or use Research search.'];
    if (!hi.length) return ['', 'Limited: none of the top ' + papers.length + ' retrieved records is listed as a systematic review, meta-analysis or randomized trial. This may reflect the search wording rather than the literature. Evidence from other designs is more vulnerable to bias and confounding.'];
    return ['info', 'Higher-design records retrieved: ' + sr + ' systematic review/meta-analysis and ' + rct + ' randomized trial record(s) among the top ' + papers.length + ' of ' + total.toLocaleString() + ' matches. Their presence does not mean the question is settled, and the labels are not quality ratings.'];
  }
  async function ask(e) {
    e.preventDefault(); var q = $('qq').value.trim(), res = $('res'); if (q.length < 8) { res.innerHTML = '<div class="kv-note">Please enter a full research question (at least a few words).</div>'; return; }
    $('emer').innerHTML = EMERG.test(q) ? '<div class="kv-note err" role="alert" style="margin-top:12px"><strong>If this is an emergency, stop and call your local emergency number now (India: 112).</strong> This tool cannot help with urgent medical situations.</div>' : (PERSONAL.test(q) ? '<div class="kv-note" style="margin-top:12px"><strong>This looks like a personal medical question.</strong> KAIVYRA shows general research only and cannot advise on your situation. Please speak with a clinician or pharmacist.</div>' : '');
    var qq = R.questionToQuery(q); if (!qq.terms.length) { res.innerHTML = '<div class="kv-note">No searchable medical terms were found in the question. Try naming a condition, intervention or outcome.</div>'; return; }
    res.setAttribute('aria-busy', 'true'); res.innerHTML = '<div class="kv-skel"></div><div class="kv-skel"></div>';
    var base = { sources: 'med', pageSize: 25, hasAbstract: $('absn').checked, humans: $('hum').checked, yearFrom: $('yf').value };
    var used = 'AND', r, ext = 'https://europepmc.org/search?query=' + encodeURIComponent(qq.and);
    try {
      r = await R.searchPapers(Object.assign({ q: qq.and }, base));
      if (!r.papers.length && qq.terms.length > 1) { used = 'OR (relaxed because AND matched nothing)'; r = await R.searchPapers(Object.assign({ q: qq.or }, base)); }
    } catch (err) { res.setAttribute('aria-busy', 'false'); res.innerHTML = '<div class="kv-note err" role="alert" style="margin-top:14px">' + R.friendlyError(err, 'Europe PMC', ext) + '</div>'; return; }
    KVWorkspace.pushHistory('ai', q, { n: r.hitCount });
    var papers = r.papers, v = verdict(papers, r.hitCount), groups = {}; papers.forEach(function (p) { groups[p.study.group] = (groups[p.study.group] || 0) + 1; });
    var h = '<h2 class="kv-h2">1. What KAIVYRA understood</h2><div class="kv-card"><p><strong>Keywords extracted</strong> (simple word filtering, not medical concept mapping): ' + qq.terms.map(function (t) { return '<span class="kv-chip">' + esc(t) + '</span>'; }).join(' ') + '</p><p style="margin-top:8px"><strong>Query sent to Europe PMC</strong> (' + esc(used) + '): <code>' + esc(r.query) + '</code></p><p class="kv-meta" style="margin-top:6px">' + esc(R.retrievalLine(r, 'Europe PMC')) + ' <a class="kv-link" href="' + esc(ext) + '" target="_blank" rel="noopener noreferrer">Check this search on Europe PMC</a></p></div>';
    h += '<h2 class="kv-h2">2. Evidence overview</h2><div class="kv-note ' + v[0] + '" role="status">' + esc(v[1]) + '</div>';
    if (papers.length) {
      h += '<div class="kv-tags" style="margin:10px 0">' + R.GROUPS.filter(function (g) { return groups[g[0]]; }).map(function (g) { return '<span class="kv-badge">' + esc(g[1]) + ': ' + groups[g[0]] + '</span>'; }).join('') + '</div>';
      h += '<p class="kv-meta">Counts cover the ' + papers.length + ' records retrieved, not all ' + r.hitCount.toLocaleString() + ' matches. Group labels come from the source’s publication type; “possible” labels are inferred from wording.</p>';
      var tm = qq.terms, order = papers.slice(); var sortTier = false;
      h += '<h2 class="kv-h2">3. Excerpts from the sources</h2><p class="kv-meta">Sentences are copied unchanged from abstracts. They were chosen because they contain your keywords. Read them in context in the original paper. <strong>Differences between sources are not analyzed automatically</strong>: compare populations, designs and outcomes yourself in <a class="kv-link" href="/evidence-lab/">Evidence Lab</a>.</p>';
      h += '<div id="srcs">' + order.map(function (p, i) { var ex = excerptFor(p, tm); return ui.card(p, { n: i + 1, terms: tm, snippets: ex.length ? ex : null }); }).join('') + '</div>';
      h += '<div class="kv-note" style="margin-top:18px"><strong>Uncertainty and limitations.</strong> Retrieval used keywords only, so relevant papers using other wording may be missing and irrelevant ones may appear. Only titles and abstracts were read. Abstracts can omit limitations, and results can differ between populations and methods. This output is not a systematic review, not expert-reviewed, and not medical advice.</div>';
    }
    res.setAttribute('aria-busy', 'false'); res.innerHTML = h;
  }
  $('qf').addEventListener('submit', ask);

  $('sb').addEventListener('click', function () {
    var t = $('st').value.trim(), out = $('so'); if (t.length < 200) { out.innerHTML = '<div class="kv-note">Paste a longer passage (at least a few sentences).</div>'; return; }
    var S = t.split(/(?<=[.!?])\s+(?=[A-Z0-9])/).map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 25; });
    if (S.length < 4) { out.innerHTML = '<div class="kv-note">Too short to summarize meaningfully. Read the passage directly.</div>'; return; }
    var freq = {}; t.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).forEach(function (w) { if (w.length > 3 && R.terms(w).length) freq[w] = (freq[w] || 0) + 1; });
    var scored = S.map(function (s, i) { var ws = s.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(function (w) { return freq[w]; }); var sc = ws.reduce(function (a, w) { return a + freq[w]; }, 0) / Math.sqrt(ws.length || 1); if (/\b(conclusion|results?|we found|showed|demonstrated)\b/i.test(s)) sc *= 1.25; return { s: s, i: i, sc: sc }; });
    var top = scored.sort(function (a, b) { return b.sc - a.sc; }).slice(0, 3).sort(function (a, b) { return a.i - b.i; });
    out.innerHTML = '<ol>' + top.map(function (x) { return '<li class="kv-abs">' + esc(x.s) + '</li>'; }).join('') + '</ol><p class="kv-meta">Extractive selection (sentences unchanged). It may omit caveats and limitations. Read the full text before relying on it.</p>';
  });
})();
