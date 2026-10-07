// Foto de uma tela na casa de alguém. Arquivo: public/img/ambientes/<id>.jpg
export default function FotoAmbiente({ id, legenda, className = "" }: { id: string; legenda: string; className?: string }) {
  return (
    <figure className={`m-0 ${className}`}>
      <img src={`/img/ambientes/${id}.jpg`} alt={legenda} loading="lazy" decoding="async" className="aspect-[4/5] w-full object-cover" />
      <figcaption className="mt-2 text-[0.95rem] italic text-gesso/70">{legenda}</figcaption>
    </figure>
  );
}
