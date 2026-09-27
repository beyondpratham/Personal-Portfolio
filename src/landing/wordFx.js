import { gsap } from "gsap";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** Replace an element's text with one span per character: <span.cls><span.cls__i>c</span></span>. */
export function splitChars(el, cls) {
  const text = el.textContent;
  el.textContent = "";
  const letters = [];
  for (const char of text) {
    const outer = document.createElement("span");
    outer.className = cls;
    const inner = document.createElement("span");
    inner.className = `${cls}__i`;
    inner.textContent = char;
    outer.appendChild(inner);
    el.appendChild(outer);
    letters.push({ outer, inner, char });
  }
  return letters;
}

/** Treat a set of letters as one hover target, bridging the gaps between them. */
function hoverGroup(letters, { enter, move, leave }) {
  let active = false;
  let timer;
  letters.forEach((l, i) => {
    l.outer.addEventListener("pointerenter", () => {
      clearTimeout(timer);
      if (!active) {
        active = true;
        enter?.(i);
      }
      move?.(i);
    });
    l.outer.addEventListener("pointerleave", () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        active = false;
        leave?.();
      }, 140);
    });
  });
}

/* ---- bubbly, jelly pop (headline) ---- */
export function initBubbly(letters) {
  const inners = letters.map((l) => l.inner).filter((el) => el.textContent.trim());
  hoverGroup(letters, {
    move(i) {
      inners.forEach((el, j) => {
        const d = Math.abs(j - i);
        const s = j === i ? 1.4 : Math.max(1.08, 1.26 - d * 0.04);
        if (j === i && !reduced()) gsap.set(el, { scaleX: 1.7, scaleY: 1.02 });
        gsap.to(el, {
          scaleX: s,
          scaleY: s,
          y: j === i ? "-0.12em" : "-0.05em",
          duration: 1,
          delay: d * 0.022,
          ease: "elastic.out(1.15, 0.3)",
          overwrite: "auto",
        });
      });
    },
    leave() {
      gsap.to(inners, {
        scaleX: 1,
        scaleY: 1,
        y: 0,
        duration: 1.1,
        ease: "elastic.out(1, 0.35)",
        stagger: { each: 0.015, from: "center" },
        overwrite: "auto",
      });
    },
  });
}

/* ---- designing: pink light wherever the cursor is ---- */
function initDesigning(letters) {
  let queued = false;
  let pointer = { x: -9999, y: -9999 };
  let lit = false;

  function paint() {
    queued = false;
    let any = false;
    letters.forEach(({ inner }) => {
      const r = inner.getBoundingClientRect();
      const d = Math.hypot(pointer.x - (r.left + r.width / 2), pointer.y - (r.top + r.height / 2));
      const g = Math.max(0, 1 - d / 90);
      if (g > 0) any = true;
      inner.style.setProperty("--g", g.toFixed(3));
      gsap.to(inner, { scale: 1 + g * 0.18, y: -g * 4, duration: 0.25, overwrite: "auto" });
    });
    lit = any;
  }

  window.addEventListener("pointermove", (e) => {
    pointer = { x: e.clientX, y: e.clientY };
    const r = letters[0].inner.getBoundingClientRect();
    const near = Math.abs(e.clientY - (r.top + r.height / 2)) < 160;
    if ((near || lit) && !queued) {
      queued = true;
      requestAnimationFrame(paint);
    }
  });
}

/* ---- developing: hacker-movie scramble ---- */
const GLYPHS = "01<>/\\{}[]#$%&*+=?;:_|~^@";
const FONTS = [
  '"VT323", monospace',
  '"Space Mono", monospace',
  '"Courier New", monospace',
  '"Playfair Display", serif',
  "Impact, sans-serif",
  "Georgia, serif",
];

