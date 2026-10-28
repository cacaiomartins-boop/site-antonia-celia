import { useCallback, useEffect, useState } from "react";
import { dataCurta } from "../lib/loja";

type Item = {
  id: string; obraId: string; obraTitulo: string;
  comprador: { nome: string; telefone: string; email?: string };
  status: string; statusAtual: string; sinal: number; modo: string;
  criadaEm: string; pagaEm?: string; expiraEm: string; devolvido?: boolean;
};

const rotulo: Record<string, string> = {
  aguardando_pagamento: "Aguardando o Pix", reservada: "Reservada (sinal pago)", vendida: "Vendida", liberada: "Liberada",
  expirada: "Prazo vencido", cancelada: "Não pagou a tempo", conflito: "Pagou depois de outra reserva",
};

// Painel da artista: quem reservou o quê. Não aparece no menu; protegido por senha.
export default function Admin() {
  const [senha, setSenha] = useState(() => sessionStorage.getItem("admin") ?? "");
  const [lista, setLista] = useState<Item[] | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const m = document.createElement("meta");
    m.name = "robots"; m.content = "noindex";
    document.head.appendChild(m);
    document.title = "Reservas";
    return () => { m.remove(); };
  }, []);

  const carregar = useCallback(async (s: string) => {
    setMsg("");
    const r = await fetch("/api/admin", { headers: { "x-admin-token": s } });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setLista(null); setMsg(j.erro ?? "Não foi possível abrir."); return; }
    sessionStorage.setItem("admin", s);
    setLista(j.reservas);
  }, []);

  useEffect(() => { if (senha) carregar(senha); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const agir = async (id: string, acao: string, devolverSinal = false) => {
    if (acao === "liberar" && !confirm(devolverSinal ? "Liberar a tela e devolver o sinal?" : "Liberar a tela sem devolver o sinal?")) return;
    if (acao === "devolver" && !confirm("Devolver o sinal?")) return;
    if (acao === "vendida" && !confirm("Marcar como vendida? A tela sai da lista de disponíveis.")) return;
    const r = await fetch("/api/admin", { method: "POST", headers: { "x-admin-token": senha, "Content-Type": "application/json" }, body: JSON.stringify({ id, acao, devolverSinal }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) setMsg(j.erro ?? "Não deu certo.");
    await carregar(senha);
  };

  if (!lista) {
    return (
      <section className="mx-auto max-w-md px-5 py-40">
        <h1 className="m-0 text-4xl font-extrabold">Reservas</h1>
        <form className="mt-8" onSubmit={(e) => { e.preventDefault(); carregar(senha); }}>
          <label className="block">Senha
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} className="mt-1 block w-full border-2 border-tinta bg-transparent px-3 py-3 text-lg" autoFocus />
          </label>
          <button type="submit" className="display mt-4 bg-tinta px-6 py-3 font-bold text-gesso">Entrar</button>
          {msg && <p role="alert" className="mt-4 text-vermelhao">{msg}</p>}
        </form>
      </section>
    );
  }

  const ativas = lista.filter((r) => ["reservada", "aguardando_pagamento"].includes(r.statusAtual));
  const outras = lista.filter((r) => !ativas.includes(r));

  const Cartao = ({ r }: { r: Item }) => {
    const zap = `https://wa.me/55${r.comprador.telefone.replace(/\D/g, "").replace(/^55/, "")}?text=${encodeURIComponent(`Olá, ${r.comprador.nome.split(" ")[0]}! Aqui é da equipe da Antônia Célia, sobre a sua reserva da tela "${r.obraTitulo}".`)}`;
    const pago = Boolean(r.pagaEm);
    return (
      <li className="border-2 border-tinta p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="m-0 text-2xl font-extrabold">{r.obraTitulo}</h3>
          <span className="display text-sm font-bold">{rotulo[r.statusAtual] ?? r.statusAtual}{r.modo === "simulado" ? " (TESTE)" : ""}</span>
        </div>
        <p className="mt-3 text-lg">
          <b>{r.comprador.nome}</b><br />
          {r.comprador.telefone}{r.comprador.email ? ` · ${r.comprador.email}` : ""}
        </p>
        <p className="mt-2 text-tinta/75">
          Reservou em {dataCurta(r.criadaEm)}
          {pago ? ` · sinal de R$ ${r.sinal} pago${r.devolvido ? " e devolvido" : ""}` : " · sinal ainda não pago"}
          {r.statusAtual === "reservada" ? ` · vale até ${dataCurta(r.expiraEm)}` : ""}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={zap} target="_blank" rel="noreferrer" className="display border-2 border-tinta px-4 py-2 text-sm font-bold">WhatsApp</a>
          {r.statusAtual === "reservada" && (
            <>
              <button type="button" onClick={() => agir(r.id, "vendida")} className="display bg-tinta px-4 py-2 text-sm font-bold text-gesso">Marcar como vendida</button>
              <button type="button" onClick={() => agir(r.id, "estender")} className="display border-2 border-tinta px-4 py-2 text-sm font-bold">Estender +7 dias</button>
              <button type="button" onClick={() => agir(r.id, "liberar", true)} className="display border-2 border-tinta px-4 py-2 text-sm font-bold">Liberar e devolver sinal</button>
              <button type="button" onClick={() => agir(r.id, "liberar", false)} className="display border-2 border-tinta px-4 py-2 text-sm font-bold">Liberar sem devolver</button>
            </>
          )}
          {["expirada", "conflito", "liberada"].includes(r.statusAtual) && pago && !r.devolvido && (
            <button type="button" onClick={() => agir(r.id, "devolver")} className="display bg-vermelhao px-4 py-2 text-sm font-bold text-gesso">Devolver sinal</button>
          )}
        </div>
      </li>
    );
  };

  return (
    <section className="mx-auto max-w-[1000px] px-5 py-32 md:px-9">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="m-0 text-4xl font-extrabold">Reservas</h1>
        <button type="button" onClick={() => carregar(senha)} className="display border-2 border-tinta px-4 py-2 text-sm font-bold">Atualizar</button>
      </div>
      {msg && <p role="alert" className="mt-4 text-vermelhao">{msg}</p>}

      <h2 className="mt-10 text-2xl font-extrabold">Ativas ({ativas.length})</h2>
      <ul className="m-0 mt-4 grid list-none gap-4 p-0">
        {ativas.map((r) => <Cartao key={r.id} r={r} />)}
        {ativas.length === 0 && <li className="italic text-tinta/70">Nenhuma reserva ativa.</li>}
      </ul>

      <h2 className="mt-12 text-2xl font-extrabold">Histórico ({outras.length})</h2>
      <ul className="m-0 mt-4 grid list-none gap-4 p-0">
        {outras.map((r) => <Cartao key={r.id} r={r} />)}
      </ul>
    </section>
  );
}
