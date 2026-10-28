import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap, reduzido } from "../lib/scroll";
import { Traco, PALETA } from "../lib/paint";
import { textos, artista } from "../data/clinic";
import { TLink } from "./Transicao";

// Abertura: tela branca, a assinatura da Antonia se escreve sozinha
// e o visitante pode riscar a tela com um traço simples.
// cursor em forma de pincel, com a ponta na cor escolhida (só nesta tela)
const cursorPincel = (cor: string) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><path d='M27 4 L15 16' stroke='#16130F' stroke-width='4' stroke-linecap='round'/><path d='M16 15 L12 19' stroke='#9a9a9a' stroke-width='5' stroke-linecap='round'/><path d='M12 18 C7 18 4 22 4 28 C10 28 14 25 14 20 Z' fill='${cor}' stroke='white' stroke-width='1'/></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}") 5 27, crosshair`;
};

export default function TelaViva() {
  const secao = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const traco = useRef<Traco | null>(null);
  const assinatura = useRef<HTMLSpanElement>(null);
  const risco = useRef<SVGPathElement>(null);
  const [cor, setCor] = useState(PALETA[0]);

  // tamanho do canvas (sem custo de pintura enquanto ninguém desenha)
  useEffect(() => {
    const c = canvas.current!;
    const ajustar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = c.clientWidth, h = c.clientHeight;
      if (c.width === Math.round(w * dpr) && c.height === Math.round(h * dpr)) return;
      const copia = document.createElement("canvas");
      copia.width = c.width; copia.height = c.height;
      if (c.width) copia.getContext("2d")!.drawImage(c, 0, 0);
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      const ctx = c.getContext("2d")!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (copia.width) ctx.drawImage(copia, 0, 0, copia.width / dpr, copia.height / dpr);
      const cor0 = traco.current?.cor;
      traco.current = new Traco(ctx);
      if (cor0) traco.current.cor = cor0;
    };
    ajustar();
    window.addEventListener("resize", ajustar);
    return () => window.removeEventListener("resize", ajustar);
  }, []);

  // entrada: a assinatura se escreve da esquerda para a direita, depois o risco vermelho
  useLayoutEffect(() => {
    const p = risco.current!;
    const len = p.getTotalLength();
    gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
    if (reduzido()) { gsap.set(p, { strokeDashoffset: 0 }); return; }
    const ctx = gsap.context(() => {
      gsap.timeline({ delay: 0.3 })
        .fromTo(assinatura.current, { clipPath: "inset(-10% 100% -10% 0)" }, { clipPath: "inset(-10% -2% -10% 0)", duration: 2.4, ease: "power1.inOut" })
        .to(p, { strokeDashoffset: 0, duration: 1, ease: "power2.out" }, "-=0.5")
        .from(".hero-entra", { opacity: 0, y: 14, duration: 0.7, stagger: 0.1 }, "-=0.7");
    }, secao);
    return () => ctx.revert();
  }, []);

  // traço do visitante
  useEffect(() => {
    const s = secao.current!;
    let apertado = false;
    const pos = (e: PointerEvent) => {
      const b = canvas.current!.getBoundingClientRect();
      return [e.clientX - b.left, e.clientY - b.top] as const;
    };
    const ignora = (e: Event) => !!(e.target as HTMLElement).closest("a,button");
    const down = (e: PointerEvent) => {
      if (ignora(e) || !traco.current) return;
      apertado = true;
      traco.current.inicio(...pos(e));
    };
    const move = (e: PointerEvent) => {
      if (!traco.current || !apertado) return;
      traco.current.mover(...pos(e));
    };
    const up = () => { apertado = false; traco.current?.fim(); };
    s.addEventListener("pointerdown", down);
    s.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      s.removeEventListener("pointerdown", down);
      s.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, []);

  const escolher = (c: string) => {
    setCor(c);
    if (traco.current) traco.current.cor = c;
  };
  const limpar = () => {
    const c = canvas.current!;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
  };

  return (
    <section ref={secao} className="relative h-[100svh] min-h-[540px] overflow-hidden bg-gesso" style={{ touchAction: "pan-y", cursor: cursorPincel(cor) }}>
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden />

      <div className="pointer-events-none absolute inset-x-0 top-[38%] -translate-y-1/2 px-5 text-center">
        <h1 className="m-0 leading-none" aria-label={`${artista.nome}, ${artista.funcao}`}>
          <span
            ref={assinatura}
            aria-hidden
            className="font-assinatura inline-block whitespace-nowrap pb-[0.12em] pr-[0.1em] text-[clamp(3.6rem,15.5vw,15rem)] font-normal leading-[1.1] tracking-normal text-tinta"
          >
            {artista.nome}
          </span>
        </h1>
        <svg className="mx-auto -mt-[1.6vw] block w-[min(46vw,26rem)] min-w-[11rem]" viewBox="0 0 400 30" fill="none" aria-hidden>
          <path ref={risco} d="M4 20 C60 6 120 26 190 14 S320 8 396 16" stroke="#C42A1D" strokeWidth="5" strokeLinecap="round" />
        </svg>
        <p className="hero-entra m-0 mt-5 text-lg italic text-tinta/75 md:text-xl">{textos.heroLinha}</p>
      </div>

      <div className="absolute inset-x-5 bottom-5 flex flex-wrap items-end justify-between gap-4 md:inset-x-9 md:bottom-8">
        <div className="hero-entra flex flex-wrap items-center gap-3">
          <TLink to="/disponiveis" className="display bg-tinta px-5 py-3 text-sm font-bold text-white">
            Ver telas disponíveis
          </TLink>
          <TLink to="/quem-sou" className="display px-1 py-3 text-sm font-bold underline decoration-2 underline-offset-8">
            Quem é a Antonia
          </TLink>
        </div>

        <div className="hero-entra flex flex-col items-end gap-2">
          <span className="text-sm italic text-tinta/60">{textos.heroDica}</span>
          <div className="flex items-center gap-2" role="group" aria-label="Escolher a cor da tinta">
            {PALETA.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => escolher(c)}
                aria-label={`Tinta ${c}`}
                aria-pressed={cor === c}
                className="h-6 w-6 rounded-full transition-transform"
                style={{ background: c, transform: cor === c ? "scale(1.3)" : "scale(1)" }}
              />
            ))}
            <button type="button" onClick={limpar} className="display ml-2 text-xs font-bold underline underline-offset-4">
              Limpar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
