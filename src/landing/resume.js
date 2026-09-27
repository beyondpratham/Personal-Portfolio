import { gsap } from "gsap";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Hovering the Resume button: the page lifts out of the doc icon, splits into
 * a handful of sheets and they're tossed into the air like after the last exam
 * — flipping, drifting and fluttering back down before the icon settles back.
 */
export function initResume() {
  const btn = document.getElementById("resumeBtn");
  const doc = btn?.querySelector(".resume-btn__doc");
  if (!btn || !doc || reduced()) return;

  const layer = document.createElement("div");
  layer.className = "paper-layer";
  document.body.appendChild(layer);

  let busy = false;

  function toss() {
    if (busy) return;
    busy = true;
    const r = doc.getBoundingClientRect();
    const ox = r.left + r.width / 2;
    const oy = r.top + r.height / 2;
    const count = 11;

    const tl = gsap.timeline({ onComplete: () => (busy = false) });

    // the icon's page peels up and pops off
    tl.to(doc, { y: -10, rotation: -14, scale: 1.25, duration: 0.18, ease: "power2.out" })
      .to(doc, { scale: 0, opacity: 0, duration: 0.12, ease: "power2.in" });

    const launch = 0.26;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      p.className = "paper";
      layer.appendChild(p);

      const angle = (-90 + gsap.utils.random(-75, 75)) * (Math.PI / 180);
      const power = gsap.utils.random(140, 260);
      const peakX = Math.cos(angle) * power;
      // the button lives near the top of the screen: keep the arc's peak in view
      const peakY = Math.max(Math.sin(angle) * power, -(oy - 24));
      const drift = gsap.utils.random(-70, 70);
      const fall = gsap.utils.random(140, 280);
      const up = gsap.utils.random(0.45, 0.65);
      const down = gsap.utils.random(1.1, 1.6);
      const spin = gsap.utils.random(-360, 360);

      gsap.set(p, { x: ox, y: oy, scale: 0.3, rotation: gsap.utils.random(-20, 20), opacity: 1 });
      const at = launch + i * 0.018;

      // up and out
      tl.to(p, { x: ox + peakX, y: oy + peakY, scale: gsap.utils.random(0.85, 1.25), duration: up, ease: "power3.out" }, at)
        .to(p, { rotation: `+=${spin}`, rotationX: gsap.utils.random(-180, 180), rotationY: gsap.utils.random(-180, 180), duration: up + down, ease: "power1.out" }, at)
        // then flutter down: slow fall with side-to-side sway
        .to(p, { y: oy + peakY + fall, duration: down, ease: "sine.in" }, at + up)
        .to(p, { x: ox + peakX + drift, duration: down, ease: "sine.inOut" }, at + up)
        .to(p, { rotationZ: `+=${gsap.utils.random(-40, 40)}`, duration: down / 3, ease: "sine.inOut", yoyo: true, repeat: 2 }, at + up)
        .to(p, { opacity: 0, duration: 0.35, onComplete: () => p.remove() }, at + up + down - 0.35);
    }

    // a fresh page slides back into the icon
    tl.fromTo(doc, { y: 8, scale: 0.6, rotation: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.6, ease: "back.out(2.2)" }, 1.05);
  }

  btn.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "mouse") toss();
  });
  btn.addEventListener("focus", (e) => {
    if (e.target.matches(":focus-visible")) toss();
  });
}
