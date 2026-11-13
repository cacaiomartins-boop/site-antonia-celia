import { useEffect, useState } from "react";
import { artista, cores } from "../data/clinic";
import { gsap, reduzido } from "../lib/scroll";

// Abertura rápida: sobre o fundo off-white, o nome dela é escrito e uma pincelada vermelha com um fio dourado se
// desenham embaixo (o mesmo risco da Home) e então a cortina sobe e mostra o site. Aparece só na primeira entrada de cada
// visita; clique ou tecla para pular.
const deveMostrar = (() => {
  try {
    if (new URLSearchParams(window.location.search).has("abertura")) return true; // endereço com ?abertura: para rever a abertura
    return !reduzido() && !sessionStorage.getItem("abertura");
  } catch {
    return false;
  }
})();

// as animações do site esperam a abertura terminar para não acontecerem por baixo dela
const retomar = () => gsap.globalTimeline.resume();
if (deveMostrar) {
  gsap.globalTimeline.pause();
  setTimeout(retomar, 3500); // segurança: o site nunca fica parado
}

export default function Abertura() {
  const [fase, setFase] = useState<"pre" | "entra" | "sai" | "fim">(deveMostrar ? "pre" : "fim");

  useEffect(() => {
    if (!deveMostrar) return;
    try { sessionStorage.setItem("abertura", "1"); } catch { /* sem armazenamento: aparece de novo, sem problema */ }
    let vivo = true;
    let tSai: ReturnType<typeof setTimeout>;
    let raf = 0;
    // espera a letra manuscrita carregar (no máximo 0,9 s) para o nome não trocar de fonte no meio da animação
    const fonte = document.fonts ? document.fonts.load('1em "La Belle Aurore"').catch(() => undefined) : Promise.resolve();
    Promise.race([fonte, new Promise((ok) => setTimeout(ok, 900))]).then(() => {
      if (!vivo) return;
      raf = requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!vivo) return;
        setFase("entra");
        tSai = setTimeout(() => setFase((f) => (f === "entra" ? "sai" : f)), 1500);
      }));
    });
    const tFim = setTimeout(() => setFase("fim"), 3800);
    const pular = () => setFase((f) => (f === "fim" ? f : "sai"));
    window.addEventListener("keydown", pular);
    return () => { vivo = false; cancelAnimationFrame(raf); clearTimeout(tSai); clearTimeout(tFim); window.removeEventListener("keydown", pular); };
  }, []);

  useEffect(() => {
    if (fase === "sai" || fase === "fim") retomar();
    if (fase === "sai") {
      const t = setTimeout(() => setFase("fim"), 750);
      return () => clearTimeout(t);
    }
  }, [fase]);

  if (fase === "fim") return null;
  const desenhado = fase !== "pre";

  return (
    <div
      aria-hidden="true"
      onClick={() => setFase("sai")}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        background: cores.gesso,
        cursor: "pointer",
        transform: fase === "sai" ? "translateY(-100%)" : "translateY(0)",
        transition: "transform 650ms cubic-bezier(.7,0,.2,1)",
      }}
    >
      <div className="flex w-[min(86vw,58rem)] flex-col items-center">
        <span
          className="font-assinatura inline-block whitespace-nowrap pb-[0.12em] pr-[0.1em] text-[clamp(2.6rem,12vw,10rem)] leading-[1.1] text-tinta"
          style={{
            clipPath: desenhado ? "inset(-10% -2% -10% 0)" : "inset(-10% 100% -10% 0)",
            transition: "clip-path 850ms cubic-bezier(.45,0,.25,1)",
          }}
        >
          {artista.nome}
        </span>
        <svg viewBox="0 0 400 40" fill="none" className="-mt-[1.2vw] block w-[min(62vw,44rem)]" style={{ overflow: "visible" }}>
          <path
            d="M4 22 C60 8 120 28 190 16 S320 10 396 18"
            pathLength={1}
            stroke={cores.vermelhao}
            strokeWidth="7"
            strokeLinecap="round"
            style={{ strokeDasharray: 1, strokeDashoffset: desenhado ? 0 : 1, transition: "stroke-dashoffset 650ms cubic-bezier(.5,0,.2,1) 450ms" }}
          />
          <path
            d="M30 33 C90 22 150 38 220 29 S330 25 372 31"
            pathLength={1}
            stroke={cores.ouro}
            strokeWidth="2.2"
            strokeLinecap="round"
            style={{ strokeDasharray: 1, strokeDashoffset: desenhado ? 0 : 1, transition: "stroke-dashoffset 600ms cubic-bezier(.5,0,.2,1) 700ms" }}
          />
        </svg>
      </div>
    </div>
  );
}
