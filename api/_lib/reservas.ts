// Regras das reservas. Cada obra só pode ter uma reserva ativa por vez.
//   aguardando_pagamento -> reservada -> (vendida | liberada | expirada)
//   aguardando_pagamento -> cancelada (não pagou a tempo)
//   conflito: pagou depois que outra pessoa já tinha reservado (sinal precisa ser devolvido)
import { obras, reserva as regras } from "../../src/data/clinic.js";
import { armazenamento, type Store } from "./store.js";
import { aprovadoDaReserva, criarCheckout, devolver, modo, type Checkout } from "./pagamento.js";
import { avisarArtista, avisarComprador, avisarConflito } from "./notificar.js";

export type StatusReserva = "aguardando_pagamento" | "reservada" | "vendida" | "liberada" | "expirada" | "cancelada" | "conflito";

export type Reserva = {
  id: string;
  token: string; // só quem reservou conhece (usado para acompanhar o pagamento)
  obraId: string;
  obraTitulo: string;
  comprador: { nome: string; telefone: string; email?: string }; // o e-mail vem do pagamento
  status: StatusReserva;
  sinal: number;
  modo: string;
  pagamentoId: string; // preenchido quando o pagamento é aprovado
  checkout: Checkout;
  criadaEm: string;
  pagaEm?: string;
  expiraEm: string; // fim da reserva (ou do prazo para pagar, enquanto aguarda)
  devolvido?: boolean;
};

const LISTA = "reservas:ids";
const kReserva = (id: string) => `reserva:${id}`;
const kObra = (obraId: string) => `obra:${obraId}`;

export class ErroReserva extends Error {
  constructor(public codigo: number, mensagem: string) { super(mensagem); }
}

export const loja = () => {
  const s = armazenamento();
  if (!s || modo() === "desligado") throw new ErroReserva(503, "As reservas pelo site estão desativadas no momento.");
  return s;
};

export const ativo = () => modo() !== "desligado" && armazenamento() !== null;

const aleatorio = (bytes: number) => Array.from(crypto.getRandomValues(new Uint8Array(bytes)), (b) => b.toString(16).padStart(2, "0")).join("");

// Estado "de verdade" agora (o salvo pode estar vencido)
export function efetivo(r: Reserva, agora = Date.now()): StatusReserva {
  if (r.status === "aguardando_pagamento" && Date.parse(r.expiraEm) < agora) return "cancelada";
  if (r.status === "reservada" && Date.parse(r.expiraEm) < agora) return "expirada";
  return r.status;
}
const ocupa = (s: StatusReserva) => s === "aguardando_pagamento" || s === "reservada" || s === "vendida";

export async function todas(s: Store): Promise<Reserva[]> {
  const ids = await s.todos(LISTA);
  const lidas = await Promise.all(ids.map((id) => s.get<Reserva>(kReserva(id))));
  return lidas.filter((r): r is Reserva => Boolean(r));
}

export async function estadoPublico() {
  const s = loja();
  const agora = Date.now();
  const reservadas: Record<string, string> = {};
  const vendidas: string[] = [];
  for (const r of await todas(s)) {
    const e = efetivo(r, agora);
    if (e === "vendida") vendidas.push(r.obraId);
    else if (e === "reservada" || e === "aguardando_pagamento") reservadas[r.obraId] = r.expiraEm;
  }
  return { reservadas, vendidas };
}

const dataBr = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
const reais = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export type Entrada = { obraId: string; nome: string; telefone: string; ip: string; origem: string };

export async function criar(e: Entrada) {
  const s = loja();
  const obra = obras.find((o) => o.id === e.obraId);
  if (!obra || obra.status !== "disponivel") throw new ErroReserva(404, "Esta tela não está disponível para reserva.");

  // limite simples por IP: 6 tentativas por hora
  if ((await s.incr(`limite:${e.ip}`, 3600)) > 6) throw new ErroReserva(429, "Muitas tentativas. Tente de novo mais tarde ou fale com a artista pelo WhatsApp.");

  // quem segura a obra agora?
  const atualId = await s.get<string>(kObra(e.obraId));
  if (atualId) {
    const atual = await s.get<Reserva>(kReserva(atualId));
    if (atual && ocupa(efetivo(atual))) throw new ErroReserva(409, "Esta tela acabou de ser reservada por outra pessoa.");
    await s.del(kObra(e.obraId));
  }

  const id = aleatorio(8);
  const prazoPagar = regras.minutosParaPagar * 60;
  if (!(await s.setNX(kObra(e.obraId), id, prazoPagar))) throw new ErroReserva(409, "Esta tela acabou de ser reservada por outra pessoa.");

  try {
    const token = aleatorio(16);
    const checkout = await criarCheckout({
      reservaId: id, token, obraId: obra.id, titulo: obra.titulo, valor: regras.sinal,
      nome: e.nome, telefone: e.telefone, minutos: regras.minutosParaPagar, origem: e.origem,
    });
    const r: Reserva = {
      id, token, obraId: obra.id, obraTitulo: obra.titulo,
      comprador: { nome: e.nome, telefone: e.telefone },
      status: "aguardando_pagamento", sinal: regras.sinal, modo: modo(), pagamentoId: "", checkout,
      criadaEm: new Date().toISOString(), expiraEm: checkout.expiraEm,
    };
    await s.set(kReserva(id), r);
    await s.push(LISTA, id);
    return r;
  } catch (err) {
    await s.del(kObra(e.obraId)); // não deixa a obra presa se o Pix falhou
    console.error("Falha ao criar o pagamento:", err);
    throw new ErroReserva(502, "Não foi possível abrir o pagamento agora. Tente de novo ou fale com a artista pelo WhatsApp.");
  }
}

