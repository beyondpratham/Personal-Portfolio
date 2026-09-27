import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const lerp = (a, b, t) => a + (b - a) * t;

/** Entrance after the loader. */
export function playIntro({ hello, taglineWords }) {
  if (reduced()) return;
  const letters = hello.letters.map((l) => l.inner);
  const name = hello.name.map((l) => l.inner);
  const dot = hello.dot.map((l) => l.inner);

  return gsap
    .timeline({ onComplete: () => ScrollTrigger.refresh() })
    .from(
      letters,
      {
        yPercent: 110,
        rotationX: -95,
        opacity: 0,
        filter: "blur(12px)",
        transformOrigin: "50% 100%",
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.035,
        clearProps: "filter",
      },
      0
    )
    .fromTo(
      name,
      { scaleY: 1.35, scaleX: 0.8 },
      { scaleY: 1, scaleX: 1, duration: 1.1, ease: "elastic.out(1.1, 0.3)", stagger: 0.05 },
      0.45
    )
    .from(dot, { y: "-1.4em", duration: 1, ease: "bounce.out" }, 0.85)
    .from(".pp-pane", { opacity: 0, y: 70, scale: 0.94, duration: 1.1, ease: "power3.out" }, 0.35)
    .from("#sphere", { scale: 0.3, opacity: 0, duration: 1.4, ease: "elastic.out(1, 0.55)" }, 0.7)
    .from(".paths", { opacity: 0, x: 70, duration: 1, ease: "power3.out" }, 0.5)
    .from(
      taglineWords,
      {
        opacity: 0,
        y: 50,
        rotation: () => gsap.utils.random(-10, 10),
        duration: 1,
        ease: "back.out(1.8)",
        stagger: 0.12,
      },
      0.75
    )
    .from(".tagline__and", { opacity: 0, letterSpacing: "1.2em", duration: 1 }, 1);
}

/**
 * Scroll: the headline shrinks into a title bar while the photo lifts out of
 * its pane — morphing from its glass rectangle into a small round avatar — and
 * flies up beside it. On arrival it shoves the whole name aside with an elastic
 * bump. Scrolling back up plays it all in reverse.
 */
