/* KAIVYRA kv-dock v1
 * Ek hi file, har page par:
 *  1) Back (ek step peeche) + Home button, hamesha dikhte hain (scroll par bhi).
 *  2) Page ka apna navigation bar (sticky / fixed header) thoda sa bhi scroll karte hi turant hat jata hai,
 *     aur sirf page ke top par wapas aane par dikhta hai.
 * Rules: ek page par ek hi nav bar. Page ka apna nav ho to wahi chalta hai (global bar sirf home par).
 * Iframe ke andar (arena/analyzer app) sirf scroll-hide chalta hai; dock bahar wale page ka hi dikhta hai.
 * Koi dependency nahi. Pages isse optional hooks se jod sakte hain: window.__kvBack() -> true agar page ne
 * ek step peeche khud handle kar liya. */
(function () {
  'use strict';
  if (window.__kvDock) return;
  window.__kvDock = true;

  var doc = document, root = doc.documentElement;
  var inFrame = false;
  try { inFrame = window.top !== window.self; } catch (e) { inFrame = true; }

  /* ---------- 1) own-nav hide on scroll ---------- */
  var SEL = 'header, nav, [role="banner"], .brand-bar, .topbar';
  var HIDE_AT = 4;                 // px: isse zyada scroll hote hi bar hat jata hai
  var hidden = [], lastScan = 0, ticking = false;

  function inOwnUi(el) {
    return el.id === 'kv-dock' || (el.closest && (el.closest('#kv-dock') || el.closest('#kv-global-bar')));
  }
  function detect() {
    var vh = window.innerHeight, vw = window.innerWidth, found = [];
    var nodes = doc.querySelectorAll(SEL);
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (inOwnUi(el)) continue;
      var cs = getComputedStyle(el);
      if (cs.position !== 'fixed' && cs.position !== 'sticky') continue;
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      var r = el.getBoundingClientRect();
      if (r.height > 220 || r.width < vw * 0.5) continue;      // sidebar / chhota widget nahi
      if (r.top > vh * 0.45 || r.bottom < 0) continue;          // neeche wale tab bar ko nahi chhedte
      found.push(el);
    }
    // nested duplicate hatao: parent mil gaya to child ko alag se nahi chhupana
    return found.filter(function (el) {
      return !found.some(function (o) { return o !== el && o.contains(el); });
    });
  }
  function apply() {
    var y = window.pageYOffset || root.scrollTop || 0;
    if (y > HIDE_AT) {
      var now = Date.now();
      if (now - lastScan > 250) {
        lastScan = now;
        var f = detect();
        f.forEach(function (el) { if (hidden.indexOf(el) < 0) hidden.push(el); });
      }
      hidden.forEach(function (el) { el.classList.add('kv-hidebar'); });
    } else {
      hidden.forEach(function (el) { el.classList.remove('kv-hidebar'); });
      hidden = hidden.filter(function (el) { return doc.contains(el); });
      lastScan = 0;
    }
  }
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { ticking = false; apply(); });
  }

  /* ---------- 2) Back / Home dock ---------- */
  var hashMoves = 0;
  addEventListener('hashchange', function () { hashMoves++; refresh(); });
  addEventListener('popstate', function () { refresh(); });
  addEventListener('pageshow', function () { refresh(); });
  (function () {
    var ps = history.pushState;
    history.pushState = function () { hashMoves++; var r = ps.apply(this, arguments); setTimeout(refresh, 0); return r; };
  })();

  function sameOriginReferrer() {
    try { return !!doc.referrer && new URL(doc.referrer).origin === location.origin; } catch (e) { return false; }
  }
  function isRoot() { return location.pathname.replace(/index\.html$/, '') === '/'; }
  function parentUrl() {
    var parts = location.pathname.replace(/index\.html$/, '').split('/').filter(Boolean);
    if (!parts.length) return null;
    parts.pop();
    return '/' + (parts.length ? parts.join('/') + '/' : '');
  }
  function frameBack() {
    try {
      var f = doc.getElementById('kv-app'), w = f && f.contentWindow;
      if (w && typeof w.__kvBack === 'function') return w.__kvBack() === true;
    } catch (e) {}
    return false;
  }
  function canBack() {
    if (!isRoot()) return true;
    return hashMoves > 0 || sameOriginReferrer();
  }
  function goBack() {
    if (frameBack()) return;                                             // iframe app ke andar ek step
    try { if (typeof window.__kvBack === 'function' && window.__kvBack() === true) return; } catch (e) {} // page ka apna step
    if (hashMoves > 0 || sameOriginReferrer()) { history.back(); return; } // site ka pichla page / section
    var p = parentUrl();                                                  // seedha khola gaya ho to ek level upar
    if (p) location.href = p;
  }
  function goHome(e) {
    if (isRoot()) {                                                       // home par ho to top par le jao
      e.preventDefault();
      try { if (location.search || location.hash) history.replaceState(null, '', '/'); } catch (x) {}
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  var LANG = {
    en: { back: 'Back', home: 'Home', bl: 'Go back one step', hl: 'Go to home page', nav: 'Page navigation' },
    hi: { back: '\u0935\u093e\u092a\u0938', home: '\u0939\u094b\u092e', bl: '\u090f\u0915 \u0938\u094d\u091f\u0947\u092a \u092a\u0940\u091b\u0947 \u091c\u093e\u090f\u0902', hl: '\u0939\u094b\u092e \u092a\u0947\u091c \u092a\u0930 \u091c\u093e\u090f\u0902', nav: '\u092a\u0947\u091c \u0928\u0947\u0935\u093f\u0917\u0947\u0936\u0928' }
  };
  function txt() {
    var l = 'en';
    try { l = localStorage.getItem('kv_lang') || root.lang || 'en'; } catch (e) {}
    return LANG[String(l).slice(0, 2)] || LANG.en;
  }

  var dock, bBack, bHome;
  var ICON_BACK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
  var ICON_HOME = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.5L12 5l8 6.5"/><path d="M6.5 10.5V19h11v-8.5"/></svg>';

  function paintLabels() {
    if (!dock) return;
    var t = txt();
    dock.setAttribute('aria-label', t.nav);
    bBack.querySelector('span').textContent = t.back; bBack.setAttribute('aria-label', t.bl); bBack.title = t.bl;
    bHome.querySelector('span').textContent = t.home; bHome.setAttribute('aria-label', t.hl); bHome.title = t.hl;
  }
  function luminance(c) {
    var m = /rgba?\(([^)]+)\)/.exec(c || ''); if (!m) return null;
    var p = m[1].split(',').map(parseFloat); if (p.length > 3 && p[3] < 0.3) return null;
    return (0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2]) / 255;
  }
  function paintTheme() {
    if (!dock) return;
    var l = null;
    if (root.classList.contains('light') || root.getAttribute('data-theme') === 'light') l = 1;
    else if (root.classList.contains('dark') || root.getAttribute('data-theme') === 'dark') l = 0;
    else {
      l = luminance(getComputedStyle(doc.body).backgroundColor);
      if (l === null) l = luminance(getComputedStyle(root).backgroundColor);
      if (l === null) l = 0;
    }
    dock.setAttribute('data-t', l > 0.55 ? 'light' : 'dark');
  }
  function refresh() {
    if (!dock) return;
    var ok = canBack();
    bBack.setAttribute('aria-disabled', ok ? 'false' : 'true');
    paintLabels(); paintTheme();
  }

  var CSS = '' +
    '.kv-hidebar{transform:translateY(-135%)!important;opacity:0!important;pointer-events:none!important;box-shadow:none!important;transition:transform .14s cubic-bezier(.4,0,.2,1),opacity .1s ease!important}' +
    '#kv-dock{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(max(14px,env(safe-area-inset-bottom,0px)) + var(--kvd-lift,0px));z-index:2147483000;display:flex;align-items:center;gap:2px;padding:4px;border-radius:99px;font:600 14px/1 Inter,"Noto Sans Devanagari",system-ui,-apple-system,"Segoe UI",sans-serif;' +
      'background:rgba(8,14,28,.88);color:#e6edf8;border:1px solid rgba(148,163,184,.28);box-shadow:0 14px 34px -14px rgba(0,0,0,.8);-webkit-backdrop-filter:blur(14px) saturate(160%);backdrop-filter:blur(14px) saturate(160%);-webkit-tap-highlight-color:transparent}' +
    '#kv-dock[data-t=light]{background:rgba(255,255,255,.94);color:#14213d;border-color:rgba(15,23,42,.14);box-shadow:0 14px 30px -16px rgba(15,23,42,.5)}' +
    '#kv-dock .kvd-b{all:unset;box-sizing:border-box;display:inline-flex;align-items:center;gap:6px;height:40px;padding:0 15px 0 11px;border-radius:99px;cursor:pointer;color:inherit;text-decoration:none;font:inherit;user-select:none;-webkit-user-select:none;transition:background .15s,color .15s,opacity .15s}' +
    '#kv-dock .kvd-b:hover{background:rgba(45,212,191,.16);color:#2dd4bf}' +
    '#kv-dock[data-t=light] .kvd-b:hover{background:rgba(15,118,110,.12);color:#0f766e}' +
    '#kv-dock .kvd-b:focus-visible{outline:2px solid #22d3ee;outline-offset:1px}' +
    '#kv-dock .kvd-b[aria-disabled=true]{opacity:.38;cursor:default;pointer-events:none}' +
    '#kv-dock svg{width:19px;height:19px;flex:none;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}' +
    '#kv-dock .kvd-s{width:1px;height:20px;background:currentColor;opacity:.2}' +
    '@media(max-width:700px){body[data-kv-section=arena] #kv-dock{--kvd-lift:62px}}' +
    '@media(max-width:380px){#kv-dock .kvd-b{padding:0 12px 0 9px}}' +
    '@media print{#kv-dock{display:none!important}}' +
    '@media(prefers-reduced-motion:reduce){.kv-hidebar,#kv-dock .kvd-b{transition:none!important}}';

  function mount() {
    if (!doc.getElementById('kv-dock-css')) {
      var st = doc.createElement('style'); st.id = 'kv-dock-css'; st.textContent = CSS; (doc.head || root).appendChild(st);
    }
    if (inFrame) return;                         // iframe me dock nahi: bahar wale page ka dock hi chalega
    if (doc.getElementById('kv-dock')) return;
    dock = doc.createElement('div');
    dock.id = 'kv-dock'; dock.setAttribute('role', 'navigation');
    dock.innerHTML =
      '<button type="button" class="kvd-b" data-k="back">' + ICON_BACK + '<span>Back</span></button>' +
      '<i class="kvd-s" aria-hidden="true"></i>' +
      '<a class="kvd-b" data-k="home" href="/">' + ICON_HOME + '<span>Home</span></a>';
    if (typeof window.KV_DOCK_LIFT === 'number') dock.style.setProperty('--kvd-lift', window.KV_DOCK_LIFT + 'px');   // page chaahe to dock ko composer / bottom bar ke upar utha sakta hai
    doc.body.appendChild(dock);
    bBack = dock.querySelector('[data-k=back]'); bHome = dock.querySelector('[data-k=home]');
    bBack.addEventListener('click', function (e) { e.preventDefault(); if (bBack.getAttribute('aria-disabled') !== 'true') goBack(); });
    bHome.addEventListener('click', goHome);
    refresh();
    try { new MutationObserver(function () { paintTheme(); paintLabels(); }).observe(root, { attributes: true, attributeFilter: ['class', 'data-theme', 'lang'] }); } catch (e) {}
    window.KVI18N_dockRefresh = refresh;
    addEventListener('storage', function (e) { if (e.key === 'kv_lang') refresh(); });
    setTimeout(refresh, 600); setTimeout(refresh, 2000);   // theme / i18n late load hone par
  }

  addEventListener('scroll', onScroll, { passive: true });
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', mount); else mount();
  window.KVDock = { refresh: refresh, back: goBack };
})();
