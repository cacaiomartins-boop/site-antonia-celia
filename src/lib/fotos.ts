// Prepara a foto no navegador: reduz para 1600 px (grande) e 640 px (miniatura). Tenta WebP; se o aparelho não
// consegue gerar WebP (alguns iPhones), usa JPEG. O painel só envia o resultado, nunca a foto original do celular.
export type FotoPronta = {
  ext: "webp" | "jpg";
  w: number;
  h: number;
  grande: string; // base64 (sem o prefixo data:)
  mini?: string; // base64; só quando a foto é maior que 640 px
  previa: string; // endereço para mostrar na tela
};

const GRANDE = 1600;
const MINI = 640;

function carregar(arquivo: File): Promise<HTMLImageElement> {
  return new Promise((ok, falha) => {
    const url = URL.createObjectURL(arquivo);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); ok(img); };
    img.onerror = () => { URL.revokeObjectURL(url); falha(new Error("Não foi possível abrir esta foto. Use uma imagem JPG, PNG ou WebP.")); };
    img.src = url;
  });
}

// "lado" = o maior lado da imagem; "largura" = a largura exata (miniatura)
function desenhar(img: HTMLImageElement, tamanho: number, por: "lado" | "largura" = "lado"): HTMLCanvasElement {
  const e = Math.min(1, tamanho / (por === "lado" ? Math.max(img.naturalWidth, img.naturalHeight) : img.naturalWidth));
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(img.naturalWidth * e));
  c.height = Math.max(1, Math.round(img.naturalHeight * e));
  const g = c.getContext("2d")!;
  g.imageSmoothingQuality = "high";
  g.drawImage(img, 0, 0, c.width, c.height);
  return c;
}

const paraBlob = (c: HTMLCanvasElement, tipo: string, q: number) => new Promise<Blob | null>((ok) => c.toBlob(ok, tipo, q));

async function base64(b: Blob): Promise<string> {
  const buf = new Uint8Array(await b.arrayBuffer());
  let s = "";
  for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return btoa(s);
}

export async function prepararFoto(arquivo: File): Promise<FotoPronta> {
  if (!/^image\//.test(arquivo.type)) throw new Error("Escolha um arquivo de imagem (JPG, PNG ou WebP).");
  const img = await carregar(arquivo);
  const grande = desenhar(img, GRANDE);
  let tipo: "image/webp" | "image/jpeg" = "image/webp";
  let blob = await paraBlob(grande, tipo, 0.78);
  if (!blob || blob.type !== "image/webp") { tipo = "image/jpeg"; blob = await paraBlob(grande, tipo, 0.86); }
  if (!blob) throw new Error("Não foi possível preparar a foto.");
  const ext = tipo === "image/webp" ? "webp" : "jpg";
  const pronta: FotoPronta = { ext, w: grande.width, h: grande.height, grande: await base64(blob), previa: URL.createObjectURL(blob) };
  if (grande.width > MINI) {
    const mini = desenhar(img, MINI, "largura");
    const bm = await paraBlob(mini, tipo, tipo === "image/webp" ? 0.74 : 0.82);
    if (bm) pronta.mini = await base64(bm);
  }
  return pronta;
}
