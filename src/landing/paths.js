import { gsap } from "gsap";

/**
 * Developer / Designer pane: two links. Hovering one slides a glass highlight
 * under it and plays that side's scene across the pane (strongest on the other half).
 */
export function initPaths() {
  const pane = document.querySelector(".paths");
  if (!pane) return;
  const thumb = pane.querySelector(".paths__thumb");
  const opts = [...pane.querySelectorAll(".paths__opt")];
  const scenes = {
    developer: pane.querySelector(".paths__bg-layer--developer"),
    design: pane.querySelector(".paths__bg-layer--design"),
  };
  // only the visible scene runs; the hidden one sits paused
  const play = (key) =>
    Object.entries(scenes).forEach(([k, layer]) => {
      const on = k === key;
      layer?.querySelectorAll("svg").forEach((svg) => (on ? svg.unpauseAnimations() : svg.pauseAnimations()));
      layer?.style.setProperty("--run", on ? "running" : "paused");
    });
  play(null);

  function activate(opt) {
    pane.dataset.active = opt.dataset.path;
    play(opt.dataset.path);
    gsap.to(thumb, {
      x: opt.offsetLeft,
      width: opt.offsetWidth,
      opacity: 1,
      duration: 0.5,
      ease: "back.out(1.4)",
    });
  }

  function deactivate() {
    delete pane.dataset.active;
    setTimeout(() => !pane.dataset.active && play(null), 600);
    gsap.to(thumb, { opacity: 0, duration: 0.3 });
  }

  opts.forEach((opt) => {
    opt.addEventListener("pointerenter", () => activate(opt));
    opt.addEventListener("focus", () => activate(opt));
  });
  pane.addEventListener("pointerleave", deactivate);
  pane.addEventListener("focusout", (e) => {
    if (!pane.contains(e.relatedTarget)) deactivate();
  });
}
