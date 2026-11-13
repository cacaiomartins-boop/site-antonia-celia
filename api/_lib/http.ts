// Tipos e utilitários mínimos para as funções da pasta api/ (estilo Vercel).
// Sem dependências externas: o mesmo código roda na Vercel e no servidor de teste local.

export type Req = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  query: Record<string, string | string[] | undefined>;
  body?: unknown;
};

export type Res = {
  status(codigo: number): Res;
  json(corpo: unknown): void;
  setHeader(nome: string, valor: string): void;
  end(corpo?: string): void;
};

export const env = (nome: string): string | undefined => {
  const v = process.env[nome];
  return v && v.trim() ? v.trim() : undefined;
};

// Na Vercel esta variável existe; no computador do Caio, não.
export const naNuvem = () => Boolean(env("VERCEL"));

export const cabecalho = (req: Req, nome: string): string => {
  const v = req.headers[nome.toLowerCase()];
  return (Array.isArray(v) ? v[0] : v) ?? "";
};

export const param = (req: Req, nome: string): string => {
  const v = req.query[nome];
  return (Array.isArray(v) ? v[0] : v) ?? "";
};

export const corpo = (req: Req): Record<string, unknown> => {
  let b = req.body;
  if (typeof b === "string") {
    try { b = JSON.parse(b); } catch { b = {}; }
  }
  return b && typeof b === "object" ? (b as Record<string, unknown>) : {};
};

export const ipDe = (req: Req): string => cabecalho(req, "x-forwarded-for").split(",")[0].trim() || "desconhecido";

export const json = (res: Res, codigo: number, dados: unknown) => {
  res.setHeader("Cache-Control", "no-store");
  res.status(codigo).json(dados);
};

export const erro = (res: Res, codigo: number, mensagem: string) => json(res, codigo, { erro: mensagem });

export const texto = (v: unknown, max: number): string => (typeof v === "string" ? v.trim().slice(0, max) : "");

export const escapar = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
