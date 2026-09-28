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
 * "develops." decodes itself: each letter cycles through code glyphs in
 * different shades of grey before settling, left to right. Plays once on
 * load and again on hover. "Pratham" stays still.
 */
function initVerbHack() {
  const el = document.querySelector("[data-hack]");
  if (!el) return;
  const text = el.textContent;
  el.textContent = "";
  el.setAttribute("aria-label", text);
  const cells = [...text].map((ch) => {
    const s = Object.assign(document.createElement("span"), { className: "hk", textContent: ch });
    el.appendChild(s);
    return s;
  });
  const GLYPHS = "01<>/{}[]#$%&*+=?_|~;:";
  const SHADES = [18, 32, 46, 60, 74, 88]; // % of ink, mixed into the page background
  const pick = (a) => a[(Math.random() * a.length) | 0];
  let timers = [];
  const clear = () => (timers.forEach((t) => (clearInterval(t), clearTimeout(t))), (timers = []));
  const settle = () =>
    cells.forEach((c, i) => {
      c.textContent = text[i];
      c.style.removeProperty("--hk");
      c.style.width = c.style.clipPath = "";
    });
  const play = () => {
    if (reduced()) return;
    clear();
    cells.forEach((c, i) => {
      if (!/\w/.test(text[i])) return; // punctuation stays put
      // lock the letter's width and clip wider glyphs to it, so nothing spills sideways
      c.style.width = `${c.offsetWidth}px`;
      c.style.clipPath = "inset(-0.3em 0)";
      const iv = setInterval(() => {
        c.textContent = pick(GLYPHS);
        c.style.setProperty("--hk", `${pick(SHADES)}%`);
      }, 55);
      timers.push(iv);
      timers.push(
        setTimeout(() => {
          clearInterval(iv);
          c.textContent = text[i];
          c.style.removeProperty("--hk");
          c.style.width = c.style.clipPath = "";
        }, 280 + i * 75)
      );
    });
  };
  el.addEventListener("pointerenter", play);
  el.addEventListener("pointerleave", () => (clear(), settle()));
  setTimeout(play, 350);
}

/** The photo + name open a profile popup, so this page stands on its own. */
function initProfile(modal) {
  const btn = document.querySelector("[data-profile]");
  const tpl = document.getElementById("profileTpl");
  if (!btn || !tpl || !modal) return;
  btn.addEventListener("click", () => modal.openTemplate(btn, tpl, "pm--profile"));
}

initTheme();
const lenis = initSmoothScroll();
initVerbHack();
initReels();
initWobble(); // featured glass pane, like the landing page
initWobble(".proj", { surface: null, tilt: 4 });
initProfile(initProjectModal({ lenis, variant: "dev" }));
highlight();
initGlassLight();
initResume();
fadeIn();
