import { useCallback, useEffect, useState } from "react";
import type { Obra } from "../data/clinic";

// O que o servidor sabe sobre reservas e vendas feitas depois que o site foi publicado.
export type Loja = {
  ativo: boolean; // reservas funcionando (senão o site só mostra o WhatsApp)
  simulado: boolean; // pagamento de teste (só no computador)
  reservadas: Record<string, string>; // obraId -> data final da reserva
  vendidas: string[];
};

const vazia: Loja = { ativo: false, simulado: false, reservadas: {}, vendidas: [] };

export function useLoja() {
  const [loja, setLoja] = useState<Loja>(vazia);
  const atualizar = useCallback(async () => {
    try {
      const r = await fetch("/api/status", { cache: "no-store" });
      if (!r.ok) return setLoja(vazia);
      const j = (await r.json()) as Partial<Loja>;
      setLoja({ ativo: !!j.ativo, simulado: !!j.simulado, reservadas: j.reservadas ?? {}, vendidas: j.vendidas ?? [] });
    } catch {
      setLoja(vazia); // sem servidor: o site continua funcionando só com o WhatsApp
    }
  }, []);
  useEffect(() => { atualizar(); }, [atualizar]);
  return { loja, atualizar };
}

export type Estado = "disponivel" | "reservada" | "vendida" | "oculta";

export function estadoDe(o: Obra, l: Loja): Estado {
  if (o.status === "aguardando") return "oculta";
  if (o.status === "vendida" || l.vendidas.includes(o.id)) return "vendida";
  return l.reservadas[o.id] ? "reservada" : "disponivel";
}

export const dataCurta = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");
