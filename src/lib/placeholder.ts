import type { Obra } from "../data/clinic";

// Tela provisória só com CSS (leve): fundo na cor da obra + faixas, para quando
// ainda não existe a foto real em public/img/obras/<id>.jpg
function semente(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507)), ((h ^= h >>> 13) >>> 0) / 4294967296);
}

export function telaProvisoria(o: Pick<Obra, "id" | "paleta">, vertical: boolean) {
  const r = semente(o.id);
  const [a, b, c] = o.paleta;
  const dir = vertical ? "90deg" : "180deg";
  const faixas = [b, c, b].map((cor, i) => {
    const ini = 8 + r() * 70 + i * 4;
    const fim = Math.min(98, ini + 6 + r() * 18);
    return `linear-gradient(${dir}, transparent ${ini.toFixed(0)}%, ${cor} ${ini.toFixed(0)}%, ${cor} ${fim.toFixed(0)}%, transparent ${fim.toFixed(0)}%)`;
  });
  const fio = 20 + r() * 60;
  faixas.push(`linear-gradient(${vertical ? "100deg" : "170deg"}, transparent ${fio.toFixed(0)}%, #C9A24B ${fio.toFixed(0)}%, #C9A24B ${(fio + 0.8).toFixed(1)}%, transparent ${(fio + 0.8).toFixed(1)}%)`);
  faixas.push(`linear-gradient(${a}, ${a})`);
  return faixas.join(", ");
}
