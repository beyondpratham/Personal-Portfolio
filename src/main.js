import "./style.css";
import { initTheme } from "./theme.js";
import { runPreloader } from "./preloader.js";
import { initCursor } from "./cursor.js";
import { initSmoothScroll } from "./smoothScroll.js";
import { initGlass } from "./glass.js";
import { initSegmented } from "./segmented.js";
import {
  initHeroIntro,
  initScrollReveals,
  initMagnetic,
  initMobileNav,
  setFooterYear,
} from "./animations.js";

async function bootstrap() {
  initTheme();
  initSmoothScroll();
  initCursor();
  initMobileNav();
  setFooterYear();
  initSegmented();

  await runPreloader();

  initHeroIntro();
  initScrollReveals();
  initGlass();
  initMagnetic();
}

bootstrap();
