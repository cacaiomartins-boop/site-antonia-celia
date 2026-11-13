# Painel das telas (/admin): como ligar e como usar

O painel fica em `https://www.antoniacelia.com/admin` (há também um link discreto "Painel" no rodapé do site).
Nele a Antônia (ou quem ela indicar) marca uma tela como **vendida**, **volta para a loja**, edita nome, valor e medida,
**cadastra uma tela nova** arrastando a foto e **exclui** telas. Nada vai para o site na hora: as mudanças ficam
guardadas no painel até clicar em **Publicar alterações**. Cerca de 1 a 2 minutos depois o site está atualizado.

## Como funciona (resumo)

- As obras ficam no arquivo `src/data/obras.json` e as fotos em `public/img/obras/`.
- "Publicar alterações" grava tudo de uma vez no repositório do site no GitHub (um commit só).
  A Vercel republica sozinha, e o site (incluindo título, descrição e dados para o Google) é gerado de novo.
- Cada publicação vira um commit no GitHub ("Painel: nova: ...; vendida: ..."). Para **desfazer**, basta reverter o commit.
- A foto é reduzida no próprio navegador (1600 px e uma miniatura de 640 px, em WebP) antes de ser enviada.
- A senha e a chave do GitHub ficam só no servidor (variáveis da Vercel). Nada disso vai para o navegador.

## O que precisa ser feito uma vez (por você, Caio)

Até isto ser feito, o painel abre, mas avisa que ainda não está configurado. Nada quebra no site.

### 1. Criar a chave do GitHub
1. GitHub > **Settings** > **Developer settings** > **Personal access tokens** > **Fine-grained tokens** > **Generate new token**.
2. Nome: `painel-antonia-celia`. Validade: a maior disponível (anote para renovar).
3. **Repository access**: *Only select repositories* > `site-antonia-celia`.
4. **Permissions** > Repository permissions > **Contents: Read and write**. Nenhuma outra.
5. Gere e **copie** a chave (só aparece uma vez). Não envie por conversa.

### 2. Variáveis na Vercel
Projeto > **Settings** > **Environment Variables** (marque Production, Preview e Development):

| Nome | Valor |
|---|---|
| `ADMIN_PASSWORD` | a senha do painel |
| `GITHUB_TOKEN` | a chave copiada acima |
| `ADMIN_SESSION_SECRET` | (opcional, recomendado) um texto longo e aleatório |
| `GITHUB_REPO` | (opcional) `cacaiomartins-boop/site-antonia-celia`, que já é o padrão |
| `GITHUB_BRANCH` | (opcional) `main`, que já é o padrão |

Depois: **Deployments** > o último > **Redeploy** (a Vercel só lê variáveis novas num novo deploy).

### 3. Testar
Abra `https://www.antoniacelia.com/admin`, entre com a senha, marque uma tela como vendida, clique em
**Publicar alterações** e confira no GitHub o commit novo. Depois volte a tela para a loja e publique de novo.

## Cuidados

- **Senha:** uma senha só de números (6 dígitos) pode ser adivinhada por tentativa e erro. O painel atrasa e limita as
  tentativas, mas o ideal é uma senha mais longa (12 caracteres ou mais, com letras). Trocar é só mudar `ADMIN_PASSWORD` na Vercel.
- **A chave do GitHub expira.** Quando expirar, o painel mostra "O painel não tem permissão no GitHub". Crie outra e troque `GITHUB_TOKEN`.
- **Duas pessoas ao mesmo tempo:** se alguém publicar enquanto outra pessoa edita, o painel avisa para recarregar (não sobrescreve).
- **Foto trocada** pode demorar até 1 dia para aparecer em quem já visitou o site (cache de imagens).
- Se um dado inválido impedir a geração do site, a Vercel mantém a versão anterior no ar.

## Para testar no computador (modo de teste)

Com `npm run dev` e um arquivo `.env.local` com `ADMIN_PASSWORD=...`, o painel funciona **sem GitHub**: tudo o que for
"publicado" vai para a pasta `.dev-data/` (que é apagada à vontade e não vai para o site). `.env.local` não é enviado ao GitHub.
