import { useLayoutEffect, useRef, useState } from "react";
import { gsap, reduzido } from "../lib/scroll";
import PaginaTopo from "../components/PaginaTopo";
import Quadro from "../components/Quadro";
import Sala from "../components/Sala";
import { TLink } from "../components/Transicao";
import { Obra, obras, paginas, textos } from "../data/clinic";

const cor = paginas[3].cor;

export default function Vendidas() {
  const vendidas = obras.filter((o) => o.status === "vendida");
  const [aberta, setAberta] = useState<Obra | null>(null);
  const faixa = useRef<HTMLDivElement>(null);
  const secao = useRef<HTMLElement>(null);

  // arrastar o corredor com o mouse
  useLayoutEffect(() => {
    const el = faixa.current!;
    let down = false, x0 = 0, s0 = 0, moveu = false;
    const d = (e: PointerEvent) => { if (e.pointerType !== "mouse") return; down = true; moveu = false; x0 = e.clientX; s0 = el.scrollLeft; };
    const m = (e: PointerEvent) => { if (!down) return; if (Math.abs(e.clientX - x0) > 4) moveu = true; el.scrollLeft = s0 - (e.clientX - x0); };
    const u = () => { down = false; };
    const clique = (e: MouseEvent) => { if (moveu) { e.stopPropagation(); e.preventDefault(); moveu = false; } };
    el.addEventListener("pointerdown", d); window.addEventListener("pointermove", m); window.addEventListener("pointerup", u);
    el.addEventListener("click", clique, true);
    return () => { el.removeEventListener("pointerdown", d); window.removeEventListener("pointermove", m); window.removeEventListener("pointerup", u); el.removeEventListener("click", clique, true); };
  }, []);

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
      <section ref={secao} className="py-16 md:py-24" aria-labelledby="corredor">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-5 md:flex-row md:items-end md:justify-between md:px-9">
          <h2 id="corredor" className="m-0 text-[clamp(2.4rem,6vw,5.5rem)] font-extrabold">
            {vendidas.length} telas já têm parede
          </h2>
          <p className="m-0 max-w-sm text-lg italic">Arraste para o lado. Clique em uma tela para vê-la no tamanho real.</p>
        </div>
        <div ref={faixa} className="sem-scroll mt-12 flex gap-10 overflow-x-auto px-5 pb-10 md:gap-16 md:px-9" data-cursor="arrastar" data-lenis-prevent-wheel style={{ cursor: "grab" }}>
          {vendidas.map((o) => (
            <div key={o.id} className="shrink-0 self-end">
              <Quadro obra={o} selo altura="clamp(240px,46svh,520px)" onClick={() => setAberta(o)} />
            </div>
          ))}
        </div>
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
