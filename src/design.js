import { gsap } from "gsap";
import "@fontsource/open-runde/400.css";
import "@fontsource/open-runde/500.css";
import "@fontsource/open-runde/600.css";
import "@fontsource/open-runde/700.css";
import "./style.css";
import "./landing.css";
import "./developer.css";
import "./design.css";
import { initTheme } from "./theme.js";
import { initSmoothScroll } from "./smoothScroll.js";
import { initGlassLight } from "./landing/glassLight.js";
import { initResume } from "./landing/resume.js";
import { initWobble } from "./landing/wobble.js";
import { initProjectModal } from "./projectModal.js";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const PALETTE = ["#ff3d7f", "#ff9f1c", "#ffd23f", "#2ec4b6", "#3a86ff", "#8338ec"];

/**
 * "Pratham" is shy. As the cursor comes near, each letter flinches away from
 * it, and the whole word — pinned in place — shrinks away from the cursor's
 * side: cursor above → it squashes down, cursor on the right → it shrinks to
 * the left, and so on. Once the cursor leaves, it springs back.
 */
function initShyName() {
  const el = document.querySelector("[data-play]");
  if (!el) return;
  const text = el.textContent;
  el.textContent = "";
  el.setAttribute("aria-label", text);
  const cells = [...text].map((ch) => {
    const s = Object.assign(document.createElement("span"), { className: "pc", textContent: ch });
    el.appendChild(s);
    return s;
  });
  if (reduced() || !finePointer()) return;

  const R = 190; // how far the shyness reaches
  const moves = cells.map((c) => ({
    x: gsap.quickTo(c, "x", { duration: 0.45, ease: "power3.out" }),
    y: gsap.quickTo(c, "y", { duration: 0.45, ease: "power3.out" }),
    r: gsap.quickTo(c, "rotation", { duration: 0.5, ease: "power3.out" }),
  }));
  // the word's squash, with its pivot on the side away from the cursor
  const shape = { ox: 50, oy: 50, sx: 1, sy: 1 };
  const apply = () => {
    el.style.transformOrigin = `${shape.ox}% ${shape.oy}%`;
    el.style.transform = `scale(${shape.sx}, ${shape.sy})`;
  };

  // untransformed geometry, in page coordinates
  let base = null;
  const measure = () => {
    const prev = [el.style.transform, ...cells.map((c) => c.style.transform)];
    el.style.transform = "";
    cells.forEach((c) => (c.style.transform = ""));
    const r = el.getBoundingClientRect();
    base = {
      word: { l: r.left + scrollX, t: r.top + scrollY, w: r.width, h: r.height },
      cells: cells.map((c) => {
        const b = c.getBoundingClientRect();
        return { x: b.left + b.width / 2 + scrollX, y: b.top + b.height / 2 + scrollY };
      }),
    };
    el.style.transform = prev[0];
    cells.forEach((c, i) => (c.style.transform = prev[i + 1]));
  };
  document.fonts?.ready.then(measure);
  measure();
  window.addEventListener("resize", measure);

  let calm = true;
  let raf = 0;
  let px = 0;
  let py = 0;
  const update = () => {
    raf = 0;
    const { word: w } = base;
    const cx = px + scrollX;
    const cy = py + scrollY;
    const ex = Math.max(w.l - cx, 0, cx - (w.l + w.w));
    const ey = Math.max(w.t - cy, 0, cy - (w.t + w.h));
    const p = Math.max(0, 1 - Math.hypot(ex, ey) / R); // 0 far … 1 touching
    if (!p) {
      if (calm) return;
      calm = true;
      moves.forEach((m) => (m.x(0), m.y(0), m.r(0)));
      gsap.to(shape, { sx: 1, sy: 1, duration: 1.1, ease: "elastic.out(1, 0.3)", overwrite: true, onUpdate: apply });
      return;
    }
    calm = false;
    const e = p * p * (3 - 2 * p);

    // each letter flinches away from the cursor and leans back
    base.cells.forEach((c, i) => {
      const dx = c.x - cx;
      const dy = c.y - cy;
      const d = Math.hypot(dx, dy) || 1;
      const f = Math.max(0, 1 - d / (R * 1.1)) ** 1.5;
      moves[i].x((dx / d) * f * 34);
      moves[i].y((dy / d) * f * 26);
      moves[i].r((dx / d) * f * 22);
    });

    // the whole word pulls away: pivot on the far side, shrink toward it
    const u = Math.max(-1, Math.min(1, (cx - (w.l + w.w / 2)) / (w.w / 2)));
    const v = Math.max(-1, Math.min(1, (cy - (w.t + w.h / 2)) / (w.h / 2)));
    const len = Math.hypot(u, v) || 1;
    const nu = Math.abs(u) / len;
    const nv = Math.abs(v) / len;
    gsap.to(shape, {
      ox: 50 - u * 50,
      oy: 50 - v * 50,
      sx: 1 - 0.32 * e * nu - 0.06 * e,
      sy: 1 - 0.42 * e * nv - 0.06 * e,
      duration: 0.5,
      ease: "power3.out",
      overwrite: true,
      onUpdate: apply,
    });
  };
  window.addEventListener("pointermove", (ev) => {
    if (ev.pointerType !== "mouse" || !base) return;
    px = ev.clientX;
    py = ev.clientY;
    if (!raf) raf = requestAnimationFrame(update);
  });
  window.addEventListener("scroll", () => !raf && !calm && (raf = requestAnimationFrame(update)), { passive: true });
}