export async function buscar(id: string, token?: string): Promise<Reserva | null> {
  const r = await loja().get<Reserva>(kReserva(id));
  if (!r) return null;
  if (token !== undefined && r.token !== token) return null;
  return r;
}

// Pagamento aprovado (webhook, consulta ou simulação)
export async function confirmarPagamento(id: string, pagamento?: { id: string; email?: string }): Promise<Reserva | null> {
  const s = loja();
  const r = await s.get<Reserva>(kReserva(id));
  if (!r || r.status === "reservada" || r.status === "vendida") return r;
  if (r.status !== "aguardando_pagamento" && r.status !== "cancelada" && r.status !== "expirada") return r;

  const agora = new Date();
  const fim = new Date(agora.getTime() + regras.dias * 86400 * 1000).toISOString();
  const seg = regras.dias * 86400;

  // segura a obra por 7 dias: vale se ainda é nossa ou se está livre
  const dono = await s.get<string>(kObra(r.obraId));
  let ok = dono === r.id;
  if (ok) await s.set(kObra(r.obraId), r.id, seg);
  else if (!dono) ok = await s.setNX(kObra(r.obraId), r.id, seg);

  if (!ok) {
    const c: Reserva = { ...r, status: "conflito", pagaEm: agora.toISOString(), pagamentoId: pagamento?.id ?? r.pagamentoId };
    await s.set(kReserva(id), c);
    await avisarConflito({ obra: r.obraTitulo, nome: r.comprador.nome, telefone: r.comprador.telefone });
    if (await devolver(r.pagamentoId)) await s.set(kReserva(id), { ...c, devolvido: true });
    return c;
  }

  const nova: Reserva = {
    ...r, status: "reservada", pagaEm: agora.toISOString(), expiraEm: fim,
    pagamentoId: pagamento?.id ?? r.pagamentoId,
    comprador: { ...r.comprador, email: pagamento?.email ?? r.comprador.email },
  };
  await s.set(kReserva(id), nova);
  const d = {
    obra: r.obraTitulo, nome: r.comprador.nome, email: nova.comprador.email, telefone: r.comprador.telefone,
    ate: dataBr(fim), valor: reais(r.sinal),
  };
  await Promise.all([avisarArtista(d), avisarComprador(d)]);
  return nova;
}

// Se o webhook demorar, a página consulta o Mercado Pago diretamente.
export async function sincronizar(r: Reserva): Promise<Reserva> {
  if (r.status !== "aguardando_pagamento" || r.modo !== "mercadopago") return r;
  const p = await aprovadoDaReserva(r.id);
  if (p && p.valor >= r.sinal) return (await confirmarPagamento(r.id, { id: p.id, email: p.email })) ?? r;
  return r;
}

// ---------------- Ações da artista (painel /admin) ----------------
export type Acao = "liberar" | "vendida" | "devolver" | "estender";

export async function agir(id: string, acao: Acao, devolverSinal = false): Promise<Reserva> {
  const s = loja();
  const r = await s.get<Reserva>(kReserva(id));
  if (!r) throw new ErroReserva(404, "Reserva não encontrada.");
  let nova = r;

  if (acao === "liberar") {
    nova = { ...r, status: "liberada" };
    if (await s.get<string>(kObra(r.obraId)) === r.id) await s.del(kObra(r.obraId));
    if (devolverSinal && r.pagaEm && !r.devolvido && (await devolver(r.pagamentoId))) nova.devolvido = true;
  } else if (acao === "vendida") {
    nova = { ...r, status: "vendida" };
    await s.set(kObra(r.obraId), r.id); // sem prazo: a obra nunca mais é reservada
  } else if (acao === "devolver") {
    if (!r.pagaEm || r.devolvido) throw new ErroReserva(400, "Não há sinal para devolver.");
    if (!(await devolver(r.pagamentoId))) throw new ErroReserva(502, "O meio de pagamento recusou a devolução. Faça pela conta do Mercado Pago.");
    nova = { ...r, devolvido: true };
  } else if (acao === "estender") {
    if (efetivo(r) !== "reservada") throw new ErroReserva(400, "Só dá para estender uma reserva ativa.");
    const fim = new Date(Date.parse(r.expiraEm) + regras.dias * 86400 * 1000).toISOString();
    nova = { ...r, expiraEm: fim };
    await s.set(kObra(r.obraId), r.id, Math.ceil((Date.parse(fim) - Date.now()) / 1000));
  }
  await s.set(kReserva(id), nova);
  return nova;
}

// Visão pública mínima (nunca devolve dados do comprador)
export const visao = (r: Reserva) => ({
  id: r.id,
  status: efetivo(r),
  obra: r.obraTitulo,
  ate: r.expiraEm,
  checkoutUrl: efetivo(r) === "aguardando_pagamento" ? r.checkout.url : undefined,
  valor: r.sinal,
  simulado: r.modo === "simulado",
});
