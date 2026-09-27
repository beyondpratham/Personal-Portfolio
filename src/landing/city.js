import { gsap } from "gsap";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Months are 0-based, from the resume. `orb` is the spot on the avenue in
// front of each building (SVG user units).
const EXPERIENCE = {
  research: {
    from: [2023, 7],
    to: [2024, 3],
    orb: [151.1, 255],
    org: "IIIT-Delhi · Guide: Dr. Dhruv Kumar",
    role: "Undergraduate Research Assistant",
    dates: "Aug 2023 – Apr 2024",
    points: [
      "Built a Python pipeline (scraping, PDF-to-CSV) turning NIRF government reports into datasets for a React ranking dashboard.",
      "Ran user research on India's ranking methodology and co-authored the resulting HCI research paper.",
    ],
    links: [
      ["Code", "https://github.com/plon-Susk7/CS-RANKINGS"],
      ["Paper", "https://www.overleaf.com/read/knszfvykbjvv#de0c29"],
    ],
  },
  natwest: {
    from: [2025, 6],
    to: null,
    orb: [430, 255],
    org: "NatWest Group · Gurugram",
    role: "Software Development Engineer 1",
    dates: "Jul 2025 – Present",
    points: [
      "Own and scale a Java (Spring Boot) / Python REST platform for international payments, adopted by 12+ engineering teams.",
      "Built a webhook-driven Adobe eSign integration handling 8,000+ requests/hour, secured with mTLS.",
      "Cut p95 latency ~35% with a Redis/Valkey cache on AWS; release time from hours to under 15 minutes via Docker, Kubernetes and CI/CD.",
    ],
    links: [],
  },
};

const monthsBetween = ([y1, m1], [y2, m2]) => (y2 - y1) * 12 + (m2 - m1) + 1;
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** "2 Years", "1 Year 3 Months", "9 Months" */
function spell(months) {
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y && plural(y, "Year"), m && plural(m, "Month")].filter(Boolean).join(" ") || "0 Months";
}
/** compact form for the readout: "1 yr 3 mos" */
function short(months) {
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y && `${y} yr`, m && `${m} mo${m === 1 ? "" : "s"}`].filter(Boolean).join(" ");
}

/**
 * Experience as an isometric city: IIIT-Delhi on the left, a neighbourhood
 * that grows toward NatWest's tower on the right. Hovering/clicking a building
 * selects that role; a light runs down the avenue to it.
 * "Present role" jumps back to the current job and hides while it's selected.
 */
export function initCity() {
  const city = document.getElementById("city");
  if (!city) return null;

  const now = new Date();
  const today = [now.getFullYear(), now.getMonth()];
  const months = Object.fromEntries(
    Object.entries(EXPERIENCE).map(([k, e]) => [k, monthsBetween(e.from, e.to ?? today)])
  );
  document.getElementById("expTotal").textContent = `${spell(months.research + months.natwest)} Total`;

  const els = {
    org: document.getElementById("expOrg"),
    role: document.getElementById("expRole"),
    num: document.getElementById("expNum"),
    dates: document.getElementById("expDates"),
  };
  const present = document.getElementById("expPresent");
  const orb = document.getElementById("orb");
  const buildings = [...city.querySelectorAll(".bld")];
  const tile = document.getElementById("expTile");
  const pointsEl = document.getElementById("expPoints");
  const linksEl = document.getElementById("expLinks");
  let current = null;

  gsap.set(orb, { attr: { cx: EXPERIENCE.research.orb[0], cy: EXPERIENCE.research.orb[1] } });

  function select(key) {
    if (key === current) return;
    current = key;
    const e = EXPERIENCE[key];
    buildings.forEach((b) => b.classList.toggle("is-active", b.dataset.exp === key));
    tile.classList.toggle("is-research", key === "research");
    orb.classList.toggle("is-research", key === "research");
    present.hidden = key === "natwest";
    els.org.textContent = e.org;
    els.role.textContent = e.role;
    els.num.textContent = short(months[key]);
    els.dates.textContent = e.dates;
    pointsEl.replaceChildren(
      ...e.points.map((t) => Object.assign(document.createElement("li"), { textContent: t }))
    );
    linksEl.replaceChildren(
      ...e.links.map(([label, href]) =>
        Object.assign(document.createElement("a"), { href, target: "_blank", rel: "noopener", textContent: `${label} ↗` })
      )
    );

    if (reduced()) {
      gsap.set(orb, { attr: { cx: e.orb[0], cy: e.orb[1] } });
      return;
    }
    gsap.fromTo(tile, { y: 10, opacity: 0.2 }, { y: 0, opacity: 1, duration: 0.45, ease: "power3.out", overwrite: true });
    gsap.to(orb, { attr: { cx: e.orb[0], cy: e.orb[1] }, duration: 1.1, ease: "power2.inOut", overwrite: true });
  }

  const bind = (el, key) => {
    el.addEventListener("click", () => select(key));
    el.addEventListener("focus", () => select(key));
    el.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        select(key);
      }
    });
  };
  buildings.forEach((b) => {
    b.addEventListener("pointerenter", () => select(b.dataset.exp));
    bind(b, b.dataset.exp);
  });
  present.addEventListener("click", () => select("natwest"));

  select("research");

  return {
    /** First time the city scrolls into view: travel from college to the present job. */
    playIntro() {
      setTimeout(() => select("natwest"), 500);
    },
  };
}
