import { useRef, useState, type FormEvent, type PointerEvent as PEvt } from "react";
import { useSearchParams } from "react-router-dom";
import PaginaTopo from "../components/PaginaTopo";
import { artista, links, medidaTexto, obras, paginas, textos } from "../data/clinic";

const cor = paginas[4].cor;

export default function Contato() {
  const btn = useRef<HTMLAnchorElement>(null);
  const [busca] = useSearchParams();
  const [copiado, setCopiado] = useState(false);
  const disponiveis = obras.filter((o) => o.status === "disponivel");
  const obraInicial = disponiveis.some((o) => o.id === busca.get("obra")) ? busca.get("obra")! : "";

  // sem servidor de e-mail: monta a mensagem e abre o aplicativo de e-mail da pessoa
  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const obra = disponiveis.find((o) => o.id === f.get("obra"));
    const linhas = [
      String(f.get("mensagem") ?? "").trim(),
      "",
      `Nome: ${f.get("nome")}`,
      `E-mail para resposta: ${f.get("email")}`,
      f.get("origem") ? `De: ${f.get("origem")}` : "",
      obra ? `Tela de interesse: ${obra.titulo} (${medidaTexto(obra.dim)}${obra.preco ? `, ${obra.preco}` : ""})` : "",
    ].filter((l, i) => l || i === 1);
    window.location.href = links.email(obra ? `Contato pelo site: ${obra.titulo}` : "Contato pelo site", linhas.join("\n"));
  };
  const copiar = async () => {
    try { await navigator.clipboard.writeText(artista.email); setCopiado(true); setTimeout(() => setCopiado(false), 2500); } catch { /* sem permissão: o endereço está visível na tela */ }
  };
  const campo = "mt-1 block w-full border-2 border-tinta bg-transparent px-3 py-3 text-lg placeholder:text-tinta/40 focus:outline-none focus:ring-2 focus:ring-tinta";
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
          Não existe carrinho de compras aqui. Quem escolhe uma tela conversa direto com a Antonia, pelo WhatsApp ou por e-mail, e combina tudo com ela.
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

      <section className="mx-auto max-w-[1400px] px-5 pb-20 md:px-9 md:pb-32" aria-labelledby="email">
        <div className="grid gap-10 border-t-[3px] border-tinta pt-14 md:grid-cols-[1fr_1.3fr] md:gap-16">
          <div>
            <h2 id="email" className="m-0 text-[clamp(2.2rem,5vw,4.4rem)] font-extrabold">Prefere escrever?</h2>
            <p className="mt-5 text-xl italic text-tinta/80">
              Para quem não usa WhatsApp ou mora em outro país. Pode escrever em português ou em inglês (<i>writing from abroad? English is welcome</i>).
            </p>
            <p className="mt-8 text-lg">
              Ou escreva direto para<br />
              <a href={`mailto:${artista.email}`} className="font-bold underline decoration-2 underline-offset-4">{artista.email}</a>
            </p>
            <button type="button" onClick={copiar} className="display mt-3 border-2 border-tinta px-4 py-2 text-sm font-bold">
              {copiado ? "Endereço copiado" : "Copiar endereço"}
            </button>
          </div>

          <form onSubmit={enviar}>
            <label className="block">Seu nome<input name="nome" required autoComplete="name" className={campo} /></label>
            <label className="mt-4 block">Seu e-mail<input name="email" type="email" required autoComplete="email" className={campo} /></label>
            <label className="mt-4 block">Cidade e país <span className="text-tinta/60">(opcional)</span><input name="origem" autoComplete="off" className={campo} /></label>
            <label className="mt-4 block">Tela de interesse <span className="text-tinta/60">(opcional)</span>
              <select name="obra" defaultValue={obraInicial} className={campo}>
                <option value="">Nenhuma em especial</option>
                {disponiveis.map((o) => <option key={o.id} value={o.id}>{o.titulo} ({medidaTexto(o.dim)})</option>)}
              </select>
            </label>
            <label className="mt-4 block">Mensagem<textarea name="mensagem" required rows={5} className={campo} /></label>
            <button type="submit" className="display mt-6 bg-tinta px-6 py-4 text-base font-bold text-gesso">Escrever para a Antonia</button>
            <p className="mt-3 text-sm text-tinta/65">Ao enviar, abre o seu aplicativo de e-mail com a mensagem pronta. Se não abrir, use o endereço ao lado.</p>
          </form>
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
