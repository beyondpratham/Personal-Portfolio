import { gsap } from "gsap";

export function runPreloader() {
  return new Promise((resolve) => {
    const preloader = document.getElementById("preloader");
    const letters = preloader.querySelectorAll(".preloader__word span");
    const bar = preloader.querySelector(".preloader__bar span");
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const finish = () => {
      preloader.style.display = "none";
      document.body.style.removeProperty("overflow");
      resolve();
    };

    if (reduceMotion) {
      finish();
      return;
    }

    document.body.style.overflow = "hidden";

    gsap
      .timeline({ onComplete: finish })
      .to(letters, {
        y: "0%",
        opacity: 1,
        duration: 0.7,
        ease: "power4.out",
        stagger: 0.05,
      })
      .to(bar, { width: "100%", duration: 0.55, ease: "power2.inOut" }, "-=0.35")
      .to(preloader, { opacity: 0, duration: 0.6, ease: "power2.inOut" }, "+=0.15");
  });
}
