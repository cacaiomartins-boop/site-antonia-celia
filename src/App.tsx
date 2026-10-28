import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { iniciarScroll, ScrollTrigger } from "./lib/scroll";
import { TransicaoProvider } from "./components/Transicao";
import Cabecalho from "./components/Cabecalho";
import Rodape from "./components/Rodape";
import Home from "./pages/Home";
const QuemSou = lazy(() => import("./pages/QuemSou"));
const Exposicoes = lazy(() => import("./pages/Exposicoes"));
const Disponiveis = lazy(() => import("./pages/Disponiveis"));
const Vendidas = lazy(() => import("./pages/Vendidas"));
const Contato = lazy(() => import("./pages/Contato"));
const Admin = lazy(() => import("./pages/Admin"));
import { artista, paginas } from "./data/clinic";

export default function App() {
  const { pathname } = useLocation();

  useEffect(() => { iniciarScroll(); }, []);

  useEffect(() => {
    const p = paginas.find((x) => x.rota === pathname);
    document.title = p ? `${p.nome} · ${artista.nome}, artista plástica` : `${artista.nome} · Artista plástica em ${artista.cidade}`;
    const t = setTimeout(() => ScrollTrigger.refresh(), 150);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <TransicaoProvider>
      <Cabecalho />
      <main>
        <Suspense fallback={<div className="min-h-[80svh]" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quem-sou" element={<QuemSou />} />
          <Route path="/exposicoes" element={<Exposicoes />} />
          <Route path="/disponiveis" element={<Disponiveis />} />
          <Route path="/vendidas" element={<Vendidas />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Home />} />
        </Routes>
        </Suspense>
      </main>
      <Rodape />
    </TransicaoProvider>
  );
}
