import { useState } from "react";
import { useLocation } from "react-router-dom";
import { paginas, artista } from "../data/clinic";
import { TLink } from "./Transicao";

export default function Cabecalho() {
  const [aberto, setAberto] = useState(false);
  const { pathname } = useLocation();
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[70] flex items-start justify-between border-b border-tinta/10 bg-gesso px-5 py-4 text-tinta md:px-9 md:py-5">
        <TLink to="/" className="display text-lg font-extrabold leading-none md:text-xl" onNavigate={() => setAberto(false)}>
          {artista.nome}
        </TLink>
        <nav aria-label="Principal" className="hidden gap-7 md:flex">
          {paginas.map((p) => (
            <TLink
              key={p.rota}
              to={p.rota}
              className={`display text-sm font-bold ${pathname === p.rota ? "underline decoration-2 underline-offset-8" : "opacity-90 hover:opacity-100"}`}
            >
              {p.nome}
            </TLink>
          ))}
        </nav>
        <button
          type="button"
          className="display text-sm font-bold md:hidden"
          aria-expanded={aberto}
          aria-controls="menu-mobile"
          onClick={() => setAberto((v) => !v)}
        >
          {aberto ? "Fechar" : "Menu"}
        </button>
      </header>

      <div
        id="menu-mobile"
        className={`fixed inset-0 z-[65] grid grid-rows-5 pt-[3.4rem] transition-[clip-path] duration-500 md:hidden ${aberto ? "[clip-path:inset(0_0_0_0)]" : "[clip-path:inset(0_0_100%_0)]"}`}
        aria-hidden={!aberto}
      >
        {paginas.map((p) => (
          <TLink
            key={p.rota}
            to={p.rota}
            onNavigate={() => setAberto(false)}
            style={{ background: p.cor }}
            className="display flex items-end px-5 pb-3 text-[2.6rem] font-extrabold text-gesso"
          >
            {p.nome}
          </TLink>
        ))}
      </div>
    </>
  );
}