/** Blocks pour in as they scroll into view; a row staggers left to right. */
function initLiquid() {
  const els = [...document.querySelectorAll("[data-liquid]")];
  if (reduced()) {
    els.forEach((el) => el.classList.add("is-in", "is-done"));
    return;
  }
  let batch = 0;
  let raf = 0;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        el.style.animationDelay = `${batch++ * 110}ms`;
        el.classList.add("is-in");
        el.addEventListener(
          "animationend",
          (ev) => {
            if (ev.target !== el) return;
            el.classList.add("is-done");
            el.style.animationDelay = "";
          },
          {}
        );
        if (el.classList.contains("dev-intro")) el.classList.add("is-done");
        io.unobserve(el);
      });
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => (batch = 0));
    },
    { rootMargin: "0px 0px -6% 0px" }
  );
  els.forEach((el) => io.observe(el));
}

/** A gooey blob of colour that trails the cursor and swells over work. */
function initBlob() {
  const blob = document.querySelector(".blob");
  if (!blob || !finePointer() || reduced()) return;
  const dots = [...blob.children].map((d, i) => ({
    x: gsap.quickTo(d, "x", { duration: 0.18 + i * 0.14, ease: "power3.out" }),
    y: gsap.quickTo(d, "y", { duration: 0.18 + i * 0.14, ease: "power3.out" }),
  }));
  let hue = 0;
  window.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    blob.classList.add("is-on");
    dots.forEach((d) => {
      d.x(e.clientX);
      d.y(e.clientY);
    });
    const card = e.target.closest?.(".dcard");
    blob.classList.toggle("is-big", !!card);
    if (card) blob.style.setProperty("--blob", card.style.getPropertyValue("--c"));
    else if (e.target.closest?.("a, button")) blob.style.setProperty("--blob", PALETTE[4]);
    else blob.style.setProperty("--blob", PALETTE[hue]);
  });
  // drift through the palette while the cursor is on open canvas
  setInterval(() => (hue = (hue + 1) % PALETTE.length), 1400);
  document.documentElement.addEventListener("pointerleave", () => blob.classList.remove("is-on"));
}

/** Count the featured stats up when they appear. */
function initCounts() {
  document.querySelectorAll("[data-count]").forEach((b) => {
    const to = +b.dataset.count;
    if (reduced()) return;
    const o = { n: 0 };
    b.textContent = "0";
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      gsap.to(o, { n: to, duration: 1.6, delay: 0.5, ease: "power3.out", onUpdate: () => (b.textContent = Math.round(o.n)) });
    });
    io.observe(b);
  });
}

initTheme();
const lenis = initSmoothScroll();
initShyName();
initGlassLight();
initResume();
initLiquid();
initWobble(); // featured glass pane, like the landing page
initWobble(".dcard", { surface: null, tilt: 5 });
initBlob();
initCounts();
initProjectModal({ lenis, variant: "design" });
document.querySelectorAll(".des-tool").forEach((t, i) => t.style.setProperty("--i", i));
