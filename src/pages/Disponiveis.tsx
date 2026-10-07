import { useState } from "react";
import PaginaTopo from "../components/PaginaTopo";
import Quadro from "../components/Quadro";
import Sala from "../components/Sala";
import { Obra, obras, paginas } from "../data/clinic";

const cor = paginas[2].cor;
const filtros: { id: string; nome: string; ok: (o: Obra) => boolean }[] = [
  { id: "todas", nome: "Todas", ok: () => true },
  { id: "grandes", nome: "Grandes (acima de 1,5 m)", ok: (o) => Math.max(...o.dim) > 150 },
  { id: "medias", nome: "Médias", ok: (o) => Math.max(...o.dim) <= 150 },
  { id: "dipticos", nome: "Dípticos", ok: (o) => /díptico|I e II/i.test(o.tecnica + o.titulo) },
];

export default function Disponiveis() {
  const [f, setF] = useState("todas");
  const [aberta, setAberta] = useState<Obra | null>(null);
  const lista = obras.filter((o) => o.status === "disponivel").filter(filtros.find((x) => x.id === f)!.ok);
  return (
    <>
      <PaginaTopo titulo="Disponíveis" frase={paginas[2].frase} cor={cor} imagem={paginas[2].img} />
      <section className="mx-auto max-w-[1400px] px-5 py-16 md:px-9 md:py-24">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <p className="m-0 max-w-xl font-serif text-[clamp(1.4rem,2.3vw,2rem)] leading-[1.3]">
            Clique em uma tela para ver a ficha e experimentar como ela fica numa parede, no tamanho real.
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar telas">
            {filtros.map((x) => (
              <button
                key={x.id}
                type="button"
                aria-pressed={f === x.id}
                onClick={() => setF(x.id)}
                className="display whitespace-nowrap border-2 border-tinta px-4 py-2 text-sm font-bold transition-colors"
                style={f === x.id ? { background: cor, borderColor: cor, color: "#FFFFFF" } : undefined}
              >
                {x.nome}
              </button>
            ))}
          </div>
        </div>

        <ul className="m-0 mt-14 list-none columns-2 gap-x-5 p-0 sm:gap-x-12 lg:columns-3">
          {lista.map((o) => (
            <li key={o.id} className="mb-10 break-inside-avoid md:mb-14">
              <Quadro obra={o} onClick={() => setAberta(o)} />
              <p className="m-0 mt-1 text-[0.85rem] italic leading-snug text-tinta/65 md:text-[0.95rem]">{o.tecnica}</p>
            </li>
          ))}
        </ul>
        {lista.length === 0 && <p className="mt-10 text-xl italic">Nenhuma tela neste filtro. Tente outro.</p>}
      </section>
      {aberta && <Sala obra={aberta} fechar={() => setAberta(null)} />}
    </>
  );
}
