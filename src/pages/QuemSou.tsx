import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap, reduzido } from "../lib/scroll";
import PaginaTopo from "../components/PaginaTopo";
import Palavras from "../components/Palavras";
import FotoAmbiente from "../components/FotoAmbiente";
import { TLink } from "../components/Transicao";
import { ambientes, artista, cores, paginas, textos } from "../data/clinic";

// só mostra as fotos de ambiente que já existem em public/img/ambientes/

const cor = paginas[0].cor;
const ciclo = [cores.vermelhao, cores.oliva, cores.azul, cores.beringela, cores.ouro];

function Assinatura() {
  const ref = useRef<SVGSVGElement>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const t = ref.current.querySelector("text")!;
    const svg = ref.current;
    const centrar = () => {
      const b = t.getBBox();
      if (b.width) svg.setAttribute("viewBox", `${b.x - 24} ${b.y - 16} ${b.width + 48} ${b.height + 32}`);
    };
    centrar();
    document.fonts?.ready.then(centrar);
    if (reduzido()) { gsap.set(t, { strokeDashoffset: 0, fillOpacity: 1 }); return; }
    const ctx = gsap.context(() => {
      gsap.fromTo(t, { strokeDashoffset: 1800, fillOpacity: 0 }, {
        strokeDashoffset: 0, fillOpacity: 1, ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top 85%", end: "top 35%", scrub: 0.6 },
      });
    });
    return () => ctx.revert();
  }, []);
  return (
    <svg ref={ref} viewBox="0 0 900 220" className="mx-auto block h-auto w-full max-w-xl md:max-w-2xl" role="img" aria-label="Assinatura de Antônia Célia">
      <text x="450" y="150" textAnchor="middle" fontFamily="'La Belle Aurore', cursive" fontSize="150" fill="#16130F" stroke="#16130F" strokeWidth="1.6" strokeDasharray="1800" strokeDashoffset="0">
        {artista.nome}
      </text>
    </svg>
  );
}

export default function QuemSou() {
  const [sobre, setSobre] = useState<number | null>(null);
  const [fotos, setFotos] = useState<string[]>([]);
  useEffect(() => {
    ambientes.forEach((a) => {
      const i = new Image();
      i.onload = () => setFotos((f) => (f.includes(a.id) ? f : [...f, a.id]));
      i.src = `/img/ambientes/${a.id}.jpg`;
    });
  }, []);
  const visiveis = ambientes.filter((a) => fotos.includes(a.id));
  return (
    <>
      <PaginaTopo titulo="Quem sou" frase={paginas[0].frase} cor={cor} imagem={paginas[0].img} />

      <section className="mx-auto grid max-w-[1400px] gap-12 px-5 py-24 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:px-9 md:py-36">
        <figure className="m-0 md:sticky md:top-24 md:self-start">
          <img src="/img/antonia-sala.jpg" alt="Antônia Célia sentada no sofá, diante de uma de suas telas" width={685} height={725} className="block w-full shadow-[0_24px_40px_-22px_rgba(22,19,15,.6)]" />
          <figcaption className="mt-3 text-[0.95rem] italic text-tinta/70">{artista.nomeCompleto}, diante de uma de suas telas</figcaption>
        </figure>
        <div className="space-y-10">
          {textos.sobre.map((t, i) => (
            <Palavras key={i} texto={t} className="m-0 font-serif text-[clamp(1.2rem,1.7vw,1.6rem)] leading-[1.5]" />
          ))}
        </div>
      </section>

      <section className="px-5 py-4 md:px-9 md:py-6" aria-label="Assinatura">
        <Assinatura />
      </section>

      <section className="mx-auto flex max-w-[1100px] flex-col items-center px-5 py-20 text-center md:px-9 md:py-28" aria-labelledby="series">
        <h2 id="series" className="m-0 text-[clamp(2.2rem,5vw,4.4rem)] font-extrabold">Séries e fases</h2>
        <ul className="m-0 mt-8 flex list-none flex-wrap justify-center gap-3 p-0">
          {textos.series.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                onMouseEnter={() => setSobre(i)}
                onMouseLeave={() => setSobre(null)}
                onFocus={() => setSobre(i)}
                onBlur={() => setSobre(null)}
                className="display border-2 border-tinta px-5 py-3 text-lg font-bold transition-colors duration-300 md:text-2xl"
                style={sobre === i ? { background: ciclo[i % ciclo.length], color: ciclo[i % ciclo.length] === cores.ouro ? cores.tinta : cores.gesso, borderColor: ciclo[i % ciclo.length] } : undefined}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {visiveis.length > 0 && (
      <section className="bg-tinta px-5 py-24 text-gesso md:px-9 md:py-32" aria-labelledby="amb">
        <div className="mx-auto max-w-[1400px]">
          <h2 id="amb" className="m-0 max-w-3xl text-[clamp(2.2rem,5vw,4.4rem)] font-extrabold">Telas na parede de outras casas</h2>
          <p className="mt-5 max-w-xl text-xl italic text-gesso/80">{textos.encomenda}</p>
          <div className="mt-14 grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-8">
            {visiveis.map((a, i) => (
              <FotoAmbiente key={a.id} id={a.id} legenda={a.legenda} className={i % 2 ? "md:mt-16" : ""} />
            ))}
          </div>
        </div>
      </section>
      )}

      <section className="mx-auto max-w-[1400px] px-5 pt-24 md:px-9" aria-labelledby="crit">
        <h2 id="crit" className="m-0 text-[clamp(2.2rem,5vw,4.4rem)] font-extrabold">O que dizem sobre as telas</h2>
        <div className="mt-12 grid gap-12 md:grid-cols-2 md:gap-16">
          {textos.criticas.map((c) => (
            <figure key={c.autor} className="m-0 border-l-4 pl-6 md:pl-8" style={{ borderColor: cor }}>
              <blockquote className="m-0 space-y-5 font-serif text-[clamp(1.1rem,1.5vw,1.4rem)] leading-[1.5]">
                {c.texto.map((t) => <p key={t} className="m-0">{t}</p>)}
              </blockquote>
              <figcaption className="mt-6 text-base italic text-tinta/70">{c.autor}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-24 md:px-9" aria-labelledby="rec">
        <h2 id="rec" className="m-0 text-[clamp(2.2rem,5vw,4.4rem)] font-extrabold">Reconhecimentos</h2>
        <ul className="m-0 mt-8 list-none divide-y divide-tinta/25 border-y border-tinta/25 p-0">
          {textos.reconhecimentos.map((r) => (
            <li key={r.ano + r.texto} className="grid grid-cols-[5rem_1fr] gap-4 py-5 md:grid-cols-[8rem_1fr]">
              <span className="display text-2xl font-extrabold">{r.ano}</span>
              <span className="text-xl">{r.texto}</span>
            </li>
          ))}
        </ul>
        <div className="mt-12">
          <TLink to="/exposicoes" className="display text-xl font-bold underline decoration-2 underline-offset-8">
            Ver todas as exposições
          </TLink>
        </div>
      </section>
    </>
  );
}
