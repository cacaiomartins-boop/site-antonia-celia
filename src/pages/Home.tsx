import { useLayoutEffect, useRef } from "react";
import { gsap, reduzido } from "../lib/scroll";
import TelaViva from "../components/TelaViva";
import Quadro from "../components/Quadro";
import { TLink } from "../components/Transicao";
import { obras, paginas } from "../data/clinic";

const destaques = ["caminhos-iv", "tons-beringela", "cerrado", "ser-feliz-sim", "dialogo", "brincadeira-de-crianca", "luz-da-lua"]
  .map((id) => obras.find((o) => o.id === id)!)
  .filter(Boolean);

function Corredor() {
  const secao = useRef<HTMLElement>(null);
  const trilho = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (reduzido()) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      const dist = () => Math.max(0, trilho.current!.scrollWidth - window.innerWidth);
      gsap.to(trilho.current, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: { trigger: secao.current, pin: true, scrub: 0.8, end: () => "+=" + dist(), invalidateOnRefresh: true },
      });
    });
    return () => mm.revert();
  }, []);
  return (
    <section ref={secao} className="relative overflow-hidden bg-gesso py-16 md:flex md:h-[100svh] md:items-center md:py-0" aria-labelledby="corredor-titulo">
      <div ref={trilho} className="flex flex-col gap-8 px-5 md:flex-row md:items-center md:gap-20 md:px-9">
        <div className="shrink-0 md:w-[34vw] md:pr-10">
          <h2 id="corredor-titulo" className="m-0 text-[clamp(2.6rem,6vw,5.5rem)] font-extrabold">
            Telas recentes
          </h2>
          <p className="mt-4 max-w-sm text-lg italic"><span className="md:hidden">Deslize para o lado.</span><span className="max-md:hidden">Role para caminhar pelo corredor.</span> Cada tela tem a medida real escrita na legenda.</p>
        </div>
        <div className="sem-scroll -mx-5 flex items-center gap-8 overflow-x-auto px-5 max-md:pb-2 md:contents">
          {destaques.map((o) => (
            <div key={o.id} className="shrink-0">
              <TLink to="/disponiveis" className="block no-underline">
                <Quadro obra={o} altura="clamp(250px,50svh,620px)" inclinar />
              </TLink>
            </div>
          ))}
          <div className="shrink-0 pl-2 pr-9 md:pl-4 md:pr-[10vw]">
            <TLink to="/disponiveis" className="display whitespace-nowrap text-[clamp(1.6rem,4vw,3.4rem)] font-extrabold underline decoration-4 underline-offset-[10px]">
              Ver todas as telas
            </TLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function Portas() {
  const lista = paginas.filter((p) => p.rota !== "/contato");
  return (
    <section className="flex flex-col md:h-[86svh] md:flex-row" aria-label="Explorar o site">
      {lista.map((p) => (
        <TLink
          key={p.rota}
          to={p.rota}
          style={{ background: p.cor }}
          className="group relative flex min-h-[34svh] flex-1 flex-col justify-end overflow-hidden p-5 text-gesso transition-[flex-grow] duration-500 ease-[cubic-bezier(.2,.8,.2,1)] md:p-8 md:hover:flex-[2.4] md:focus-visible:flex-[2.4]"
        >
          <img src={p.img} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
          <span className="display relative text-[clamp(2rem,3.4vw,3.6rem)] font-extrabold leading-[0.95]">{p.nome}</span>
          <span className="relative mt-3 max-w-xs text-lg italic md:translate-y-3 md:opacity-0 md:transition-all md:duration-500 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-visible:translate-y-0 md:group-focus-visible:opacity-100">
            {p.frase}
          </span>
        </TLink>
      ))}
    </section>
  );
}

export default function Home() {
  return (
    <>
      <TelaViva />
      <Corredor />
      <Portas />
    </>
  );
}
