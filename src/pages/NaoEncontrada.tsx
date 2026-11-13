import { TLink } from "../components/Transicao";

// Endereço que não existe. O 404.html gerado no build faz a hospedagem responder com o código 404 de verdade.
export default function NaoEncontrada() {
  return (
    <section className="mx-auto flex min-h-[80svh] max-w-[1400px] flex-col justify-center px-5 py-40 md:px-9">
      <h1 className="m-0 text-[clamp(2.4rem,6vw,5.5rem)] font-extrabold">Esta página não existe.</h1>
      <div>
        <TLink to="/" className="display mt-8 inline-block bg-ouro px-6 py-4 text-base font-bold text-tinta">
          Voltar ao início
        </TLink>
      </div>
    </section>
  );
}
