// POST /api/reservar: cria a reserva e devolve o endereço da página de pagamento do sinal.
import { cabecalho, corpo, erro, ipDe, json, texto, type Req, type Res } from "./_lib/http.js";
import { criar, ErroReserva, visao } from "./_lib/reservas.js";

export default async function handler(req: Req, res: Res) {
  if (req.method !== "POST") return erro(res, 405, "Método não permitido.");
  const b = corpo(req);
  if (texto(b.site, 50)) return json(res, 200, { ok: true }); // campo-isca: robôs preenchem, pessoas não

  const nome = texto(b.nome, 80);
  const telefone = texto(b.telefone, 30).replace(/[^\d+()\-\s]/g, "");
  const obraId = texto(b.obraId, 80);
  if (nome.length < 3) return erro(res, 400, "Informe seu nome completo.");
  if (telefone.replace(/\D/g, "").length < 10) return erro(res, 400, "Informe seu WhatsApp com DDD.");

  try {
    const host = cabecalho(req, "x-forwarded-host") || cabecalho(req, "host");
    const proto = cabecalho(req, "x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
    const r = await criar({ obraId, nome, telefone, ip: ipDe(req), origem: `${proto}://${host}` });
    json(res, 201, { ...visao(r), token: r.token });
  } catch (e) {
    if (e instanceof ErroReserva) return erro(res, e.codigo, e.message);
    console.error(e);
    erro(res, 500, "Algo deu errado. Tente de novo ou fale com a artista pelo WhatsApp.");
  }
}
