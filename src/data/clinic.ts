// ============================================================
// TODOS OS DADOS DO SITE FICAM AQUI (textos, obras, exposições, contato).
// Para trocar uma foto: coloque o arquivo em public/img/obras/<id>.jpg
// (o <id> é o campo "id" de cada obra abaixo). Sem arquivo, aparece
// uma tela pintada provisória.
// ============================================================

export const artista = {
  nome: "Antônia Célia",
  nomeCompleto: "Antônia Célia de Barros Silva",
  funcao: "Artista plástica",
  cidade: "Brasília",
  instagram: "antoniaceliabarros",
  // TODO: confirmar com a neta o WhatsApp real (somente números, com 55 + DDD)
  whatsapp: "5561999999999",
  whatsappConfirmado: false,
  retrato: "/img/antonia.jpg", // foto dela (opcional; sem arquivo aparece uma moldura pintada)
};

export const cores = {
  gesso: "#FFFFFF",
  tinta: "#16130F",
  vermelhao: "#C42A1D",
  oliva: "#5A6A2B",
  laranja: "#E4501E",
  azul: "#12308F",
  beringela: "#3A1A4A",
  ouro: "#C9A24B",
};

// Cada página tem a cor de uma tela dela
export const paginas = [
  { rota: "/quem-sou", nome: "Quem sou", img: "/img/paginas/quem-sou.jpg", cor: cores.vermelhao, frase: "A mulher por trás dos gestos" },
  { rota: "/exposicoes", nome: "Exposições", img: "/img/paginas/exposicoes.jpg", cor: cores.azul, frase: "De Brasília para o mundo" },
  { rota: "/disponiveis", nome: "Disponíveis", img: "/img/paginas/disponiveis.jpg", cor: cores.laranja, frase: "Telas esperando uma parede" },
  { rota: "/vendidas", nome: "Vendidas", img: "/img/paginas/vendidas.jpg", cor: cores.beringela, frase: "Telas que já encontraram casa" },
  { rota: "/contato", nome: "Contato", img: "/img/paginas/contato.jpg", cor: cores.ouro, frase: "Vamos conversar sobre uma tela?" },
];

export const textos = {
  heroLinha: "Artista plástica · Brasília",
  heroDica: "Pinte com o mouse ou o dedo",
  sobre: [
    "Antônia Célia pinta grandes telas em acrílico, com camadas, riscos e faixas de cor que parecem paisagem e memória ao mesmo tempo. Vermelhão, verde-oliva, azul profundo, beringela e ouro aparecem em quase tudo o que ela faz.",
    "Ela começou no figurativo e foi ficando cada vez mais livre. Hoje trabalha em séries como Vestígios, Caminhos, O sabiá canta e Cerrado, muitas vezes em dípticos e polípticos que se completam na parede.",
    "Boa parte das telas nasce para um lugar específico: obras feitas sob medida para uma sala, uma escada, um corredor, em parceria com arquitetos e decoradores de Brasília.",
  ],
  series: ["Vestígios", "Caminhos", "O sabiá canta", "Cerrado", "Sustentabilidade", "Dípticos e polípticos", "Livre expressão"],
  reconhecimentos: [
    { ano: "2021", texto: "Menção honrosa no XI Salão SINAP/AIAP, com as telas Memórias" },
    { ano: "2018", texto: "Menção honrosa em São Paulo" },
  ],
  encomenda:
    "A Antonia também pinta sob encomenda: ela vê o espaço, conversa sobre as cores e as medidas e faz uma tela só para aquela parede.",
  passos: [
    { titulo: "Escolha ou descreva", texto: "Veja as telas disponíveis ou conte o que imagina para o seu espaço." },
    { titulo: "Converse com ela", texto: "O contato é direto, pelo WhatsApp. Sem carrinho e sem intermediário." },
    { titulo: "Receba em casa", texto: "Combinam valor, entrega e instalação, tudo em conversa." },
  ],
};

// ---------------------------------------------------------------
// EXPOSIÇÕES (confirmadas no Instagram da artista)
// lat/lng servem para marcar o mapa; "tipo" = individual ou coletiva
// ---------------------------------------------------------------
export type Exposicao = {
  id: string;
  ano: number;
  titulo: string;
  local: string;
  cidade: string;
  pais: string;
  lat: number;
  lng: number;
  tipo: "individual" | "coletiva" | "premio";
  nota?: string;
};

