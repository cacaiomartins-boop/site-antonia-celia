import { createContext, CSSProperties, ReactNode, useContext, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { gsap, reduzido, topo, ScrollTrigger } from "../lib/scroll";
import { paginas, cores, artista } from "../data/clinic";

type Ctx = { ir: (para: string, x?: number, y?: number) => void };
const C = createContext<Ctx>({ ir: () => {} });
export const useTransicao = () => useContext(C);

// Troca de página como pincelada: um círculo de tinta cresce a partir do clique,
// cobre a tela, a página muda por baixo e a tinta "escorre" para fora.
export function TransicaoProvider({ children }: { children: ReactNode }) {
  const navegar = useNavigate();
  const { pathname } = useLocation();
  const el = useRef<HTMLDivElement>(null);
  const rotulo = useRef<HTMLSpanElement>(null);
  const ocupado = useRef(false);

  const ir = (para: string, x = window.innerWidth / 2, y = window.innerHeight / 2) => {
    if (ocupado.current || para === pathname) return;
    const dest = paginas.find((p) => p.rota === para);
    const cor = dest?.cor ?? cores.tinta;
    const nome = dest?.nome ?? artista.nome;
    if (reduzido() || !el.current || !rotulo.current) {
      navegar(para);
      topo();
      return;
    }
    ocupado.current = true;
    const o = el.current;
    rotulo.current.textContent = nome;
    gsap.set(o, { display: "grid", background: cor, clipPath: `circle(0px at ${x}px ${y}px)` });
    gsap.set(rotulo.current, { opacity: 0, y: 30 });
    const tl = gsap.timeline({ onComplete: () => { gsap.set(o, { display: "none" }); ocupado.current = false; } });
    tl.to(o, { clipPath: `circle(150vmax at ${x}px ${y}px)`, duration: 0.8, ease: "power3.in" })
      .to(rotulo.current, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, "-=0.25")
      .add(() => { navegar(para); topo(); setTimeout(() => ScrollTrigger.refresh(), 60); })
      .to({}, { duration: 0.35 })
      .to(o, { clipPath: "circle(0px at 50% 100%)", duration: 0.9, ease: "power3.out" });
  };

  return (
    <C.Provider value={{ ir }}>
      {children}
      <div
        ref={el}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[80] hidden place-items-center"
        style={{ display: "none" }}
      >
        <span ref={rotulo} className="display text-[clamp(3rem,12vw,10rem)] font-extrabold text-gesso" />
      </div>
    </C.Provider>
  );
}

export function TLink({ to, children, className = "", onNavigate, style }: { to: string; children: ReactNode; className?: string; onNavigate?: () => void; style?: CSSProperties }) {
  const { ir } = useTransicao();
  return (
    <a
      href={to}
      className={className}
      style={style}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onNavigate?.();
        ir(to, e.clientX, e.clientY);
      }}
    >
      {children}
    </a>
  );
}
