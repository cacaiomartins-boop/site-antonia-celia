// Regras das obras: o que o painel pode gravar em src/data/obras.json e em public/img/obras.
export type Foto = { w: number; h: number; ext: "webp" | "jpg"; mini?: boolean };
export type Obra = {
  id: string;
  titulo: string;
  tecnica?: string;
  ano?: number;
  dim: [number, number];
  semMedida?: boolean;
  status: "disponivel" | "vendida" | "aguardando";
  preco?: string;
  precoAnterior?: string;
  diptico?: boolean;
  detalhe?: string;
  paleta: [string, string, string];
  foto?: Foto;
};

export const CAMINHO_OBRAS = "src/data/obras.json";
export const ID_OK = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const CAMINHO_FOTO = /^public\/img\/obras\/[a-z0-9]+(-[a-z0-9]+)*(-640)?\.(webp|jpg)$/;

export class ErroValidacao extends Error {}

const txt = (v: unknown, max: number, campo: string, obrigatorio = false): string | undefined => {
  if (v === undefined || v === null || v === "") {
    if (obrigatorio) throw new ErroValidacao(`Falta preencher: ${campo}.`);
    return undefined;
  }
  if (typeof v !== "string") throw new ErroValidacao(`Valor inválido em ${campo}.`);
  const t = v.trim();
  if (t.length > max) throw new ErroValidacao(`${campo} está muito longo (máximo ${max} letras).`);
  return t || undefined;
};

const num = (v: unknown, min: number, max: number, campo: string): number => {
  const n = typeof v === "number" ? v : NaN;
  if (!Number.isFinite(n) || n < min || n > max) throw new ErroValidacao(`Valor inválido em ${campo}.`);
  return n;
};

const PADRAO_PALETA = /^#[0-9A-Fa-f]{6}$/;

// Confere e limpa a lista inteira (descarta campos desconhecidos e mantém a ordem das chaves)
export function validarObras(entrada: unknown): Obra[] {
  if (!Array.isArray(entrada)) throw new ErroValidacao("Lista de obras inválida.");
  if (entrada.length > 400) throw new ErroValidacao("Obras demais.");
  const ids = new Set<string>();
  return entrada.map((x, i) => {
    if (!x || typeof x !== "object") throw new ErroValidacao(`Obra ${i + 1} inválida.`);
    const o = x as Record<string, unknown>;
    const id = txt(o.id, 60, "código da tela", true)!;
    if (!ID_OK.test(id)) throw new ErroValidacao(`Código inválido: ${id}.`);
    if (ids.has(id)) throw new ErroValidacao(`Código repetido: ${id}.`);
    ids.add(id);
    const titulo = txt(o.titulo, 120, "título", true)!;
    const status = o.status;
    if (status !== "disponivel" && status !== "vendida" && status !== "aguardando") throw new ErroValidacao(`Situação inválida em "${titulo}".`);
    const dim = Array.isArray(o.dim) && o.dim.length === 2 ? ([num(o.dim[0], 1, 1000, "altura"), num(o.dim[1], 1, 1000, "largura")] as [number, number]) : null;
    if (!dim) throw new ErroValidacao(`Medida inválida em "${titulo}".`);
    const paleta = Array.isArray(o.paleta) && o.paleta.length === 3 && o.paleta.every((c) => typeof c === "string" && PADRAO_PALETA.test(c));
    if (!paleta) throw new ErroValidacao(`Cores inválidas em "${titulo}".`);
    let foto: Foto | undefined;
    if (o.foto !== undefined && o.foto !== null) {
      const f = o.foto as Record<string, unknown>;
      if (f.ext !== "webp" && f.ext !== "jpg") throw new ErroValidacao(`Foto inválida em "${titulo}".`);
      foto = { w: num(f.w, 1, 8000, "largura da foto"), h: num(f.h, 1, 8000, "altura da foto"), ext: f.ext, ...(f.mini ? { mini: true } : {}) };
    }
    if (status !== "aguardando" && !foto) throw new ErroValidacao(`A tela "${titulo}" precisa de uma foto para aparecer no site.`);
    const ano = o.ano === undefined || o.ano === null || o.ano === "" ? undefined : num(o.ano, 1900, 2100, "ano");
    const preco = txt(o.preco, 80, "valor");
    const precoAnterior = txt(o.precoAnterior, 80, "valor anterior");
    if (status === "disponivel" && !preco) throw new ErroValidacao(`A tela "${titulo}" está disponível e precisa de um valor.`);
    return {
      id,
      titulo,
      ...(txt(o.tecnica, 80, "técnica") ? { tecnica: txt(o.tecnica, 80, "técnica") } : {}),
      ...(ano !== undefined ? { ano } : {}),
      dim,
      ...(o.semMedida ? { semMedida: true } : {}),
      status,
      ...(preco ? { preco } : {}),
      ...(precoAnterior ? { precoAnterior } : {}),
      ...(o.diptico ? { diptico: true } : {}),
      ...(txt(o.detalhe, 400, "observação") ? { detalhe: txt(o.detalhe, 400, "observação") } : {}),
      paleta: o.paleta as [string, string, string],
      ...(foto ? { foto } : {}),
    };
  });
}

// JSON legível: um campo por linha e listas pequenas em uma linha só (como o arquivo original)
export function formatarObras(obras: Obra[]): string {
  const t = JSON.stringify(obras, null, 2)
    .replace(/\[\s+([^[\]{}]*?)\s+\]/g, (_m, g: string) => `[${g.replace(/\s*\n\s*/g, " ")}]`)
    .replace(/"foto": \{\s+([^{}]*?)\s+\}/g, (_m, g: string) => `"foto": { ${g.replace(/,\s*\n\s*/g, ", ")} }`);
  return `${t}\n`;
}

export const arquivosDaFoto = (id: string, f: Foto): string[] => [
  `public/img/obras/${id}.${f.ext}`,
  ...(f.mini ? [`public/img/obras/${id}-640.${f.ext}`] : []),
];