export const exposicoes: Exposicao[] = [
  {
    id: "londres-2017",
    ano: 2017,
    titulo: "Exposição em Londres",
    local: "Londres",
    cidade: "Londres",
    pais: "Reino Unido",
    lat: 51.5,
    lng: -0.12,
    tipo: "coletiva",
    nota: "As primeiras telas a cruzar o Atlântico.",
  },
  {
    id: "sp-2018",
    ano: 2018,
    titulo: "Exposição em São Paulo",
    local: "São Paulo",
    cidade: "São Paulo",
    pais: "Brasil",
    lat: -23.55,
    lng: -46.63,
    tipo: "premio",
    nota: "Também rendeu uma menção honrosa no mesmo ano.",
  },
  {
    id: "arte-em-pauta-2019",
    ano: 2019,
    titulo: "A Arte em Pauta",
    local: "Inn Gallery",
    cidade: "São Paulo",
    pais: "Brasil",
    lat: -23.56,
    lng: -46.66,
    tipo: "coletiva",
    nota: "Mostra com artistas de Brasília.",
  },
  {
    id: "dubai-2019",
    ano: 2019,
    titulo: "Brazil in Focus",
    local: "DIAC, Dubai International Art Centre",
    cidade: "Dubai",
    pais: "Emirados Árabes",
    lat: 25.2,
    lng: 55.27,
    tipo: "coletiva",
    nota: "De 14 a 21 de setembro, com a Cia Arte Cultura.",
  },
  {
    id: "bela-bienal-2021",
    ano: 2021,
    titulo: "5ª Bela Bienal",
    local: "Finlândia",
    cidade: "Finlândia",
    pais: "Finlândia",
    lat: 61.9,
    lng: 25.7,
    tipo: "coletiva",
    nota: "Duas obras na bienal. O projeto seguiu no Brasil com A Natureza na Arte, nos Correios do Rio e de Niterói.",
  },
  {
    id: "alicante-2021",
    ano: 2021,
    titulo: "Artemisia Now",
    local: "Museu Del Mar",
    cidade: "Santa Pola, Alicante",
    pais: "Espanha",
    lat: 38.19,
    lng: -0.56,
    tipo: "coletiva",
    nota: "Mostra de arte contemporânea inspirada em Artemisia Gentileschi.",
  },
  {
    id: "salao-sinap-2021",
    ano: 2021,
    titulo: "XI Salão SINAP/AIAP",
    local: "Salão SINAP/AIAP",
    cidade: "São Paulo",
    pais: "Brasil",
    lat: -23.5,
    lng: -46.7,
    tipo: "premio",
    nota: "Menção honrosa com as telas Memórias.",
  },
  {
    id: "pan-techne-2022",
    ano: 2022,
    titulo: "Pan Techné",
    local: "Espaço Cultural Correios",
    cidade: "Niterói",
    pais: "Brasil",
    lat: -22.88,
    lng: -43.1,
    tipo: "coletiva",
    nota: "Homenagem à Semana de Arte Moderna de 1922, com quatro telas da série O sabiá canta. A imagem de uma delas ilustrou o convite.",
  },
  {
    id: "museu-republica-2022",
    ano: 2022,
    titulo: "Releitura para o Museu da República",
    local: "Museu da República",
    cidade: "Brasília",
    pais: "Brasil",
    lat: -15.8,
    lng: -47.88,
    tipo: "coletiva",
    nota: "Uma tela de 2,40 por 1,70 m feita para a exposição.",
  },
  {
    id: "vestigios-2024",
    ano: 2024,
    titulo: "Vestígios",
    local: "Juridicon, Lago Sul",
    cidade: "Brasília",
    pais: "Brasil",
    lat: -15.83,
    lng: -47.87,
    tipo: "individual",
    nota: "Sua exposição individual, aberta em 14 de agosto.",
  },
  {
    id: "vestigios-2-2024",
    ano: 2024,
    titulo: "Vestígios II",
    local: "The Gallery Fernanda Curado",
    cidade: "Brasília",
    pais: "Brasil",
    lat: -15.76,
    lng: -47.89,
    tipo: "coletiva",
    nota: "Segunda mostra, dessa vez ao lado da amiga e pintora Sônnia Guerra. Abertura em 4 de setembro.",
  },
  {
    id: "barcelona-2026",
    ano: 2026,
    titulo: "Where Art Begins",
    local: "Galeria Marzia, Ciutat Vella",
    cidade: "Barcelona",
    pais: "Espanha",
    lat: 41.38,
    lng: 2.17,
    tipo: "coletiva",
    nota: "De 12 a 26 de junho, com artistas de vários países.",
  },
  // TODO (aguardando a neta): exposição no Louvre. Não consta no Instagram. Quando vierem
  // nome do salão, ano e comprovante, entra aqui como uma exposição normal.
];

