import { useLayoutEffect, useRef } from "react";
import { gsap, reduzido } from "../lib/scroll";

// Texto que "acende" palavra por palavra conforme a pessoa rola a página.
export default function Palavras({ texto, className = "" }: { texto: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useLayoutEffect(() => {
    if (reduzido() || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.to(".palavra", {
        opacity: 1,
        stagger: 0.12,
        ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top 82%", end: "bottom 50%", scrub: 0.6 },
      });
    }, ref);
    return () => ctx.revert();
  }, [texto]);
  return (
    <p ref={ref} className={className} aria-label={texto}>
      {texto.split(" ").map((p, i) => (
        <span key={i} className="palavra" aria-hidden>
          {p}&nbsp;
        </span>
      ))}
    </p>
  );
}