export function initTitlebar({ lenis, hello }) {
  const h1 = document.getElementById("hello");
  const push = h1?.querySelector(".hello__push");
  const band = document.querySelector(".titlebar");
  const flyer = document.getElementById("dockSphere");
  const zone = document.getElementById("orbitZone");
  const card = document.getElementById("sphere");
  if (!h1 || !push || !flyer || !card) return;

  const small = () => window.innerWidth < 640;
  const dockSize = () => (small() ? 30 : 36);
  const titlePx = () => (small() ? 22 : 30);
  const titleScale = () => titlePx() / parseFloat(getComputedStyle(h1).fontSize);
  const BAND_CENTRE = 38;
  const FLIGHT = 340;

  flyer.addEventListener("click", () =>
    lenis ? lenis.scrollTo(0, { duration: 1.4 }) : window.scrollTo({ top: 0, behavior: "smooth" })
  );

  gsap.to(h1, {
    scale: titleScale,
    ease: "none",
    scrollTrigger: { start: 0, end: 260, scrub: 0.4, invalidateOnRefresh: true },
  });
  gsap.to(band, { autoAlpha: 1, ease: "none", scrollTrigger: { start: 140, end: 260, scrub: true } });

  // dark-mode switch + resume: centred on the big headline, top of the page only —
  // they slip away as you scroll and never ride into the title bar
  const actions = document.getElementById("helloActions");
  if (actions) {
    // phones wrap the actions onto their own line, so only centre them beside the headline when they share a row
    const restY = () => (window.innerWidth <= 640 ? 0 : (h1.offsetHeight - actions.offsetHeight) / 2);
    gsap.set(actions, { y: restY });
    window.addEventListener("resize", () => gsap.set(actions, { y: restY() }));
    gsap.fromTo(
      actions,
      { autoAlpha: 1 },
      { autoAlpha: 0, ease: "none", immediateRender: false, scrollTrigger: { start: 20, end: 150, scrub: 0.3 } }
    );
  }

  // Panes stay put. When the photo floats up to the title bar it stays tethered
  // to its empty frame by a rope, like a balloon.
  const peg = document.getElementById("ppPeg");
  const rope = document.getElementById("rope");
  const ropePath = rope?.querySelector(".rope__line");
  const ropeKnot = rope?.querySelector(".rope__knot");
  const geo = {};
  const docRect = (el) => {
    const r = el.getBoundingClientRect();
    return { left: r.left, top: r.top + window.scrollY, width: r.width, height: r.height };
  };
  function measure() {
    geo.card = docRect(card);
    draw();
  }

  let ropeOn = false;
  function drawRope(time = performance.now() / 1000) {
    if (!rope || !peg) return;
    if (!ropeOn) {
      rope.style.opacity = "0";
      return;
    }
    const a = peg.getBoundingClientRect();
    const b = flyer.getBoundingClientRect();
    const ax = a.left + a.width / 2;
    const ay = a.top + a.height / 2;
    const bx = b.left + b.width / 2;
    const by = b.bottom - 2;
    const dist = Math.hypot(bx - ax, by - ay);
    // a little slack that sways, pulled tauter the further the balloon goes
    const sag = Math.max(10, 46 - dist * 0.04) + Math.sin(time * 1.6) * 6;
    const mx = (ax + bx) / 2 + sag;
    const my = (ay + by) / 2 + Math.cos(time * 1.3) * 4;
    ropePath.setAttribute("d", `M${ax} ${ay} Q${mx} ${my} ${bx} ${by}`);
    ropeKnot.setAttribute("transform", `translate(${bx} ${by})`);
    // fade the rope away as its peg scrolls up under the title bar
    const fade = gsap.utils.clamp(0, 1, (ay - 110) / 140) * gsap.utils.clamp(0, 1, state.p / 0.15);
    rope.style.opacity = String(fade);
  }
  if (rope && !reduced()) gsap.ticker.add((t) => ropeOn && drawRope(t));

  const ease = gsap.parseEase("power2.inOut");
  const state = { p: 0 };
  let flying = false;
  let docked = false;

  function draw() {
    const p = state.p;
    const nowFlying = p > 0.001;
    if (nowFlying !== flying) {
      flying = nowFlying;
      if (flying) window.dispatchEvent(new Event("hero:docking"));
      gsap.set(flyer, { autoAlpha: flying ? 1 : 0 });
      gsap.set(zone, { autoAlpha: flying ? 0 : 1 });
      document.body.classList.toggle("is-docking", flying);
      ropeOn = flying;
    }
    if (!flying || !geo.card) return;

    // start from where the pane's photo sits in the page (its untransformed layout box)
    const sy = window.scrollY;
    const c = { left: geo.card.left, top: geo.card.top - sy, width: geo.card.width, height: geo.card.height };
    const size = dockSize();
    const e = ease(p);
    const w = lerp(c.width, size, e);
    const h = lerp(c.height, size, e);
    const cx = lerp(c.left + c.width / 2, h1.getBoundingClientRect().left + size / 2, e);
    const cy = lerp(c.top + c.height / 2, BAND_CENTRE, e);
    const radius = lerp(22, size / 2, e);
    flyer.style.width = `${w}px`;
    flyer.style.height = `${h}px`;
    flyer.style.borderRadius = `${Math.min(radius, Math.min(w, h) / 2)}px`;
    flyer.style.setProperty("--planet", String(e));
    gsap.set(flyer, { x: cx - w / 2, y: cy - h / 2 });
    drawRope();

    const nowDocked = p > 0.995;
    if (nowDocked !== docked) {
      docked = nowDocked;
      docked ? shove() : unshove();
    }
  }

  // "dhakka": the photo lands and knocks the whole name sideways; it squashes,
  // tips back, and the letters ripple as it springs into place
  function shove() {
    const dx = (dockSize() + 14) / titleScale();
    gsap.to(push, { x: dx, duration: 1.1, ease: "elastic.out(1.05, 0.32)", overwrite: "auto" });
    gsap.fromTo(
      push,
      { rotation: -4, scaleX: 0.86, scaleY: 1.1, transformOrigin: "0% 60%" },
      { rotation: 0, scaleX: 1, scaleY: 1, duration: 1, ease: "elastic.out(1.2, 0.28)" }
    );
    gsap.fromTo(
      hello.letters.map((l) => l.inner),
      { x: "-0.18em" },
      { x: 0, duration: 0.9, ease: "elastic.out(1, 0.3)", stagger: 0.025 }
    );
  }
  function unshove() {
    gsap.to(push, { x: 0, duration: 0.8, ease: "elastic.out(1, 0.45)", overwrite: "auto" });
  }

  ScrollTrigger.create({
    start: 0,
    end: FLIGHT,
    onUpdate: (self) =>
      gsap.to(state, { p: self.progress, duration: 0.35, ease: "power2.out", overwrite: true, onUpdate: draw }),
    onRefresh: measure,
  });
  measure();
  window.addEventListener("scroll", draw, { passive: true });
}

/** Lower panes tilt up into place, footer rises, the city plays its story once. */
export function initScrollScenes(city) {
  const panes = gsap.utils.toArray(".grid-bottom .lg--pane, .about-pane");

  if (reduced()) {
    city?.playIntro();
    return;
  }

  panes.forEach((el) => {
    gsap.fromTo(
      el,
      { rotationX: 22, y: 110, scale: 0.93, opacity: 0, transformOrigin: "50% 0%" },
      {
        rotationX: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 98%", end: "top 68%", scrub: 0.8 },
      }
    );
  });

  gsap.from("[data-reveal-footer]", {
    y: 40,
    opacity: 0,
    duration: 0.9,
    ease: "power3.out",
    scrollTrigger: { trigger: "[data-reveal-footer]", start: "top bottom-=40", once: true },
  });

  if (city) {
    ScrollTrigger.create({ trigger: "#city", start: "top 80%", once: true, onEnter: () => city.playIntro() });
  }
}
