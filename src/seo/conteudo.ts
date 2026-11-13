// Gera, a partir dos dados do próprio site, o que fica no HTML de cada página para quem não executa JavaScript
// (robôs de busca e de IA): tags do <head>, dados estruturados (JSON-LD) e uma versão em texto do conteúdo.
// Só roda no build (scripts/seo.mjs). Nada daqui aparece para quem usa o site normalmente.
import { artista, curriculo, exposicoes, links, medidaTexto, obras, paginas, textos, type Obra } from "../data/clinic";
import { NOME, OG_ALT, OG_IMAGEM, SITE, seoNaoEncontrada, seoPaginas, urlDe } from "./site";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const json = (o: unknown) => JSON.stringify(o).replace(/</g, "\\u003c");

const EMAIL = artista.email;
const TELEFONE = `+${artista.whatsapp.slice(0, 2)} ${artista.whatsapp.slice(2, 4)} ${artista.whatsapp.slice(4, 9)}-${artista.whatsapp.slice(9)}`;
const PESSOA = `${SITE}/#antonia-celia`;
const SITE_ID = `${SITE}/#site`;

const foto = (id: string) => `${SITE}/img/obras/${id}.webp`;
const preco = (o: Obra) => {
  const m = o.preco?.match(/R\$\s*([\d.]+),(\d{2})/);
  return m ? `${m[1].replace(/\./g, "")}.${m[2]}` : null;
};

const pessoa = (comContato = false) => ({
  "@type": "Person",
  "@id": PESSOA,
  name: NOME,
  alternateName: artista.nomeCompleto,
  jobTitle: "Artista plástica",
  description: textos.sobre[0],
  url: `${SITE}/`,
  image: `${SITE}/img/antonia-sala.webp`,
  email: EMAIL,
  telephone: TELEFONE,
  address: { "@type": "PostalAddress", addressLocality: artista.cidade, addressRegion: "DF", addressCountry: "BR" },
  sameAs: [links.instagram],
  ...(comContato
    ? { contactPoint: { "@type": "ContactPoint", contactType: "customer support", telephone: TELEFONE, email: EMAIL, availableLanguage: ["pt-BR", "en"], areaServed: "Worldwide" } }
    : {}),
});

const site = () => ({
  "@type": "WebSite",
  "@id": SITE_ID,
  url: `${SITE}/`,
  name: NOME,
  inLanguage: "pt-BR",
  publisher: { "@id": PESSOA },
});

const obraLd = (o: Obra, comOferta: boolean) => ({
  "@type": "VisualArtwork",
  name: o.titulo,
  image: foto(o.id),
  creator: { "@id": PESSOA },
  ...(o.tecnica ? { artMedium: o.tecnica } : {}),
  ...(o.ano ? { dateCreated: String(o.ano) } : {}),
  ...(o.semMedida ? {} : {
    height: { "@type": "QuantitativeValue", value: o.dim[0], unitCode: "CMT" },
    width: { "@type": "QuantitativeValue", value: o.dim[1], unitCode: "CMT" },
  }),
  ...(comOferta && preco(o)
    ? { offers: { "@type": "Offer", price: preco(o), priceCurrency: "BRL", availability: "https://schema.org/InStock", url: urlDe("/disponiveis") } }
    : {}),
});

const lista = (itens: object[]) => ({
  "@type": "ItemList",
  numberOfItems: itens.length,
  itemListElement: itens.map((item, i) => ({ "@type": "ListItem", position: i + 1, item })),
});

const nomeDe = (rota: string) => paginas.find((p) => p.rota === rota)?.nome ?? "";

function grafo(rota: string) {
  if (rota === "/") return [site(), pessoa()];
  const tipo: Record<string, string> = { "/quem-sou": "AboutPage", "/contato": "ContactPage", "/exposicoes": "CollectionPage", "/disponiveis": "CollectionPage", "/vendidas": "CollectionPage" };
  const seo = seoPaginas.find((p) => p.rota === rota)!;
  const g: object[] = [
    {
      "@type": tipo[rota],
      "@id": `${urlDe(rota)}#pagina`,
      url: urlDe(rota),
      name: seo.titulo,
      description: seo.descricao,
      inLanguage: "pt-BR",
      isPartOf: { "@id": SITE_ID },
      about: { "@id": PESSOA },
      breadcrumb: { "@id": `${urlDe(rota)}#trilha` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${urlDe(rota)}#trilha`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: nomeDe(rota), item: urlDe(rota) },
      ],
    },
    site(),
    pessoa(rota === "/contato"),
  ];
  if (rota === "/disponiveis") g.push(lista(obras.filter((o) => o.status === "disponivel").map((o) => obraLd(o, true))));
  if (rota === "/vendidas") g.push(lista(obras.filter((o) => o.status === "vendida").map((o) => obraLd(o, false))));
  return g;
}

export function headDe(rota: string): string {
  const seo = seoPaginas.find((p) => p.rota === rota)!;
  const url = urlDe(rota);
  return [
    `<title>${esc(seo.titulo)}</title>`,
    `<meta name="description" content="${esc(seo.descricao)}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large" />`,
    `<link rel="canonical" href="${url}" />`,
    ...(paginas.find((x) => x.rota === rota) ? [`<link rel="preload" as="image" href="${paginas.find((x) => x.rota === rota)!.img}" type="image/webp" fetchpriority="high" />`] : []),
    `<meta property="og:site_name" content="${NOME}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="pt_BR" />`,
    `<meta property="og:title" content="${esc(seo.titulo)}" />`,
    `<meta property="og:description" content="${esc(seo.descricao)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${OG_IMAGEM}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(OG_ALT)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(seo.titulo)}" />`,
    `<meta name="twitter:description" content="${esc(seo.descricao)}" />`,
    `<meta name="twitter:image" content="${OG_IMAGEM}" />`,
    `<script type="application/ld+json">${json({ "@context": "https://schema.org", "@graph": grafo(rota) })}</script>`,
  ].join("\n    ");
}

