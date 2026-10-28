import { useEffect, useRef, useState, type FormEvent } from "react";
import { Obra, links, reserva } from "../data/clinic";
import { dataCurta } from "../lib/loja";
import { parar, seguir } from "../lib/scroll";

type Visao = { id: string; status: string; obra: string; ate: string; checkoutUrl?: string; valor: number; simulado: boolean; token?: string };

const reais = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const campo = "mt-1 block w-full border-2 border-gesso/40 bg-transparent px-3 py-3 text-lg text-gesso placeholder:text-gesso/40 focus:border-ouro focus:outline-none";

async function chamar<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, init);
  const j = (await r.json().catch(() => ({}))) as T & { erro?: string };
  if (!r.ok) throw new Error(j.erro ?? "Algo deu errado. Tente de novo.");
  return j;
}

// Reservar: nome e WhatsApp, e segue para a página de pagamento (Pix ou cartão).
export default function Reserva({ obra, voltar }: { obra: Obra; voltar: () => void }) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setErro("");
    setEnviando(true);
    try {
      const v = await chamar<Visao>("/api/reservar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ obraId: obra.id, nome: f.get("nome"), telefone: f.get("telefone"), site: f.get("site") /* campo-isca */ }),
      });
      if (!v.checkoutUrl) throw new Error("Não foi possível abrir o pagamento. Tente de novo.");
      window.location.href = v.checkoutUrl; // volta para o site depois de pagar
    } catch (x) {
      setErro((x as Error).message);
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} noValidate>
      <button type="button" onClick={voltar} className="mb-5 bg-transparent p-0 text-sm text-gesso/70 underline underline-offset-4">Voltar</button>
      <h3 className="m-0 text-3xl font-extrabold">Reservar {obra.titulo}</h3>
      <p className="mt-3 text-lg text-gesso/85">Sinal de <b>{reais(reserva.sinal)}</b>, abatido do valor da tela. Ela fica sua por {reserva.dias} dias.</p>

      <label className="mt-6 block text-gesso/80">Seu nome<input name="nome" autoComplete="name" required className={campo} /></label>
      <label className="mt-4 block text-gesso/80">WhatsApp com DDD<input name="telefone" type="tel" autoComplete="tel" required placeholder="(61) 99999-9999" className={campo} /></label>
      {/* campo-isca contra robôs: fica fora da tela */}
      <div aria-hidden className="absolute -left-[9999px]"><label>Site<input name="site" tabIndex={-1} autoComplete="off" /></label></div>

      {erro && <p role="alert" className="mt-4 text-[#ff9b8f]">{erro}</p>}
      <button type="submit" disabled={enviando} className="display mt-6 bg-ouro px-6 py-4 text-base font-bold text-tinta disabled:opacity-60">
        {enviando ? "Abrindo o pagamento..." : "Ir para o pagamento"}
      </button>
      <p className="mt-3 text-sm text-gesso/65">Você escolhe Pix ou cartão na próxima tela.</p>

      <details className="mt-5 text-sm text-gesso/75">
        <summary className="cursor-pointer underline underline-offset-4">Condições da reserva</summary>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          {reserva.condicoes.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </details>
      <p className="mt-3 text-sm text-gesso/60">Ao continuar, você concorda com as condições da reserva.</p>
    </form>
  );
}

