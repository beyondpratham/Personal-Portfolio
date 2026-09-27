import { gsap } from "gsap";

/**
 * A faint blurred light that follows the cursor over the page background.
 * It fades out whenever the cursor is over a pane, so it never lights the glass.
 */
export function initSpotlight() {
  const spot = document.querySelector(".spotlight");
  if (!spot || window.matchMedia("(hover: none)").matches) return;

  const x = gsap.quickTo(spot, "x", { duration: 0.6, ease: "power3" });
  const y = gsap.quickTo(spot, "y", { duration: 0.6, ease: "power3" });

  window.addEventListener("pointermove", (e) => {
    x(e.clientX);
    y(e.clientY);
    spot.classList.toggle("is-on", !e.target.closest?.(".lg"));
  });
  document.documentElement.addEventListener("pointerleave", () => spot.classList.remove("is-on"));
}
