import { useEffect, useRef, useState } from "react";
import { Obra, links, medidaTexto, reserva } from "../data/clinic";
import { dataCurta, estadoDe, type Loja } from "../lib/loja";
import Reserva from "./Reserva";
import { telaProvisoria } from "../lib/placeholder";
import { parar, seguir } from "../lib/scroll";

// Ficha da obra: a foto ampliada, com título, medida, valor e o botão do WhatsApp.
export default function Sala({ obra, loja, fechar }: { obra: Obra; loja: Loja; fechar: () => void }) {
  const [foto, setFoto] = useState(true);
  const [reservando, setReservando] = useState(false);
  const estado = estadoDe(obra, loja);
  const fecharBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    parar();
    fecharBtn.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && fechar();
    window.addEventListener("keydown", esc);
    return () => { window.removeEventListener("keydown", esc); seguir(); };
  }, [fechar]);

  const msg = `Olá, Antônia! Vi a tela "${obra.titulo}" (${medidaTexto(obra.dim)}${obra.preco ? `, ${obra.preco}` : ""}) no seu site e gostaria de saber mais.`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${obra.titulo}, ficha da obra`}
      className="fixed inset-0 z-[75] overflow-y-auto bg-tinta/95 text-gesso backdrop-blur-sm"
      data-lenis-prevent
      onClick={(e) => e.target === e.currentTarget && fechar()}
    >
      <div
        className="mx-auto grid min-h-full max-w-[1400px] gap-8 px-5 py-20 md:grid-cols-[1.7fr_1fr] md:items-center md:gap-12 md:px-9"
        onClick={(e) => e.target === e.currentTarget && fechar()}
      >
        <div className="flex justify-center">
          {foto ? (
            <img
              src={`/img/obras/${obra.id}.jpg`}
              alt={[obra.titulo, obra.tecnica?.toLowerCase(), obra.ano].filter(Boolean).join(", ")}
              onError={() => setFoto(false)}
              draggable={false}
              className="block h-auto max-h-[72svh] w-auto max-w-full shadow-[0_24px_50px_-18px_rgba(0,0,0,.7)] md:max-h-[84svh]"
            />
          ) : (
            <div
              aria-hidden
              className="max-h-[72svh] w-full max-w-full shadow-[0_24px_50px_-18px_rgba(0,0,0,.7)] md:max-h-[84svh]"
              style={{ aspectRatio: String(obra.dim[1] / obra.dim[0]), backgroundImage: telaProvisoria(obra, obra.dim[1] < obra.dim[0]), backgroundSize: "100% 100%" }}
            />
          )}
        </div>

        <div>
          {reservando ? (
            <Reserva obra={obra} voltar={() => setReservando(false)} />
          ) : (
            <>
              <h2 className="m-0 text-[clamp(2.2rem,4.4vw,4rem)] font-extrabold">{obra.titulo}</h2>
              <dl className="m-0 mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-lg">
                {obra.tecnica && <><dt className="text-gesso/60">Técnica</dt><dd className="m-0">{obra.tecnica}</dd></>}
                <dt className="text-gesso/60">Medida</dt><dd className="m-0">{medidaTexto(obra.dim)}</dd>
                {obra.ano && <><dt className="text-gesso/60">Ano</dt><dd className="m-0">{obra.ano}</dd></>}
                {obra.preco && <><dt className="text-gesso/60">Valor</dt><dd className="m-0 font-bold">{obra.preco}</dd></>}
              </dl>
              {obra.detalhe && <p className="mt-4 italic text-gesso/80">{obra.detalhe}</p>}

              {estado === "vendida" && (
                <p className="mt-8 text-lg">Esta tela já encontrou casa. A Antônia pode pintar outra parecida para o seu espaço.</p>
              )}
              {estado === "reservada" && (
                <>
                  <p className="mt-8 border-l-4 border-ouro pl-4 text-lg">Esta tela está reservada até {dataCurta(loja.reservadas[obra.id])}. Se a reserva não for concluída, ela volta a ficar disponível.</p>
                  <a href={links.whatsapp(msg)} target="_blank" rel="noreferrer" className="display mt-6 inline-block border-2 border-gesso/60 px-6 py-3 text-base font-bold">Falar com a artista</a>
                </>
              )}
              {estado === "disponivel" && (
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  {loja.ativo ? (
                    <>
                      <button type="button" onClick={() => setReservando(true)} className="display bg-ouro px-6 py-4 text-base font-bold text-tinta">
                        Reservar
                      </button>
                      <a href={links.whatsapp(msg)} target="_blank" rel="noreferrer" className="display border-2 border-gesso/60 px-6 py-3.5 text-base font-bold">Falar com a artista</a>
                    </>
                  ) : (
                    <a href={links.whatsapp(msg)} target="_blank" rel="noreferrer" className="display bg-ouro px-6 py-4 text-base font-bold text-tinta">
                      Quero saber mais sobre esta tela
                    </a>
                  )}
                </div>
              )}
              <p className="mt-4 text-sm text-gesso/60">
                {loja.ativo && estado === "disponivel"
                  ? `Reserve com um sinal de R$ ${reserva.sinal} (Pix ou cartão), abatido do valor. Valor final, entrega e instalação são combinados direto com a artista.`
                  : "A conversa é direta com a artista, pelo WhatsApp. Entrega e instalação são combinadas ali."}
              </p>
            </>
          )}
        </div>
      </div>
      <button ref={fecharBtn} type="button" onClick={fechar} className="display fixed right-5 top-5 z-[80] bg-gesso px-4 py-2 text-sm font-bold text-tinta md:right-9 md:top-6">
        Fechar
      </button>
    </div>
  );
}
