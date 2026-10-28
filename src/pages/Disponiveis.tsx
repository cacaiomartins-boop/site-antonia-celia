import { useState } from "react";
import PaginaTopo from "../components/PaginaTopo";
import Quadro from "../components/Quadro";
import Sala from "../components/Sala";
import { Obra, medidaTexto, obras, paginas } from "../data/clinic";
import { estadoDe, useLoja } from "../lib/loja";
import { RetornoReserva } from "../components/Reserva";

const cor = paginas[2].cor;
// primeiro valor em reais da linha de preço (ex.: "R$ 5.600,00 cada · ..." vira 5600)
const valor = (o: Obra) => {
  const m = o.preco?.match(/R\$\s*([\d.]+),/);
  return m ? Number(m[1].replace(/\./g, "")) : Infinity;
};
const ordens: { id: string; nome: string; cmp?: (a: Obra, b: Obra) => number }[] = [
  { id: "padrao", nome: "Destaques" },
  { id: "menor", nome: "Menor valor", cmp: (a, b) => valor(a) - valor(b) },
  { id: "maior", nome: "Maior valor", cmp: (a, b) => valor(b) - valor(a) },
];
const filtros: { id: string; nome: string; ok: (o: Obra) => boolean }[] = [
  { id: "todas", nome: "Todas", ok: () => true },
  { id: "grandes", nome: "Grandes (acima de 1,5 m)", ok: (o) => Math.max(...o.dim) > 150 },
  { id: "medias", nome: "Médias", ok: (o) => Math.max(...o.dim) <= 150 },
  { id: "dipticos", nome: "Dípticos", ok: (o) => !!o.diptico },
];

export default function Disponiveis() {
  const [f, setF] = useState("todas");
  const { loja, atualizar } = useLoja();
  const [ordem, setOrdem] = useState("padrao");
  const [aberta, setAberta] = useState<Obra | null>(null);
  // volta da página de pagamento: o endereço traz ?reserva=...&t=...
  const [retorno, setRetorno] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return p.get("reserva") && p.get("t") ? { id: p.get("reserva")!, token: p.get("t")! } : null;
  });
  const cmp = ordens.find((x) => x.id === ordem)!.cmp;
  const lista = obras.filter((o) => ["disponivel", "reservada"].includes(estadoDe(o, loja))).filter(filtros.find((x) => x.id === f)!.ok);
  if (cmp) lista.sort(cmp);
  return (
    <>
      <PaginaTopo titulo="Disponíveis" frase={paginas[2].frase} cor={cor} imagem={paginas[2].img} />
      <section className="mx-auto max-w-[1400px] px-5 py-16 md:px-9 md:py-24">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <p className="m-0 max-w-xl font-serif text-[clamp(1.4rem,2.3vw,2rem)] leading-[1.3]">
            Clique em uma tela para vê-la ampliada, com medida e valor.
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

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-tinta/20 py-4 text-base">
          <p className="m-0 font-bold">{lista.length} {lista.length === 1 ? "tela" : "telas"}</p>
          <label className="flex items-center gap-3">
            <span className="text-tinta/70">Ordenar por</span>
            <select value={ordem} onChange={(e) => setOrdem(e.target.value)} className="border-2 border-tinta bg-transparent px-3 py-2 font-bold">
              {ordens.map((x) => <option key={x.id} value={x.id}>{x.nome}</option>)}
            </select>
          </label>
        </div>

        <ul className="m-0 mt-14 list-none columns-2 gap-x-5 p-0 sm:gap-x-12 lg:columns-3">
          {lista.map((o) => (
            <li key={o.id} className="mb-10 break-inside-avoid md:mb-14">
              <Quadro obra={o} rotulo={estadoDe(o, loja) === "reservada" ? "Reservada" : undefined} onClick={() => setAberta(o)} />
              <p className="m-0 mt-1 text-[0.85rem] italic leading-snug text-tinta/65 md:text-[0.95rem]">
                {[o.tecnica, medidaTexto(o.dim)].filter(Boolean).join(" · ")}
              </p>
              {o.preco && <p className="m-0 mt-1 text-[0.95rem] font-bold leading-snug md:text-[1.05rem]">{o.preco}</p>}
            </li>
          ))}
        </ul>
        {lista.length === 0 && <p className="mt-10 text-xl italic">Nenhuma tela neste filtro. Tente outro.</p>}
      </section>
      {aberta && <Sala obra={aberta} loja={loja} fechar={() => setAberta(null)} />}
      {retorno && (
        <RetornoReserva
          id={retorno.id}
          token={retorno.token}
          fechar={() => { window.history.replaceState(null, "", window.location.pathname); setRetorno(null); atualizar(); }}
        />
      )}
    </>
  );
}
