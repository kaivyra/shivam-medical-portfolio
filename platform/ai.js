/* KAIVYRA AI: ChatGPT-style medical assistant.
   Streaming answers, multi-turn memory, chat history, Markdown, optional paper citations (Europe PMC).
   Keys never live here: a Cloudflare Worker (Gemini -> Groq -> OpenRouter free) holds them. */
(function () {
  'use strict';
  if (window.KVAI) return;

  var EP = 'https://www.ebi.ac.uk/europepmc/webservices/rest/search';
  var AI_API = (function () { var m = document.querySelector('meta[name=kv-ai-api]'); var v = m && m.content && m.content.trim(); return v || 'https://kaivyra-ai.the-kaivyra.workers.dev'; })();
  var PAGE = !!window.KVAI_PAGE;
  var LS = 'kvai_chats_v2', LSS = 'kvai_set_v2', MAXCH = 40;

  var LOGO = '<svg class="lg" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21.5" fill="none" stroke="#2dd4bf" stroke-width="3"/><path d="M17 11Q24 24 17 37M31 11Q24 24 31 37" fill="none" stroke="#2dd4bf" stroke-width="2.6" stroke-linecap="round"/><g fill="#2dd4bf"><circle cx="17" cy="11" r="2.4"/><circle cx="17" cy="37" r="2.4"/><circle cx="31" cy="11" r="2.4"/><circle cx="31" cy="37" r="2.4"/></g></svg>';
  var IC = {
    x: '<path d="M6 6l12 12M18 6L6 18"/>', send: '<path d="M12 19V5M5 12l7-7 7 7"/>', stop: '<rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>', trash: '<path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>', retry: '<path d="M4 12a8 8 0 1 0 3-6.2M4 4v5h5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h10"/>', plus: '<path d="M12 5v14M5 12h14"/>', expand: '<path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/>',
    home: '<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>', book: '<path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h10"/>', check: '<path d="M5 12l5 5 9-10"/>'
  };
  function ic(n) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + IC[n] + '</svg>'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function hi() { return document.documentElement.classList.contains('kv-hi'); }

  /* ---------- text ---------- */
  var T = {
    en: {
      sub: 'Medical AI assistant', hello: 'What do you want to understand?', hd: 'Ask anything in medicine. Answers stream live, remember the conversation, and can cite real papers.',
      ph: 'Message KAIVYRA AI…', neu: 'New chat', chats: 'Chats', nochats: 'No chats yet. Ask your first question.', m_general: 'Expert', m_exam: 'MBBS exam', m_clinical: 'Clinical', m_simple: 'Simple',
      cite: 'Cite papers', searching: 'Searching publications…', thinking: 'Thinking…', copy: 'Copy', copied: 'Copied', regen: 'Regenerate', stop: 'Stop', send: 'Send',
      err: 'Could not get an answer. Check your connection and try again.', retry: 'Try again', srcs: 'Sources', tools: 'Related KAIVYRA tools', nopapers: 'Could not fetch papers, so this answer uses general medical knowledge.',
      foot: 'KAIVYRA AI can make mistakes. Verify important medical information. Educational only, not medical advice.', saved: 'Chats are saved only in this browser.',
      emerg: 'This may be an emergency. Call your local emergency number or go to the nearest hospital now.', th: 'Theme', cls: 'Close', exp: 'Open full page', home: 'Home', menu: 'Chats', del: 'Delete chat', tryq: 'Try asking',
      fu1: 'Explain this in simpler words', fu2: 'Give me 5 exam-style MCQs on this, with answers', fu3: 'Summarize this in 5 high-yield points', pro: 'Based on', papers: 'papers', via: 'via'
    },
    hi: {
      sub: 'चिकित्सा AI सहायक', hello: 'आप क्या समझना चाहते हैं?', hd: 'चिकित्सा से जुड़ा कुछ भी पूछें। उत्तर लाइव आते हैं, बातचीत याद रहती है, और असली पेपर के स्रोत भी दे सकता है।',
      ph: 'KAIVYRA AI से पूछें…', neu: 'नई चैट', chats: 'चैट', nochats: 'अभी कोई चैट नहीं। अपना पहला सवाल पूछें।', m_general: 'विशेषज्ञ', m_exam: 'MBBS परीक्षा', m_clinical: 'क्लिनिकल', m_simple: 'आसान',
      cite: 'पेपर के स्रोत', searching: 'प्रकाशन खोज रहा हूँ…', thinking: 'सोच रहा हूँ…', copy: 'कॉपी', copied: 'कॉपी हुआ', regen: 'दोबारा लिखें', stop: 'रोकें', send: 'भेजें',
      err: 'उत्तर नहीं मिल सका। कनेक्शन जाँचें और फिर कोशिश करें।', retry: 'फिर कोशिश करें', srcs: 'स्रोत', tools: 'संबंधित KAIVYRA टूल', nopapers: 'पेपर नहीं मिल सके, इसलिए यह उत्तर सामान्य चिकित्सा ज्ञान पर आधारित है।',
      foot: 'KAIVYRA AI से गलती हो सकती है। ज़रूरी चिकित्सा जानकारी जाँच लें। केवल शिक्षा के लिए, चिकित्सकीय सलाह नहीं।', saved: 'चैट केवल इसी ब्राउज़र में सहेजी जाती हैं।',
      emerg: 'यह आपात स्थिति हो सकती है। अपने स्थानीय आपातकालीन नंबर पर कॉल करें या तुरंत नज़दीकी अस्पताल जाएँ।', th: 'थीम', cls: 'बंद करें', exp: 'पूरा पेज खोलें', home: 'होम', menu: 'चैट', del: 'चैट हटाएँ', tryq: 'ये पूछकर देखें',
      fu1: 'इसे और आसान शब्दों में समझाओ', fu2: 'इस पर परीक्षा-शैली के 5 MCQ उत्तर सहित दो', fu3: 'इसे 5 मुख्य बिंदुओं में बताओ', pro: 'आधार:', papers: 'पेपर', via: 'से'
    }
  };
  function t(k) { return (hi() ? T.hi : T.en)[k]; }
  var SUGG = [
    { i: '❤️', c: 'Cardiology', q: 'Explain the management of acute STEMI step by step' },
    { i: '🩸', c: 'Critical care', q: 'Sepsis: Surviving Sepsis bundle and fluid choice' },
    { i: '🧪', c: 'Pharmacology', q: 'Compare SGLT2 inhibitors vs GLP-1 agonists in a table' },
    { i: '🧠', c: 'Neurology', q: 'Differentiate upper vs lower motor neuron lesions' },
    { i: '🦟', c: 'Infectious disease', q: 'Dengue warning signs and fluid management' },
    { i: '📝', c: 'Exam prep', q: 'Give 5 high-yield MCQs on thyroid disorders with explanations' }
  ];
  var ROUTES = [
    [/\b(egfr|bmi|qtc|sofa|meld|calculator|score|dose|dosing|abg|gcs|apache|curb)\b/i, '/clinical/#calculators', 'Clinical calculators and scores'],
    [/\b(report|cbc|blood test|lab result|lipid|thyroid|hba1c|urine|creatinine|haemoglobin|hemoglobin)\b/i, '/analyzer/', 'Report Analyzer'],
    [/\b(learn|study|anatomy|physiology|biochem|pathology|pharmacology|microbiology|mbbs|subject|chapter|quiz|mcq)\b/i, '/all-in-one/', 'Medical Learning'],
    [/\b(emergency|resus|shock|cardiac arrest|code blue|ecg|ventilator|icu|critical care|sepsis|dka|stemi)\b/i, '/emergency-lab/', 'Emergency Virtual Room'],
    [/\b(trial|trials|nct|recruiting|phase [123i]+)\b/i, '/trials/', 'Clinical Trials'],
    [/\b(myth|conflicting|appraise|bias|meta-analysis|study design)\b/i, '/evidence-lab/', 'Evidence Lab']
  ];
  var EMERG = /\b(chest pain|can'?t breathe|cannot breathe|difficulty breathing|not breathing|unconscious|seizure now|stroke symptoms|face drooping|heavy bleeding|overdose|suicid|kill myself|poison(ed|ing)? now|anaphylaxis)\b/i;
  var STOP = {}; 'a an the of in on for and or to with without is are was were be been what which who how why when does do did can could should would about from into by as at it its this that these those vs versus between treatment effect effects use using people patients patient disease please tell me explain give any best step compare table'.split(' ').forEach(function (w) { STOP[w] = 1; });

  /* ---------- state ---------- */
  var root, scrim, body, ta, sendBtn, sbList, chats = [], cur = null, busy = false, abortCtl = null;
  var S = { mode: 'general', cite: true };
  function loadState() {
    try { chats = JSON.parse(localStorage.getItem(LS) || '[]') || []; } catch (e) { chats = []; }
    try { var s = JSON.parse(localStorage.getItem(LSS) || '{}'); if (s.mode) S.mode = s.mode; if (typeof s.cite === 'boolean') S.cite = s.cite; } catch (e) { }
  }
  function saveChats() {
    chats.sort(function (a, b) { return b.ts - a.ts; }); chats = chats.slice(0, MAXCH);
    try { localStorage.setItem(LS, JSON.stringify(chats)); } catch (e) { try { chats = chats.slice(0, 10); localStorage.setItem(LS, JSON.stringify(chats)); } catch (e2) { } }
  }
  function saveSet() { try { localStorage.setItem(LSS, JSON.stringify(S)); } catch (e) { } }
  function uid() { return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function siteLight() { var d = document.documentElement; return d.classList.contains('light') || d.dataset.theme === 'light'; }
  function applyTheme() { var p = null; try { p = localStorage.getItem('kv_ai_theme'); } catch (e) { } root.classList.toggle('light', p ? p === 'light' : siteLight()); }
  function toggleTheme() { var l = !root.classList.contains('light'); try { localStorage.setItem('kv_ai_theme', l ? 'light' : 'dark'); } catch (e) { } applyTheme(); }

  /* ---------- markdown (safe: everything is escaped first) ---------- */
  function inline(s, srcs) {
    s = esc(s);
    var codes = []; s = s.replace(/`([^`]+)`/g, function (m, c) { codes.push(c); return '\u0000' + (codes.length - 1) + '\u0000'; });
    s = s.replace(/\*\*([^*]+?)\*\*/g, '<b>$1</b>').replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?![*\w])/g, '$1<i>$2</i>');
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    s = s.replace(/\[(\d{1,2})\]/g, function (m, k) {
      k = +k; var sr = srcs && srcs[k - 1];
      return sr ? '<sup class="kai-cite"><a href="' + esc(sr.url) + '" target="_blank" rel="noopener noreferrer" title="' + esc(sr.title) + '">' + k + '</a></sup>' : m;
    });
    return s.replace(/\u0000(\d+)\u0000/g, function (m, i) { return '<code>' + codes[+i] + '</code>'; });
  }
  function blockStart(ln) { return /^```/.test(ln) || /^#{1,4}\s/.test(ln) || /^\s*([-*•]|\d+[.)])\s+/.test(ln) || /^>\s?/.test(ln) || /^\s*\|.*\|\s*$/.test(ln) || /^\s*([-*_])\1\1+\s*$/.test(ln); }
  function cells(ln) { return ln.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(function (c) { return c.trim(); }); }
  function listHtml(items, srcs) {
    var h = '', st = [];
    items.forEach(function (it) {
      while (st.length > it.l + 1) h += '</li></' + st.pop() + '>';
      if (st.length === it.l + 1) h += '</li>'; else { while (st.length < it.l + 1) { var tg = it.o ? 'ol' : 'ul'; h += '<' + tg + '>'; st.push(tg); } }
      h += '<li>' + inline(it.x, srcs);
    });
    while (st.length) h += '</li></' + st.pop() + '>';
    return h;
  }
  function md(text, srcs) {
    var L = String(text || '').replace(/\r/g, '').split('\n'), out = [], i = 0, m;
    while (i < L.length) {
      var ln = L[i];
      if (/^```/.test(ln)) { var buf = []; i++; while (i < L.length && !/^```/.test(L[i])) { buf.push(L[i]); i++; } i++; out.push('<pre><code>' + esc(buf.join('\n')) + '</code></pre>'); continue; }
      if (/^\s*\|.*\|\s*$/.test(ln) && i + 1 < L.length && /^\s*\|?\s*:?-{2,}[\s:|-]*$/.test(L[i + 1])) {
        var hd = cells(ln); i += 2; var rows = [];
        while (i < L.length && /^\s*\|.*\|\s*$/.test(L[i])) { rows.push(cells(L[i])); i++; }
        out.push('<div class="kai-tw"><table><thead><tr>' + hd.map(function (c) { return '<th>' + inline(c, srcs) + '</th>'; }).join('') + '</tr></thead><tbody>' +
          rows.map(function (r) { return '<tr>' + hd.map(function (_, k) { return '<td>' + inline(r[k] || '', srcs) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>'); continue;
      }
      if ((m = ln.match(/^(#{1,4})\s+(.*)$/))) { out.push('<h' + (m[1].length + 2) + '>' + inline(m[2], srcs) + '</h' + (m[1].length + 2) + '>'); i++; continue; }
      if (/^\s*([-*_])\1\1+\s*$/.test(ln)) { out.push('<hr>'); i++; continue; }
      if (/^>\s?/.test(ln)) { var q = []; while (i < L.length && /^>\s?/.test(L[i])) { q.push(L[i].replace(/^>\s?/, '')); i++; } out.push('<blockquote>' + q.map(function (x) { return inline(x, srcs); }).join('<br>') + '</blockquote>'); continue; }
      if (/^\s*([-*•]|\d+[.)])\s+/.test(ln)) {
        var items = [];
        while (i < L.length && (m = L[i].match(/^(\s*)([-*•]|\d+[.)])\s+(.*)$/))) { items.push({ l: Math.min(2, Math.floor(m[1].length / 2)), o: /\d/.test(m[2]), x: m[3] }); i++; }
        if (items.length) { out.push(listHtml(items, srcs)); continue; }
      }
      if (!ln.trim()) { i++; continue; }
      var para = [ln]; i++;
      while (i < L.length && L[i].trim() && !blockStart(L[i])) { para.push(L[i]); i++; }
      out.push('<p>' + para.map(function (x) { return inline(x, srcs); }).join('<br>') + '</p>');
    }
    return out.join('');
  }

  /* ---------- papers (optional grounding) ---------- */
  var pc = {}; try { pc = JSON.parse(sessionStorage.getItem('kvai_pc2') || '{}'); } catch (e) { }
  function plain(h) { var d = document.createElement('div'); d.innerHTML = String(h || ''); return (d.textContent || '').replace(/\s+/g, ' ').trim(); }
  function keywords(q) { return q.toLowerCase().replace(/[^a-z0-9\-\s]/g, ' ').split(/\s+/).filter(function (w) { return w.length > 2 && !STOP[w]; }); }
  function design(r) {
    var l = ((r.pubTypeList && r.pubTypeList.pubType) || []).join(' ').toLowerCase() + ' ' + String(r.title || '').toLowerCase();
    if (/meta-analysis/.test(l)) return 'Meta-analysis'; if (/systematic review/.test(l)) return 'Systematic review'; if (/randomi[sz]ed/.test(l)) return 'RCT'; if (/guideline/.test(l)) return 'Guideline'; if (/review/.test(l)) return 'Review'; return '';
  }
  function fetchPapers(query) {
    var key = query.toLowerCase(); if (pc[key]) return Promise.resolve(pc[key]);
    var url = EP + '?query=' + encodeURIComponent('(' + query + ') AND HAS_ABSTRACT:y AND SRC:MED') + '&resultType=core&pageSize=8&format=json';
    function once(ms) {
      var c = window.AbortController ? new AbortController() : null, to = setTimeout(function () { if (c) c.abort(); }, ms);
      return fetch(url, c ? { signal: c.signal } : {}).then(function (r) { clearTimeout(to); if (!r.ok) throw new Error('http ' + r.status); return r.json(); }, function (e) { clearTimeout(to); throw e; });
    }
    return once(9000).catch(function () { return once(12000); }).then(function (j) {
      var rs = (j.resultList && j.resultList.result) || [];
      var out = rs.map(function (r) { return { title: plain(r.title), jr: r.journalTitle || '', yr: r.pubYear || '', type: design(r), text: plain(r.abstractText).slice(0, 1300), url: 'https://europepmc.org/article/' + r.source + '/' + r.id, oa: r.isOpenAccess === 'Y' }; }).filter(function (s) { return s.text && s.title; }).slice(0, 6);
      pc[key] = out; try { sessionStorage.setItem('kvai_pc2', JSON.stringify(pc).slice(0, 400000)); } catch (e) { }
      return out;
    });
  }

  /* ---------- DOM ---------- */
  function build() {
    loadState();
    scrim = document.createElement('div'); scrim.className = 'kai-scrim'; scrim.addEventListener('click', close);
    root = document.createElement('aside'); root.className = 'kai' + (PAGE ? ' pg' : ''); root.setAttribute('role', PAGE ? 'main' : 'dialog'); root.setAttribute('aria-label', 'KAIVYRA AI');
    root.innerHTML =
      '<div class="kai-sb"><div class="kai-sbh"><button type="button" class="kai-new" data-a="new">' + ic('plus') + '<span data-k="neu"></span></button></div>' +
      '<div class="kai-sbt" data-k="chats"></div><div class="kai-sbl"></div><div class="kai-sbf" data-k="saved"></div></div>' +
      '<div class="kai-sbs" data-a="sbclose"></div>' +
      '<div class="kai-main"><div class="kai-h"><button class="kai-ib kai-mn" type="button" data-a="sb" aria-label="Chats">' + ic('menu') + '</button>' + LOGO +
      '<div class="kai-ht"><b>KAIVYRA AI</b><small data-k="sub"></small></div><span class="sp"></span>' +
      '<button class="kai-ib" type="button" data-a="theme">' + ic('moon') + '</button>' +
      (PAGE ? '<a class="kai-ib" data-a="home" href="/">' + ic('home') + '</a>' : '<a class="kai-ib" data-a="exp" href="/ai/">' + ic('expand') + '</a><button class="kai-ib" type="button" data-a="close">' + ic('x') + '</button>') + '</div>' +
      '<div class="kai-body" aria-live="polite"></div>' +
      '<div class="kai-f"><div class="kai-opts"><div class="kai-modes" role="group"></div><button type="button" class="kai-cit" data-a="cite" aria-pressed="true">' + ic('book') + '<span data-k="cite"></span></button></div>' +
      '<form class="kai-box"><textarea rows="1" maxlength="2000" aria-label="Message"></textarea><button class="kai-send" type="submit">' + ic('send') + '</button></form>' +
      '<div class="kai-meta" data-k="foot"></div></div></div>';
    document.body.appendChild(scrim); document.body.appendChild(root);
    body = root.querySelector('.kai-body'); ta = root.querySelector('textarea'); sendBtn = root.querySelector('.kai-send'); sbList = root.querySelector('.kai-sbl');
    var mb = root.querySelector('.kai-modes');
    ['general', 'exam', 'clinical', 'simple'].forEach(function (m) { var b = document.createElement('button'); b.type = 'button'; b.className = 'kai-mc'; b.setAttribute('data-mode', m); mb.appendChild(b); });

    root.addEventListener('click', onClick);
    root.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); if (busy) stop(); else send(ta.value); });
    ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); if (!busy) send(ta.value); } });
    ta.addEventListener('input', function () { ta.style.height = 'auto'; ta.style.height = Math.min(180, ta.scrollHeight) + 'px'; syncSend(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !PAGE && isOpen()) close(); });
    labels(); applyTheme(); renderSidebar(); newChat(true);
    if (PAGE) document.documentElement.classList.add('kai-open');
  }
  function labels() {
    var q = function (k) { return root.querySelector('[data-k=' + k + ']'); };
    q('neu').textContent = t('neu'); q('chats').textContent = t('chats'); q('sub').textContent = t('sub'); q('cite').textContent = t('cite'); q('foot').textContent = t('foot'); q('saved').textContent = t('saved');
    ta.placeholder = t('ph'); root.querySelectorAll('.kai-mc').forEach(function (b) { b.textContent = t('m_' + b.getAttribute('data-mode')); });
    var th = root.querySelector('[data-a=theme]'); th.setAttribute('aria-label', t('th')); th.title = t('th');
    var cl = root.querySelector('[data-a=close]'); if (cl) cl.setAttribute('aria-label', t('cls'));
    var ex = root.querySelector('[data-a=exp]'); if (ex) { ex.title = t('exp'); ex.setAttribute('aria-label', t('exp')); }
    var hm = root.querySelector('[data-a=home]'); if (hm) { hm.title = t('home'); hm.setAttribute('aria-label', t('home')); }
    syncOpts(); syncSend(); renderSidebar();
  }
  function syncOpts() {
    root.querySelectorAll('.kai-mc').forEach(function (b) { var on = b.getAttribute('data-mode') === S.mode; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    var c = root.querySelector('.kai-cit'); c.classList.toggle('on', S.cite); c.setAttribute('aria-pressed', S.cite);
  }
  function syncSend() { sendBtn.innerHTML = busy ? ic('stop') : ic('send'); sendBtn.classList.toggle('stop', busy); sendBtn.disabled = !busy && !ta.value.trim(); sendBtn.setAttribute('aria-label', busy ? t('stop') : t('send')); }
  function isOpen() { return document.documentElement.classList.contains('kai-open'); }
  function open(q) {
    if (!root) build();
    document.documentElement.classList.add('kai-open'); if (!PAGE) document.documentElement.classList.add('kai-lock');
    applyTheme(); setTimeout(function () { try { ta.focus({ preventScroll: true }); } catch (e) { } }, 30);
    if (typeof q === 'string' && q.trim()) send(q);
  }
  function close() { if (PAGE) return; document.documentElement.classList.remove('kai-open'); document.documentElement.classList.remove('kai-lock'); root.classList.remove('sb-open'); }

  /* ---------- sidebar / chats ---------- */
  function renderSidebar() {
    if (!sbList) return;
    if (!chats.length || (chats.length === 1 && !chats[0].msgs.length)) { sbList.innerHTML = '<div class="kai-sbe">' + esc(t('nochats')) + '</div>'; return; }
    sbList.innerHTML = chats.filter(function (c) { return c.msgs.length; }).map(function (c) {
      return '<div class="kai-ci' + (cur && cur.id === c.id ? ' on' : '') + '" data-id="' + esc(c.id) + '"><button type="button" class="kai-cl" data-a="open" data-id="' + esc(c.id) + '">' + esc(c.title || '…') + '</button><button type="button" class="kai-cd" data-a="del" data-id="' + esc(c.id) + '" title="' + esc(t('del')) + '" aria-label="' + esc(t('del')) + '">' + ic('trash') + '</button></div>';
    }).join('');
  }
  function newChat(silent) {
    if (busy) stop();
    var empty = chats.filter(function (c) { return !c.msgs.length; })[0];
    cur = empty || { id: uid(), title: '', ts: Date.now(), msgs: [] }; if (!empty) chats.unshift(cur);
    renderChat(); renderSidebar(); root.classList.remove('sb-open'); if (!silent) { try { ta.focus(); } catch (e) { } }
  }
  function openChat(id) { var c = chats.filter(function (x) { return x.id === id; })[0]; if (!c) return; if (busy) stop(); cur = c; renderChat(); renderSidebar(); root.classList.remove('sb-open'); }
  function delChat(id) { chats = chats.filter(function (c) { return c.id !== id; }); saveChats(); if (cur && cur.id === id) { cur = null; newChat(true); } renderSidebar(); }

  function hello() {
    body.innerHTML = '<div class="kai-hello"><div class="kai-orb">' + LOGO + '</div><h3>' + esc(t('hello')) + '</h3><p>' + esc(t('hd')) + '</p>' +
      '<div class="kai-sh">' + esc(t('tryq')) + '</div><div class="kai-grid">' + SUGG.map(function (x) { return '<button type="button" class="kai-card" data-q="' + esc(x.q) + '"><span class="kai-cic">' + x.i + '</span><span class="kai-ct"><small>' + esc(x.c) + '</small>' + esc(x.q) + '</span></button>'; }).join('') + '</div></div>';
  }
  function renderChat() {
    if (!cur || !cur.msgs.length) { hello(); return; }
    body.innerHTML = '';
    cur.msgs.forEach(function (m, i) { addMsg(m, i === cur.msgs.length - 1); });
    body.scrollTop = body.scrollHeight;
  }
  function actionsHTML(last) {
    return '<div class="kai-bar"><button type="button" class="kai-gh" data-a="copy">' + ic('copy') + '<span>' + esc(t('copy')) + '</span></button>' +
      (last ? '<button type="button" class="kai-gh" data-a="regen">' + ic('retry') + '<span>' + esc(t('regen')) + '</span></button>' : '') + '</div>';
  }
  function srcsHTML(srcs) {
    if (!srcs || !srcs.length) return '';
    return '<details class="kai-srcs"><summary>' + esc(t('srcs')) + ' (' + srcs.length + ')</summary>' + srcs.map(function (s, i) {
      return '<a target="_blank" rel="noopener noreferrer" href="' + esc(s.url) + '"><span class="kai-n">' + (i + 1) + '</span><span>' + esc(s.title) + '<small>' + esc((s.jr ? s.jr + ' · ' : '') + s.yr + (s.type ? ' · ' + s.type : '') + (s.oa ? ' · Open access' : '')) + '</small></span></a>';
    }).join('') + '</details>';
  }
  function followHTML() { return '<div class="kai-fu">' + ['fu1', 'fu2', 'fu3'].map(function (k) { return '<button type="button" class="kai-chip" data-q="' + esc(t(k)) + '">' + esc(t(k)) + '</button>'; }).join('') + '</div>'; }
  function toolsHTML(q) {
    var acts = ROUTES.filter(function (r) { return r[0].test(q); }).slice(0, 3);
    return acts.length ? '<div class="kai-act"><span>' + esc(t('tools')) + ':</span>' + acts.map(function (r) { return '<a href="' + r[1] + '">' + esc(r[2]) + '</a>'; }).join('') + '</div>' : '';
  }
  function addMsg(m, last) {
    var d = document.createElement('div'); d.className = 'kai-m ' + (m.role === 'user' ? 'u' : 'a');
    if (m.role === 'user') { d.innerHTML = '<div class="kai-ub">' + esc(m.content).replace(/\n/g, '<br>') + '</div>'; }
    else {
      d.innerHTML = '<div class="kai-av">' + LOGO + '</div><div class="kai-ab"><div class="kai-md">' + md(m.content, m.sources) + '</div>' + (m.note ? '<div class="kai-note">' + esc(m.note) + '</div>' : '') + srcsHTML(m.sources) + toolsHTML(m.q || '') + actionsHTML(last) + (last ? followHTML() : '') + '</div>';
      d._raw = m.content;
    }
    body.appendChild(d); return d;
  }

  /* ---------- sending / streaming ---------- */
  function stop() { if (abortCtl) { try { abortCtl.abort(); } catch (e) { } } }
  function setBusy(b) { busy = b; syncSend(); }
  function send(text, opts) {
    opts = opts || {};
    text = String(text || '').replace(/\s+$/g, '').trim(); if (!text || busy) return;
    if (!cur) newChat(true);
    ta.value = ''; ta.style.height = 'auto';
    if (!opts.regen) {
      cur.msgs.push({ role: 'user', content: text });
      if (!cur.title) cur.title = text.replace(/\s+/g, ' ').slice(0, 48);
    }
    cur.ts = Date.now(); saveChats(); renderSidebar();
    if (cur.msgs.length === 1 || opts.regen) renderChat();
    else {
      // drop follow-up chips / regenerate buttons from the previous answer
      body.querySelectorAll('.kai-fu').forEach(function (n) { n.remove(); }); body.querySelectorAll('[data-a=regen]').forEach(function (n) { n.remove(); });
      if (!opts.regen) addMsg(cur.msgs[cur.msgs.length - 1], false);
    }
    var a = document.createElement('div'); a.className = 'kai-m a'; a.innerHTML = '<div class="kai-av">' + LOGO + '</div><div class="kai-ab"><div class="kai-md"></div></div>';
    body.appendChild(a); var mdEl = a.querySelector('.kai-md'), ab = a.querySelector('.kai-ab');
    function status(s) { mdEl.innerHTML = '<span class="kai-dots"><i></i><i></i><i></i></span> <span class="kai-note">' + esc(s) + '</span>'; }
    if (EMERG.test(text)) { var w = document.createElement('div'); w.className = 'kai-warn'; w.innerHTML = '<b>⚠</b> ' + esc(t('emerg')); ab.insertBefore(w, mdEl); }
    body.scrollTop = body.scrollHeight; setBusy(true);

    var kw = keywords(text), note = '', srcsP;
    if (S.cite && kw.length >= 2 && AI_API) { status(t('searching')); srcsP = fetchPapers(kw.slice(0, 8).join(' ')).catch(function () { note = t('nopapers'); return []; }); }
    else srcsP = Promise.resolve([]);

    srcsP.then(function (srcs) {
      status(t('thinking'));
      var hist = cur.msgs.filter(function (m) { return m.content; }).map(function (m) { return { role: m.role, content: m.content }; });
      // the answer being regenerated is not in cur.msgs when opts.regen (it was removed)
      abortCtl = window.AbortController ? new AbortController() : null;
      var acc = '', prov = '', raf = 0;
      function paint() { raf = 0; mdEl.innerHTML = md(acc, srcs); body.scrollTop = body.scrollHeight; }
      return fetch(AI_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: abortCtl ? abortCtl.signal : undefined, body: JSON.stringify({ messages: hist, sources: srcs.map(function (s) { return { title: s.title, jr: s.jr, yr: s.yr, type: s.type, text: s.text }; }), mode: S.mode, lang: hi() ? 'hi' : 'en', stream: true }) })
        .then(function (r) {
          if (!r.ok) throw new Error('http ' + r.status);
          prov = r.headers.get('X-Provider') || '';
          if (!r.body || !r.body.getReader) return r.text().then(function (txt) { parseSSE(txt); });
          var rd = r.body.getReader(), dec = new TextDecoder(), buf = '';
          function pump() {
            return rd.read().then(function (x) {
              if (x.done) { parseSSE(buf, true); return; }
              buf += dec.decode(x.value, { stream: true });
              var cut = buf.lastIndexOf('\n'); if (cut >= 0) { parseSSE(buf.slice(0, cut + 1)); buf = buf.slice(cut + 1); }
              return pump();
            });
          }
          return pump();
        })
        .then(function () { return { acc: acc, srcs: srcs, prov: prov }; }, function (err) { if (err && err.name === 'AbortError') return { acc: acc, srcs: srcs, prov: prov, aborted: true }; throw Object.assign(err || new Error('x'), { partial: acc }); });
      function parseSSE(txt) {
        txt.split('\n').forEach(function (ln) {
          ln = ln.trim(); if (ln.indexOf('data:') !== 0) return; var p = ln.slice(5).trim(); if (!p || p === '[DONE]') return;
          try { var j = JSON.parse(p), dl = j.choices && j.choices[0] && j.choices[0].delta; if (dl && dl.content) { acc += dl.content; if (!raf) raf = requestAnimationFrame(paint); } } catch (e) { }
        });
      }
    }).then(function (res) {
      if (res.acc.trim()) {
        var m = { role: 'assistant', content: res.acc, sources: res.srcs, q: text, note: note, provider: res.prov };
        cur.msgs.push(m); cur.ts = Date.now(); saveChats(); a.remove(); addMsg(m, true);
      } else { a.remove(); if (!res.aborted) throw new Error('empty'); }
    }).catch(function (err) {
      var partial = err && err.partial;
      if (partial && partial.trim()) { var m2 = { role: 'assistant', content: partial, sources: [], q: text, note: '' }; cur.msgs.push(m2); saveChats(); a.remove(); addMsg(m2, true); return; }
      try { console.error('KAIVYRA AI failed:', err); } catch (e) { }
      ab.innerHTML = '<div class="kai-err"><b>' + esc(t('err')) + '</b><div class="kai-bar"><button type="button" class="kai-gh pri" data-a="retry">' + ic('retry') + '<span>' + esc(t('retry')) + '</span></button></div></div>';
      a._retry = text;
    }).then(function () { abortCtl = null; setBusy(false); renderSidebar(); body.scrollTop = body.scrollHeight; });
  }

  function onClick(e) {
    var el = e.target.closest('[data-a],[data-q],[data-mode]'); if (!el || !root.contains(el)) return;
    var a = el.getAttribute('data-a'), q = el.getAttribute('data-q'), md_ = el.getAttribute('data-mode');
    if (md_) { S.mode = md_; saveSet(); syncOpts(); return; }
    if (q) { send(q); return; }
    if (a === 'close' || a === 'sbclose') { if (a === 'sbclose') root.classList.remove('sb-open'); else close(); }
    else if (a === 'sb') root.classList.toggle('sb-open');
    else if (a === 'theme') toggleTheme();
    else if (a === 'new') newChat();
    else if (a === 'open') openChat(el.getAttribute('data-id'));
    else if (a === 'del') delChat(el.getAttribute('data-id'));
    else if (a === 'cite') { S.cite = !S.cite; saveSet(); syncOpts(); }
    else if (a === 'copy') { var m = el.closest('.kai-m'); copyText(m && m._raw || '', el); }
    else if (a === 'regen') {
      if (busy || !cur) return; var last = cur.msgs[cur.msgs.length - 1]; if (!last || last.role !== 'assistant') return;
      cur.msgs.pop(); var u = cur.msgs[cur.msgs.length - 1]; saveChats(); if (u) send(u.content, { regen: true });
    }
    else if (a === 'retry') { var mm = el.closest('.kai-m'); var tx = mm && mm._retry; if (mm) mm.remove(); if (tx) { var lastU = cur.msgs[cur.msgs.length - 1]; if (lastU && lastU.role === 'user' && lastU.content === tx) send(tx, { regen: true }); else send(tx); } }
    else if (a === 'exp' || a === 'home') { /* normal link */ }
  }
  function copyText(txt, btn) {
    function done() { var s = btn.querySelector('span'); if (!s) return; s.textContent = t('copied'); setTimeout(function () { s.textContent = t('copy'); }, 1500); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, done);
    else { var x = document.createElement('textarea'); x.value = txt; document.body.appendChild(x); x.select(); try { document.execCommand('copy'); } catch (e) { } x.remove(); done(); }
  }

  /* re-label when the site language flips */
  try { new MutationObserver(function () { if (root) { labels(); if (cur && !cur.msgs.length) hello(); } }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] }); } catch (e) { }

  window.KVAI = { open: open, close: close, ask: send };
  if (PAGE) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { open(); }); else open(); }
})();
