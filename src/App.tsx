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
import NaoEncontrada from "./pages/NaoEncontrada";
import { aplicarSeo } from "./seo/head";

export default function App() {
  const { pathname } = useLocation();

  useEffect(() => { iniciarScroll(); }, []);

  useEffect(() => {
    aplicarSeo(pathname);
    const t = setTimeout(() => ScrollTrigger.refresh(), 150);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <TransicaoProvider>
      <Cabecalho />
      <main>
        <Suspense fallback={<div className="min-h-[300svh]" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quem-sou" element={<QuemSou />} />
          <Route path="/exposicoes" element={<Exposicoes />} />
          <Route path="/disponiveis" element={<Disponiveis />} />
          <Route path="/vendidas" element={<Vendidas />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="*" element={<NaoEncontrada />} />
        </Routes>
        </Suspense>
      </main>
      <Rodape />
    </TransicaoProvider>
  );
}
