import { erro, json, type Req, type Res } from "./_lib/http.js";
import { ErroRepo, lerObrasRepo, modoLocal, repoConfigurado } from "./_lib/repo.js";
import { exigirLogin } from "./_lib/sessao.js";

// Devolve a lista de obras como está no repositório (inclui o que ainda está sendo publicado).
export default async function handler(req: Req, res: Res) {
  if (req.method !== "GET") return erro(res, 405, "Método não permitido.");
  if (!(await exigirLogin(req, res))) return;
  if (!repoConfigurado()) return erro(res, 503, "O painel ainda não tem acesso ao GitHub (falta a chave GITHUB_TOKEN no servidor).");
  try {
    const { conteudo, sha } = await lerObrasRepo();
    json(res, 200, { obras: JSON.parse(conteudo), sha, teste: modoLocal() });
  } catch (e) {
    if (e instanceof ErroRepo) return erro(res, e.codigo, e.message);
    console.error(e);
    erro(res, 500, "Não foi possível abrir as obras.");
  }
}
