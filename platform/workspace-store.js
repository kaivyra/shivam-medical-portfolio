/* KAIVYRA workspace (local to this browser, no account, no server sync).
 * Data lives in localStorage under kv_ws_v1. Clearing browser data deletes it. Export regularly.
 * v5 adds: saved trials, saved topics, saved searches, evidence briefs and inquiry trackers.
 * The storage format stays v:1; older exports load fine because new collections default to empty.
 */
(function () {
  'use strict';
  var KEY = 'kv_ws_v1', MAXH = 100, MAXS = 60;
  function blank() { return { v: 1, papers: {}, collections: {}, notes: [], history: [], projects: [], prefs: {}, trials: {}, topics: {}, searches: [], briefs: [], inquiries: {} }; }
  function load() {
    try {
      var o = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (o && o.v === 1 && o.papers && typeof o.papers === 'object') {
        var s = Object.assign(blank(), o);
        ['trials', 'topics', 'inquiries'].forEach(function (k) { if (!s[k] || typeof s[k] !== 'object' || Array.isArray(s[k])) s[k] = {}; });
        ['searches', 'briefs'].forEach(function (k) { if (!Array.isArray(s[k])) s[k] = []; });
        return s;
      }
    } catch (e) {}
    return blank();
  }
  function persist(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); window.dispatchEvent(new CustomEvent('kv-workspace-change')); return true; }
    catch (e) { return false; }
  }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function snapshot(p) {
    return { key: p.key, source: p.source, id: p.id, pmid: p.pmid, pmcid: p.pmcid, doi: p.doi, title: p.title, authors: p.authors, journal: p.journal, volume: p.volume, issue: p.issue,
      pages: p.pages, year: p.year, date: p.date, abstract: p.abstract, pubTypes: p.pubTypes, mesh: p.mesh, isOA: p.isOA, isPreprint: p.isPreprint, retracted: p.retracted, study: p.study,
      links: p.links, savedAt: Date.now(), retrievedAt: Date.now(), collections: [] };
  }
  function trialSnap(t) {
    return { nct: t.nct, title: t.title, officialTitle: t.officialTitle || null, status: t.status, statusLabel: t.statusLabel, phases: t.phases || [], sponsor: t.sponsor, conditions: t.conditions || [],
      interventions: (t.interventions || []).slice(0, 8), enrollment: t.enrollment, enrollmentType: t.enrollmentType || null, studyType: t.studyType || null, start: t.start || null,
      primaryCompletion: t.primaryCompletion || null, completion: t.completion || null, lastUpdate: t.lastUpdate || null, hasResults: !!t.hasResults, link: t.link, savedAt: Date.now() };
  }
  var W = {
    get: load,
    /* ----- papers ----- */
    isSaved: function (key) { return !!load().papers[key]; },
    savePaper: function (p) { var s = load(); if (!s.papers[p.key]) s.papers[p.key] = snapshot(p); return persist(s); },
    removePaper: function (key) { var s = load(); delete s.papers[key]; s.notes.forEach(function (n) { if (n.paperKey === key) n.paperKey = null; }); return persist(s); },
    /* ----- collections, notes, projects ----- */
    addCollection: function (name) { name = String(name || '').trim().slice(0, 80); if (!name) return null; var s = load(), id = uid(); s.collections[id] = { id: id, name: name, created: Date.now() }; persist(s); return id; },
    deleteCollection: function (id) { var s = load(); delete s.collections[id]; Object.keys(s.papers).forEach(function (k) { s.papers[k].collections = (s.papers[k].collections || []).filter(function (c) { return c !== id; }); }); return persist(s); },
    toggleInCollection: function (key, cid) {
      var s = load(), p = s.papers[key]; if (!p || !s.collections[cid]) return false; var c = p.collections || [], i = c.indexOf(cid);
      if (i >= 0) c.splice(i, 1); else c.push(cid); p.collections = c; return persist(s);
    },
    addNote: function (text, paperKey) { text = String(text || '').trim().slice(0, 5000); if (!text) return null; var s = load(), n = { id: uid(), text: text, paperKey: paperKey || null, created: Date.now() }; s.notes.unshift(n); persist(s); return n.id; },
    updateNote: function (id, text) { var s = load(); s.notes.forEach(function (n) { if (n.id === id) { n.text = String(text).slice(0, 5000); n.updated = Date.now(); } }); return persist(s); },
    deleteNote: function (id) { var s = load(); s.notes = s.notes.filter(function (n) { return n.id !== id; }); return persist(s); },
    addProject: function (name, desc) { name = String(name || '').trim().slice(0, 100); if (!name) return null; var s = load(), id = uid(); s.projects.unshift({ id: id, name: name, description: String(desc || '').slice(0, 500), created: Date.now(), question: '' }); persist(s); return id; },
    deleteProject: function (id) { var s = load(); s.projects = s.projects.filter(function (p) { return p.id !== id; }); return persist(s); },
    /* ----- history ----- */
    pushHistory: function (type, q, extra) {
      q = String(q || '').trim().slice(0, 300); if (!q) return; var s = load();
      if (s.prefs.history === 'off') return;
      s.history = s.history.filter(function (h) { return !(h.type === type && h.q === q); });
      s.history.unshift({ type: type, q: q, t: Date.now(), n: extra && extra.n, u: extra && extra.u ? String(extra.u).slice(0, 600) : undefined }); s.history = s.history.slice(0, MAXH); persist(s);
    },
    clearHistory: function () { var s = load(); s.history = []; return persist(s); },
    setPref: function (k, v) { var s = load(); s.prefs[k] = v; return persist(s); },
    /* ----- trials ----- */
    isTrialSaved: function (nct) { return !!load().trials[String(nct).toUpperCase()]; },
    saveTrial: function (t) { if (!t || !t.nct) return false; var s = load(), k = String(t.nct).toUpperCase(); if (!s.trials[k]) s.trials[k] = trialSnap(t); return persist(s); },
    removeTrial: function (nct) { var s = load(); delete s.trials[String(nct).toUpperCase()]; return persist(s); },
    listTrials: function () { var t = load().trials; return Object.keys(t).map(function (k) { return t[k]; }).sort(function (a, b) { return b.savedAt - a.savedAt; }); },
    /* ----- topics (Research Domain Atlas and Inquiry Framework bookmarks) ----- */
    isTopicSaved: function (id) { return !!load().topics[id]; },
    saveTopic: function (t) { if (!t || !t.id) return false; var s = load(); if (!s.topics[t.id]) s.topics[t.id] = { id: String(t.id).slice(0, 40), label: String(t.label || '').slice(0, 160), kind: t.kind === 'dimension' ? 'dimension' : 'topic', path: String(t.path || '').slice(0, 200), url: String(t.url || '').slice(0, 400), savedAt: Date.now() }; return persist(s); },
    removeTopic: function (id) { var s = load(); delete s.topics[id]; return persist(s); },
    listTopics: function () { var t = load().topics; return Object.keys(t).map(function (k) { return t[k]; }).sort(function (a, b) { return b.savedAt - a.savedAt; }); },
    /* ----- saved searches ----- */
    saveSearch: function (o) {
      if (!o || !o.url) return null; var s = load(), url = String(o.url).slice(0, 800);
      if (/^https?:/i.test(url) || /^\/\//.test(url)) return null; // internal links only
      var ex = s.searches.filter(function (x) { return x.url === url; })[0]; if (ex) return ex.id;
      var id = uid(); s.searches.unshift({ id: id, type: o.type === 'trials' ? 'trials' : 'research', label: String(o.label || '').trim().slice(0, 160) || url, url: url, n: o.n != null ? o.n : null, savedAt: Date.now() });
      s.searches = s.searches.slice(0, MAXS); return persist(s) ? id : null;
    },
    isSearchSaved: function (url) { return load().searches.some(function (x) { return x.url === url; }); },
    removeSearch: function (id) { var s = load(); s.searches = s.searches.filter(function (x) { return x.id !== id; }); return persist(s); },
    /* ----- evidence briefs (AI Lab output saved as Markdown text) ----- */
    addBrief: function (o) {
      if (!o || !o.md) return null; var s = load(), id = uid();
      s.briefs.unshift({ id: id, title: String(o.title || 'Evidence brief').slice(0, 160), question: String(o.question || '').slice(0, 400), md: String(o.md).slice(0, 60000), createdAt: Date.now() });
      s.briefs = s.briefs.slice(0, 30); return persist(s) ? id : null;
    },
    removeBrief: function (id) { var s = load(); s.briefs = s.briefs.filter(function (b) { return b.id !== id; }); return persist(s); },
    /* ----- inquiry tracker (Medical Inquiry Framework coverage per subject) ----- */
    getInquiry: function (subject) { var k = String(subject || '').trim().toLowerCase().slice(0, 120); return load().inquiries[k] || null; },
    setInquiry: function (subject, done, extra) {
      var label = String(subject || '').trim().slice(0, 120), k = label.toLowerCase(); if (!k) return false; var s = load(), keys = Object.keys(s.inquiries);
      if (!s.inquiries[k] && keys.length >= 40) { var oldest = keys.sort(function (a, b) { return s.inquiries[a].updated - s.inquiries[b].updated; })[0]; delete s.inquiries[oldest]; }
      s.inquiries[k] = { subject: label, done: done || {}, notes: (extra && extra.notes) || (s.inquiries[k] && s.inquiries[k].notes) || {}, updated: Date.now() }; return persist(s);
    },
    listInquiries: function () { var q = load().inquiries; return Object.keys(q).map(function (k) { return q[k]; }).sort(function (a, b) { return b.updated - a.updated; }); },
    deleteInquiry: function (subject) { var s = load(); delete s.inquiries[String(subject || '').trim().toLowerCase()]; return persist(s); },
    /* ----- export / import ----- */
    exportJSON: function () { return JSON.stringify(load(), null, 2); },
    importJSON: function (text) {
      var o; try { o = JSON.parse(text); } catch (e) { return { ok: false, error: 'File is not valid JSON.' }; }
      if (!o || o.v !== 1 || typeof o.papers !== 'object' || !Array.isArray(o.notes) || !Array.isArray(o.history)) return { ok: false, error: 'This is not a KAIVYRA workspace export (version 1).' };
      var s = load();
      Object.keys(o.papers).forEach(function (k) { if (!s.papers[k] && o.papers[k] && typeof o.papers[k].title !== 'undefined') s.papers[k] = o.papers[k]; });
      Object.keys(o.collections || {}).forEach(function (k) { if (!s.collections[k]) s.collections[k] = o.collections[k]; });
      var have = {}; s.notes.forEach(function (n) { have[n.id] = 1; }); o.notes.forEach(function (n) { if (n && n.id && !have[n.id]) s.notes.push(n); });
      if (o.trials && typeof o.trials === 'object') Object.keys(o.trials).forEach(function (k) { if (!s.trials[k] && o.trials[k] && o.trials[k].nct) s.trials[k] = o.trials[k]; });
      if (o.topics && typeof o.topics === 'object') Object.keys(o.topics).forEach(function (k) { if (!s.topics[k] && o.topics[k] && o.topics[k].id) s.topics[k] = o.topics[k]; });
      if (Array.isArray(o.searches)) { var hu = {}; s.searches.forEach(function (x) { hu[x.url] = 1; }); o.searches.forEach(function (x) { if (x && x.url && !hu[x.url] && !/^(https?:)?\/\//i.test(x.url)) s.searches.push(x); }); s.searches = s.searches.slice(0, MAXS); }
      if (Array.isArray(o.briefs)) { var hb = {}; s.briefs.forEach(function (x) { hb[x.id] = 1; }); o.briefs.forEach(function (x) { if (x && x.id && x.md && !hb[x.id]) s.briefs.push(x); }); s.briefs = s.briefs.slice(0, 30); }
      if (o.inquiries && typeof o.inquiries === 'object') Object.keys(o.inquiries).forEach(function (k) { if (!s.inquiries[k] && o.inquiries[k] && o.inquiries[k].subject) s.inquiries[k] = o.inquiries[k]; });
      return { ok: persist(s), error: null };
    }
  };
  window.KVWorkspace = W;
})();
