import { OG_IMAGEM, seoNaoEncontrada, seoPaginas, urlDe } from "./site";

function meta(attr: "name" | "property", chave: string, valor: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${chave}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, chave);
    document.head.appendChild(el);
  }
  el.setAttribute("content", valor);
}

// Mantém título, descrição, endereço canônico e tags de compartilhamento certos quando a pessoa navega pelo site.
export function aplicarSeo(rota: string) {
  const p = seoPaginas.find((x) => x.rota === rota);
  const dados = p ?? seoNaoEncontrada;
  document.title = dados.titulo;
  meta("name", "description", dados.descricao);
  meta("name", "robots", p ? "index, follow" : "noindex");
  meta("property", "og:title", dados.titulo);
  meta("property", "og:description", dados.descricao);
  meta("name", "twitter:title", dados.titulo);
  meta("name", "twitter:description", dados.descricao);
  meta("name", "twitter:image", OG_IMAGEM);
  let canon = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!p) {
    canon?.remove(); // página que não existe: sem endereço canônico
    return;
  }
  if (!canon) {
    canon = document.createElement("link");
    canon.rel = "canonical";
    document.head.appendChild(canon);
  }
  canon.href = urlDe(rota);
  meta("property", "og:url", urlDe(rota));
}
