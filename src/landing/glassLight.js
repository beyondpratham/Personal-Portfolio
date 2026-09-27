import { gsap } from "gsap";

// light from straight above at rest, so every rim is symmetric and reads level
const REST_ANGLE = "0deg";

/**
 * Each glass element reflects the cursor only while the cursor is over it:
 * the rim's bright edge turns toward the pointer, a hotspot sits under it and
 * a diagonal band slides across as it moves. Everything else stays at rest.
 */
export function initGlassLight() {
  const glass = [...document.querySelectorAll(".lg")];
  const lit = new Set();
  const pointer = { x: 0, y: 0 };
  let queued = false;

  function paint() {
    queued = false;
    for (const el of lit) {
      // measure the visible glass surface (a pane's surface can grow beyond its box)
      const face = el.querySelector(":scope > .lg__surface") ?? el;
      const r = face.getBoundingClientRect();
      const px = ((pointer.x - r.left) / r.width) * 100;
      const py = ((pointer.y - r.top) / r.height) * 100;
      const angle =
        (Math.atan2(pointer.x - (r.left + r.width / 2), -(pointer.y - (r.top + r.height / 2))) * 180) / Math.PI;
      el.style.setProperty("--lg-x", `${px}%`);
      el.style.setProperty("--lg-y", `${py}%`);
      el.style.setProperty("--lg-band", `${px * 0.8 + py * 0.2}%`);
      el.style.setProperty("--lg-angle", `${angle}deg`);
    }
  }
  const queue = () => {
    if (!queued && lit.size) {
      queued = true;
      requestAnimationFrame(paint);
    }
  };

  glass.forEach((el) => {
    el.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "mouse") return;
      gsap.killTweensOf(el, "--lg-angle");
      lit.add(el);
      el.classList.add("is-lit");
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      queue();
    });
    el.addEventListener("pointerleave", () => {
      lit.delete(el);
      el.classList.remove("is-lit");
      gsap.to(el, { "--lg-angle": REST_ANGLE, duration: 0.8, ease: "power3.out" });
    });
  });

  window.addEventListener("pointermove", (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    queue();
  });
  window.addEventListener("scroll", queue, { passive: true });

  initPaneGlow();
}

/** Dousan-style glow that trails the cursor inside a glass pill. */
function initPaneGlow() {
  document.querySelectorAll(".pane-glow").forEach((glow) => {
    const host = glow.closest(".lg");
    const pos = { x: 0, y: 0 };
    const set = () => {
      glow.style.setProperty("--gx", `${pos.x}px`);
      glow.style.setProperty("--gy", `${pos.y}px`);
    };
    const toX = gsap.quickTo(pos, "x", { duration: 0.9, ease: "power3", onUpdate: set });
    const toY = gsap.quickTo(pos, "y", { duration: 0.9, ease: "power3", onUpdate: set });
    host.addEventListener("pointerenter", (e) => {
      const r = host.getBoundingClientRect();
      pos.x = e.clientX - r.left;
      pos.y = e.clientY - r.top;
      set();
    });
    host.addEventListener("pointermove", (e) => {
      const r = host.getBoundingClientRect();
      toX(e.clientX - r.left);
      toY(e.clientY - r.top);
    });
  });
}

