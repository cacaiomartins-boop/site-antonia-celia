// Avisos por e-mail (Resend). Sem RESEND_API_KEY, o aviso só vai para o log do servidor.
import { env, escapar } from "./http.js";

type Email = { para: string; assunto: string; html: string };

export async function enviar(m: Email): Promise<boolean> {
  const chave = env("RESEND_API_KEY");
  if (!chave) {
    console.log(`[e-mail simulado] para ${m.para}: ${m.assunto}`);
    return false;
  }
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${chave}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env("MAIL_FROM") ?? "Antônia Célia <onboarding@resend.dev>", to: [m.para], subject: m.assunto, html: m.html }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

const moldura = (conteudo: string) =>
  `<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.5;color:#16130F;max-width:560px">${conteudo}</div>`;

export type DadosReserva = { obra: string; nome: string; email?: string; telefone: string; ate: string; valor: string };

export async function avisarArtista(d: DadosReserva) {
  const para = env("NOTIFY_EMAIL");
  if (!para) return console.log(`[aviso] reserva de "${d.obra}" por ${d.nome} (sem NOTIFY_EMAIL configurado)`);
  await enviar({
    para,
    assunto: `Nova reserva: ${d.obra}`,
    html: moldura(`
      <h2 style="margin:0 0 12px">Nova reserva: ${escapar(d.obra)}</h2>
      <p>O sinal de ${escapar(d.valor)} foi pago. A tela fica reservada até <b>${escapar(d.ate)}</b>.</p>
      <p><b>${escapar(d.nome)}</b><br>WhatsApp/telefone: ${escapar(d.telefone)}${d.email ? `<br>${escapar(d.email)}` : ""}</p>
      <p>Entre em contato para combinar valor final, entrega e instalação.</p>`),
  });
}

export async function avisarComprador(d: DadosReserva) {
  if (!d.email) return;
  await enviar({
    para: d.email,
    assunto: `Reserva confirmada: ${d.obra}`,
    html: moldura(`
      <h2 style="margin:0 0 12px">Sua reserva foi confirmada</h2>
      <p>${escapar(d.nome)}, a tela <b>${escapar(d.obra)}</b> está reservada para você até <b>${escapar(d.ate)}</b>.</p>
      <p>O sinal de ${escapar(d.valor)} será abatido do valor final. A Antônia (ou quem ela indicar) vai entrar em contato pelo WhatsApp que você informou para combinar valor, entrega e instalação.</p>
      <p>Se o negócio não for fechado, o sinal é devolvido.</p>`),
  });
}

export async function avisarConflito(d: { obra: string; nome: string; telefone: string }) {
  const para = env("NOTIFY_EMAIL");
  if (!para) return;
  await enviar({
    para,
    assunto: `Atenção: pagamento duplicado em ${d.obra}`,
    html: moldura(`<p>${escapar(d.nome)} (${escapar(d.telefone)}) pagou o sinal de <b>${escapar(d.obra)}</b> depois que a obra já tinha sido reservada por outra pessoa. O sinal precisa ser devolvido (painel /admin).</p>`),
  });
}
