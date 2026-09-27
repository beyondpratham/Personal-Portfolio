import { gsap } from "gsap";

/**
 * Panes behave like slabs of glass: a Dousan-style jelly wobble when the
 * pointer lands, and a slight 3D tilt toward it while it moves across.
 */
export function initWobble() {
  if (window.matchMedia("(hover: none), (prefers-reduced-motion: reduce)").matches) return;

  document.querySelectorAll(".lg--pane").forEach((pane) => {
    const surface = pane.querySelector(":scope > .lg__surface");
    if (!surface) return;
    gsap.set(surface, { transformPerspective: 1400 });
    const rx = gsap.quickTo(surface, "rotationX", { duration: 0.8, ease: "power3" });
    const ry = gsap.quickTo(surface, "rotationY", { duration: 0.8, ease: "power3" });

    pane.addEventListener("pointerenter", () => {
      gsap.fromTo(
        surface,
        { scaleX: 1.022, scaleY: 0.984 },
        { scaleX: 1.008, scaleY: 1.008, duration: 1, ease: "elastic.out(1.2, 0.3)", overwrite: "auto" }
      );
    });
    pane.addEventListener("pointermove", (e) => {
      const r = pane.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 3.2);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 3.2);
    });
    pane.addEventListener("pointerleave", () => {
      gsap.to(surface, { scaleX: 1, scaleY: 1, duration: 0.9, ease: "elastic.out(1, 0.35)", overwrite: "auto" });
      rx(0);
      ry(0);
    });
  });
}
