import { gsap } from "gsap";
import "./projectModal.css";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Project details popup shared by the developer and designer pages.
 * The panel flies out of the card with transforms only (cheap, 60fps), lands
 * slightly squashed and jiggles back into shape like a drop of liquid glass.
 */
export function initProjectModal({ lenis = null, variant = "dev" } = {}) {
  const cards = [...document.querySelectorAll(".proj[data-more]")];
  if (!cards.length) return;

  const pm = document.createElement("div");
  pm.className = `pm pm--${variant}`;
  pm.hidden = true;
  pm.innerHTML = `
    <div class="pm__veil" data-pm-close></div>
    <div class="pm__panel" role="dialog" aria-modal="true" aria-labelledby="pmTitle" data-lenis-prevent>
      <div class="pm__media"><img class="pm__poster" alt="" /><video class="pm__video" muted loop playsinline></video></div>
      <div class="pm__body">
        <span class="pm__chip"></span>
        <h2 id="pmTitle"></h2>
        <p class="pm__lead"></p>
        <ul class="pm__points"></ul>
        <div class="pm__foot"></div>
      </div>
      <button class="lg lg--circle pm__close" type="button" data-pm-close aria-label="Close">
        <span class="lg__surface"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg></span>
      </button>
    </div>`;
  document.body.append(pm);

  const $ = (s) => pm.querySelector(s);
  const veil = $(".pm__veil");
  const panel = $(".pm__panel");
  const media = $(".pm__media");
  const poster = $(".pm__poster");
  const video = $(".pm__video");
  const body = $(".pm__body");
  const closeBtn = $(".pm__close");
  let source = null;
  let busy = false;

  video.addEventListener("playing", () => media.classList.add("has-frame"));

  const fill = (card) => {
    const more = card.querySelector("template.proj__more")?.content;
    $(".pm__chip").textContent = card.querySelector(".proj__chip")?.textContent.trim() || "";
    $("#pmTitle").textContent = card.querySelector("h3").textContent;
    $(".pm__lead").textContent = more?.querySelector("p")?.textContent || card.querySelector(".proj__text p").textContent;
    const points = $(".pm__points");
    points.innerHTML = "";
    more?.querySelectorAll("li").forEach((li) => points.append(li.cloneNode(true)));
    points.hidden = !points.children.length;
    const foot = $(".pm__foot");
    foot.innerHTML = "";
    const tags = card.querySelector(".proj__tags");
    if (tags) foot.append(tags.cloneNode(true));
    const links = document.createElement("span");
    links.className = "pm__links";
    const extra = more?.querySelectorAll("a") || [];
    [...card.querySelectorAll(".proj__links a"), ...extra].forEach((a) => links.append(a.cloneNode(true)));
    if (links.children.length) foot.append(links);
    pm.style.setProperty("--c", card.style.getPropertyValue("--c") || "");
    poster.src = card.querySelector(".demo__poster")?.src || "";
    media.classList.remove("has-frame");
    const v = card.querySelector(".demo__video");
    video.hidden = !v;
    if (v) {
      video.src = v.getAttribute("src");
      try {
        video.currentTime = v.currentTime || 0;
      } catch {}
      video.play().catch(() => {});
    } else video.removeAttribute("src");
  };

  // transform that lays the (centre-origin) panel exactly over rect `r`
  const over = (r) => {
    const p = panel.getBoundingClientRect();
    return {
      x: r.left + r.width / 2 - (p.left + p.width / 2),
      y: r.top + r.height / 2 - (p.top + p.height / 2),
      scaleX: r.width / p.width,
      scaleY: r.height / p.height,
    };
  };
  const bits = () => [media, ...body.children];

  const open = (card) => {
    if (busy) return;
    busy = true;
    source = card;
    fill(card);
    pm.hidden = false;
    document.documentElement.classList.add("pm-open");
    lenis?.stop();
    panel.scrollTop = 0;
    closeBtn.focus({ preventScroll: true });

    if (reduced()) {
      busy = false;
      return;
    }
    const from = over(card.getBoundingClientRect());
    card.classList.add("is-lifted");
    gsap.set(bits(), { opacity: 0, y: 18 });
    gsap.set(closeBtn, { opacity: 0, scale: 0.3 });
    gsap
      .timeline({ onComplete: () => (busy = false) })
      .fromTo(veil, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: "power1.out" }, 0)
      // fly out of the card and land a little squashed…
      .fromTo(
        panel,
        { ...from, opacity: 0.6 },
        { x: 0, y: 0, scaleX: 1.04, scaleY: 0.965, opacity: 1, duration: 0.34, ease: "power3.out" },
        0
      )
      // …then the glass jiggles itself back into shape
      .to(panel, { scaleX: 1, duration: 0.9, ease: "elastic.out(1, 0.32)" }, 0.34)
      .to(panel, { scaleY: 1, duration: 0.95, ease: "elastic.out(1.1, 0.28)" }, 0.36)
      .to(bits(), { opacity: 1, y: 0, duration: 0.5, stagger: 0.035, ease: "back.out(1.6)" }, 0.16)
      .to(closeBtn, { opacity: 1, scale: 1, duration: 0.55, ease: "elastic.out(1.2, 0.4)" }, 0.3);
  };

  const close = () => {
    if (pm.hidden) return;
    gsap.killTweensOf([panel, veil, closeBtn, ...bits()]);
    busy = true;
    const card = source;
    const done = () => {
      pm.hidden = true;
      video.pause();
      video.removeAttribute("src");
      video.load();
      gsap.set([panel, veil, closeBtn, ...bits()], { clearProps: "all" });
      card?.classList.remove("is-lifted");
      document.documentElement.classList.remove("pm-open");
      lenis?.start();
      card?.querySelector(".proj__hit")?.focus({ preventScroll: true });
      // the card catches its surface back with a little bounce
      if (card && !reduced())
        gsap.fromTo(
          card,
          { scaleX: 1.03, scaleY: 0.97 },
          { scaleX: 1, scaleY: 1, duration: 0.8, ease: "elastic.out(1.1, 0.35)", overwrite: "auto" }
        );
      busy = false;
    };
    if (reduced() || !card) return done();
    const to = over(card.getBoundingClientRect());
    gsap
      .timeline({ onComplete: done })
      .to([closeBtn, ...bits()], { opacity: 0, duration: 0.12, ease: "power1.in" }, 0)
      .to(panel, { scaleX: 0.97, scaleY: 1.03, duration: 0.1, ease: "power1.out" }, 0)
      .to(panel, { ...to, opacity: 0.7, duration: 0.3, ease: "power3.in" }, 0.1)
      .to(veil, { opacity: 0, duration: 0.25, ease: "power1.in" }, 0.15);
  };

  cards.forEach((card) => card.querySelector(".proj__hit")?.addEventListener("click", () => open(card)));
  pm.querySelectorAll("[data-pm-close]").forEach((el) => el.addEventListener("click", close));
  window.addEventListener("keydown", (e) => {
    if (pm.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "Tab") {
      // keep focus inside the dialog
      const f = [...panel.querySelectorAll("a, button")];
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) (e.preventDefault(), f.at(-1).focus());
      else if (!e.shiftKey && i === f.length - 1) (e.preventDefault(), f[0].focus());
    }
  });
}

/** Hover-to-play reels. The poster is a real <img>; the video only shows once it has a frame. */
export function initReels(selector = ".proj") {
  document.querySelectorAll(selector).forEach((card) => {
    const v = card.querySelector(".demo__video");
    if (!v) return;
    v.addEventListener("playing", () => card.classList.add("has-frame"));
    const play = () => {
      card.classList.add("is-playing");
      v.play().catch(() => {});
    };
    const stop = () => {
      card.classList.remove("is-playing", "has-frame");
      v.pause();
      try {
        v.currentTime = 0;
      } catch {}
    };
    card.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && play());
    card.addEventListener("pointerleave", (e) => e.pointerType === "mouse" && stop());
    card.addEventListener("focusin", play);
    card.addEventListener("focusout", (e) => !card.contains(e.relatedTarget) && stop());
  });
}
