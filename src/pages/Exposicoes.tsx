import { useEffect, useRef, useState } from "react";
import PaginaTopo from "../components/PaginaTopo";
import ExpoMapa from "../components/ExpoMapa";
import { exposicoes, paginas } from "../data/clinic";

const cor = paginas[1].cor;
const tipoTxt = { individual: "Exposição individual", coletiva: "Mostra coletiva", premio: "Salão e prêmio" } as const;

export default function Exposicoes() {
  const [ativo, setAtivo] = useState(0);
  const itens = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setAtivo(Number((e.target as HTMLElement).dataset.i))),
      { rootMargin: "-42% 0px -48% 0px" }
    );
    itens.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const anoMax = Math.max(...exposicoes.map((e) => e.ano));
  const paises = new Set(exposicoes.map((e) => e.pais)).size;

  return (
    <>
      <PaginaTopo titulo="Exposições" frase={paginas[1].frase} cor={cor} imagem={paginas[1].img} />

      <section className="mx-auto max-w-[1400px] px-5 pt-20 md:px-9 md:pt-28">
        <p className="m-0 max-w-3xl font-serif text-[clamp(1.5rem,2.6vw,2.3rem)] leading-[1.3]">
          Entre {exposicoes[0].ano} e {anoMax}, as telas da Antonia viajaram por {paises} países e foram vistas em salões, museus e galerias.
          Role a página e acompanhe o caminho.
        </p>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 pb-28 pt-12 md:grid md:grid-cols-[1.15fr_1fr] md:gap-12 md:px-9" aria-label="Linha do tempo das exposições">
        <div className="sticky top-[3.6rem] z-10 -mx-5 h-[34svh] bg-gesso px-5 md:top-20 md:mx-0 md:h-[78svh] md:self-start md:bg-transparent md:px-0">
          <ExpoMapa lista={exposicoes} ativo={ativo} cor={cor} />
        </div>

        <ol className="m-0 list-none p-0">
          {exposicoes.map((e, i) => (
            <li
              key={e.id}
              ref={(el) => (itens.current[i] = el)}
              data-i={i}
              className="flex min-h-[46svh] flex-col justify-center border-t border-tinta/20 py-10 transition-opacity duration-500 md:min-h-[58svh]"
              style={{ opacity: ativo === i ? 1 : 0.38 }}
            >
              <span className="display text-[clamp(3.6rem,8vw,7rem)] font-extrabold leading-none" style={{ color: ativo === i ? cor : undefined }}>{e.ano}</span>
              <h2 className="m-0 mt-4 text-[clamp(1.8rem,3.2vw,2.8rem)] font-extrabold leading-[1]">{e.titulo}</h2>
              <p className="m-0 mt-3 text-xl">
                {[...new Set([e.local, e.cidade, e.pais])].join(", ")}
              </p>
              <p className="m-0 mt-1 text-base italic text-tinta/70">{tipoTxt[e.tipo]}</p>
              {e.nota && <p className="m-0 mt-4 max-w-md text-lg">{e.nota}</p>}
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
