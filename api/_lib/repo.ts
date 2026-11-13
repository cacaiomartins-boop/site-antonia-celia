// Onde ficam as obras e as fotos: no repositório do site (GitHub). A Vercel republica sozinha a cada alteração.
// No computador (sem GITHUB_TOKEN e fora da Vercel) tudo é gravado em .dev-data/, só para testar o painel.
import { env, naNuvem } from "./http.js";
import { CAMINHO_FOTO, CAMINHO_OBRAS } from "./obras.js";

export type Estado = { conteudo: string; sha: string };
export type Mudanca = { path: string; sha: string | null }; // sha null = apagar o arquivo

export class ErroRepo extends Error {
  constructor(public codigo: number, mensagem: string) { super(mensagem); }
}

export const modoLocal = () => !env("GITHUB_TOKEN") && !naNuvem();
export const repoConfigurado = () => Boolean(env("GITHUB_TOKEN")) || modoLocal();

// ---------------- GitHub ----------------
const repo = () => env("GITHUB_REPO") ?? "cacaiomartins-boop/site-antonia-celia";
const ramo = () => env("GITHUB_BRANCH") ?? "main";
const base = () => env("GITHUB_API_URL") ?? "https://api.github.com";

async function gh<T>(metodo: string, caminho: string, corpo?: unknown): Promise<T> {
  const r = await fetch(`${base()}/repos/${repo()}${caminho}`, {
    method: metodo,
    headers: {
      Authorization: `Bearer ${env("GITHUB_TOKEN")}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "painel-antonia-celia",
      ...(corpo ? { "Content-Type": "application/json" } : {}),
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  if (!r.ok) {
    const detalhe = (await r.text().catch(() => "")).slice(0, 300);
    console.error(`GitHub ${metodo} ${caminho} -> ${r.status} ${detalhe}`);
    if (r.status === 401 || r.status === 403) throw new ErroRepo(502, "O painel não tem permissão no GitHub. Confira a chave (GITHUB_TOKEN).");
    if (r.status === 404) throw new ErroRepo(502, "Repositório ou arquivo não encontrado no GitHub. Confira GITHUB_REPO e GITHUB_BRANCH.");
    if (r.status === 409 || r.status === 422) throw new ErroRepo(409, "O site foi alterado por outra pessoa agora. Recarregue o painel e tente de novo.");
    throw new ErroRepo(502, "Não foi possível falar com o GitHub agora. Tente de novo em instantes.");
  }
  return (await r.json()) as T;
}

async function lerGithub(): Promise<Estado> {
  const j = await gh<{ content: string; sha: string; encoding: string }>("GET", `/contents/${CAMINHO_OBRAS}?ref=${encodeURIComponent(ramo())}`);
  return { conteudo: Buffer.from(j.content, "base64").toString("utf-8"), sha: j.sha };
}

async function blobGithub(base64: string): Promise<string> {
  return (await gh<{ sha: string }>("POST", "/git/blobs", { content: base64, encoding: "base64" })).sha;
}

async function publicarGithub(mensagem: string, conteudoObras: string, mudancas: Mudanca[], shaEsperado: string): Promise<void> {
  const atual = await lerGithub();
  if (atual.sha !== shaEsperado) throw new ErroRepo(409, "As obras foram alteradas por outra pessoa. Recarregue o painel e refaça a alteração.");
  const head = (await gh<{ object: { sha: string } }>("GET", `/git/ref/heads/${ramo()}`)).object.sha;
  const arvoreBase = (await gh<{ tree: { sha: string } }>("GET", `/git/commits/${head}`)).tree.sha;
  const blobObras = (await gh<{ sha: string }>("POST", "/git/blobs", { content: conteudoObras, encoding: "utf-8" })).sha;
  const arvore = await gh<{ sha: string }>("POST", "/git/trees", {
    base_tree: arvoreBase,
    tree: [
      { path: CAMINHO_OBRAS, mode: "100644", type: "blob", sha: blobObras },
      ...mudancas.map((m) => ({ path: m.path, mode: "100644", type: "blob", sha: m.sha })),
    ],
  });
  const commit = await gh<{ sha: string }>("POST", "/git/commits", { message: mensagem, tree: arvore.sha, parents: [head] });
  await gh("PATCH", `/git/refs/heads/${ramo()}`, { sha: commit.sha, force: false });
}

// ---------------- Teste no computador ----------------
async function fs() { return import("node:fs/promises"); }
async function sha1(dados: Uint8Array | string): Promise<string> {
  const { createHash } = await import("node:crypto");
  return createHash("sha1").update(dados).digest("hex");
}
const dev = ".dev-data";

async function lerLocal(): Promise<Estado> {
  const f = await fs();
  let conteudo: string;
  try { conteudo = await f.readFile(`${dev}/obras.json`, "utf-8"); } catch { conteudo = await f.readFile(CAMINHO_OBRAS, "utf-8"); }
  return { conteudo, sha: await sha1(conteudo) };
}

async function blobLocal(base64: string): Promise<string> {
  const f = await fs();
  const dados = Buffer.from(base64, "base64");
  const sha = await sha1(dados);
  await f.mkdir(`${dev}/blobs`, { recursive: true });
  await f.writeFile(`${dev}/blobs/${sha}`, dados);
  return sha;
}

async function publicarLocal(mensagem: string, conteudoObras: string, mudancas: Mudanca[], shaEsperado: string): Promise<void> {
  const f = await fs();
  const atual = await lerLocal();
  if (atual.sha !== shaEsperado) throw new ErroRepo(409, "As obras foram alteradas por outra pessoa. Recarregue o painel e refaça a alteração.");
  await f.mkdir(dev, { recursive: true });
  await f.writeFile(`${dev}/obras.json`, conteudoObras);
  for (const m of mudancas) {
    const destino = `${dev}/${m.path}`;
    if (m.sha === null) { await f.rm(destino, { force: true }); continue; }
    await f.mkdir(destino.slice(0, destino.lastIndexOf("/")), { recursive: true });
    await f.copyFile(`${dev}/blobs/${m.sha}`, destino);
  }
  await f.appendFile(`${dev}/commits.log`, `${new Date().toISOString()} ${mensagem} | ${mudancas.length} arquivo(s)\n`);
}

// ---------------- Interface única ----------------
export const lerObrasRepo = (): Promise<Estado> => (modoLocal() ? lerLocal() : lerGithub());
export const criarBlob = (base64: string): Promise<string> => (modoLocal() ? blobLocal(base64) : blobGithub(base64));

export function publicarRepo(mensagem: string, conteudoObras: string, mudancas: Mudanca[], shaEsperado: string): Promise<void> {
  for (const m of mudancas) if (!CAMINHO_FOTO.test(m.path)) throw new ErroRepo(400, "Arquivo não permitido.");
  return modoLocal() ? publicarLocal(mensagem, conteudoObras, mudancas, shaEsperado) : publicarGithub(mensagem, conteudoObras, mudancas, shaEsperado);
}
