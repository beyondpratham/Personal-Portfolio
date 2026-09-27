import { gsap } from "gsap";

export function initSegmented() {
  const roots = document.querySelectorAll("[data-segmented]");

  roots.forEach((root) => {
    const thumb = root.querySelector(".segmented__thumb");
    const options = [...root.querySelectorAll(".segmented__option")];
    const current = root.dataset.active || "";
    const activeEl = options.find((o) => o.dataset.option === current) || null;

    function place(el, animate = true) {
      options.forEach((o) => o.setAttribute("data-active", String(o === el)));

      if (!el) {
        gsap.to(thumb, { opacity: 0, duration: animate ? 0.3 : 0 });
        return;
      }

      const rootRect = root.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();

      gsap.to(thumb, {
        opacity: 1,
        x: elRect.left - rootRect.left,
        width: elRect.width,
        duration: animate ? 0.5 : 0,
        ease: "power3.out",
      });
    }

    place(activeEl, false);

    options.forEach((opt) => {
      opt.addEventListener("mouseenter", () => place(opt));
      opt.addEventListener("focus", () => place(opt));
    });

    root.addEventListener("mouseleave", () => place(activeEl));
    root.addEventListener("focusout", (e) => {
      if (!root.contains(e.relatedTarget)) place(activeEl);
    });

    window.addEventListener("resize", () => place(activeEl, false));
  });
}
