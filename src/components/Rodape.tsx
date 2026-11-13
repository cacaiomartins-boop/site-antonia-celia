import { useLocation } from "react-router-dom";
import { artista, links } from "../data/clinic";
import { TLink } from "./Transicao";

export default function Rodape() {
  const { pathname } = useLocation();
  const semCta = pathname === "/contato" || pathname === "/vendidas" || pathname === "/admin"; // essas páginas já terminam com o chamado
  return (
    <footer className="bg-tinta px-5 pb-8 pt-14 text-gesso md:px-9">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-10 md:flex-row md:items-end md:justify-between">
        {!semCta && (<div>
          <p className="display text-[clamp(2rem,6vw,4.5rem)] font-extrabold">
            Quer uma tela para a sua parede?
          </p>
          <a
            href={links.whatsapp("Olá, Antônia! Vi o seu site e gostaria de conversar sobre uma tela.")}
            target="_blank"
            rel="noreferrer"
            className="display mt-6 inline-block bg-ouro px-6 py-3 text-base font-bold text-tinta"
          >
            Falar com a Antonia no WhatsApp
          </a>
        </div>)}
        <ul className="m-0 flex list-none gap-6 p-0 text-sm">
          <li><TLink to="/contato" className="underline underline-offset-4">Contato</TLink></li>
          <li><a href={links.instagram} target="_blank" rel="noreferrer" className="underline underline-offset-4">Instagram</a></li>
        </ul>
      </div>
      <div className="mx-auto mt-14 flex max-w-[1400px] flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm text-gesso/55">
        <p className="m-0">© {new Date().getFullYear()} {artista.nomeCompleto}. Todas as obras são de autoria da artista.</p>
        <TLink to="/admin" className="text-gesso/50 underline-offset-4 hover:text-gesso/80 hover:underline">Painel</TLink>
      </div>
    </footer>
  );
}