function initDeveloping(word, letters) {
  let timers = [];
  let glitch;

  const scrambleOne = (l) => {
    l.inner.textContent = pick(GLYPHS);
    l.inner.style.fontFamily = pick(FONTS);
    l.inner.style.fontSize = `${0.6 + Math.random() * 0.75}em`;
    gsap.set(l.inner, { y: gsap.utils.random(-6, 6), rotation: gsap.utils.random(-14, 14) });
  };
  const restore = (l) => {
    l.inner.textContent = l.char;
    l.inner.style.fontFamily = "";
    l.inner.style.fontSize = "";
    gsap.to(l.inner, { y: 0, rotation: 0, duration: 0.25 });
  };
  const clearAll = () => {
    timers.forEach((t) => (clearInterval(t), clearTimeout(t)));
    timers = [];
    clearInterval(glitch);
  };

  word.addEventListener("pointerenter", () => {
    clearAll();
    word.classList.add("is-hacking");
    if (reduced()) return;
    // lock each cell's width so swapping glyphs/fonts doesn't shove the line around
    letters.forEach((l) => (l.outer.style.width = `${l.outer.offsetWidth}px`));
    letters.forEach((l, i) => {
      const iv = setInterval(() => scrambleOne(l), 45);
      timers.push(iv);
      timers.push(setTimeout(() => (clearInterval(iv), restore(l)), 380 + i * 75));
    });
    timers.push(
      setTimeout(() => {
        glitch = setInterval(() => {
          const l = pick(letters);
          scrambleOne(l);
          setTimeout(() => restore(l), 90);
        }, 260);
      }, 380 + letters.length * 75)
    );
  });
  word.addEventListener("pointerleave", () => {
    clearAll();
    letters.forEach((l) => {
      restore(l);
      l.outer.style.width = "";
    });
    word.classList.remove("is-hacking");
  });
}

/* ---- impacts: grows and a light sweeps across ---- */
function initImpacts(word, letters, container) {
  const inners = letters.map((l) => l.inner);
  let shine;
  word.addEventListener("pointerenter", () => {
    word.classList.add("is-lit");
    gsap.to(inners, { scale: 1.22, y: -4, duration: 0.8, ease: "elastic.out(1, 0.45)", stagger: 0.035, overwrite: "auto" });
    if (reduced()) return;
    shine = gsap.fromTo(
      inners,
      { "--shine": "100%" },
      { "--shine": "0%", duration: 0.8, ease: "power2.inOut", stagger: 0.07, repeat: -1, repeatDelay: 0.5 }
    );
    burst(container, inners[Math.floor(inners.length / 2)], ["✦", "✧", "✦"], ["#2dd4bf", "#99f6e4", "#ffffff"], 8);
  });
  word.addEventListener("pointerleave", () => {
    shine?.kill();
    gsap.set(inners, { "--shine": "100%" });
    word.classList.remove("is-lit");
    gsap.to(inners, { scale: 1, y: 0, duration: 0.6, ease: "power3.out", overwrite: "auto" });
  });
}

/* ---- experiences: a happy wave with little hearts and stars ---- */
function initExperiences(word, letters, container) {
  const inners = letters.map((l) => l.inner);
  let wave;
  let emitter;
  word.addEventListener("pointerenter", () => {
    word.classList.add("is-joy");
    if (reduced()) return;
    wave = gsap.timeline({ repeat: -1 }).to(inners, {
      y: -12,
      rotation: (i) => (i % 2 ? 8 : -8),
      scale: 1.12,
      duration: 0.32,
      ease: "sine.out",
      yoyo: true,
      repeat: 1,
      stagger: 0.05,
    });
    emitter = setInterval(
      () => burst(container, pick(inners), ["♥", "✦", "★", "✿"], ["#ff5e9a", "#6fa6e6", "#ff9ec6", "#3f74b8"], 1),
      130
    );
  });
  word.addEventListener("pointerleave", () => {
    wave?.kill();
    clearInterval(emitter);
    word.classList.remove("is-joy");
    gsap.to(inners, { y: 0, rotation: 0, scale: 1, duration: 0.5, ease: "back.out(2)", overwrite: "auto" });
  });
}

/** Float small glyphs up out of a letter, positioned inside `container`. */
function burst(container, fromEl, glyphs, colors, count) {
  const c = container.getBoundingClientRect();
  const r = fromEl.getBoundingClientRect();
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.className = "sparkle";
    s.textContent = pick(glyphs);
    s.style.color = pick(colors);
    s.style.left = `${r.left + r.width / 2 - c.left}px`;
    s.style.top = `${r.top - c.top}px`;
    container.appendChild(s);
    gsap.fromTo(
      s,
      { xPercent: -50, x: 0, y: 0, scale: 0, opacity: 1, rotation: 0 },
      {
        x: gsap.utils.random(-40, 40),
        y: gsap.utils.random(-90, -45),
        scale: gsap.utils.random(0.9, 1.5),
        rotation: gsap.utils.random(-60, 60),
        opacity: 0,
        duration: gsap.utils.random(0.9, 1.4),
        ease: "power2.out",
        onComplete: () => s.remove(),
      }
    );
  }
}

