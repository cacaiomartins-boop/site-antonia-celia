// POST /api/simular: "paga" o Pix de teste. Só existe no computador, sem MP_ACCESS_TOKEN.
import { corpo, erro, json, texto, type Req, type Res } from "./_lib/http.js";
import { modo } from "./_lib/pagamento.js";
import { buscar, confirmarPagamento, ErroReserva, visao } from "./_lib/reservas.js";

export default async function handler(req: Req, res: Res) {
  if (modo() !== "simulado") return erro(res, 404, "Não encontrado.");
  if (req.method !== "POST") return erro(res, 405, "Método não permitido.");
  const b = corpo(req);
  try {
    const r = await buscar(texto(b.id, 40), texto(b.token, 80));
    if (!r) return erro(res, 404, "Reserva não encontrada.");
    json(res, 200, visao((await confirmarPagamento(r.id, { id: `SIM-${r.id}` })) ?? r));
  } catch (e) {
    if (e instanceof ErroReserva) return erro(res, e.codigo, e.message);
    console.error(e);
    erro(res, 500, "Algo deu errado.");
  }
}
