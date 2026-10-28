// POST /api/webhook: aviso do Mercado Pago quando um pagamento muda de estado.
// O pagamento é sempre reconsultado na API do Mercado Pago antes de qualquer mudança.
import { cabecalho, corpo, json, param, type Req, type Res } from "./_lib/http.js";
import { assinaturaOk, consultar } from "./_lib/pagamento.js";
import { buscar, confirmarPagamento } from "./_lib/reservas.js";

export default async function handler(req: Req, res: Res) {
  const b = corpo(req);
  const dados = b.data as { id?: string | number } | undefined;
  const dataId = String(dados?.id ?? param(req, "data.id") ?? "");
  const tipo = String(b.type ?? param(req, "type") ?? "");
  if (!dataId || (tipo && tipo !== "payment")) return json(res, 200, { ok: true });

  const ok = await assinaturaOk({ assinatura: cabecalho(req, "x-signature"), requisicao: cabecalho(req, "x-request-id"), dataId });
  if (!ok) return json(res, 401, { erro: "assinatura inválida" });

  try {
    const p = await consultar(dataId);
    if (p && p.status === "aprovado" && p.referencia) {
      const r = await buscar(p.referencia);
      if (r && p.valor >= r.sinal) await confirmarPagamento(r.id, { id: p.id, email: p.email });
    }
    json(res, 200, { ok: true });
  } catch (e) {
    console.error(e);
    json(res, 500, { erro: "falha" }); // o Mercado Pago tenta de novo
  }
}
