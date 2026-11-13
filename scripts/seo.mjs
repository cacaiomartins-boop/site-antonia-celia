// Depois do build: grava em dist/ um HTML para cada página (título, descrição, canonical, dados estruturados e
// uma versão em texto para quem não executa JavaScript), o sitemap.xml e o 404.html. O visual não muda:
// o React assume a página normalmente assim que o JavaScript carrega.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createServer } from "vite";

const dist = "dist";
const servidor = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "error" });
let c;
try {
  c = await servidor.ssrLoadModule("/src/seo/conteudo.ts");
} finally {
  await servidor.close();
}

const modelo = await readFile(join(dist, "index.html"), "utf8");
const montar = (head, noscript) =>
  modelo
    .replace(/\s*<title>[\s\S]*?<\/title>/, "")
    .replace(/\s*<meta name="description"[^>]*>/, "")
    .replace("</head>", `    ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root"></div>\n    ${noscript}`);

for (const rota of c.rotas) {
  const html = montar(c.headDe(rota), c.semJavascriptDe(rota));
  const pasta = rota === "/" ? dist : join(dist, rota);
  await mkdir(pasta, { recursive: true });
  await writeFile(join(pasta, "index.html"), html);
}
await mkdir(join(dist, "admin"), { recursive: true });
await writeFile(join(dist, "admin", "index.html"), montar(c.headPainel(), ""));
await writeFile(join(dist, "404.html"), montar(c.headNaoEncontrada(), c.semJavascriptNaoEncontrada()));
await writeFile(join(dist, "sitemap.xml"), c.sitemap());
console.log(`SEO: ${c.rotas.length} páginas, 404.html e sitemap.xml gerados em ${dist}/`);