export function headNaoEncontrada(): string {
  return [
    `<title>${esc(seoNaoEncontrada.titulo)}</title>`,
    `<meta name="description" content="${esc(seoNaoEncontrada.descricao)}" />`,
    `<meta name="robots" content="noindex" />`,
  ].join("\n    ");
}

// ---------------- texto das páginas (versão sem JavaScript) ----------------
const p = (t: string) => `<p>${esc(t)}</p>`;
const ul = (itens: string[]) => `<ul>${itens.map((i) => `<li>${i}</li>`).join("")}</ul>`;
const a = (href: string, t: string) => `<a href="${esc(href)}">${esc(t)}</a>`;
const medida = (o: Obra) => (o.semMedida ? "" : medidaTexto(o.dim));

const menu = () =>
  `<nav aria-label="Principal">${ul([a("/", "Início"), ...paginas.map((x) => a(x.rota, x.nome))])}</nav>`;

const contatoLinhas = () =>
  ul([
    a(links.whatsapp("Olá, Antônia! Vi o seu site e gostaria de conversar sobre uma tela."), "Falar com a Antônia no WhatsApp"),
    `E-mail: ${a(`mailto:${EMAIL}`, EMAIL)}`,
    a(links.instagram, `Instagram @${artista.instagram}`),
  ]);

function corpo(rota: string): string {
  const h1 = rota === "/" ? `${NOME}, ${artista.funcao.toLowerCase()}` : nomeDe(rota);
  const frase = paginas.find((x) => x.rota === rota)?.frase;
  const base: string[] = [`<h1>${esc(h1)}</h1>`, frase ? p(frase) : p(textos.heroLinha)];

  if (rota === "/") {
    base.push(...textos.sobre.map(p), p(textos.encomenda), contatoLinhas());
  }
  if (rota === "/quem-sou") {
    base.push(...textos.sobre.map(p));
    base.push("<h2>Séries e fases</h2>", ul(textos.series.map(esc)));
    base.push("<h2>O que dizem sobre as telas</h2>");
    for (const c of textos.criticas) base.push(`<h3>${esc(c.autor)}</h3>`, ...c.texto.map(p));
    base.push("<h2>Reconhecimentos</h2>", ul(textos.reconhecimentos.map((r) => `${esc(r.ano)}: ${esc(r.texto)}`)));
  }
  if (rota === "/exposicoes") {
    base.push(
      "<h2>Linha do tempo</h2>",
      ul(exposicoes.map((e) => {
        const onde = [...new Set([e.local, e.cidade, e.pais])].join(", ");
        return `${e.ano}: ${esc(e.titulo)}, ${esc(onde)}${e.nota ? `. ${esc(e.nota)}` : ""}`;
      })),
      "<h2>Currículo completo</h2>",
      "<h3>Exposições individuais</h3>",
      ul(curriculo.individuais.map(([ano, l]) => `${ano}: ${esc(l.join("; "))}`)),
      "<h3>Exposições coletivas</h3>",
      ul(curriculo.coletivas.map(([ano, l]) => `${ano}: ${esc(l.join("; "))}`)),
    );
  }
  if (rota === "/disponiveis") {
    const ds = obras.filter((o) => o.status === "disponivel");
    base.push(
      p(`${ds.length} telas disponíveis. Cada uma mostra técnica, medida e valor.`),
      ul(ds.map((o) => esc([o.titulo, o.tecnica, medida(o), o.ano, o.preco].filter(Boolean).join(" · ")))),
      contatoLinhas(),
    );
  }
  if (rota === "/vendidas") {
    const vs = obras.filter((o) => o.status === "vendida");
    base.push(
      p(textos.encomenda),
      ul(vs.map((o) => esc([o.titulo, o.tecnica, medida(o), o.ano].filter(Boolean).join(" · ")))),
      contatoLinhas(),
    );
  }
  if (rota === "/contato") {
    base.push(
      p("Quem escolhe uma tela conversa direto com a Antonia, pelo WhatsApp ou por e-mail, e combina tudo com ela."),
      contatoLinhas(),
      p(`${artista.cidade}, DF.`),
      "<h2>Como funciona</h2>",
      ul(textos.passos.map((s) => `${esc(s.titulo)}: ${esc(s.texto)}`)),
    );
  }
  return `<header>${menu()}</header><main>${base.join("")}</main><footer>${p(`© ${new Date().getFullYear()} ${artista.nomeCompleto}. Todas as obras são de autoria da artista.`)}</footer>`;
}

// Fica dentro de <noscript>: quem usa o site normalmente nunca vê; robôs sem JavaScript leem o texto.
export const semJavascriptDe = (rota: string) => `<noscript>${corpo(rota)}</noscript>`;

export const semJavascriptNaoEncontrada = () =>
  `<noscript><main><h1>Página não encontrada</h1>${p("Esta página não existe.")}${a("/", "Voltar ao início")}</main></noscript>`;

export const rotas = seoPaginas.map((x) => x.rota);

export function sitemap(): string {
  const data = new Date().toISOString().slice(0, 10);
  const itens = rotas
    .map((r) => `  <url>\n    <loc>${urlDe(r)}</loc>\n    <lastmod>${data}</lastmod>\n  </url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${itens}\n</urlset>\n`;
}
