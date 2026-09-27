import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const isCoarsePointer = () =>
  window.matchMedia("(hover: none), (pointer: coarse)").matches;

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initHeroIntro() {
  const els = gsap.utils.toArray('[data-reveal="hero"]');
  if (!els.length) return;

  if (prefersReducedMotion()) {
    gsap.set(els, { opacity: 1, y: 0 });
    return;
  }

  gsap.set(els, { y: 32 });

  gsap.to(els, {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: "power4.out",
    stagger: 0.1,
  });
}

export function initScrollReveals() {
  const els = gsap.utils.toArray('[data-reveal]:not([data-reveal="hero"])');
  if (!els.length) return;

  if (prefersReducedMotion()) {
    gsap.set(els, { opacity: 1, y: 0 });
    return;
  }

  gsap.set(els, { y: 40 });

  ScrollTrigger.batch(els, {
    start: "top 88%",
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.12,
      }),
  });
}

export function initMagnetic() {
  if (isCoarsePointer() || prefersReducedMotion()) return;

  const els = document.querySelectorAll("[data-magnetic]");

  els.forEach((el) => {
    const moveX = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
    const moveY = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });

    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      moveX(relX * 0.35);
      moveY(relY * 0.35);
    });

    el.addEventListener("mouseleave", () => {
      moveX(0);
      moveY(0);
    });
  });
}

export function initMobileNav() {
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("mobileMenu");
  if (!toggle || !menu) return;

  const close = () => {
    menu.classList.remove("is-open");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.removeProperty("overflow");
  };

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
}

export function setFooterYear() {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
}
