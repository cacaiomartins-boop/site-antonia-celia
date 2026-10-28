// Pagamento do sinal pela página do Mercado Pago (Checkout Pro): a pessoa escolhe Pix ou cartão lá.
// O dinheiro cai na conta de quem é dono do MP_ACCESS_TOKEN (a conta da Antônia).
//  - "mercadopago": cobra de verdade (precisa de MP_ACCESS_TOKEN).
//  - "simulado": só no computador, sem token. O site mostra uma tela de teste em vez da página do banco.
//  - "desligado": na Vercel sem token. As reservas ficam desativadas.
import { env, naNuvem } from "./http.js";

export type Modo = "mercadopago" | "simulado" | "desligado";
export type Checkout = { url: string; preferenciaId?: string; expiraEm: string };
export type StatusPagamento = "pendente" | "aprovado" | "cancelado";
export type Pagamento = { id: string; status: StatusPagamento; valor: number; referencia: string; email?: string };

export const modo = (): Modo => (env("MP_ACCESS_TOKEN") ? "mercadopago" : naNuvem() ? "desligado" : "simulado");

const MP = "https://api.mercadopago.com";
const cab = (extra: Record<string, string> = {}) => ({
  Authorization: `Bearer ${env("MP_ACCESS_TOKEN")}`,
  "Content-Type": "application/json",
  ...extra,
});

// O Mercado Pago pede a data com fuso (-03:00, horário de Brasília)
const dataBr = (ms: number) => new Date(ms - 3 * 3600 * 1000).toISOString().replace("Z", "-03:00");

export async function criarCheckout(p: {
  reservaId: string; token: string; obraId: string; titulo: string; valor: number;
  nome: string; telefone: string; minutos: number; origem: string;
}): Promise<Checkout> {
  const expiraMs = Date.now() + p.minutos * 60 * 1000;
  const site = (env("SITE_URL") ?? p.origem).replace(/\/$/, "");
  const volta = `${site}/disponiveis?reserva=${p.reservaId}&t=${p.token}`;

  if (modo() === "simulado") {
    return { url: `/disponiveis?reserva=${p.reservaId}&t=${p.token}`, expiraEm: new Date(expiraMs).toISOString() };
  }

  // telefone brasileiro: DDD + número
  const d = p.telefone.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  const [primeiro, ...resto] = p.nome.split(" ");
  const r = await fetch(`${MP}/checkout/preferences`, {
    method: "POST",
    headers: cab(),
    body: JSON.stringify({
      items: [{ id: p.obraId, title: `Reserva: ${p.titulo}`, description: "Sinal de reserva, abatido do valor final da tela", quantity: 1, currency_id: "BRL", unit_price: p.valor }],
      payer: { name: primeiro, surname: resto.join(" "), phone: { area_code: d.slice(0, 2), number: d.slice(2) } },
      external_reference: p.reservaId,
      back_urls: { success: volta, pending: volta, failure: volta },
      ...(site.startsWith("https://") ? { auto_return: "approved", notification_url: `${site}/api/webhook` } : {}),
      expires: true,
      expiration_date_from: dataBr(Date.now()),
      expiration_date_to: dataBr(expiraMs),
      payment_methods: { excluded_payment_types: [{ id: "ticket" }] }, // sem boleto: demora dias e prenderia a obra
      statement_descriptor: "ANTONIA CELIA",
    }),
  });
  const j = (await r.json()) as any;
  const teste = (env("MP_ACCESS_TOKEN") ?? "").startsWith("TEST-");
  const url = teste ? j?.sandbox_init_point : j?.init_point;
  if (!r.ok || !url) throw new Error(`Mercado Pago: ${j?.message ?? r.status}`);
  return { url, preferenciaId: String(j.id), expiraEm: new Date(expiraMs).toISOString() };
}

const lerPagamento = (j: any): Pagamento => ({
  id: String(j.id),
  status: j.status === "approved" ? "aprovado" : ["cancelled", "rejected", "refunded", "charged_back"].includes(j.status) ? "cancelado" : "pendente",
  valor: Number(j.transaction_amount),
  referencia: String(j.external_reference ?? ""),
  email: typeof j.payer?.email === "string" ? j.payer.email : undefined,
});

export async function consultar(id: string): Promise<Pagamento | null> {
  if (modo() !== "mercadopago") return null;
  const r = await fetch(`${MP}/v1/payments/${encodeURIComponent(id)}`, { headers: cab() });
  return r.ok ? lerPagamento(await r.json()) : null;
}

// Procura o pagamento aprovado de uma reserva (usado quando o webhook ainda não chegou)
export async function aprovadoDaReserva(reservaId: string): Promise<Pagamento | null> {
  if (modo() !== "mercadopago") return null;
  const r = await fetch(`${MP}/v1/payments/search?external_reference=${encodeURIComponent(reservaId)}&sort=date_created&criteria=desc&limit=10`, { headers: cab() });
  if (!r.ok) return null;
  const j = (await r.json()) as { results?: any[] };
  return (j.results ?? []).map(lerPagamento).find((p) => p.status === "aprovado" && p.referencia === reservaId) ?? null;
}

export async function devolver(pagamentoId: string): Promise<boolean> {
  if (modo() === "simulado") return true;
  if (modo() !== "mercadopago" || !pagamentoId) return false;
  const r = await fetch(`${MP}/v1/payments/${encodeURIComponent(pagamentoId)}/refunds`, {
    method: "POST",
    headers: cab({ "X-Idempotency-Key": `devolucao-${pagamentoId}` }),
    body: "{}",
  });
  return r.ok;
}

// Confere a assinatura do webhook (opcional: o pagamento é sempre reconsultado na API do Mercado Pago).
export async function assinaturaOk(p: { assinatura: string; requisicao: string; dataId: string }): Promise<boolean> {
  const segredo = env("MP_WEBHOOK_SECRET");
  if (!segredo) return true;
  const partes = Object.fromEntries(p.assinatura.split(",").map((x) => x.trim().split("=") as [string, string]));
  if (!partes.ts || !partes.v1) return false;
  const manifesto = `id:${p.dataId.toLowerCase()};request-id:${p.requisicao};ts:${partes.ts};`;
  const chave = await crypto.subtle.importKey("raw", new TextEncoder().encode(segredo), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const bruto = new Uint8Array(await crypto.subtle.sign("HMAC", chave, new TextEncoder().encode(manifesto)));
  const hex = Array.from(bruto).map((b) => b.toString(16).padStart(2, "0")).join("");
  return hex === partes.v1;
}
