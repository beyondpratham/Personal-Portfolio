import { gsap } from "gsap";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The photo rests as a glass-framed rectangle that fills its pane. Hover (or
 * tap) it and it melts into a round planet while my tech stack blooms around
 * it as one tightly packed band, Apple Watch style: larger icons sit on the
 * inner edge and smaller ones nestle slightly further out between them, so the
 * band reads as one connected ring. It revolves steadily as a single piece and
 * slows while you point at an icon. The icons are not links.
 */
export function initOrbit() {
  const zone = document.getElementById("orbitZone");
  const stage = document.getElementById("ppStage");
  const card = document.getElementById("sphere");
  const items = [...(zone?.querySelectorAll(".orbit li") ?? [])];
  if (!zone || !stage || !card || !items.length) return;

  const SPEED = 0.12; // deg / frame
  const state = { r: 0, rot: -90, speed: SPEED };
  const pops = items.map(() => ({ v: 0 }));
  let open = false;
  let slowOnIcon = false;

  // design units (scaled to the pane): planet 200, then a gap, then the band —
  // big icons (56) on the inner track, small ones (40) on the outer track, alternating
  const U = { planet: 200, gap: 24, big: 56, small: 40, lift: 26 };
  const geom = () => {
    const half = Math.min(stage.clientWidth, stage.clientHeight) / 2;
    const outer = U.planet / 2 + U.gap + U.big / 2 + U.lift + U.small / 2;
    const k = Math.min(1.1, (half - 6) / outer);
    const rBig = (U.planet / 2 + U.gap + U.big / 2) * k;
    return { k, planet: U.planet * k, rBig, rSmall: rBig + U.lift * k };
  };
  const planetSize = () => geom().planet;
  const sizeOf = (i) => (i % 2 === 0 ? U.big : U.small);

  function layoutSizes() {
    const { k } = geom();
    items.forEach((li, i) => li.style.setProperty("--icon", `${Math.round(sizeOf(i) * k)}px`));
  }
  layoutSizes();

  const rectState = () => ({
    width: stage.clientWidth,
    height: stage.clientHeight,
    borderRadius: 22,
    "--planet": 0,
  });
  const planetState = () => {
    const d = planetSize();
    return { width: d, height: d, borderRadius: d / 2, "--planet": 1 };
  };

  gsap.set(card, { xPercent: -50, yPercent: -50, ...rectState() });
  gsap.set(items, { x: 0, y: 0, scale: 0, opacity: 0 });
  new ResizeObserver(() => {
    layoutSizes();
    gsap.set(card, open ? planetState() : rectState());
  }).observe(stage);

  function render() {
    const { rBig, rSmall } = geom();
    const step = 360 / items.length;
    items.forEach((li, i) => {
      const r = (i % 2 === 0 ? rBig : rSmall) * state.r;
      const a = ((state.rot + i * step) * Math.PI) / 180;
      const pop = pops[i].v;
      gsap.set(li, { x: Math.cos(a) * r, y: Math.sin(a) * r, scale: pop, opacity: Math.min(1, pop * 1.6) });
    });
  }

  gsap.ticker.add((_, dt) => {
    if (state.r < 0.002) return;
    if (!reduced()) {
      const target = slowOnIcon ? 0.015 : SPEED;
      state.speed += (target - state.speed) * 0.06;
      state.rot += state.speed * (dt / 16.67);
    }
    render();
  });

  function show() {
    if (open || document.body.classList.contains("is-docking")) return;
    open = true;
    zone.classList.add("is-open");
    card.classList.add("is-planet");
    card.setAttribute("aria-expanded", "true");
    gsap.to(card, { ...planetState(), duration: reduced() ? 0 : 0.9, ease: "expo.inOut", overwrite: "auto" });
    gsap.to(state, { r: 1, delay: 0.25, duration: 1.2, ease: "elastic.out(1, 0.6)", overwrite: true });
    gsap.to(pops, { v: 1, delay: 0.25, duration: 0.7, ease: "back.out(2.4)", stagger: { each: 0.03, from: "start" }, overwrite: true });
  }

  function hide(immediate = false) {
    if (!open) return;
    open = false;
    zone.classList.remove("is-open");
    card.classList.remove("is-planet");
    card.setAttribute("aria-expanded", "false");
    const d = immediate ? 0 : 1;
    gsap.to(state, { r: 0, duration: 0.45 * d, ease: "power3.in", overwrite: true });
    gsap.to(pops, { v: 0, duration: 0.35 * d, ease: "power2.in", stagger: { each: 0.012, from: "end" }, overwrite: true });
    gsap.to(card, { ...rectState(), delay: 0.2 * d, duration: 0.9 * d, ease: "expo.inOut", overwrite: "auto" });
  }

  card.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "mouse") show();
  });
  zone.addEventListener("pointerleave", (e) => {
    if (e.pointerType === "mouse") hide();
  });

  let lastPointer = "";
  card.addEventListener("pointerdown", (e) => (lastPointer = e.pointerType));
  card.addEventListener("click", () => {
    if (lastPointer === "mouse") return (lastPointer = "");
    open ? hide() : show();
  });
  zone.addEventListener("focusin", (e) => {
    if (e.target.matches(":focus-visible")) show();
  });
  zone.addEventListener("focusout", (e) => {
    if (!zone.contains(e.relatedTarget)) hide();
  });
  window.addEventListener("hero:docking", () => hide(true));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hide();
  });
  document.addEventListener("pointerdown", (e) => {
    if (open && !zone.contains(e.target)) hide();
  });

  items.forEach((li) => {
    li.addEventListener("pointerenter", () => {
      slowOnIcon = true;
      gsap.to(li.firstElementChild, { scale: 1.18, duration: 0.5, ease: "elastic.out(1, 0.4)" });
    });
    li.addEventListener("pointerleave", () => {
      slowOnIcon = false;
      gsap.to(li.firstElementChild, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.4)" });
    });
  });

  initCardGlass(card);
}

/** A gentle 3D tilt toward the cursor. */
function initCardGlass(card) {
  if (window.matchMedia("(hover: none)").matches || reduced()) return;
  const rx = gsap.quickTo(card, "rotationX", { duration: 0.7, ease: "power3" });
  const ry = gsap.quickTo(card, "rotationY", { duration: 0.7, ease: "power3" });
  gsap.set(card, { transformPerspective: 900 });

  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry((px - 0.5) * 10);
    rx(-(py - 0.5) * 10);
  });
  card.addEventListener("pointerleave", () => {
    rx(0);
    ry(0);
  });
}