// Tela de volta do pagamento (o endereço traz ?reserva=...&t=...): confirma, espera ou avisa que não deu.
export function RetornoReserva({ id, token, fechar }: { id: string; token: string; fechar: () => void }) {
  const [v, setV] = useState<Visao | null>(null);
  const [erro, setErro] = useState("");
  const botao = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    parar();
    botao.current?.focus();
    return () => seguir();
  }, []);

  useEffect(() => {
    let vivo = true;
    const ler = async () => {
      try { const x = await chamar<Visao>(`/api/reserva?id=${id}&token=${token}`); if (vivo) setV(x); }
      catch (e) { if (vivo) setErro((e as Error).message); }
    };
    ler();
    const t = setInterval(() => { if (!v || v.status === "aguardando_pagamento") ler(); }, 4000);
    return () => { vivo = false; clearInterval(t); };
  }, [id, token, v?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const simular = async () => {
    try { setV(await chamar<Visao>("/api/simular", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, token }) })); }
    catch (e) { setErro((e as Error).message); }
  };

  const zap = links.whatsapp(`Olá, Antônia! Tenho uma dúvida sobre a minha reserva${v ? ` da tela "${v.obra}"` : ""}.`);
  const caixa = "mx-auto max-w-xl";

  let conteudo;
  if (erro && !v) {
    conteudo = (
      <div className={caixa}>
        <h2 className="m-0 text-3xl font-extrabold">Não encontramos a sua reserva.</h2>
        <p className="mt-4 text-lg text-gesso/85">{erro} Se você chegou a pagar, fale com a artista pelo WhatsApp.</p>
      </div>
    );
  } else if (!v) {
    conteudo = <p className={`${caixa} text-lg`}>Confirmando o seu pagamento...</p>;
  } else if (v.status === "reservada" || v.status === "vendida") {
    conteudo = (
      <div className={caixa}>
        <p className="display m-0 text-sm font-bold uppercase tracking-[0.12em] text-ouro">Reserva confirmada</p>
        <h2 className="m-0 mt-3 text-4xl font-extrabold">{v.obra} é sua até {dataCurta(v.ate)}.</h2>
        <p className="mt-5 text-lg text-gesso/85">
          Recebemos o sinal de {reais(v.valor)}. A Antônia, ou quem ela indicar, vai entrar em contato pelo WhatsApp que você informou para combinar o valor final, a entrega e a instalação. O sinal é abatido do valor da tela.
        </p>
        <a href={zap} target="_blank" rel="noreferrer" className="display mt-8 inline-block border-2 border-gesso/60 px-6 py-3 text-base font-bold">Falar com a artista agora</a>
      </div>
    );
  } else if (v.status === "aguardando_pagamento") {
    conteudo = (
      <div className={caixa}>
        <h2 className="m-0 text-3xl font-extrabold">Aguardando o pagamento de {v.obra}</h2>
        <p className="mt-4 text-lg text-gesso/85">
          Assim que o pagamento for confirmado, esta tela avisa sozinha. Pix costuma levar poucos segundos. Se você fechou a página de pagamento sem terminar, é possível retomar por ela.
        </p>
        {v.checkoutUrl && !v.simulado && (
          <a href={v.checkoutUrl} className="display mt-6 inline-block bg-ouro px-6 py-4 text-base font-bold text-tinta">Voltar ao pagamento</a>
        )}
        {v.simulado && (
          <div className="mt-6 border-2 border-dashed border-ouro p-4 text-sm">
            <p className="m-0">Modo de teste: aqui abriria a página do banco. Nada é cobrado.</p>
            <button type="button" onClick={simular} className="display mt-3 border-2 border-ouro px-4 py-2 font-bold text-ouro">Simular pagamento aprovado</button>
          </div>
        )}
      </div>
    );
  } else {
    conteudo = (
      <div className={caixa}>
        <h2 className="m-0 text-3xl font-extrabold">O pagamento não foi concluído.</h2>
        <p className="mt-4 text-lg text-gesso/85">A tela foi liberada. Se você ainda quiser, é só reservar de novo. Se chegou a pagar, fale com a artista e resolvemos.</p>
        <a href={zap} target="_blank" rel="noreferrer" className="display mt-8 inline-block border-2 border-gesso/60 px-6 py-3 text-base font-bold">Falar com a artista</a>
      </div>
    );
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Reserva" className="fixed inset-0 z-[78] overflow-y-auto bg-tinta text-gesso" data-lenis-prevent>
      <div className="flex min-h-full items-center px-5 py-24">{conteudo}</div>
      <button ref={botao} type="button" onClick={fechar} className="display fixed right-5 top-5 z-[80] bg-gesso px-4 py-2 text-sm font-bold text-tinta md:right-9 md:top-6">
        Fechar
      </button>
    </div>
  );
}
