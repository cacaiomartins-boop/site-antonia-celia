// Login do painel: senha conferida no servidor. A sessão é um código assinado que o painel guarda só na memória da página
// (nada em cookie nem em armazenamento do navegador): ao recarregar ou fechar a página, a senha é pedida de novo.
import { cabecalho, env, type Req, type Res } from "./http.js";

const HORAS = 4;
const enc = new TextEncoder();

const hex = (b: ArrayBuffer) => Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, "0")).join("");

async function hmac(chave: string, dado: string): Promise<string> {
  const k = await crypto.subtle.importKey("raw", enc.encode(chave), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", k, enc.encode(dado)));
}

const igual = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
};

export const painelConfigurado = () => Boolean(env("ADMIN_PASSWORD"));
const segredo = () => `${env("ADMIN_SESSION_SECRET") ?? env("ADMIN_PASSWORD") ?? ""}|painel-antonia`;

export async function senhaCorreta(tentativa: string): Promise<boolean> {
  const certa = env("ADMIN_PASSWORD");
  if (!certa) return false;
  // compara os resumos (mesmo tamanho), em tempo constante
  const a = await hmac("senha", tentativa);
  const b = await hmac("senha", certa);
  return igual(a, b);
}

// Tentativas erradas por endereço (vale por instância do servidor: é uma barreira simples, não um bloqueio total)
const falhas = new Map<string, { n: number; ate: number }>();
export function bloqueado(ip: string): boolean {
  const f = falhas.get(ip);
  return Boolean(f && f.n >= 5 && Date.now() < f.ate);
}
export function registrarFalha(ip: string) {
  const f = falhas.get(ip);
  const agora = Date.now();
  falhas.set(ip, !f || agora > f.ate ? { n: 1, ate: agora + 15 * 60_000 } : { n: f.n + 1, ate: f.ate });
}
export const limparFalhas = (ip: string) => falhas.delete(ip);

export async function criarToken(): Promise<string> {
  const exp = String(Date.now() + HORAS * 3600_000);
  return `${exp}.${await hmac(segredo(), exp)}`;
}

export async function logado(req: Req): Promise<boolean> {
  if (!painelConfigurado()) return false;
  const m = cabecalho(req, "authorization").match(/^Bearer ([0-9]+)\.([0-9a-f]+)$/);
  if (!m) return false;
  if (Number(m[1]) < Date.now()) return false;
  return igual(await hmac(segredo(), m[1]), m[2]);
}

// Exige sessão e pedido em JSON (barreira extra contra pedidos feitos por outros sites)
export async function exigirLogin(req: Req, res: Res, exigirJson = false): Promise<boolean> {
  if (exigirJson && !cabecalho(req, "content-type").includes("application/json")) {
    res.status(415).json({ erro: "Pedido inválido." });
    return false;
  }
  if (!(await logado(req))) {
    res.status(401).json({ erro: "Sessão expirada. Entre de novo." });
    return false;
  }
  return true;
}
