/* KAIVYRA site-pro v1
   - mounts the main page's Connect band + footer at the bottom of every inner page
   - instant click feedback: route progress bar, button/card ripple
   - soft reveal for below-the-fold blocks and freshly rendered results
   Safe to load twice. Does nothing on the home page (it has its own footer). */
(function () {
  'use strict';
  if (window.__kvSitePro) return; window.__kvSitePro = true;

  var D = document, rm = false;
  try { rm = matchMedia('(prefers-reduced-motion:reduce)').matches; } catch (e) {}

  /* ---------- stylesheet (for pages that did not link it in <head>) ---------- */
  if (!D.querySelector('link[href*="site-pro.css"]')) {
    var l = D.createElement('link'); l.rel = 'stylesheet'; l.href = '/platform/site-pro.css?v=1'; D.head.appendChild(l);
  }

  /* ---------- footer markup: same content as the main page ---------- */
  var MAIL = 'the.kaivyra@gmail.com';
  var HTML =
    '<section class="kvs-band"><div class="kvs-wrap"><div class="kvs-con">' +
      '<div><p class="kvs-ey">Connect</p><h2>Questions, feedback or collaboration?</h2>' +
      '<p class="kvs-lead">Write to us or follow KAIVYRA for updates. We read every message.</p>' +
      '<div class="kvs-cta"><a class="kvs-btn" href="mailto:' + MAIL + '">Email us</a><a class="kvs-btn o" href="/research/">Start searching</a></div></div>' +
      '<div class="kvs-lk">' +
        '<a href="mailto:' + MAIL + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M4 7l8 6 8-6"/></svg><span>Email<small>' + MAIL + '</small></span></a>' +
        '<a href="https://x.com/KAIVYRAHQ" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.2 2.5h3.3l-7.2 8.2 8.5 11.3h-6.7l-5.2-6.8-6 6.8H1.6l7.7-8.8L1.2 2.5H8l4.7 6.2zm-1.2 17.5h1.8L7.1 4.4H5.2z"/></svg><span>X (Twitter)<small>@KAIVYRAHQ</small></span></a>' +
        '<a href="https://www.linkedin.com/company/144122048/" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.8h4V21H3zM9.5 9.8h3.8v1.6h.1c.5-1 1.8-1.9 3.8-1.9 4 0 4.8 2.6 4.8 6V21h-4v-4.9c0-1.2 0-2.7-1.7-2.7s-1.9 1.3-1.9 2.6V21h-4z"/></svg><span>LinkedIn<small>KAIVYRA company page</small></span></a>' +
      '</div></div></div></section>' +
    '<footer class="kvs-foot"><div class="kvs-wrap"><div class="kvs-fg">' +
      '<div><strong>KAIVYRA</strong><p>Medical research intelligence, clinical tools and evidence education. Scientific information, with the source always one click away.</p><p><a href="/legal/">Disclaimer, sources &amp; takedown policy</a></p></div>' +
      '<div><h4>Platform</h4><a href="/research/">Research</a><a href="/trials/">Clinical Trials</a><a href="/ai-lab/">AI Lab</a><a href="/evidence-lab/">Evidence Lab</a><a href="/knowledge/">Knowledge Hub</a></div>' +
      '<div><h4>Tools</h4><a href="/clinical/">Clinical suite</a><a href="/analyzer/">Report Analyzer</a><a href="/arena/">Medical Arena</a><a href="/workspace/">Workspace</a><a href="/future/">Roadmap</a></div>' +
      '<div><h4>Connect</h4><a href="mailto:' + MAIL + '">Email</a><a href="https://x.com/KAIVYRAHQ" target="_blank" rel="noopener noreferrer">X (Twitter)</a><a href="https://www.linkedin.com/company/144122048/" target="_blank" rel="noopener noreferrer">LinkedIn</a></div>' +
    '</div><div class="kvs-fb"><span>&copy; 2026 KAIVYRA. Scientific information and education. Not for diagnosis or treatment decisions.</span><span>In an emergency call your local emergency number (India: 112).</span></div></div></footer>';

  function mountFooter() {
    var b = D.body; if (!b) return;
    if (b.classList.contains('kv-home') || window.KVS_NO_FOOTER) return;   // home has its own
    if (D.getElementById('kvs-end')) return;
    var box = D.createElement('div'); box.id = 'kvs-end'; box.innerHTML = HTML;
    var old = D.getElementById('kv-footer');
    if (old && old.parentNode) { old.parentNode.replaceChild(box, old); return; }
    // no placeholder on this page: put it after the last visible block, before scripts
    var first = null, kids = b.children;
    for (var i = kids.length - 1; i >= 0; i--) { if (kids[i].tagName === 'SCRIPT' || kids[i].tagName === 'NOSCRIPT') first = kids[i]; else break; }
    b.insertBefore(box, first);
  }

  /* ---------- route progress bar on any internal click ---------- */
  var prog;
  function bar() {
    if (prog) return prog;
    prog = D.createElement('div'); prog.id = 'kvs-prog'; prog.setAttribute('aria-hidden', 'true'); D.body.appendChild(prog); return prog;
  }
  function start() {
    var p = bar(); p.classList.remove('on'); void p.offsetWidth; p.classList.add('on'); D.body.classList.add('kvs-leaving');
  }
  function stop() { if (prog) prog.classList.remove('on'); D.body.classList.remove('kvs-leaving'); }
  addEventListener('pageshow', stop);

  D.addEventListener('click', function (e) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
    // ripple on cards / buttons
    var host = e.target.closest('.kv-btn,a.kv-card'); if (host && !rm) ripple(host, e);
    var h = a.getAttribute('href') || '';
    if (a.target && a.target !== '_self') return;
    if (a.hasAttribute('download') || /^(mailto:|tel:|javascript:|#)/i.test(h)) return;
    var u; try { u = new URL(a.href, location.href); } catch (x) { return; }
    if (u.origin !== location.origin) return;
    if (u.pathname === location.pathname && u.search === location.search) return;   // same page: nothing to load
    setTimeout(function () { if (!e.defaultPrevented) start(); }, 0);
  }, false);

  D.addEventListener('pointerdown', function (e) {
    if (rm || e.button) return;
    var host = e.target.closest && e.target.closest('button.kv-btn,.kv-btn:not(a)'); if (host) ripple(host, e);
  }, true);

  function ripple(host, e) {
    var r = host.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2, d = D.createElement('span');
    d.className = 'kvs-ripple'; d.style.width = d.style.height = s + 'px';
    d.style.left = (e.clientX - r.left - s / 2) + 'px'; d.style.top = (e.clientY - r.top - s / 2) + 'px';
    host.appendChild(d); setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 650);
  }

  /* ---------- reveal: below-the-fold blocks fade up, new results pop in ---------- */
  var SEL = '.kv-card,.kv-result,.kv-h2,.kv-kpi,.kv-table-wrap';
  function reveal() {
    if (rm || !('IntersectionObserver' in window)) return;
    var main = D.getElementById('kv-main') || D.querySelector('main'); if (!main) return;
    var vh = innerHeight, io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('kvs-in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    var all = [];
    Array.prototype.forEach.call(main.querySelectorAll(SEL), function (el) {
      if (el.closest('dialog,[hidden],.kvs-rv')) return;
      var r = el.getBoundingClientRect();
      if (r.top > vh * 0.95) { el.classList.add('kvs-rv'); io.observe(el); all.push(el); }
    });
    setTimeout(function () { all.forEach(function (el) { el.classList.add('kvs-in'); }); }, 3500);   // safety net: never leave anything hidden
    // content rendered later (search results, saved items)
    var t = 0, mo = new MutationObserver(function (ms) {
      if (D.readyState !== 'complete' && !t) { /* initial paint handled by CSS rise */ }
      ms.forEach(function (m) {
        Array.prototype.forEach.call(m.addedNodes, function (n) {
          if (n.nodeType !== 1 || n.id === 'kvs-end' || n.id === 'kvs-prog') return;
          if (n.matches && n.matches('.kv-card,.kv-result') && !n.classList.contains('kvs-rv')) {
            if (performance.now() > 1200) n.classList.add('kvs-new');
          }
        });
      });
    });
    mo.observe(main, { childList: true, subtree: true });
  }

  function init() { mountFooter(); bar(); reveal(); }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', init); else init();
  window.KVSitePro = { mountFooter: mountFooter };
})();
