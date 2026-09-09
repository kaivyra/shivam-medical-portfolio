"use strict";

/**
 * Shivam Maurya — Portfolio
 * Dependency-free interaction layer.
 * Defensive by design: every DOM lookup is null-checked so a missing
 * element (e.g. edited markup) never throws and breaks the rest of the page.
 */

(function () {
  const doc = document;

  /* ---------------------------------------------------------------
   * Mobile navigation
   * ------------------------------------------------------------- */
  function initNav() {
    const toggle = doc.querySelector("[data-nav-toggle]");
    const nav = doc.querySelector("[data-nav]");

    if (!toggle || !nav) return;

    const links = nav.querySelectorAll("[data-nav-link]");

    const closeNav = () => {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
      doc.body.classList.remove("nav-open");
    };

    const openNav = () => {
      toggle.setAttribute("aria-expanded", "true");
      nav.classList.add("is-open");
      doc.body.classList.add("nav-open");
    };

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      isOpen ? closeNav() : openNav();
    });

    links.forEach((link) => link.addEventListener("click", closeNav));

    doc.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) closeNav();
    });
  }

  /* ---------------------------------------------------------------
   * Scroll-spy: highlight the nav link for the section in view
   * ------------------------------------------------------------- */
  function initScrollSpy() {
    const links = doc.querySelectorAll("[data-nav-link]");
    if (!links.length || !("IntersectionObserver" in window)) return;

    const sections = Array.from(links)
      .map((link) => {
        const id = (link.getAttribute("href") || "").replace("#", "");
        return id ? doc.getElementById(id) : null;
      })
      .filter(Boolean);

    if (!sections.length) return;

    const linkForId = new Map();
    links.forEach((link) => {
      const id = (link.getAttribute("href") || "").replace("#", "");
      if (id) linkForId.set(id, link);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) => link.classList.remove("is-active"));
          const activeLink = linkForId.get(entry.target.id);
          if (activeLink) activeLink.classList.add("is-active");
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
  }

  /* ---------------------------------------------------------------
   * Footer year — keeps the copyright line accurate with no
   * manual edits required.
   * ------------------------------------------------------------- */
  function initFooterYear() {
    const el = doc.querySelector("[data-year]");
    if (!el) return;
    el.textContent = String(new Date().getFullYear());
  }

  function init() {
    initNav();
    initScrollSpy();
    initFooterYear();
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
