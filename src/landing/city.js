import { gsap } from "gsap";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Months are 0-based. From the resume. `x` is the building's centre on the
// horizon; `top` is how high its light scan travels.
const EXPERIENCE = {
  research: {
    from: [2023, 7],
    to: [2024, 3],
    x: 170,
    top: 110,
    org: "IIIT-Delhi · Guide: Dr. Dhruv Kumar",
    role: "Undergraduate Research Assistant",
    note: "NIRF ranking data pipeline + HCI research paper",
    dates: "Aug 2023 – Apr 2024",
  },
  natwest: {
    from: [2025, 6],
    to: null,
    x: 509,
    top: 30,
    org: "NatWest Group · Gurugram",
    role: "Software Development Engineer 1",
    note: "Payments APIs used by 12+ teams · 8,000+ eSign req/hr",
    dates: "Jul 2025 – Present",
  },
};

const monthsBetween = ([y1, m1], [y2, m2]) => (y2 - y1) * 12 + (m2 - m1) + 1;

function duration(months) {
  if (months < 12) return { num: String(months), unit: "mo" };
  const yrs = months / 12;
  return { num: yrs % 1 === 0 ? String(yrs) : yrs.toFixed(1), unit: "yr" };
}

/**
 * Experience as a minimal glass skyline: IIIT-Delhi, a quiet neighbourhood,
 * NatWest. Selecting a building sends a light along the horizon to it and a
 * scan of light up its glass.
 */
export function initCity() {
  const city = document.getElementById("city");
  if (!city) return null;

  const now = new Date();
  const today = [now.getFullYear(), now.getMonth()];
  const months = Object.fromEntries(
    Object.entries(EXPERIENCE).map(([k, e]) => [k, monthsBetween(e.from, e.to ?? today)])
  );
  const total = duration(months.research + months.natwest);
  document.getElementById("expTotal").textContent = `${total.num} ${total.unit} total`;

  const els = {
    org: document.getElementById("expOrg"),
    role: document.getElementById("expRole"),
    note: document.getElementById("expNote"),
    num: document.getElementById("expNum"),
    unit: document.getElementById("expUnit"),
    dates: document.getElementById("expDates"),
  };
  const orb = document.getElementById("orb");
  const scans = {
    research: city.querySelector("#scanResearch rect"),
    natwest: city.querySelector("#scanNatwest rect"),
  };
  const buildings = [...city.querySelectorAll(".bld")];
  let current = null;

  gsap.set(orb, { x: EXPERIENCE.research.x, y: 222 });

  function scan(key) {
    const rect = scans[key];
    gsap.killTweensOf(rect);
    gsap
      .timeline()
      .set(rect, { attr: { y: 222 }, opacity: 0.9 })
      .to(rect, { attr: { y: EXPERIENCE[key].top - 40 }, duration: 1.2, ease: "power1.in" })
      .to(rect, { opacity: 0, duration: 0.3 }, "-=0.3");
  }

  function select(key) {
    if (key === current) return;
    current = key;
    const e = EXPERIENCE[key];
    const d = duration(months[key]);
    buildings.forEach((b) => b.classList.toggle("is-active", b.dataset.exp === key));
    orb.classList.toggle("is-research", key === "research");
    els.org.textContent = e.org;
    els.role.textContent = e.role;
    els.note.textContent = e.note;
    els.num.textContent = d.num;
    els.unit.textContent = d.unit;
    els.dates.textContent = e.dates;

    if (reduced()) {
      gsap.set(orb, { x: e.x });
      return;
    }
    gsap.fromTo([els.org, els.role, els.note], { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.04 });
    const from = gsap.getProperty(orb, "x");
    gsap.to(orb, {
      x: e.x,
      duration: Math.max(0.5, Math.abs(e.x - from) / 320),
      ease: "power2.inOut",
      overwrite: true,
      onComplete: () => scan(key),
    });
  }

  buildings.forEach((b) => {
    const key = b.dataset.exp;
    b.addEventListener("pointerenter", () => select(key));
    b.addEventListener("focus", () => select(key));
    b.addEventListener("click", () => select(key));
    b.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        select(key);
      }
    });
  });

  select("research");

  if (!reduced()) {
    gsap.fromTo(
      "#citySheen",
      { attr: { x: -160 } },
      { attr: { x: 820 }, duration: 2.4, ease: "power2.inOut", repeat: -1, repeatDelay: 4 }
    );
  }

  return {
    /** First time the city scrolls into view: light travels from college to NatWest. */
    playIntro() {
      setTimeout(() => select("natwest"), 400);
    },
  };
}
