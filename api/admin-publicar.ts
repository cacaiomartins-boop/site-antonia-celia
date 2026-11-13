import { corpo, erro, json, type Req, type Res } from "./_lib/http.js";
import { ErroValidacao, ID_OK, arquivosDaFoto, formatarObras, validarObras, type Obra } from "./_lib/obras.js";
import { ErroRepo, lerObrasRepo, publicarRepo, repoConfigurado, type Mudanca } from "./_lib/repo.js";
import { exigirLogin } from "./_lib/sessao.js";

type FotoNova = { id: string; ext: "webp" | "jpg"; grande: string; mini?: string };
const SHA = /^[0-9a-f]{40}$/;

// Resumo para o histórico do site (ex.: "Painel: nova: Céu azul; vendida: Belo")
function resumo(antes: Obra[], depois: Obra[]): string {
  const a = new Map(antes.map((o) => [o.id, o]));
  const b = new Map(depois.map((o) => [o.id, o]));
  const partes: string[] = [];
  const novas = depois.filter((o) => !a.has(o.id)).map((o) => o.titulo);
  const tiradas = antes.filter((o) => !b.has(o.id)).map((o) => o.titulo);
  const vendidas = depois.filter((o) => a.get(o.id) && a.get(o.id)!.status !== "vendida" && o.status === "vendida").map((o) => o.titulo);
  const voltaram = depois.filter((o) => a.get(o.id) && a.get(o.id)!.status === "vendida" && o.status === "disponivel").map((o) => o.titulo);
  const editadas = depois.filter((o) => a.get(o.id) && JSON.stringify(a.get(o.id)) !== JSON.stringify(o)).length;
  if (novas.length) partes.push(`nova: ${novas.join(", ")}`);
  if (vendidas.length) partes.push(`vendida: ${vendidas.join(", ")}`);
  if (voltaram.length) partes.push(`voltou para a loja: ${voltaram.join(", ")}`);
  if (tiradas.length) partes.push(`removida: ${tiradas.join(", ")}`);
  if (!partes.length && editadas) partes.push(`${editadas} tela(s) editada(s)`);
  return `Painel: ${(partes.join("; ") || "alterações").slice(0, 200)}`;
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== "POST") return erro(res, 405, "Método não permitido.");
  if (!(await exigirLogin(req, res, true))) return;
  if (!repoConfigurado()) return erro(res, 503, "O painel ainda não tem acesso ao GitHub.");
  try {
    const c = corpo(req);
    const novas = validarObras(c.obras);
    const shaBase = typeof c.sha === "string" ? c.sha : "";
    const fotosNovas = (Array.isArray(c.fotosNovas) ? c.fotosNovas : []) as FotoNova[];

    const atual = await lerObrasRepo();
    if (atual.sha !== shaBase) throw new ErroRepo(409, "As obras foram alteradas por outra pessoa. Recarregue o painel e refaça a alteração.");
    const antes = JSON.parse(atual.conteudo) as Obra[];

    // arquivos que o site passa a usar e os que já existiam
    const mudancas: Mudanca[] = [];
    const enviados = new Set<string>();
    for (const f of fotosNovas) {
      if (!f || !ID_OK.test(f.id) || (f.ext !== "webp" && f.ext !== "jpg") || !SHA.test(f.grande) || (f.mini !== undefined && !SHA.test(f.mini))) throw new ErroValidacao("Foto nova inválida.");
      const o = novas.find((x) => x.id === f.id);
      if (!o?.foto || o.foto.ext !== f.ext || Boolean(o.foto.mini) !== Boolean(f.mini)) throw new ErroValidacao("A foto enviada não confere com a tela.");
      mudancas.push({ path: `public/img/obras/${f.id}.${f.ext}`, sha: f.grande });
      enviados.add(`public/img/obras/${f.id}.${f.ext}`);
      if (f.mini) {
        mudancas.push({ path: `public/img/obras/${f.id}-640.${f.ext}`, sha: f.mini });
        enviados.add(`public/img/obras/${f.id}-640.${f.ext}`);
      }
    }
    const existentes = new Set(antes.flatMap((o) => (o.foto ? arquivosDaFoto(o.id, o.foto) : [])));
    const usados = new Set(novas.flatMap((o) => (o.foto ? arquivosDaFoto(o.id, o.foto) : [])));
    for (const caminho of usados) if (!enviados.has(caminho) && !existentes.has(caminho)) throw new ErroValidacao("Falta enviar uma foto.");
    for (const caminho of existentes) if (!usados.has(caminho)) mudancas.push({ path: caminho, sha: null }); // foto de tela removida ou trocada

    await publicarRepo(resumo(antes, novas), formatarObras(novas), mudancas, atual.sha);
    json(res, 200, { ok: true });
  } catch (e) {
    if (e instanceof ErroValidacao) return erro(res, 400, e.message);
    if (e instanceof ErroRepo) return erro(res, e.codigo, e.message);
    console.error(e);
    erro(res, 500, "Não foi possível publicar agora.");
  }
}
