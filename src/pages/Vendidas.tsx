import { useLayoutEffect, useRef, useState } from "react";
import { gsap, reduzido } from "../lib/scroll";
import PaginaTopo from "../components/PaginaTopo";
import Quadro from "../components/Quadro";
import Sala from "../components/Sala";
import { TLink } from "../components/Transicao";
import { Obra, medidaTexto, obras, paginas, textos } from "../data/clinic";

const cor = paginas[3].cor;

export default function Vendidas() {
  const vendidas = obras.filter((o) => o.status === "vendida");
  const [aberta, setAberta] = useState<Obra | null>(null);
  const secao = useRef<HTMLElement>(null);

  // carimbos "vendida" batem na tela quando entram na vista
  useLayoutEffect(() => {
    if (reduzido()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".selo").forEach((s, i) => {
        gsap.from(s, {
          scale: 3.2, rotate: -25, opacity: 0, duration: 0.45, ease: "back.in(1.6)", delay: 0.15,
          scrollTrigger: { trigger: s, start: "top 92%", toggleActions: "play none none none", horizontal: false },
        });
      });
    }, secao);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <PaginaTopo titulo="Vendidas" frase={paginas[3].frase} cor={cor} imagem={paginas[3].img} />
      <section ref={secao} className="mx-auto max-w-[1400px] px-5 py-16 md:px-9 md:py-24" aria-labelledby="corredor">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 id="corredor" className="m-0 text-[clamp(2.4rem,6vw,5.5rem)] font-extrabold">
            Telas que já têm parede
          </h2>
          <p className="m-0 max-w-sm text-lg italic">Clique em uma tela para vê-la ampliada.</p>
        </div>
        <ul className="m-0 mt-14 list-none columns-2 gap-x-5 p-0 sm:gap-x-12 lg:columns-3">
          {vendidas.map((o, i) => (
            <li key={o.id} className="mb-10 break-inside-avoid md:mb-14">
              <Quadro obra={o} selo prioridade={i < 4} onClick={() => setAberta(o)} />
              <p className="m-0 mt-1 text-[0.85rem] italic leading-snug text-tinta/65 md:text-[0.95rem]">
                {[o.tecnica, !o.semMedida && medidaTexto(o.dim)].filter(Boolean).join(" · ")}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-tinta px-5 py-24 text-gesso md:px-9 md:py-32">
        <div className="mx-auto grid max-w-[1400px] gap-10 md:grid-cols-[1.2fr_1fr] md:items-end">
          <h2 className="m-0 text-[clamp(2.4rem,6vw,5.5rem)] font-extrabold">A próxima parede pode ser a sua.</h2>
          <div>
            <p className="m-0 text-xl italic text-gesso/85">{textos.encomenda}</p>
            <TLink to="/contato" className="display mt-8 inline-block bg-ouro px-6 py-4 text-base font-bold text-tinta">
              Quero uma tela sob medida
            </TLink>
          </div>
        </div>
      </section>
      {aberta && <Sala obra={aberta} fechar={() => setAberta(null)} />}
    </>
  );
}
