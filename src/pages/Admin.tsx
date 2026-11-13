import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent, type FormEvent } from "react";
import { fotoUrl, medidaTexto, type Obra } from "../data/clinic";
import { prepararFoto, type FotoPronta } from "../lib/fotos";

// Painel da artista: marcar telas como vendidas, voltar para a loja, editar e cadastrar telas novas.
// As alterações só vão para o site quando ela clica em "Publicar alterações".
type Filtro = "todas" | "disponivel" | "vendida" | "aguardando";
type Previa = FotoPronta & { paleta: [string, string, string]; enviada?: boolean };

const situacao: Record<Obra["status"], string> = { disponivel: "Disponível", vendida: "Vendida", aguardando: "Escondida" };
const tecnicas = ["Acrílico sobre tela", "Óleo sobre tela", "Mista sobre tela", "Mista com colagem"];
const campo = "mt-1 block w-full border-2 border-tinta bg-transparent px-3 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-tinta";
const botao = "display border-2 border-tinta px-4 py-2 text-sm font-bold";
const botaoCheio = "display bg-tinta px-5 py-3 text-sm font-bold text-gesso disabled:opacity-50";

async function chamar<T>(url: string, corpo?: unknown, token = ""): Promise<T> {
  const auth: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  const r = await fetch(url, corpo === undefined ? { cache: "no-store", headers: auth } : { method: "POST", headers: { "Content-Type": "application/json", ...auth }, body: JSON.stringify(corpo) });
  const j = (await r.json().catch(() => ({}))) as T & { erro?: string };
  if (!r.ok) throw Object.assign(new Error(j.erro ?? "Algo deu errado. Tente de novo."), { codigo: r.status });
  return j;
}

const slug = (t: string) =>
  t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50) || "tela";

