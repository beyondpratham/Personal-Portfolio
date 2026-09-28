import "./style.css";
import "./landing.css";
import { initTheme } from "./theme.js";
import { initSmoothScroll } from "./smoothScroll.js";
import { initGlassLight } from "./landing/glassLight.js";
import { initOrbit } from "./landing/orbit.js";
import { initHello, initTagline } from "./landing/wordFx.js";
import { initCity } from "./landing/city.js";
import { initClock } from "./landing/clock.js";
import { initPaths } from "./landing/paths.js";
import { initWobble } from "./landing/wobble.js";
import { initSpotlight } from "./landing/spotlight.js";
import { initResume } from "./landing/resume.js";
import { playIntro, initTitlebar, initScrollScenes } from "./landing/motion.js";

async function bootstrap() {
  initTheme();
  const lenis = initSmoothScroll();
  initSpotlight();
  initResume();
  initClock();
  initPaths();
  initOrbit();
  initWobble();
  const city = initCity();
  const hello = initHello();

  const taglineWords = await initTagline();

  initGlassLight();
  playIntro({ hello, taglineWords });
  document.documentElement.classList.remove("intro-pending");
  initTitlebar({ lenis, hello });
  initScrollScenes(city);
}

bootstrap();
