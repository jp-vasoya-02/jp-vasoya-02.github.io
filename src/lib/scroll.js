import Lenis from "lenis";

let lenis = null;

export function initSmoothScroll() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  let raf;
  const loop = (time) => {
    lenis.raf(time);
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  return () => {
    cancelAnimationFrame(raf);
    lenis.destroy();
    lenis = null;
  };
}

export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  // Both paths honour the html scroll-padding-top that clears the fixed nav.
  if (lenis) lenis.scrollTo(el);
  else el.scrollIntoView();
}

// Reference-counted so overlapping overlays (palette, modal) can't unlock each other.
let locks = 0;

export function lockScroll(on) {
  locks = Math.max(0, locks + (on ? 1 : -1));
  const locked = locks > 0;
  if (lenis) (locked ? lenis.stop() : lenis.start());
  document.documentElement.style.overflow = locked ? "hidden" : "";
}
