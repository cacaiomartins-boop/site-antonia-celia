// GET /api/reserva?id=...&token=...: acompanha o pagamento de uma reserva.
import { erro, json, param, type Req, type Res } from "./_lib/http.js";
import { buscar, ErroReserva, sincronizar, visao } from "./_lib/reservas.js";

export default async function handler(req: Req, res: Res) {
  if (req.method && req.method !== "GET") return erro(res, 405, "Método não permitido.");
  try {
    const r = await buscar(param(req, "id"), param(req, "token"));
    if (!r) return erro(res, 404, "Reserva não encontrada.");
    json(res, 200, visao(await sincronizar(r)));
  } catch (e) {
    if (e instanceof ErroReserva) return erro(res, e.codigo, e.message);
    console.error(e);
    erro(res, 500, "Algo deu errado.");
  }
}
