const fmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export function initClock() {
  const digital = document.getElementById("istTime");
  const svg = document.querySelector(".clock");
  if (!digital || !svg) return;

  const ticks = svg.querySelector(".clock__ticks");
  for (let i = 0; i < 12; i++) {
    const a = (i * 30 * Math.PI) / 180;
    const inner = i % 3 === 0 ? 34 : 38;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", String(50 + Math.sin(a) * inner));
    line.setAttribute("y1", String(50 - Math.cos(a) * inner));
    line.setAttribute("x2", String(50 + Math.sin(a) * 42));
    line.setAttribute("y2", String(50 - Math.cos(a) * 42));
    ticks.appendChild(line);
  }

  const hour = svg.querySelector(".clock__hour");
  const min = svg.querySelector(".clock__min");
  const sec = svg.querySelector(".clock__sec");

  function tick() {
    const parts = Object.fromEntries(fmt.formatToParts(new Date()).map((p) => [p.type, p.value]));
    const h = Number(parts.hour) % 24;
    const m = Number(parts.minute);
    const s = Number(parts.second);
    digital.textContent = `${parts.hour}:${parts.minute}:${parts.second}`;
    hour.style.transform = `rotate(${(h % 12) * 30 + m * 0.5}deg)`;
    min.style.transform = `rotate(${m * 6 + s * 0.1}deg)`;
    sec.style.transform = `rotate(${s * 6}deg)`;
    setTimeout(tick, 1000 - (Date.now() % 1000));
  }
  tick();
}
