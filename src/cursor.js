import { gsap } from "gsap";

export function initCursor() {
  const isCoarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const dot = document.querySelector(".cursor__dot");
  const ring = document.querySelector(".cursor__ring");

  if (isCoarse || !dot || !ring) {
    document.querySelector(".cursor")?.remove();
    return;
  }

  gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

  const cursor = document.querySelector(".cursor");
  const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3" });
  const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3" });
  const ringX = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3" });
  const ringY = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3" });

  window.addEventListener(
    "mousemove",
    () => cursor.classList.add("is-visible"),
    { once: true }
  );

  window.addEventListener("mousemove", (e) => {
    dotX(e.clientX);
    dotY(e.clientY);
    ringX(e.clientX);
    ringY(e.clientY);
  });

  document.addEventListener("mouseover", (e) => {
    if (e.target.closest("a, button, [data-magnetic], [data-tilt]")) {
      ring.classList.add("is-active");
    }
  });

  document.addEventListener("mouseout", (e) => {
    if (e.target.closest("a, button, [data-magnetic], [data-tilt]")) {
      ring.classList.remove("is-active");
    }
  });
}
