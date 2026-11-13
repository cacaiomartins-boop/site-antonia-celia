import { corpo, erro, ipDe, json, texto, type Req, type Res } from "./_lib/http.js";
import { bloqueado, criarToken, limparFalhas, painelConfigurado, registrarFalha, senhaCorreta } from "./_lib/sessao.js";

export default async function handler(req: Req, res: Res) {
  if (req.method !== "POST") return erro(res, 405, "Método não permitido.");
  if (!painelConfigurado()) return erro(res, 503, "O painel ainda não foi configurado no servidor (falta a senha).");
  const ip = ipDe(req);
  if (bloqueado(ip)) return erro(res, 429, "Muitas tentativas. Espere alguns minutos e tente de novo.");
  const senha = texto(corpo(req).senha, 200);
  if (!(await senhaCorreta(senha))) {
    registrarFalha(ip);
    await new Promise((ok) => setTimeout(ok, 1200)); // atrasa quem tenta adivinhar
    return erro(res, 401, "Senha incorreta.");
  }
  limparFalhas(ip);
  json(res, 200, { ok: true, token: await criarToken() });
}
