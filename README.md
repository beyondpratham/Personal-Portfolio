# Pratham Singhal — Portfolio

A three-page portfolio built with [Vite](https://vitejs.dev/), styled as a
light-reactive "liquid glass" UI, and animated with [GSAP](https://gsap.com/)
and [Lenis](https://lenis.darkroom.engineering/) smooth scroll.

## Getting started

Requires [Node.js](https://nodejs.org/) 18+. All dependencies install locally into this project's `node_modules` — nothing is installed globally.

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

## Scripts

- `npm run dev` — start the local dev server with hot reload
- `npm run build` — build the production site into `dist/`
- `npm run preview` — preview the production build locally

## Pages

- `index.html` — landing / About Me: animated "Hi, I am Pratham." headline
  that becomes a title bar on scroll, photo pane with orbiting socials, dark
  mode pane, interactive tagline, Developer/Designer pane, demographics,
  an illustrated experience "city", About pane, and a "Get in touch" line
- `developer.html` — "Pratham develops.": monochrome work page — intro, a featured project in a liquid-glass pane, and every GitHub project as a plain card with a real code excerpt
- `design.html` — design work (to be redesigned)

## Project structure

```
index.html / developer.html / design.html
src/
  landing.js            landing page entry
  landing.css           landing styles + the .lg liquid-glass component
  landing/
    glassLight.js       cursor acts as the light source for every glass surface
    orbit.js            social icons orbiting the profile sphere
    wordFx.js           headline + tagline letter splitting and per-word hover effects
    city.js             experience city (IIIT-Delhi → NatWest) with a walking avatar
    clock.js            live India time (analog + digital)
    paths.js            Developer / Designer pane
    wobble.js           jelly wobble on pane hover
    motion.js           intro, photo-to-title-bar flight, scroll scenes
  developer.js / developer.css   developer page entry + styles (Open Runde, Dousan-style cards)
  main.js               entry for the design page (to be redesigned)
  theme.js              light/dark toggle (persisted, respects system preference)
  preloader.js, cursor.js, smoothScroll.js, animations.js, glass.js, segmented.js
  style.css             shared tokens and styles
public/
  images/               portrait and project images
  resume.pdf            linked from the "Resume" button
```

## Deploying

`npm run build` outputs a static `dist/` folder (all three pages as separate
entry points) that can be hosted anywhere (GitHub Pages, Netlify, Vercel, etc.).
