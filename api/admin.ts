// Painel da artista. Protegido pelo ADMIN_TOKEN (cabeçalho x-admin-token).
//   GET  /api/admin          -> lista as reservas, com os dados de quem reservou
//   POST /api/admin          -> { id, acao: liberar | vendida | devolver | estender, devolverSinal? }
import { cabecalho, corpo, env, erro, json, naNuvem, texto, type Req, type Res } from "./_lib/http.js";
import { agir, efetivo, ErroReserva, loja, todas, type Acao } from "./_lib/reservas.js";

const igual = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
};

const ACOES: Acao[] = ["liberar", "vendida", "devolver", "estender"];

export default async function handler(req: Req, res: Res) {
  const esperado = env("ADMIN_TOKEN") ?? (naNuvem() ? "" : "dev-admin");
  const enviado = cabecalho(req, "x-admin-token");
  if (!esperado || !igual(enviado, esperado)) return erro(res, 401, "Acesso negado.");

  try {
    if (req.method === "POST") {
      const b = corpo(req);
      const acao = texto(b.acao, 20) as Acao;
      if (!ACOES.includes(acao)) return erro(res, 400, "Ação inválida.");
      const r = await agir(texto(b.id, 40), acao, b.devolverSinal === true);
      return json(res, 200, { ...r, token: undefined, statusAtual: efetivo(r) });
    }
    const lista = (await todas(loja()))
      .map((r) => ({ ...r, token: undefined, statusAtual: efetivo(r) }))
      .sort((a, b) => b.criadaEm.localeCompare(a.criadaEm));
    json(res, 200, { reservas: lista });
  } catch (e) {
    if (e instanceof ErroReserva) return erro(res, e.codigo, e.message);
    console.error(e);
    erro(res, 500, "Algo deu errado.");
  }
}
