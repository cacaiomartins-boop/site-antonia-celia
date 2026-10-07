import { Exposicao } from "../data/clinic";
import { MUNDO_H, MUNDO_LAT_BASE, MUNDO_LAT_TOPO, MUNDO_PATH, MUNDO_W } from "../data/mundo";

const px = (lng: number) => ((lng + 180) / 360) * MUNDO_W;
const py = (lat: number) => ((MUNDO_LAT_TOPO - lat) / (MUNDO_LAT_TOPO - MUNDO_LAT_BASE)) * MUNDO_H;

// Mapa-múndi: cada exposição vira um ponto de tinta, ligados por um traço
// que vai sendo pintado conforme a pessoa rola a lista.
export default function ExpoMapa({ lista, ativo, cor }: { lista: Exposicao[]; ativo: number; cor: string }) {
  const pts = lista.map((e) => ({ x: px(e.lng), y: py(e.lat) }));
  const arcos = pts.slice(1).map((p, i) => {
    const a = pts[i];
    const mx = (a.x + p.x) / 2, my = (a.y + p.y) / 2 - Math.min(90, Math.hypot(p.x - a.x, p.y - a.y) * 0.35);
    return `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  });
  const e = lista[ativo];
  const p = pts[ativo];
  const direita = p.x > 600;
  return (
    <svg viewBox="296 26 452 276" className="h-full w-full" role="img" aria-label={`Mapa das exposições. Em destaque: ${e.titulo}, ${e.cidade}, ${e.ano}.`}>
      <defs><clipPath id="recorte"><rect width={MUNDO_W} height={MUNDO_H} /></clipPath></defs>
      <path d={MUNDO_PATH} fill="#16130F" fillOpacity="0.13" clipPath="url(#recorte)" />
      {[-120, -60, 0, 60, 120].map((l) => (
        <line key={l} x1={px(l)} x2={px(l)} y1="0" y2={MUNDO_H} stroke="#16130F" strokeOpacity=".08" strokeWidth=".6" />
      ))}
      {arcos.map((d, i) => (
        <path
          key={i}
          d={d}
          pathLength={1}
          fill="none"
          stroke={cor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="1"
          style={{ strokeDashoffset: i < ativo ? 0 : 1, transition: "stroke-dashoffset .9s cubic-bezier(.3,.7,.2,1)" }}
        />
      ))}
      {pts.map((q, i) => (
        <circle key={i} cx={q.x} cy={q.y} r={i === ativo ? 4.5 : 2.4} fill={i <= ativo ? cor : "#16130F"} fillOpacity={i <= ativo ? 1 : 0.35} style={{ transition: "all .5s" }} />
      ))}
      <circle cx={p.x} cy={p.y} r="5" fill="none" stroke={cor} strokeWidth="1">
        <animate attributeName="r" from="5" to="18" dur="1.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" from=".8" to="0" dur="1.6s" repeatCount="indefinite" />
      </circle>
      <g transform={`translate(${p.x + (direita ? -9 : 9)} ${p.y - 8})`} textAnchor={direita ? "end" : "start"}>
        <text fontFamily="Syne, sans-serif" fontWeight="800" fontSize="15" fill="#16130F" stroke="#FFFFFF" strokeWidth="3.5" paintOrder="stroke">{e.cidade.split(",")[0]}</text>
        <text y="13" fontFamily="Newsreader, serif" fontStyle="italic" fontSize="11" fill="#16130F" stroke="#FFFFFF" strokeWidth="3" paintOrder="stroke">{e.ano}</text>
      </g>
    </svg>
  );
}
