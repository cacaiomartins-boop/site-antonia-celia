import { useLayoutEffect, useRef } from "react";
import { gsap, reduzido } from "../lib/scroll";

// Cabeçalho de cada página: um bloco inteiro na cor da tela daquela página.
export default function PaginaTopo({ titulo, frase, cor, imagem, escuro = false }: { titulo: string; frase: string; cor: string; imagem?: string; escuro?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    if (reduzido() || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".letra", { yPercent: 110, rotate: 6, duration: 1, ease: "power4.out", stagger: 0.045, delay: 0.9 });
      gsap.from(".topo-quadro", { clipPath: "inset(0 0 100% 0)", y: 30, duration: 1.3, ease: "power3.out", delay: 0.5 });
      gsap.from(".frase-topo", { opacity: 0, y: 16, duration: 0.8, delay: 1.5 });
    }, ref);
    return () => ctx.revert();
  }, [titulo]);
  return (
    <section
      ref={ref}
      className="relative flex min-h-[78svh] flex-col justify-end overflow-hidden px-5 pb-10 pt-32 [--gut:2.5rem] md:px-9 md:[--gut:4.5rem]"
      style={{ background: cor, color: escuro ? "#16130F" : "#FFFFFF" }}
    >
      {imagem && (
        <img
          src={imagem}
          alt=""
          className="topo-quadro absolute right-5 top-[5.2rem] h-[27svh] max-w-[calc(100vw-2.5rem)] rotate-[1.5deg] object-cover shadow-[0_22px_40px_-16px_rgba(0,0,0,.55)] md:right-9 md:top-[6.5rem] md:h-[min(40svh,22rem)] md:max-w-[52vw]"
        />
      )}
      <h1 className="relative m-0 whitespace-nowrap font-extrabold" style={{ fontSize: `min(14rem, calc((100vw - var(--gut)) / ${(titulo.length * 0.7).toFixed(2)}))` }} aria-label={titulo}>
        <span className="block overflow-hidden pb-[0.08em]" aria-hidden>
          {titulo.split("").map((l, i) => (
            <span key={i} className="letra inline-block whitespace-pre">{l}</span>
          ))}
        </span>
      </h1>
      <p className="frase-topo relative mt-4 max-w-xl text-xl italic md:text-2xl">{frase}</p>
    </section>
  );
}