// ---------------------------------------------------------------
// OBRAS
// "status" PROVISÓRIO: só uma tela está marcada como vendida no
// Instagram. Confirmar com a neta quais estão disponíveis ou vendidas.
// "dim" = as duas medidas em cm, como a artista escreveu nas legendas.
// ---------------------------------------------------------------
export type Obra = {
  id: string;
  titulo: string;
  tecnica: string;
  dim: [number, number];
  ano: number;
  status: "disponivel" | "vendida";
  paleta: [string, string, string];
  detalhe?: string;
};

const V = cores.vermelhao, O = cores.oliva, A = cores.azul, B = cores.beringela, G = cores.ouro, W = cores.gesso;
const ACR = "Acrílico sobre tela";

export const obras: Obra[] = [
  // 2026
  { id: "ultimo-trabalho", titulo: "Último trabalho", tecnica: ACR, dim: [120, 220], ano: 2026, status: "disponivel", paleta: ["#B5481E", "#1F9E8A", "#E8C22B"] },
  { id: "cerrado", titulo: "Cerrado", tecnica: ACR, dim: [120, 220], ano: 2026, status: "disponivel", paleta: [O, V, G] },
  { id: "fluir", titulo: "Fluir", tecnica: ACR, dim: [69, 187], ano: 2026, status: "disponivel", paleta: [A, W, G] },
  { id: "dialogo", titulo: "Diálogo", tecnica: `${ACR}, díptico`, dim: [140, 200], ano: 2026, status: "disponivel", paleta: [V, W, G] },
  { id: "sentimento-de-paz", titulo: "Sentimento de Paz", tecnica: `${ACR}, díptico`, dim: [100, 160], ano: 2026, status: "disponivel", paleta: [A, W, O] },
  { id: "luz-da-lua", titulo: "Luz da Lua I e II", tecnica: `${ACR}, díptico`, dim: [100, 160], ano: 2026, status: "disponivel", paleta: [B, A, G] },
  { id: "melhores-lembrancas", titulo: "Melhores lembranças I e II", tecnica: `${ACR}, díptico`, dim: [100, 180], ano: 2026, status: "disponivel", paleta: [V, G, W] },
  { id: "poesia", titulo: "Poesia", tecnica: "Mista sobre tela", dim: [200, 100], ano: 2026, status: "disponivel", paleta: [W, G, B] },
  { id: "linguagem-urbana", titulo: "Linguagem urbana", tecnica: ACR, dim: [160, 100], ano: 2026, status: "disponivel", paleta: [B, V, W] },
  { id: "o-tempo-2026", titulo: "O tempo", tecnica: ACR, dim: [187, 68], ano: 2026, status: "disponivel", paleta: [O, W, G] },
  { id: "pipa", titulo: "Pipa", tecnica: ACR, dim: [100, 120], ano: 2026, status: "disponivel", paleta: [V, A, G] },
  { id: "memorias", titulo: "Memórias", tecnica: ACR, dim: [120, 100], ano: 2026, status: "disponivel", paleta: [G, B, W] },
  { id: "vestigios", titulo: "Vestígios", tecnica: ACR, dim: [100, 120], ano: 2026, status: "disponivel", paleta: [O, G, W] },
  { id: "encanto", titulo: "Encanto", tecnica: ACR, dim: [100, 100], ano: 2026, status: "disponivel", paleta: [V, B, G] },
  { id: "caminhar-olhar-imaginar", titulo: "Caminhar Olhar Imaginar", tecnica: ACR, dim: [100, 80], ano: 2026, status: "disponivel", paleta: [A, G, W] },
  { id: "sobre-sustentabilidade", titulo: "Sobre sustentabilidade", tecnica: ACR, dim: [80, 80], ano: 2026, status: "disponivel", paleta: [O, A, W] },
  { id: "acalanto", titulo: "Acalanto", tecnica: `${ACR}, díptico`, dim: [90, 120], ano: 2026, status: "disponivel", paleta: [A, W, B] },
  { id: "faz-de-conta", titulo: "Faz de conta", tecnica: `${ACR}, díptico`, dim: [70, 70], ano: 2026, status: "disponivel", paleta: [V, G, O] },
  // 2025
  { id: "ceu-de-estrelas", titulo: "Céu de Estrelas", tecnica: ACR, dim: [130, 220], ano: 2025, status: "disponivel", paleta: [A, B, W] },
  { id: "livre-expressao", titulo: "Livre Expressão", tecnica: ACR, dim: [135, 230], ano: 2025, status: "disponivel", paleta: [V, O, G] },
  // 2024 e anteriores (status provisório: vendidas)
  { id: "poliptico-unir", titulo: "Unir (políptico)", tecnica: ACR, dim: [100, 160], ano: 2024, status: "vendida", paleta: [A, G, W] },
  { id: "poliptico-amor", titulo: "Amor (políptico)", tecnica: ACR, dim: [100, 160], ano: 2024, status: "vendida", paleta: [V, G, W] },
  { id: "poliptico-pensador", titulo: "Pensador (políptico)", tecnica: ACR, dim: [100, 160], ano: 2024, status: "vendida", paleta: [B, G, W] },
  { id: "poliptico-imaginacao", titulo: "Imaginação (políptico)", tecnica: ACR, dim: [100, 160], ano: 2024, status: "vendida", paleta: [O, G, W] },
  { id: "tela-100x160", titulo: "Tela de 2023", tecnica: ACR, dim: [100, 160], ano: 2023, status: "vendida", paleta: [W, G, B], detalhe: "Marcada como vendida no Instagram da artista." },
  { id: "natureza-plena", titulo: "Natureza Plena", tecnica: ACR, dim: [120, 200], ano: 2022, status: "vendida", paleta: [O, A, G] },
  { id: "amar", titulo: "Amar", tecnica: ACR, dim: [90, 200], ano: 2022, status: "vendida", paleta: [V, B, W] },
  { id: "o-tempo-na-memoria", titulo: "Sustentabilidade, o tempo na memória", tecnica: "Mista com colagem", dim: [83, 83], ano: 2022, status: "vendida", paleta: [G, O, W] },
  { id: "azul-da-cor-do-mar", titulo: "Azul da cor do mar I e II", tecnica: ACR, dim: [120, 100], ano: 2020, status: "vendida", paleta: [A, W, A] },
  { id: "agua", titulo: "Água", tecnica: "Mista sobre tela", dim: [110, 135], ano: 2020, status: "vendida", paleta: [A, O, W] },
  { id: "semear-amor", titulo: "Semear amor", tecnica: ACR, dim: [130, 150], ano: 2020, status: "vendida", paleta: [V, G, O] },
  { id: "silencio-e-luz", titulo: "Silêncio e luz", tecnica: ACR, dim: [130, 220], ano: 2019, status: "vendida", paleta: [W, G, O] },
  { id: "flores-pelo-caminho", titulo: "Flores pelo caminho", tecnica: ACR, dim: [130, 220], ano: 2019, status: "vendida", paleta: [V, O, W] },
  { id: "fundo-do-mar", titulo: "Fundo do Mar", tecnica: ACR, dim: [110, 220], ano: 2019, status: "vendida", paleta: [A, B, O] },
  { id: "profeta", titulo: "Profeta", tecnica: ACR, dim: [120, 150], ano: 2019, status: "vendida", paleta: [B, G, W] },
  { id: "mandacaru", titulo: "Mandacaru", tecnica: ACR, dim: [320, 140], ano: 2015, status: "vendida", paleta: [O, V, G] },
  { id: "luz-do-sol", titulo: "Luz do Sol", tecnica: ACR, dim: [220, 130], ano: 2016, status: "vendida", paleta: [G, V, W] },
];

// Fotos de telas nos ambientes dos clientes (Instagram: "especialmente para esta sala")
export const ambientes = [
  { id: "sala-sofa", legenda: "Tela de 1,20 × 2,20 m sobre o sofá", cor: G },
  { id: "sala-jantar", legenda: "Vermelhão na sala de jantar", cor: V },
  { id: "corredor", legenda: "Verde-oliva no corredor", cor: O },
  { id: "living-arquiteta", legenda: "Living da arquiteta Rachel Fechina", cor: A },
];

export const links = {
  instagram: `https://instagram.com/${artista.instagram}`,
  whatsapp: (msg?: string) =>
    `https://wa.me/${artista.whatsapp}${msg ? `?text=${encodeURIComponent(msg)}` : ""}`,
};

export const medidaTexto = (d: [number, number]) =>
  `${(d[0] / 100).toFixed(2).replace(".", ",")} × ${(d[1] / 100).toFixed(2).replace(".", ",")} m`;
