import { useEffect, useRef, useState, type PointerEvent as PEvt } from "react";
import { Obra, cores, links, medidaTexto } from "../data/clinic";
import Quadro from "./Quadro";
import { parar, seguir } from "../lib/scroll";

const PAREDES = [
  { nome: "Gesso", cor: "#E9E6DE" },
  { nome: "Cinza", cor: "#9A9A94" },
  { nome: "Grafite", cor: "#2E2F33" },
  { nome: "Verde", cor: "#3D4A3A" },
  { nome: "Terracota", cor: "#B86A4B" },
];
const ESC = 1.5; // px por cm no desenho (parede de 800px = ~5,3 m)

// Ficha da obra + simulador: a tela aparece no tamanho real sobre um sofá
// de 2,10 m e pode ser arrastada pela parede.
export default function Sala({ obra, fechar }: { obra: Obra; fechar: () => void }) {
  const [parede, setParede] = useState(0);
  const [pessoa, setPessoa] = useState(false);
  const [x, setX] = useState(0); // deslocamento horizontal em px do desenho
  const caixa = useRef<HTMLDivElement>(null);
  const fecharBtn = useRef<HTMLButtonElement>(null);

  const largCm = obra.dim[1] >= obra.dim[0] ? Math.max(...obra.dim) : Math.min(...obra.dim);
  const altCm = obra.dim[1] >= obra.dim[0] ? Math.min(...obra.dim) : Math.max(...obra.dim);
  const W = 800, H = 420, chao = 380;
  const sofaW = 210 * ESC, sofaH = 85 * ESC;
  const qW = largCm * ESC, qH = altCm * ESC;
  const baixo = Math.max(chao - sofaH - 20 * ESC, 10 + qH);
  const topo = baixo - qH;

  useEffect(() => {
    parar();
    fecharBtn.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && fechar();
    window.addEventListener("keydown", esc);
    return () => { window.removeEventListener("keydown", esc); seguir(); };
  }, [fechar]);

  const arrastar = (e: PEvt) => {
    const el = caixa.current!;
    el.setPointerCapture(e.pointerId);
    const escala = el.getBoundingClientRect().width / W;
    const x0 = e.clientX, ini = x;
    const mover = (ev: PointerEvent) => {
      const lim = (W - qW) / 2 - 8;
      setX(Math.max(-lim, Math.min(lim, ini + (ev.clientX - x0) / escala)));
    };
    const soltar = () => { el.removeEventListener("pointermove", mover); el.removeEventListener("pointerup", soltar); };
    el.addEventListener("pointermove", mover);
    el.addEventListener("pointerup", soltar);
  };

  const msg = `Olá, Antônia! Vi a tela "${obra.titulo}" (${medidaTexto(obra.dim)}) no seu site e gostaria de saber mais.`;

  return (
    <div role="dialog" aria-modal="true" aria-label={`${obra.titulo}, ficha e simulador`} className="fixed inset-0 z-[75] overflow-y-auto bg-tinta/95 text-gesso backdrop-blur-sm" data-lenis-prevent>
      <div className="mx-auto grid min-h-full max-w-[1400px] gap-8 px-5 py-20 md:grid-cols-[1.6fr_1fr] md:items-center md:px-9">
        <div>
          <div
            ref={caixa}
            className="relative w-full select-none overflow-hidden"
            style={{ aspectRatio: `${W} / ${H}`, background: PAREDES[parede].cor, touchAction: "pan-y" }}
          >
            {/* rodapé e chão */}
            <div className="absolute inset-x-0 bottom-0" style={{ top: `${(chao / H) * 100}%`, background: "#6b5846" }} />
            <div className="absolute inset-x-0 h-[1.2%] bg-black/15" style={{ top: `${(chao / H) * 100 - 1.2}%` }} />
            {/* sofá */}
            <div className="absolute rounded-t-[14px]" style={{ left: `${((W - sofaW) / 2 / W) * 100}%`, width: `${(sofaW / W) * 100}%`, top: `${((chao - sofaH) / H) * 100}%`, height: `${(sofaH / H) * 100}%`, background: "#40454d" }}>
              <div className="absolute inset-x-[4%] bottom-0 h-[46%] rounded-t-md bg-[#565c66]" />
              <div className="absolute -left-[3%] bottom-0 h-[70%] w-[6%] rounded-t-md bg-[#363a41]" />
              <div className="absolute -right-[3%] bottom-0 h-[70%] w-[6%] rounded-t-md bg-[#363a41]" />
            </div>
            {/* pessoa de 1,70 m para dar escala */}
            {pessoa && (
              <div className="absolute" style={{ left: `${((W - sofaW) / 2 / W) * 100 - 9}%`, width: `${((46 * ESC) / W) * 100}%`, top: `${((chao - 170 * ESC) / H) * 100}%`, height: `${((170 * ESC) / H) * 100}%` }} aria-hidden>
                <div className="mx-auto h-[13%] w-[40%] rounded-full bg-black/55" />
                <div className="mx-auto mt-[3%] h-[85%] w-full rounded-t-[40%] bg-black/45" />
              </div>
            )}
            {/* a tela, arrastável */}
            <div
              onPointerDown={arrastar}
              className="absolute cursor-grab active:cursor-grabbing"
              style={{ left: `${((W - qW) / 2 + x) / W * 100}%`, width: `${(qW / W) * 100}%`, top: `${(topo / H) * 100}%` }}
              data-cursor="arrastar"
            >
              <Quadro obra={obra} legenda={false} inclinar={false} />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
            <span className="italic text-gesso/70">Arraste a tela pela parede. O sofá tem 2,10 m.</span>
            <div className="flex items-center gap-2" role="group" aria-label="Cor da parede">
              {PAREDES.map((p, i) => (
                <button key={p.nome} type="button" aria-label={`Parede ${p.nome}`} aria-pressed={parede === i} onClick={() => setParede(i)}
                  className="h-6 w-6 rounded-full border border-gesso/40" style={{ background: p.cor, transform: parede === i ? "scale(1.3)" : undefined }} />
              ))}
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={pessoa} onChange={(e) => setPessoa(e.target.checked)} className="h-4 w-4 accent-[#C9A24B]" />
              Mostrar uma pessoa de 1,70 m
            </label>
          </div>
        </div>

        <div>
          <h2 className="m-0 text-[clamp(2.2rem,4.4vw,4rem)] font-extrabold">{obra.titulo}</h2>
          <dl className="m-0 mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-lg">
            <dt className="text-gesso/60">Técnica</dt><dd className="m-0">{obra.tecnica}</dd>
            <dt className="text-gesso/60">Medida</dt><dd className="m-0">{medidaTexto(obra.dim)}</dd>
            <dt className="text-gesso/60">Ano</dt><dd className="m-0">{obra.ano}</dd>
          </dl>
          {obra.detalhe && <p className="mt-4 italic text-gesso/80">{obra.detalhe}</p>}
          {obra.status === "disponivel" ? (
            <a href={links.whatsapp(msg)} target="_blank" rel="noreferrer" className="display mt-8 inline-block bg-ouro px-6 py-4 text-base font-bold text-tinta">
              Quero saber mais sobre esta tela
            </a>
          ) : (
            <p className="mt-8 text-lg">Esta tela já encontrou casa. A Antonia pode pintar outra parecida para o seu espaço.</p>
          )}
          <p className="mt-4 text-sm text-gesso/60">A conversa é direta com a artista, pelo WhatsApp. Valores e entrega são combinados ali.</p>
        </div>
      </div>
      <button ref={fecharBtn} type="button" onClick={fechar} className="display fixed right-5 top-5 z-[80] bg-gesso px-4 py-2 text-sm font-bold text-tinta md:right-9 md:top-6">
        Fechar
      </button>
    </div>
  );
}
