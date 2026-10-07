import { useRef, type PointerEvent as PEvt } from "react";
import PaginaTopo from "../components/PaginaTopo";
import { artista, links, paginas, textos } from "../data/clinic";

const cor = paginas[4].cor;

export default function Contato() {
  const btn = useRef<HTMLAnchorElement>(null);
  // a tinta preta "nasce" no ponto onde o mouse entra no botão
  const tinta = (e: PEvt<HTMLAnchorElement>) => {
    const b = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - b.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - b.top}px`);
  };
  return (
    <>
      <PaginaTopo titulo="Contato" frase={paginas[4].frase} cor={cor} imagem={paginas[4].img} escuro />
      <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-9 md:py-32">
        <p className="m-0 max-w-3xl font-serif text-[clamp(1.6rem,3vw,2.6rem)] leading-[1.25]">
          Não existe carrinho de compras aqui. Quem escolhe uma tela conversa direto com a Antonia, pelo WhatsApp, e combina tudo com ela.
        </p>

        <a
          ref={btn}
          href={links.whatsapp("Olá, Antônia! Vi o seu site e gostaria de conversar sobre uma tela.")}
          target="_blank"
          rel="noreferrer"
          onPointerEnter={tinta}
          onPointerMove={tinta}
          className="group relative mt-14 block overflow-hidden border-[3px] border-tinta px-6 py-10 md:px-12 md:py-16"
          data-cursor="abrir"
        >
          <span className="absolute inset-0 bg-tinta [clip-path:circle(0px_at_var(--x,50%)_var(--y,50%))] transition-[clip-path] duration-700 ease-out group-hover:[clip-path:circle(150%_at_var(--x,50%)_var(--y,50%))] group-focus-visible:[clip-path:circle(150%_at_50%_50%)]" aria-hidden />
          <span className="relative block text-[clamp(2.4rem,8.5vw,8rem)] font-extrabold leading-[0.95] text-tinta transition-colors duration-500 group-hover:text-gesso group-focus-visible:text-gesso display">
            Falar com a Antonia no WhatsApp
          </span>
          <span className="relative mt-4 block text-xl italic text-tinta/75 transition-colors duration-500 group-hover:text-gesso/80">
            Brasília. Resposta direta, sem intermediário.
          </span>
        </a>

        <div className="mt-8 flex flex-wrap gap-x-10 gap-y-3 text-xl">
          <a href={links.instagram} target="_blank" rel="noreferrer" className="underline decoration-2 underline-offset-8">
            Instagram @{artista.instagram}
          </a>
          <span>{artista.cidade}, DF</span>
        </div>
      </section>

      <section className="bg-tinta px-5 py-24 text-gesso md:px-9 md:py-32" aria-labelledby="como">
        <div className="mx-auto max-w-[1400px]">
          <h2 id="como" className="m-0 text-[clamp(2.2rem,5vw,4.4rem)] font-extrabold">Como funciona</h2>
          <ol className="m-0 mt-12 grid list-none gap-10 p-0 md:grid-cols-3">
            {textos.passos.map((p, i) => (
              <li key={p.titulo} className="border-t-2 border-ouro pt-5">
                <span className="display text-5xl font-extrabold text-ouro">{i + 1}</span>
                <h3 className="m-0 mt-3 text-2xl font-extrabold">{p.titulo}</h3>
                <p className="mt-3 text-lg text-gesso/80">{p.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
