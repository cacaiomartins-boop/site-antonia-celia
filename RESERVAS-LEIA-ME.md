# Reservas com sinal: como funciona e como ligar

O botão **"Reservar"** pede só nome e WhatsApp e leva a pessoa para a **página de pagamento do Mercado Pago**
(Pix ou cartão, sem boleto), com o sinal de R$ 200. Quando o pagamento é aprovado, a pessoa volta ao site, a obra
aparece como **Reservada** por 7 dias e a Antônia recebe um e-mail com os dados de quem reservou.
O valor final, a entrega e a instalação são combinados direto com ela (ou com quem ela indicar).

Valor do sinal, prazo e texto das condições: `reserva` em `src/data/clinic.ts` (o servidor usa os mesmos números).

## Estado atual

- **No computador (`npm run dev`)**: funciona em modo de teste. Em vez da página do banco, aparece uma tela de
  teste com o botão "Simular pagamento aprovado". Os dados ficam em `.dev-data/` (pode apagar a pasta para zerar).
- **Na Vercel, sem configurar nada abaixo**: as reservas ficam **desligadas** e o site mostra só o botão do
  WhatsApp, como antes. Nada quebra.

## Para ligar de verdade (na Vercel)

1. **Mercado Pago da Antônia** (o dinheiro cai na conta dela): conta no nome dela, depois
   Seu negócio > Configurações > Credenciais > **Credenciais de produção** > copiar o **Access Token** →
   `MP_ACCESS_TOKEN`. Ative o recebimento por Pix e cadastre uma chave Pix na conta.
2. **Webhook**: em Suas integrações > Webhooks, apontar para `https://SEU-SITE/api/webhook` e marcar "Pagamentos".
   (Opcional: copiar a assinatura secreta → `MP_WEBHOOK_SECRET`.) A cobrança já leva esse endereço, mas o webhook
   cadastrado garante a confirmação se a pessoa fechar a página antes de voltar ao site. Sem o webhook, a confirmação
   só acontece quando ela volta.
3. **Banco das reservas**: na Vercel, aba Storage / Marketplace > **Upstash for Redis** > conectar ao projeto
   (as variáveis `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` entram sozinhas).
4. **Variáveis**: `SITE_URL` (endereço do site), `ADMIN_TOKEN` (senha comprida do painel), e para e-mails
   `RESEND_API_KEY`, `MAIL_FROM`, `NOTIFY_EMAIL` (resend.com; precisa verificar o domínio). Lista completa em `.env.example`.
5. Publicar. **Testar com um pagamento real de R$ 200** (e devolver pelo painel) antes de divulgar.

## Painel da artista

`https://SEU-SITE/admin` (não aparece no menu). Entra com a senha `ADMIN_TOKEN`. Lá ela vê quem reservou
cada tela, chama no WhatsApp e escolhe: **marcar como vendida**, **estender +7 dias**, **liberar e devolver o sinal**
ou **liberar sem devolver**. Reserva vencida mostra o botão **Devolver sinal**.

## Regras que o sistema aplica

- Cada obra tem uma reserva por vez. Quem abre o pagamento segura a obra por 30 minutos; sem pagar, ela é liberada.
- Pago o Pix: reservada por 7 dias. Passado o prazo, a obra volta a ficar disponível sozinha
  (o sinal **não** é devolvido automaticamente: aparece "Devolver sinal" no painel).
- Se alguém pagar depois de outra pessoa já ter reservado, o sistema tenta devolver o sinal e avisa a artista.
- Limite de 6 tentativas por hora por pessoa, mais um campo-isca contra robôs.
- O pagamento é sempre reconsultado na API do Mercado Pago (o aviso do webhook sozinho não confirma nada).
- Os dados de contato vêm do formulário (nome e WhatsApp); o e-mail vem do próprio pagamento, se o Mercado Pago informar.
- Para aceitar só Pix, ou liberar boleto, ajustar `payment_methods` em `api/_lib/pagamento.ts`.

## Pontos para conferir na primeira publicação

- As funções da pasta `api/` nunca rodaram na Vercel ainda (só no servidor de teste). Fazer um deploy de
  teste e abrir `https://SEU-SITE/api/status`: deve responder `{"ativo":true,...}` com tudo configurado.
- A integração com o Mercado Pago foi escrita pela documentação, sem credenciais para testar. Validar
  com um pagamento real de R$ 200 (abrir a página, pagar, voltar ao site, confirmação e devolução pelo painel).
  Com credenciais de teste (começam com `TEST-`) o site usa o ambiente de testes do Mercado Pago.
- Texto das condições (`reserva.condicoes`) e política de devolução precisam da aprovação da Antônia.