/**
 * Size each tagline line to the column — a poster-style lockup — leaving
 * headroom so words can grow on hover without spilling off the page.
 */
function fitLines(tagline) {
  const lines = [...tagline.querySelectorAll(".tagline__line")];
  const fit = () => {
    const cs = getComputedStyle(tagline);
    const inner = tagline.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const width = inner * 0.96;
    lines.forEach((line) => {
      line.style.fontSize = "100px";
      // right-aligned overflow isn't counted by scrollWidth, so measure the line at its natural width
      line.style.width = "max-content";
      const natural = line.offsetWidth;
      line.style.width = "";
      const size = (100 * width) / natural;
      line.style.fontSize = `${Math.max(28, Math.min(120, size))}px`;
    });
  };
  fit();
  let lastWidth = tagline.clientWidth;
  new ResizeObserver(() => {
    const w = tagline.clientWidth;
    if (w === lastWidth || tagline.querySelector(".is-hacking")) return;
    lastWidth = w;
    fit();
  }).observe(tagline);
}

export async function initTagline() {
  const tagline = document.getElementById("tagline");
  if (!tagline) return null;
  await Promise.all(
    ['700 italic 40px "Playfair Display"', '600 40px "Fredoka"', '700 40px "JetBrains Mono"', '40px "Anton"'].map((f) =>
      document.fonts.load(f).catch(() => {})
    )
  );

  const words = {};
  tagline.querySelectorAll(".tw").forEach((w) => {
    words[w.dataset.word] = { el: w, letters: splitChars(w, "tc") };
  });
  fitLines(tagline);

  initDesigning(words.designing.letters);
  initDeveloping(words.developing.el, words.developing.letters);
  initImpacts(words.impacts.el, words.impacts.letters, tagline);
  initExperiences(words.experiences.el, words.experiences.letters, tagline);

  return Object.values(words).map((w) => w.el);
}

/**
 * "Pratham" swells toward the cursor: letters near the pointer go heavy, the
 * rest thin out, so a weight wave rolls through the word as you move.
 */
function initNameMorph(letters) {
  const cells = letters.map((l) => l.outer);
  let active = false;
  let queued = false;
  let pointer = { x: 0, y: 0 };

  function paint() {
    queued = false;
    const first = cells[0].getBoundingClientRect();
    const last = cells[cells.length - 1].getBoundingClientRect();
    const near =
      pointer.x > first.left - 140 &&
      pointer.x < last.right + 140 &&
      pointer.y > first.top - 110 &&
      pointer.y < first.bottom + 110;
    if (!near) {
      if (active) cells.forEach((c) => (c.style.fontWeight = ""));
      active = false;
      return;
    }
    active = true;
    cells.forEach((c) => {
      const r = c.getBoundingClientRect();
      const d = Math.hypot(pointer.x - (r.left + r.width / 2), pointer.y - (r.top + r.height / 2));
      const f = Math.max(0, 1 - d / 200);
      c.style.fontWeight = String(Math.round(300 + f * 500));
    });
  }

  if (!reduced()) {
    window.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      pointer = { x: e.clientX, y: e.clientY };
      if (!queued) {
        queued = true;
        requestAnimationFrame(paint);
      }
    });
  }

  // tap or click: a heavy wave sweeps through the word
  cells.forEach((c) =>
    c.addEventListener("click", () =>
      cells.forEach((cell, i) => {
        setTimeout(() => (cell.style.fontWeight = "800"), i * 55);
        setTimeout(() => (cell.style.fontWeight = ""), i * 55 + 280);
      })
    )
  );
}

export function initHello() {
  const hello = document.getElementById("hello");
  if (!hello) return null;
  const all = [];
  hello.querySelectorAll("[data-split]").forEach((part) => {
    const letters = splitChars(part, "hc");
    if (part.classList.contains("hello__name")) {
      letters.forEach((l, i) => l.outer.style.setProperty("--t", String(i / (letters.length - 1))));
    }
    all.push(...letters);
  });
  const name = all.filter((l) => l.outer.closest(".hello__name"));
  initBubbly(all.filter((l) => !name.includes(l)));
  initNameMorph(name);
  return {
    letters: all,
    name,
    dot: all.filter((l) => l.outer.closest(".hello__dot")),
  };
}
