import { gsap } from "gsap";

/**
 * Panes behave like slabs of glass: a Dousan-style jelly wobble when the
 * pointer lands, and a slight 3D tilt toward it while it moves across.
 */
export function initWobble(selector = ".lg--pane", { surface = ":scope > .lg__surface", tilt = 3.2 } = {}) {
  if (window.matchMedia("(hover: none), (prefers-reduced-motion: reduce)").matches) return;

  document.querySelectorAll(selector).forEach((pane) => {
    const target = surface ? pane.querySelector(surface) : pane;
    if (!target) return;
    // set lazily so an untouched element keeps its CSS transforms (entrance animations)
    let ready = false;
    let rx = () => {};
    let ry = () => {};

    pane.addEventListener("pointerenter", () => {
      if (!ready) {
        ready = true;
        gsap.set(target, { transformPerspective: 1400 });
        rx = gsap.quickTo(target, "rotationX", { duration: 0.8, ease: "power3" });
        ry = gsap.quickTo(target, "rotationY", { duration: 0.8, ease: "power3" });
      }
      gsap.fromTo(
        target,
        { scaleX: 1.022, scaleY: 0.984 },
        { scaleX: 1.008, scaleY: 1.008, duration: 1, ease: "elastic.out(1.2, 0.3)", overwrite: "auto" }
      );
    });
    pane.addEventListener("pointermove", (e) => {
      const r = pane.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * tilt);
      rx(-((e.clientY - r.top) / r.height - 0.5) * tilt);
    });
    pane.addEventListener("pointerleave", () => {
      gsap.to(target, { scaleX: 1, scaleY: 1, duration: 0.9, ease: "elastic.out(1, 0.35)", overwrite: "auto" });
      rx(0);
      ry(0);
    });
  });
}
