import { gsap } from "gsap";

const isCoarsePointer = () =>
  window.matchMedia("(hover: none), (pointer: coarse)").matches;

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Wires up two liquid-glass behaviours on every [data-glass] element:
 * 1. A specular highlight that tracks the pointer (via --mx/--my).
 * 2. A subtle 3D tilt toward the pointer (perspective rotateX/rotateY).
 */
export function initGlass(root = document) {
  const els = root.querySelectorAll("[data-glass]");
  if (!els.length) return;

  const reduced = prefersReducedMotion();
  const coarse = isCoarsePointer();

  els.forEach((el) => {
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "35%");

    if (coarse || reduced) return;

    const tiltStrength = Number(el.dataset.tilt || 6);
    const rotateX = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3" });
    const rotateY = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3" });

    el.style.transformPerspective = "900px";

    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;

      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);

      if (el.dataset.tilt !== "0") {
        rotateY((px - 0.5) * tiltStrength);
        rotateX(-(py - 0.5) * tiltStrength);
      }
    });

    el.addEventListener("mouseleave", () => {
      rotateX(0);
      rotateY(0);
    });
  });
}
