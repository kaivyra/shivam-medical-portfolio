/* KAIVYRA shared utilities (downloads, CSV, clipboard, toast, debounce). No external dependencies. */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function download(name, text, type) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: type || 'text/plain;charset=utf-8' })); a.download = name; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  /* CSV cell: quote everything, neutralise spreadsheet formula injection (=, +, -, @, tab, CR at the start). */
  function csvCell(c) { var s = String(c == null ? '' : c).replace(/"/g, '""'); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s + '"'; }
  function toCSV(rows) { return '﻿' + rows.map(function (r) { return r.map(csvCell).join(','); }).join('\r\n'); }
  function toast(msg) {
    var t = document.getElementById('kv-toast');
    if (!t) { t = document.createElement('div'); t.id = 'kv-toast'; t.className = 'kv-toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('on'); }, 2600);
  }
  function copy(text, okMsg) {
    function fb() {
      try { var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.appendChild(ta); ta.select(); var ok = document.execCommand('copy'); ta.remove(); return ok; } catch (e) { return false; }
    }
    var done = function (ok) { toast(ok ? (okMsg || 'Copied to clipboard') : 'Could not copy. Select the text and copy manually.'); return ok; };
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).then(function () { return done(true); }, function () { return done(fb()); });
    return Promise.resolve(done(fb()));
  }
  function debounce(fn, ms) { var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms); }; }
  function num(x, d) { if (x == null || !isFinite(x)) return '–'; return Number(x).toLocaleString(undefined, { maximumFractionDigits: d == null ? 2 : d, minimumFractionDigits: 0 }); }
  function slug(s) { return String(s || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
  function today() { return new Date().toISOString().slice(0, 10); }
  window.KVUtil = { esc: esc, download: download, csvCell: csvCell, toCSV: toCSV, toast: toast, copy: copy, debounce: debounce, num: num, slug: slug, today: today };
})();
