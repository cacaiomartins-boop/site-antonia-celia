import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const reduzido = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let lenis: Lenis | null = null;

export function iniciarScroll() {
  if (reduzido() || lenis) return;
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis?.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

export function topo() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  else window.scrollTo(0, 0);
}

export { gsap, ScrollTrigger };

export function parar() { lenis?.stop(); document.documentElement.style.overflow = "hidden"; }
export function seguir() { lenis?.start(); document.documentElement.style.overflow = ""; }
