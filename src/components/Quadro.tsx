import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { Obra } from "../data/clinic";
import { telaProvisoria } from "../lib/placeholder";

type Props = {
  obra: Obra;
  className?: string;
  onClick?: () => void;
  selo?: boolean; // carimbo "vendida"
  rotulo?: string; // etiqueta fixa, ex.: "Reservada"
  inclinar?: boolean;
  altura?: string; // ex.: "62vh" (largura sai da proporção)
  legenda?: boolean;
};

// Uma tela pendurada: foto real se existir, tela provisória se não.
export default function Quadro({ obra, className = "", onClick, selo, rotulo, inclinar = true, altura, legenda = true }: Props) {
  const [proporcao, setProporcao] = useState(obra.dim[1] / obra.dim[0]); // largura / altura (provisório até a foto carregar)
  const [foto, setFoto] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!inclinar || !ref.current || !window.matchMedia("(hover: hover)").matches) return;
    const el = ref.current;
    const rx = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3" });
    const ry = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3" });
    const mover = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      ry(((e.clientX - b.left) / b.width - 0.5) * 12);
      rx(-((e.clientY - b.top) / b.height - 0.5) * 12);
    };
    const sair = () => { rx(0); ry(0); };
    el.addEventListener("pointermove", mover);
    el.addEventListener("pointerleave", sair);
    return () => { el.removeEventListener("pointermove", mover); el.removeEventListener("pointerleave", sair); };
  }, [inclinar]);

  const fundo = !foto ? telaProvisoria(obra, proporcao < 1) : undefined;
  const Tag: any = onClick ? "button" : "div";

  return (
    <figure className={`m-0 ${className}`} style={{ perspective: 900 }}>
      <Tag
        type={onClick ? "button" : undefined}
        onClick={onClick}
        aria-label={onClick ? `Abrir ${obra.titulo}` : undefined}
        className="relative block w-full border-0 bg-transparent p-0 text-left"
        data-cursor="ver"
      >
        <div
          ref={ref}
          className="relative w-full shadow-[0_18px_34px_-14px_rgba(22,19,15,.55),0_2px_0_rgba(22,19,15,.18)]"
          style={{
            aspectRatio: String(proporcao),
            height: altura,
            width: altura ? "auto" : undefined,
            backgroundImage: fundo,
            backgroundSize: "100% 100%",
            transformStyle: "preserve-3d",
          }}
        >
          {foto && (
            <img
              src={`/img/obras/${obra.id}.jpg`}
              alt={[obra.titulo, obra.tecnica?.toLowerCase(), obra.ano].filter(Boolean).join(", ")}
              loading="lazy"
              draggable={false}
              className="block h-full w-full object-cover"
              onLoad={(e) => {
                const i = e.currentTarget;
                if (i.naturalWidth) setProporcao(i.naturalWidth / i.naturalHeight);
              }}
              onError={() => setFoto(false)}
            />
          )}
          {rotulo && (
            <span className="absolute left-0 top-4 bg-tinta px-3 py-1 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-gesso">
              {rotulo}
            </span>
          )}
          {selo && (
            <span
              className="selo absolute right-[-10px] top-4 rotate-[8deg] bg-vermelhao px-3 py-1 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-gesso"
              style={{ clipPath: "polygon(0 0,100% 0,96% 50%,100% 100%,0 100%,4% 50%)" }}
            >
              Vendida
            </span>
          )}
        </div>
      </Tag>
      {legenda && (
        <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 text-[0.95rem] leading-snug">
          <span className="font-display text-base font-bold tracking-tight">{obra.titulo}</span>
          <span className="text-tinta/65">{obra.ano ?? ""}</span>
        </figcaption>
      )}
    </figure>
  );
}
