// GET /api/status: o que o site precisa saber para mostrar "Reservada" e liberar o botão de reserva.
import { erro, json, type Req, type Res } from "./_lib/http.js";
import { modo } from "./_lib/pagamento.js";
import { ativo, estadoPublico, ErroReserva } from "./_lib/reservas.js";
import { reserva } from "../src/data/clinic.js";

export default async function handler(req: Req, res: Res) {
  if (req.method && req.method !== "GET") return erro(res, 405, "Método não permitido.");
  if (!ativo()) return json(res, 200, { ativo: false, simulado: false, reservadas: {}, vendidas: [] });
  try {
    json(res, 200, { ativo: true, simulado: modo() === "simulado", sinal: reserva.sinal, dias: reserva.dias, ...(await estadoPublico()) });
  } catch (e) {
    console.error(e);
    // se o armazenamento falhar, o site continua funcionando só com o WhatsApp
    json(res, e instanceof ErroReserva ? e.codigo : 200, { ativo: false, simulado: false, reservadas: {}, vendidas: [] });
  }
}
