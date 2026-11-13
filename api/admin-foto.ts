import { corpo, erro, json, type Req, type Res } from "./_lib/http.js";
import { ErroRepo, criarBlob } from "./_lib/repo.js";
import { exigirLogin } from "./_lib/sessao.js";

const MAX_BASE64 = 3_400_000; // cerca de 2,5 MB de imagem

// Confere o tipo pelo começo do arquivo (não pela extensão): só entram WebP e JPEG
function tipoReal(b64: string): "webp" | "jpg" | null {
  const ini = Buffer.from(b64.slice(0, 24), "base64");
  if (ini.length >= 12 && ini.toString("ascii", 0, 4) === "RIFF" && ini.toString("ascii", 8, 12) === "WEBP") return "webp";
  if (ini.length >= 3 && ini[0] === 0xff && ini[1] === 0xd8 && ini[2] === 0xff) return "jpg";
  return null;
}

// Guarda uma foto (ainda sem publicar) e devolve o código dela; a publicação usa esse código.
export default async function handler(req: Req, res: Res) {
  if (req.method !== "POST") return erro(res, 405, "Método não permitido.");
  if (!(await exigirLogin(req, res, true))) return;
  const dados = corpo(req).dados;
  if (typeof dados !== "string" || dados.length < 100 || dados.length > MAX_BASE64 || !/^[A-Za-z0-9+/=]+$/.test(dados)) return erro(res, 400, "Foto inválida ou grande demais.");
  const tipo = tipoReal(dados);
  if (!tipo) return erro(res, 400, "Use uma foto em JPG ou WebP.");
  try {
    json(res, 200, { sha: await criarBlob(dados), ext: tipo });
  } catch (e) {
    if (e instanceof ErroRepo) return erro(res, e.codigo, e.message);
    console.error(e);
    erro(res, 500, "Não foi possível guardar a foto.");
  }
}
