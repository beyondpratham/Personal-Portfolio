import "@fontsource/open-runde/400.css";
import "@fontsource/open-runde/500.css";
import "@fontsource/open-runde/600.css";
import "@fontsource/open-runde/700.css";
import "./style.css";
import "./landing.css";
import "./developer.css";
import { initTheme } from "./theme.js";
import { initProjectModal, initReels } from "./projectModal.js";
import { initSmoothScroll } from "./smoothScroll.js";
import { initGlassLight } from "./landing/glassLight.js";
import { initResume } from "./landing/resume.js";
import { initWobble } from "./landing/wobble.js";

const KEYWORDS = {
  python: "def return if else elif for in not None try except raise import from class and or True False is self while with as",
  sql: "CREATE TRIGGER BEFORE AFTER UPDATE INSERT ON FOR EACH ROW BEGIN IF THEN END SET NEW OLD AND OR SIGNAL SQLSTATE MESSAGE_TEXT NOW SELECT FROM WHERE",
  js: "function if else return const let var try catch window document new",
  java: "package import public private class static void throws return new extends",
};
const COMMENT = { python: "#.*", sql: "--.*", js: "//.*", java: "//.*" };
const escape = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);

/** Tiny monochrome highlighter: keywords, strings, numbers, comments. */
function highlight() {
  document.querySelectorAll("code[data-lang]").forEach((el) => {
    const lang = el.dataset.lang;
    const words = new Set(KEYWORDS[lang].split(" "));
    const re = new RegExp(`(${COMMENT[lang]})|('(?:[^'\\\\]|\\\\.)*'|"(?:[^"\\\\]|\\\\.)*")|(\\b\\d[\\d_.]*\\b)|([A-Za-z_]\\w*)`, "g");
    const src = el.textContent;
    let out = "";
    let last = 0;
    for (const m of src.matchAll(re)) {
      out += escape(src.slice(last, m.index));
      const [tok, c, str, num, word] = m;
      if (c) out += `<span class="t-c">${escape(tok)}</span>`;
      else if (str) out += `<span class="t-s">${escape(tok)}</span>`;
      else if (num) out += `<span class="t-n">${escape(tok)}</span>`;
      else if (words.has(word)) out += `<span class="t-k">${escape(tok)}</span>`;
      else out += escape(tok);
      last = m.index + tok.length;
    }
    el.innerHTML = out + escape(src.slice(last));
  });
}

function fadeIn() {
  const els = document.querySelectorAll("[data-fade]");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px" }
  );
  els.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i, 6) * 60}ms`;
    io.observe(el);
  });
}

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * "Pratham": the landing page's hacker scramble, toned down — monochrome, no
 * font or size swaps, letters just cycle through glyphs and resolve in order.
 */
function initNameHack() {
  const el = document.querySelector("[data-hack]");
  if (!el) return;
  const text = el.textContent;
  el.textContent = "";
  const cells = [...text].map((ch) => {
    const s = Object.assign(document.createElement("span"), { className: "hk", textContent: ch });
    el.appendChild(s);
    return s;
  });
  el.setAttribute("aria-label", text);
  const GLYPHS = "01<>/{}[]#$%&*+=?_|~";
  let timers = [];
  const clear = () => (timers.forEach((t) => (clearInterval(t), clearTimeout(t))), (timers = []));
  el.addEventListener("pointerenter", () => {
    if (reduced()) return;
    clear();
    el.classList.add("is-hacking");
    cells.forEach((c, i) => {
      c.style.width = `${c.offsetWidth}px`;
      const iv = setInterval(() => (c.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0]), 55);
      timers.push(iv);
      timers.push(setTimeout(() => (clearInterval(iv), (c.textContent = text[i])), 260 + i * 70));
    });
    timers.push(setTimeout(() => el.classList.remove("is-hacking"), 300 + cells.length * 70));
  });
  el.addEventListener("pointerleave", () => {
    clear();
    cells.forEach((c, i) => {
      c.textContent = text[i];
      c.style.width = "";
    });
    el.classList.remove("is-hacking");
  });
}

initTheme();
const lenis = initSmoothScroll();
initNameHack();
initReels();
initWobble(); // featured glass pane, like the landing page
initWobble(".proj", { surface: null, tilt: 4 });
initProjectModal({ lenis, variant: "dev" });
highlight();
initGlassLight();
initResume();
fadeIn();