// "18500" ou "18.500,00" viram "R$ 18.500,00"; textos mais completos (ex.: "R$ 3.800,00 cada") ficam como estão
function moeda(t: string): string {
  const s = t.replace(/R\$/gi, "").trim();
  if (!s) return "";
  if (!/^[\d.,\s]+$/.test(s)) return t.trim();
  const n = s.includes(",") ? parseFloat(s.replace(/\./g, "").replace(",", ".")) : parseInt(s.replace(/[.\s]/g, ""), 10);
  return Number.isFinite(n) ? `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : t.trim();
}

// três cores da foto (esquerda, centro, direita), só para o tom provisório se a foto falhar
async function paletaDe(url: string): Promise<[string, string, string]> {
  const img = new Image();
  img.src = url;
  await img.decode().catch(() => undefined);
  const c = document.createElement("canvas");
  c.width = 3; c.height = 1;
  const g = c.getContext("2d")!;
  g.drawImage(img, 0, 0, 3, 1);
  const h = (i: number) => "#" + Array.from(g.getImageData(i, 0, 1, 1).data.slice(0, 3), (v) => v.toString(16).padStart(2, "0")).join("");
  return [h(0), h(1), h(2)];
}

// texto da obra com as chaves em ordem fixa, para comparar duas versões sem depender da ordem dos campos
const estavel = (o: unknown): string =>
  JSON.stringify(o, (_k, v) => (v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b))) : v));

function posicaoPara(obras: Obra[], status: Obra["status"]): number {
  if (status === "disponivel") return 0;
  if (status === "vendida") { const i = obras.findIndex((o) => o.status === "vendida"); return i < 0 ? obras.length : i; }
  return obras.length;
}

export default function Admin() {
  const [fase, setFase] = useState<"entrar" | "painel">("entrar"); // a senha é pedida sempre que a página abre
  const token = useRef(""); // a sessão fica só na memória: recarregar a página exige a senha de novo
  const api = <T,>(url: string, corpo?: unknown) => chamar<T>(url, corpo, token.current);
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState("");
  const [obras, setObras] = useState<Obra[]>([]);
  const [original, setOriginal] = useState<Obra[]>([]);
  const [sha, setSha] = useState("");
  const [teste, setTeste] = useState(false);
  const [previas, setPrevias] = useState<Record<string, Previa>>({});
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<{ obra: Obra; nova: boolean } | null>(null);
  const [publicando, setPublicando] = useState(false);
  const [ok, setOk] = useState("");

  useEffect(() => { document.title = "Painel · Antônia Célia"; }, []);

  const abrir = useCallback(async () => {
    try {
      const j = await api<{ obras: Obra[]; sha: string; teste: boolean }>("/api/admin-obras");
      setObras(j.obras); setOriginal(j.obras); setSha(j.sha); setTeste(j.teste); setFase("painel"); setMsg("");
    } catch (e) {
      const erro = e as Error & { codigo?: number };
      if (erro.codigo === 401) { setFase("entrar"); return; }
      setMsg(erro.message);
      setFase("entrar");
    }
  }, []);

  const entrar = async (e: FormEvent) => {
    e.preventDefault();
    setMsg("");
    try { token.current = (await api<{ token: string }>("/api/admin-login", { senha })).token; setSenha(""); await abrir(); }
    catch (x) { setMsg((x as Error).message); }
  };
  const sair = async () => {
    if (pendentes.length && !confirm("Há alterações que ainda não foram publicadas. Sair mesmo assim?")) return;
    token.current = "";
    setObras([]); setOriginal([]); setPrevias({}); setFase("entrar");
  };

  // o que mudou desde que abriu
  const pendentes = useMemo(() => {
    const a = new Map(original.map((o) => [o.id, estavel(o)]));
    const b = new Map(obras.map((o) => [o.id, estavel(o)]));
    const ids = new Set([...a.keys(), ...b.keys()]);
    return [...ids].filter((id) => a.get(id) !== b.get(id));
  }, [obras, original]);

  useEffect(() => {
    if (!pendentes.length) return;
    const avisar = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [pendentes.length]);

  const marcarVendida = (id: string) =>
    setObras((l) => {
      const o = l.find((x) => x.id === id)!;
      const { preco, ...resto } = o;
      const sem = l.filter((x) => x.id !== id);
      sem.splice(posicaoPara(sem, "vendida"), 0, { ...resto, status: "vendida", ...(preco ? { precoAnterior: preco } : {}) });
      return sem;
    });

  const voltarParaLoja = (id: string) => {
    const o = obras.find((x) => x.id === id)!;
    if (!o.precoAnterior && !o.preco) { setEditando({ obra: { ...o, status: "disponivel" }, nova: false }); setOk(""); return; } // precisa informar o valor
    setObras((l) => {
      const sem = l.filter((x) => x.id !== id);
      const { precoAnterior, ...resto } = o;
      sem.splice(0, 0, { ...resto, status: "disponivel", preco: o.preco ?? precoAnterior });
      return sem;
    });
  };

  const salvar = (obra: Obra, nova: boolean, previa?: Previa) => {
    if (previa) setPrevias((p) => ({ ...p, [obra.id]: previa }));
    setObras((l) => {
      if (nova) { const c = [...l]; c.splice(posicaoPara(c, obra.status), 0, obra); return c; }
      const antigo = l.find((x) => x.id === obra.id)!;
      if (antigo.status === obra.status) return l.map((x) => (x.id === obra.id ? obra : x));
      const sem = l.filter((x) => x.id !== obra.id);
      sem.splice(posicaoPara(sem, obra.status), 0, obra);
      return sem;
    });
    setEditando(null);
    setOk("");
  };

  const excluir = (id: string) => {
    setObras((l) => l.filter((x) => x.id !== id));
    setEditando(null);
    setOk("");
  };

  const publicar = async () => {
    setPublicando(true); setMsg(""); setOk("");
    try {
      const fotosNovas: { id: string; ext: string; grande: string; mini?: string }[] = [];
      for (const id of pendentes) {
        const p = previas[id];
        const o = obras.find((x) => x.id === id);
        if (!p || p.enviada || !o || !o.foto || o.foto.w !== p.w || o.foto.h !== p.h) continue; // só fotos novas ou trocadas
        const g = await api<{ sha: string }>("/api/admin-foto", { dados: p.grande });
        const m = p.mini ? await api<{ sha: string }>("/api/admin-foto", { dados: p.mini }) : undefined;
        fotosNovas.push({ id, ext: p.ext, grande: g.sha, ...(m ? { mini: m.sha } : {}) });
      }
      await api("/api/admin-publicar", { obras, sha, fotosNovas });
      setPrevias((p) => Object.fromEntries(Object.entries(p).map(([k, v]) => [k, { ...v, enviada: true }]))); // a foto já foi; a prévia só serve para mostrar até o site atualizar
      setOk(teste ? "Publicado no modo de teste (nada foi para o site de verdade)." : "Publicado! O site é atualizado em cerca de 1 a 2 minutos.");
      const j = await api<{ obras: Obra[]; sha: string }>("/api/admin-obras");
      setObras(j.obras); setOriginal(j.obras); setSha(j.sha);
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setPublicando(false);
    }
  };

  const contagem = (f: Filtro) => (f === "todas" ? obras.length : obras.filter((o) => o.status === f).length);
  const lista = obras.filter((o) => (filtro === "todas" || o.status === filtro) && (!busca.trim() || o.titulo.toLowerCase().includes(busca.trim().toLowerCase())));

  if (fase === "entrar") {
    return (
      <section className="mx-auto max-w-md px-5 py-40">
        <h1 className="m-0 text-4xl font-extrabold">Painel</h1>
        <form className="mt-8" onSubmit={entrar}>
          <label className="block">Senha
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoFocus autoComplete="current-password" className={campo} />
          </label>
          <button type="submit" className={`${botaoCheio} mt-4`}>Entrar</button>
          {msg && <p role="alert" className="mt-4 text-vermelhao">{msg}</p>}
        </form>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1200px] px-5 pb-40 pt-32 md:px-9">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="m-0 text-4xl font-extrabold">Painel das telas</h1>
        <div className="flex gap-2">
          <button type="button" className={botao} onClick={() => setEditando({ obra: novaObra(), nova: true })}>+ Nova tela</button>
          <button type="button" className={botao} onClick={sair}>Sair</button>
        </div>
      </div>
      {teste && <p className="mt-4 border-2 border-dashed border-ouro p-3 text-sm">Modo de teste: nada do que você fizer aqui vai para o site de verdade.</p>}
      {ok && <p role="status" className="mt-4 border-l-4 border-oliva pl-4 text-lg">{ok}</p>}
      {msg && <p role="alert" className="mt-4 text-vermelhao">{msg}</p>}

      <div className="mt-8 flex flex-wrap items-center gap-2">
        {(["todas", "disponivel", "vendida", "aguardando"] as Filtro[]).map((f) => (
          <button key={f} type="button" aria-pressed={filtro === f} onClick={() => setFiltro(f)}
            className={`${botao} ${filtro === f ? "bg-tinta text-gesso" : ""}`}>
            {f === "todas" ? "Todas" : f === "disponivel" ? "Disponíveis" : f === "vendida" ? "Vendidas" : "Escondidas"} ({contagem(f)})
          </button>
        ))}
        <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar pelo nome" aria-label="Buscar pelo nome" className="ml-auto min-w-[12rem] border-2 border-tinta bg-transparent px-3 py-2" />
      </div>

      <ul className="m-0 mt-8 grid list-none grid-cols-2 gap-4 p-0 md:grid-cols-3 lg:grid-cols-4">
        {lista.map((o) => {
          const mudou = pendentes.includes(o.id);
          return (
            <li key={o.id} className={`flex flex-col border-2 ${mudou ? "border-ouro" : "border-tinta/30"} bg-gesso`}>
              <button type="button" onClick={() => { setEditando({ obra: o, nova: false }); setOk(""); }} className="block aspect-[4/3] w-full overflow-hidden border-0 bg-tinta/10 p-0" aria-label={`Editar ${o.titulo}`}>
                <img src={previas[o.id]?.previa ?? fotoUrl(o, true)} alt="" loading="lazy" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
              </button>
              <div className="flex flex-1 flex-col gap-2 p-3">
                <h2 className="m-0 text-lg font-extrabold leading-tight">{o.titulo}</h2>
                <p className="m-0 text-sm text-tinta/70">
                  <b className={o.status === "vendida" ? "text-vermelhao" : o.status === "disponivel" ? "text-oliva" : ""}>{situacao[o.status]}</b>
                  {o.status === "disponivel" && o.preco ? ` · ${o.preco}` : ""}
                  {!o.semMedida ? ` · ${medidaTexto(o.dim)}` : ""}
                  {mudou ? " · alterada" : ""}
                </p>
                <div className="mt-auto flex flex-wrap gap-2">
                  {o.status === "disponivel" && <button type="button" className={`${botaoCheio} !px-3 !py-2`} onClick={() => marcarVendida(o.id)}>Marcar como vendida</button>}
                  {o.status === "vendida" && <button type="button" className={`${botaoCheio} !px-3 !py-2`} onClick={() => voltarParaLoja(o.id)}>Voltar para a loja</button>}
                  <button type="button" className={`${botao} !py-2`} onClick={() => { setEditando({ obra: o, nova: false }); setOk(""); }}>Editar</button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {lista.length === 0 && <p className="mt-10 text-xl italic">Nenhuma tela por aqui.</p>}

      {pendentes.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-[80] border-t-2 border-tinta bg-gesso px-5 py-4">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3">
            <p className="m-0 text-lg"><b>{pendentes.length}</b> {pendentes.length === 1 ? "alteração" : "alterações"} ainda não {pendentes.length === 1 ? "publicada" : "publicadas"}.</p>
            <div className="flex gap-2">
              <button type="button" className={botao} disabled={publicando} onClick={() => { if (confirm("Descartar todas as alterações que ainda não foram publicadas?")) { setObras(original); setPrevias({}); } }}>Descartar</button>
              <button type="button" className={botaoCheio} disabled={publicando} onClick={publicar}>{publicando ? "Publicando..." : "Publicar alterações"}</button>
            </div>
          </div>
        </div>
      )}

      {editando && (
        <Editor
          obra={editando.obra}
          nova={editando.nova}
          existentes={obras.map((o) => o.id)}
          previa={previas[editando.obra.id]}
          fechar={() => setEditando(null)}
          salvar={salvar}
          excluir={excluir}
        />
      )}
    </section>
  );
}

function novaObra(): Obra {
  return { id: "", titulo: "", dim: [100, 100], status: "disponivel", paleta: ["#C42A1D", "#C9A24B", "#F7F4EC"] };
}

function Editor({ obra, nova, existentes, previa, fechar, salvar, excluir }: {
  obra: Obra; nova: boolean; existentes: string[]; previa?: Previa;
  fechar: () => void; salvar: (o: Obra, nova: boolean, p?: Previa) => void; excluir: (id: string) => void;
}) {
  const [o, setO] = useState<Obra>(obra);
  const [preco, setPreco] = useState(obra.preco ?? obra.precoAnterior ?? "");
  const [nova_, setNovaFoto] = useState<Previa | undefined>(undefined);
  const [lendo, setLendo] = useState(false);
  const [erro, setErro] = useState("");
  const [arrastando, setArrastando] = useState(false);
  const entrada = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && fechar();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [fechar]);

  const receber = async (arquivo?: File | null) => {
    if (!arquivo) return;
    setErro(""); setLendo(true);
    try {
      const f = await prepararFoto(arquivo);
      const paleta = await paletaDe(f.previa);
      setNovaFoto({ ...f, paleta });
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setLendo(false);
    }
  };
  const soltar = (e: DragEvent) => { e.preventDefault(); setArrastando(false); receber(e.dataTransfer.files[0]); };

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const titulo = o.titulo.trim();
    if (!titulo) return setErro("Escreva o nome da tela.");
    const foto = nova_ ?? previa;
    if (nova && !foto) return setErro("Escolha a foto da tela.");
    if (o.status !== "aguardando" && !(nova_ ?? o.foto)) return setErro("Esta tela precisa de uma foto para aparecer no site.");
    if (!o.semMedida && (!(o.dim[0] > 0) || !(o.dim[1] > 0))) return setErro("Informe a altura e a largura, ou marque \"Não sei a medida\".");
    const valor = moeda(preco);
    if (o.status === "disponivel" && !valor) return setErro("Informe o valor da tela (ela está disponível).");
    let id = o.id;
    if (nova) {
      const base = slug(titulo);
      id = base; let n = 2;
      while (existentes.includes(id)) id = `${base}-${n++}`;
    }
    const pronto: Obra = {
      ...o,
      id,
      titulo,
      tecnica: o.tecnica?.trim() || undefined,
      detalhe: o.detalhe?.trim() || undefined,
      ano: o.ano || undefined,
      status: o.status,
      preco: o.status === "disponivel" ? valor : undefined,
      precoAnterior: o.status === "vendida" ? (valor || o.precoAnterior || o.preco) : undefined,
      semMedida: o.semMedida || undefined,
      diptico: o.diptico || undefined,
      ...(nova_ ? { foto: { w: nova_.w, h: nova_.h, ext: nova_.ext, ...(nova_.mini ? { mini: true } : {}) }, paleta: nova_.paleta } : {}),
    };
    // campos vazios não vão para o arquivo
    for (const k of Object.keys(pronto) as (keyof Obra)[]) if (pronto[k] === undefined) delete pronto[k];
    salvar(pronto, nova, nova_);
  };

  const dim = (i: 0 | 1, v: string) => setO({ ...o, dim: i === 0 ? [Number(v) || 0, o.dim[1]] : [o.dim[0], Number(v) || 0] });
  const fotoAtual = nova_?.previa ?? previa?.previa ?? (o.foto ? fotoUrl(o, true) : "");

  return (
    <div role="dialog" aria-modal="true" aria-label={nova ? "Nova tela" : `Editar ${obra.titulo}`} className="fixed inset-0 z-[90] overflow-y-auto bg-tinta/70 p-0 md:p-8" onClick={(e) => e.target === e.currentTarget && fechar()} data-lenis-prevent>
      <form onSubmit={enviar} className="mx-auto max-w-2xl bg-gesso p-5 md:p-8">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="m-0 text-3xl font-extrabold">{nova ? "Nova tela" : "Editar tela"}</h2>
          <button type="button" onClick={fechar} className={botao}>Fechar</button>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
          onDragLeave={() => setArrastando(false)}
          onDrop={soltar}
          className={`mt-6 flex min-h-[10rem] flex-col items-center justify-center gap-3 border-2 border-dashed p-4 text-center ${arrastando ? "border-ouro bg-ouro/10" : "border-tinta/50"}`}
        >
          {fotoAtual && <img src={fotoAtual} alt="" className="max-h-64 w-auto max-w-full" />}
          <p className="m-0 text-base">{lendo ? "Preparando a foto..." : fotoAtual ? "Arraste outra foto aqui para trocar" : "Arraste a foto da tela aqui"}</p>
          <button type="button" className={botao} onClick={() => entrada.current?.click()}>{fotoAtual ? "Trocar foto" : "Escolher foto"}</button>
          <input ref={entrada} type="file" accept="image/*" hidden onChange={(e) => { receber(e.target.files?.[0]); e.target.value = ""; }} />
        </div>

        <label className="mt-6 block">Nome da tela
          <input value={o.titulo} onChange={(e) => setO({ ...o, titulo: e.target.value })} required className={campo} />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-[2fr_1fr]">
          <label className="block">Técnica <span className="text-tinta/60">(opcional)</span>
            <input list="tecnicas" value={o.tecnica ?? ""} onChange={(e) => setO({ ...o, tecnica: e.target.value })} className={campo} />
            <datalist id="tecnicas">{tecnicas.map((t) => <option key={t} value={t} />)}</datalist>
          </label>
          <label className="block">Ano <span className="text-tinta/60">(opcional)</span>
            <input type="number" inputMode="numeric" value={o.ano ?? ""} onChange={(e) => setO({ ...o, ano: e.target.value ? Number(e.target.value) : undefined })} className={campo} />
          </label>
        </div>

        <fieldset className="mt-4 border-0 p-0">
          <legend>Medida (em centímetros)</legend>
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm">Altura<input type="number" inputMode="decimal" min="1" disabled={o.semMedida} value={o.semMedida ? "" : o.dim[0] || ""} onChange={(e) => dim(0, e.target.value)} className={campo} /></label>
            <label className="block text-sm">Largura<input type="number" inputMode="decimal" min="1" disabled={o.semMedida} value={o.semMedida ? "" : o.dim[1] || ""} onChange={(e) => dim(1, e.target.value)} className={campo} /></label>
          </div>
          <label className="mt-2 flex items-center gap-2 text-base"><input type="checkbox" checked={Boolean(o.semMedida)} onChange={(e) => setO({ ...o, semMedida: e.target.checked })} /> Não sei a medida (não mostrar no site)</label>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">Situação
            <select value={o.status} onChange={(e) => setO({ ...o, status: e.target.value as Obra["status"] })} className={campo}>
              <option value="disponivel">Disponível (à venda)</option>
              <option value="vendida">Vendida</option>
              <option value="aguardando">Escondida (não aparece no site)</option>
            </select>
          </label>
          <label className="block">Valor
            <input value={preco} onChange={(e) => setPreco(e.target.value)} onBlur={() => setPreco(moeda(preco))} inputMode="decimal" placeholder="R$ 0,00" disabled={o.status === "aguardando"} className={campo} />
            {o.status === "vendida" && <span className="text-sm text-tinta/60">Fica guardado, mas não aparece no site.</span>}
          </label>
        </div>

        <label className="mt-4 block">Observação <span className="text-tinta/60">(opcional, aparece na ficha da tela)</span>
          <textarea rows={2} value={o.detalhe ?? ""} onChange={(e) => setO({ ...o, detalhe: e.target.value })} className={campo} />
        </label>
        <label className="mt-2 flex items-center gap-2 text-base"><input type="checkbox" checked={Boolean(o.diptico)} onChange={(e) => setO({ ...o, diptico: e.target.checked })} /> É um conjunto (díptico ou tríptico)</label>

        {erro && <p role="alert" className="mt-4 text-vermelhao">{erro}</p>}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button type="submit" className={botaoCheio}>{nova ? "Adicionar tela" : "Salvar"}</button>
          {!nova && <button type="button" className={`${botao} !border-vermelhao text-vermelhao`} onClick={() => { if (confirm(`Excluir "${obra.titulo}" do site? A foto também será apagada ao publicar.`)) excluir(obra.id); }}>Excluir tela</button>}
        </div>
        <p className="mt-4 text-sm text-tinta/60">Salvar aqui só guarda a alteração no painel. Ela vai para o site quando você clicar em "Publicar alterações".</p>
      </form>
    </div>
  );
}
