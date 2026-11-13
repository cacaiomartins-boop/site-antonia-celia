// Dados de SEO compartilhados: usados pelo site (título e descrição ao navegar) e pelo script do build (scripts/seo.mjs).
export const SITE = "https://www.antoniacelia.com";
export const NOME = "Antônia Célia";
export const OG_IMAGEM = `${SITE}/img/og.jpg`;
export const OG_ALT = "Pintura abstrata de Antônia Célia, em acrílico, com faixas verticais de vermelho, verde, ocre e azul";

export type SeoPagina = { rota: string; titulo: string; descricao: string };

export const seoPaginas: SeoPagina[] = [
  {
    rota: "/",
    titulo: "Antônia Célia · Artista plástica em Brasília",
    descricao: "Telas em acrílico de grande formato da artista plástica Antônia Célia, de Brasília. Obras disponíveis, exposições pelo mundo e encomendas sob medida.",
  },
  {
    rota: "/quem-sou",
    titulo: "Quem é Antônia Célia · Artista plástica de Brasília",
    descricao: "Conheça Antônia Célia, artista plástica de Brasília: sua pintura abstrata em grandes telas, as séries, os prêmios e as críticas sobre o trabalho.",
  },
  {
    rota: "/exposicoes",
    titulo: "Exposições de Antônia Célia no Brasil e no mundo",
    descricao: "Exposições de Antônia Célia desde 1993: Brasília, Paris, Roma, Nova York, Dubai, Londres e mais. Veja o mapa e o currículo completo da artista.",
  },
  {
    rota: "/disponiveis",
    titulo: "Telas à venda · Antônia Célia, artista plástica",
    descricao: "Telas de Antônia Célia à venda: pintura abstrata em acrílico, com medida e valor. Reserve pelo WhatsApp ou e-mail e combine entrega e instalação.",
  },
  {
    rota: "/vendidas",
    titulo: "Telas vendidas · Antônia Célia, artista plástica",
    descricao: "Telas de Antônia Célia que já encontraram casa. Veja as obras vendidas e peça uma tela parecida, ou sob medida, para o seu espaço.",
  },
  {
    rota: "/contato",
    titulo: "Contato e encomendas · Antônia Célia, artista plástica",
    descricao: "Fale com Antônia Célia pelo WhatsApp ou por e-mail para escolher uma tela, reservar ou encomendar uma obra sob medida, em Brasília ou no mundo todo.",
  },
];

export const seoNaoEncontrada = { titulo: "Página não encontrada · Antônia Célia", descricao: "Esta página não existe. Volte ao início do site de Antônia Célia, artista plástica de Brasília." };

export const urlDe = (rota: string) => (rota === "/" ? `${SITE}/` : `${SITE}${rota}`);
