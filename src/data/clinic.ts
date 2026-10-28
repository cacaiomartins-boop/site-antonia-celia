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
  gesso: "#F7F4EC",
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
    "Boa parte das telas nasce para um lugar específico: obras feitas sob medida para uma sala, uma escada, um corredor, em parceria com arquitetos e decoradores de Brasília. Algumas de suas telas também foram publicadas em livros de arte.",
  ],
  series: ["Vestígios", "Caminhos", "O sabiá canta", "Cerrado", "Sustentabilidade", "Dípticos e polípticos", "Livre expressão"],
  reconhecimentos: [
    { ano: "2021", texto: "Menção honrosa no XI Salão SINAP/AIAP, com as telas Memórias" },
    { ano: "2018", texto: "Menção honrosa em São Paulo" },
    { ano: "2010", texto: "Homenageada pela Pró-Arte de Brasília como artista plástica" },
    { ano: "2009", texto: "Selecionada para o Salão de Artes, Prêmio Maimeri (São Paulo)" },
    { ano: "2008", texto: "Selecionada para o Salão de Arte da SINAPESP (São Paulo)" },
    { ano: "2001", texto: "Menção honrosa na ARTEXPO 2001, em Nova York" },
    { ano: "1997", texto: "Selecionada pelo Salão Bunkyio e pelo Prêmio Maimeri 75 anos (São Paulo)" },
    { ano: "1996", texto: "Selecionada para o 25º Salão Bunkyio (São Paulo)" },
  ],
  // Textos de quem escreveu sobre a obra dela (catálogos impressos)
  criticas: [
    {
      autor: "Luiza Dornas, produtora cultural",
      texto: [
        "Antônia Célia expressa toda sua sensibilidade ao imprimir em seus trabalhos todo um universo inconsciente de intuições e interpretações, provocados pela estética das formas e cores das suas composições, despertando uma série de sentimentos diversos em todos que visualizam suas obras.",
        "Com manifestações, por vezes, desconstruídas e sobrepostas em tensas composições, e por outras, criando inserções leves com graciosas texturas e novos elementos, as obras da artista apresentam significados que não se esgotam e se renovam à medida que são visualizados.",
      ],
    },
    {
      autor: "Do catálogo da artista",
      texto: [
        "Os abstratos que a artista apresenta têm um de seus principais atributos na construção dos planos. É desafiador saber o que está à frente e o que está atrás, pois a desconstrução, palavra muitas vezes desgastada, se dá na fatura de um trabalho que traz à tona um sentimento de que se está a ver vestígios e rastros de uma civilização.",
        "Esse efeito instaura uma reflexão metafísica sobre o mundo em que vivemos e aquele em que gostaríamos de estar. Assim, cada trabalho abre uma potente janela para o interior de nosso ser.",
      ],
    },
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
// EXPOSIÇÕES (1993 a 2013: currículo impresso da artista; 2017 em diante: Instagram)
// Aqui ficam só os destaques que aparecem no mapa. O currículo completo está em "curriculo".
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
  // ---- Década de 1990 (currículo impresso da artista) ----
  { id: "itamarati-1993", ano: 1993, titulo: "CEF Itamarati", local: "CEF Itamarati", cidade: "Brasília", pais: "Brasil", lat: -15.8, lng: -47.88, tipo: "individual", nota: "Sua primeira exposição individual." },
  { id: "serpro-1994", ano: 1994, titulo: "Espaço Cultural do Serpro", local: "Espaço Cultural do Serpro, SGAN Quadra 601", cidade: "Brasília", pais: "Brasil", lat: -15.79, lng: -47.9, tipo: "individual" },
  { id: "banco-nacional-1995", ano: 1995, titulo: "Banco Nacional 504 Norte", local: "Banco Nacional 504 Norte", cidade: "Brasília", pais: "Brasil", lat: -15.77, lng: -47.89, tipo: "individual" },
  { id: "florenca-1996", ano: 1996, titulo: "Vitrina degli Artisti Contemporanei", local: "Palazzo degli Affari", cidade: "Florença", pais: "Itália", lat: 43.77, lng: 11.25, tipo: "coletiva", nota: "Terza Edizione. No mesmo ano, foi selecionada para o 25º Salão Bunkyio, em São Paulo." },
  { id: "buenos-aires-1997", ano: 1997, titulo: "Arte Contemporânea de Brasília", local: "Galeria Portinari, Fundação Centro de Estudos Brasileiros", cidade: "Buenos Aires", pais: "Argentina", lat: -34.6, lng: -58.38, tipo: "coletiva" },
  { id: "roma-1997", ano: 1997, titulo: "Diversidade de Expressão", local: "Galeria Cândido Portinari, Embaixada do Brasil", cidade: "Roma", pais: "Itália", lat: 41.9, lng: 12.5, tipo: "coletiva", nota: "A mostra seguiu para a Embaixada do Brasil em Lisboa, Portugal." },
  { id: "nova-york-1997", ano: 1997, titulo: "Arte Contemporânea de Brasília", local: "Caelum Art Gallery (Soho)", cidade: "Nova York", pais: "Estados Unidos", lat: 40.71, lng: -74.0, tipo: "coletiva" },
  { id: "paris-1997", ano: 1997, titulo: "Imaginarium", local: "Galeria Debret", cidade: "Paris", pais: "França", lat: 48.86, lng: 2.35, tipo: "coletiva", nota: "Começou no Palácio Itamaraty, em Brasília, e depois foi para o Setor Cultural da Embaixada do Brasil em Madri." },
  { id: "frankfurt-1998", ano: 1998, titulo: "Arte Contemporânea de Brasília", local: "Agência da Vasp", cidade: "Frankfurt", pais: "Alemanha", lat: 50.11, lng: 8.68, tipo: "coletiva" },
  { id: "roma-1999", ano: 1999, titulo: "MILLENNIUM", local: "Galeria Cândido Portinari, Embaixada do Brasil", cidade: "Roma", pais: "Itália", lat: 41.9, lng: 12.5, tipo: "coletiva", nota: "A mostra também passou pela Galeria Debret, em Paris, e pela Art-Art Galeria, em Brasília." },
  { id: "berlim-2000", ano: 2000, titulo: "Inauguração da Galeria da Embaixada do Brasil", local: "Embaixada do Brasil", cidade: "Berlim", pais: "Alemanha", lat: 52.52, lng: 13.4, tipo: "coletiva", nota: "No mesmo ano, expôs em Frankfurt na comemoração do Dia da Pátria, pelo Consulado Geral do Brasil." },
  { id: "tribunal-2001", ano: 2001, titulo: "Cores que Estão na Alma", local: "Espaço de Arte, Tribunal Regional do Trabalho", cidade: "Brasília", pais: "Brasil", lat: -15.78, lng: -47.93, tipo: "individual" },
  { id: "artexpo-2001", ano: 2001, titulo: "ARTEXPO 2001", local: "Jacob K. Javits Convention Center", cidade: "Nova York", pais: "Estados Unidos", lat: 40.76, lng: -74.0, tipo: "premio", nota: "Menção honrosa na feira de arte de Nova York." },
  { id: "cidade-sonho-2002", ano: 2002, titulo: "A Cidade e o Sonho", local: "Espaço Cultural 508 Sul", cidade: "Brasília", pais: "Brasil", lat: -15.81, lng: -47.9, tipo: "individual" },
  { id: "iate-2005", ano: 2005, titulo: "Pinturas 2005", local: "Iate Clube de Brasília", cidade: "Brasília", pais: "Brasil", lat: -15.82, lng: -47.84, tipo: "individual" },
  { id: "transgredir-2007", ano: 2007, titulo: "Transgredir", local: "Mezanino da Sala Villa-Lobos, Teatro Nacional", cidade: "Brasília", pais: "Brasil", lat: -15.79, lng: -47.88, tipo: "individual" },
  { id: "varsovia-2008", ano: 2008, titulo: "Circuito Internacional de Arte Brasileira", local: "Galeria Elektor", cidade: "Varsóvia", pais: "Polônia", lat: 52.23, lng: 21.01, tipo: "coletiva", nota: "O circuito passou também por Frankfurt (Hugendubel Bücher) e Viena (Palais Schlick)." },
  { id: "maimeri-2009", ano: 2009, titulo: "Salão de Artes, Prêmio Maimeri", local: "Salão de Artes", cidade: "São Paulo", pais: "Brasil", lat: -23.55, lng: -46.63, tipo: "premio", nota: "Selecionada para o prêmio." },
  { id: "louvre-2011", ano: 2011, titulo: "Art Fair Art Shopping", local: "Carrousel du Louvre", cidade: "Paris", pais: "França", lat: 48.86, lng: 2.33, tipo: "coletiva", nota: "Feira de arte no Carrousel du Louvre." },
  { id: "helsinki-2011", ano: 2011, titulo: "Café nas Cores Tropicais", local: "Poleeni Cultural Center", cidade: "Helsinki", pais: "Finlândia", lat: 60.17, lng: 24.94, tipo: "coletiva" },
  { id: "contrastes-2013", ano: 2013, titulo: "Contrastes", local: "Galeria e Ateliê Lourenço de Bem", cidade: "Brasília", pais: "Brasil", lat: -15.8, lng: -47.88, tipo: "individual" },
  // ---- 2017 em diante (Instagram da artista) ----
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
];

// ---------------------------------------------------------------
// CURRÍCULO COMPLETO (catálogo impresso da artista, 1993 a 2013)
// Cada linha: [ano, [exposições do ano]]
// ---------------------------------------------------------------
type Linha = [number, string[]];

export const curriculo: { individuais: Linha[]; coletivas: Linha[] } = {
  individuais: [
    [2013, ["Contrastes, Galeria e Ateliê Lourenço de Bem"]],
    [2007, ["Transgredir, Mezanino da Sala Villa-Lobos, Teatro Nacional, Brasília"]],
    [2005, ["Pinturas 2005, Iate Clube de Brasília"]],
    [2002, ["A Cidade e o Sonho, Espaço Cultural 508 Sul, Brasília"]],
    [2001, ["Cores que Estão na Alma, Espaço de Arte do Tribunal Regional do Trabalho, Brasília"]],
    [1995, ["Banco Nacional 504 Norte, Brasília"]],
    [1994, ["Espaço Cultural do Serpro, SGAN Quadra 601, Brasília"]],
    [1993, ["CEF Itamarati, Brasília"]],
  ],
  coletivas: [
    [2013, ["Casa Cor Brasília"]],
    [2012, ["MAB, Diálogos da Resistência, Museu Nacional da República, Brasília"]],
    [2011, [
      "Art Fair Art Shopping, Carrousel du Louvre, Paris",
      "Café nas Cores Tropicais, Poleeni Cultural Center, Helsinki",
      "Brasília Noite & Dia, Espaço Cultural do Lago (ECULT), Brasília",
    ]],
    [2010, [
      "Homenageada pela Pró-Arte de Brasília na qualidade de artista plástica",
      "Brasília Noite & Dia, Galeria Piccola I, Caixa Cultural de Brasília, Campinas (SP)",
      "Conexões, Galeria de Artes Kunst, Petrópolis (RJ)",
    ]],
    [2009, ["Salão de Artes, Prêmio Maimeri (selecionada), São Paulo"]],
    [2008, [
      "Salão de Arte da SINAPESP (selecionada), São Paulo",
      "Circuito Internacional de Arte Brasileira, Galeria Elektor, Varsóvia",
      "Circuito Internacional de Arte Brasileira, Hugendubel Bücher, Frankfurt",
      "Circuito Internacional de Arte Brasileira, Palais Schlick (Europasaal), Viena",
    ]],
    [2007, ["Casa Cor Brasília 2007", "O Círculo, Museu Nacional do Conjunto Cultural da República, Brasília"]],
    [2006, ["Casa Cor Brasília"]],
    [2005, [
      "Cores do Carnaval, Foyer do Teatro Nacional, Secretaria de Estado de Cultura, Brasília",
      "VI Exposição Anual dos Artistas Plásticos de Brasília, Museu de Arte de Brasília (MAB)",
    ]],
    [2004, ["V Exposição Anual, Artistas Associados, Galeria Athos Bulcão, Brasília"]],
    [2003, [
      "Olhar 43, Espaço Cultural Gibran Khalil Gibran, Embaixada do Líbano, Brasília",
      "Mulheres, Pintura e Abstrações, Espaço Cultural Renato Russo, 508 Sul, Brasília",
      "Mostra Contemporânea, Iate Clube de Brasília",
    ]],
    [2001, [
      "Menção honrosa, ARTEXPO 2001, Jacob K. Javits Convention Center, Nova York",
      "1ª Panorâmica da Arte Brasiliense no STJ, Brasília",
    ]],
    [2000, [
      "Mulher, 500 Anos de Luta e Conquistas, Biblioteca do Senado Federal, Brasília",
      "Comemoração do Dia da Pátria, Consulado Geral do Brasil, Frankfurt",
      "Inauguração da Galeria da Embaixada do Brasil, Berlim",
    ]],
    [1999, [
      "MILLENNIUM, Galeria Cândido Portinari, Embaixada do Brasil, Roma",
      "MILLENNIUM, Galeria Debret, Paris",
      "MILLENNIUM, Art-Art Galeria, Brasília",
      "Terra Brasilis, Foyer da Sala Martins Pena, Teatro Nacional de Brasília",
      "II Salão de Arte Contemporânea, Salão Internacional de Petit Format, São Paulo",
    ]],
    [1998, [
      "Galeria do Senado Federal, Brasília",
      "Arte Contemporânea de Brasília, Agência da Vasp, Frankfurt",
      "Arte Contemporânea de Brasília, Hotel Nacional, Brasília",
      "Art Vie, Galeria de Arte São Paulo",
    ]],
    [1997, [
      "Arte Contemporânea de Brasília, Galeria Portinari, Fundação Centro de Estudos Brasileiros, Buenos Aires",
      "Diversidade de Expressão, Galeria Cândido Portinari, Embaixada do Brasil, Roma",
      "Diversidade de Expressão, Espaço Cultural da Embaixada do Brasil, Lisboa",
      "Caelum Art Gallery (Soho), Arte Contemporânea de Brasília, Nova York",
      "Selecionada pelo Salão Bunkyio, Sociedade Brasileira de Cultura Japonesa, São Paulo",
      "Prêmio Maimeri 75 anos, Centro Cultural Liceu de Artes e Ofícios, São Paulo",
      "Imaginarium, Palácio Itamaraty, Brasília",
      "Imaginarium, Galeria Debret, Paris",
      "Imaginarium, Setor Cultural da Embaixada do Brasil, Madri",
      "Exposição do Clube Internacional de Brasília, Visual Galeria de Arte",
    ]],
    [1996, [
      "Vitrina degli Artisti Contemporanei, Terza Edizione, Palazzo degli Affari, Florença",
      "Selecionada para o 25º Salão Bunkyio, São Paulo",
    ]],
  ],
};

// ---------------------------------------------------------------
// OBRAS
// Preços e medidas: WhatsApp da artista, 20/10/2026 ("preco" = peças disponíveis).
// status "aguardando" = ainda sem confirmação (vendida ou acervo): fica escondida do site
// até a artista mandar a lista de vendidas e de acervo.
// "dim" = [altura, largura] em cm (tela deitada: a segunda é maior). Em dípticos, é o conjunto.
// Fotos: public/img/obras/<id>.jpg (sem foto, aparece uma tela provisória).
// ---------------------------------------------------------------
export type Obra = {
  id: string;
  titulo: string;
  tecnica?: string;
  dim: [number, number];
  ano?: number;
  status: "disponivel" | "vendida" | "aguardando";
  paleta: [string, string, string];
  preco?: string;
  diptico?: boolean;
  detalhe?: string;
};

const V = cores.vermelhao, O = cores.oliva, A = cores.azul, B = cores.beringela, G = cores.ouro, W = cores.gesso;
const ACR = "Acrílico sobre tela";
const OLEO = "Óleo sobre tela";

export const obras: Obra[] = [
  // ---- À venda, com preço (WhatsApp, 20/10/2026) ----
  { id: "caminhos-iv", titulo: "Caminhos IV", dim: [120, 220], status: "disponivel", paleta: [O, G, W], preco: "R$ 18.500,00" },
  { id: "faz-de-conta", titulo: "Faz de conta", dim: [70, 100], status: "disponivel", paleta: [V, G, O], preco: "R$ 4.900,00" },
  { id: "imaginar", titulo: "Imaginar", dim: [100, 80], status: "disponivel", paleta: [A, W, G], preco: "R$ 5.600,00", detalhe: "Faz par com Olhar e Caminhar. Pintada numa fase em que a artista começava a abstrair." },
  { id: "caminhar", titulo: "Caminhar", dim: [100, 80], status: "disponivel", paleta: [O, W, G], preco: "R$ 5.600,00", detalhe: "Faz par com Olhar e Imaginar." },
  { id: "olhar", titulo: "Olhar", dim: [100, 80], status: "disponivel", paleta: [V, W, B], preco: "R$ 5.600,00", detalhe: "Faz par com Caminhar e Imaginar." },
  { id: "acalanto", titulo: "Acalanto", dim: [90, 120], status: "disponivel", paleta: [A, W, B], preco: "R$ 3.800,00 cada · R$ 7.600,00 os dois", diptico: true, detalhe: "Díptico: cada tela tem 90 × 60 cm." },
  { id: "encanto", titulo: "Encanto", dim: [100, 100], status: "disponivel", paleta: [V, B, G], preco: "R$ 7.000,00" },
  { id: "cerrado", titulo: "Cerrado", tecnica: ACR, dim: [120, 210], ano: 2026, status: "disponivel", paleta: [O, V, G], preco: "R$ 17.700,00" },
  { id: "poesia", titulo: "Poesia", tecnica: "Mista sobre tela", dim: [100, 200], ano: 2026, status: "disponivel", paleta: [W, G, B], preco: "R$ 14.000,00" },
  { id: "dialogo", titulo: "Diálogo I", tecnica: ACR, dim: [100, 140], ano: 2026, status: "disponivel", paleta: [V, W, G], preco: "R$ 9.800,00", detalhe: "O Diálogo II já foi vendido." },
  { id: "sentimento-de-paz", titulo: "Sentimento de Paz", tecnica: ACR, dim: [100, 160], ano: 2026, status: "disponivel", paleta: [A, W, O], preco: "R$ 5.600,00 cada · R$ 11.200,00 o díptico", diptico: true, detalhe: "Díptico de 100 × 160 cm: cada tela tem 100 × 80 cm." },
  { id: "ser-feliz-sim", titulo: "Ser feliz sim", dim: [180, 220], status: "disponivel", paleta: [V, G, O], preco: "R$ 27.700,00" },
  { id: "vida", titulo: "Vida", dim: [120, 100], status: "disponivel", paleta: [O, G, W], preco: "R$ 8.400,00" },
  { id: "pipa", titulo: "Pipa", tecnica: ACR, dim: [120, 100], ano: 2026, status: "disponivel", paleta: [V, A, G], preco: "R$ 8.400,00" },
  { id: "melhores-lembrancas", titulo: "Melhores lembranças I e II", tecnica: ACR, dim: [100, 180], ano: 2026, status: "disponivel", paleta: [V, G, W], preco: "R$ 12.600,00", diptico: true },
  { id: "luz-da-lua", titulo: "Luz da Lua I", tecnica: ACR, dim: [160, 100], ano: 2026, status: "disponivel", paleta: [B, A, G], preco: "R$ 11.200,00" },
  { id: "tons-beringela", titulo: "Tons beringela", dim: [130, 280], status: "disponivel", paleta: [B, V, W], preco: "R$ 25.500,00" },
  { id: "liberdade", titulo: "Liberdade I e II", dim: [120, 220], status: "disponivel", paleta: [A, W, G], preco: "R$ 9.200,00 cada · R$ 18.400,00 o díptico", diptico: true, detalhe: "Díptico de 120 × 220 cm: cada tela tem 120 × 110 cm." },
  { id: "brincadeira-de-crianca", titulo: "Brincadeira de criança", dim: [130, 220], status: "disponivel", paleta: [V, G, A], preco: "R$ 20.000,00" },
  { id: "posso-sonhar", titulo: "Posso sonhar", dim: [120, 180], status: "disponivel", paleta: [A, B, W], preco: "R$ 15.000,00" },
  { id: "natureza-plena", titulo: "Natureza Plena", tecnica: ACR, dim: [120, 200], ano: 2022, status: "disponivel", paleta: [O, A, G], preco: "R$ 16.800,00" },
  { id: "semear-amor", titulo: "Semear amor", tecnica: ACR, dim: [130, 150], ano: 2020, status: "disponivel", paleta: [V, G, O], preco: "R$ 13.600,00" },
  { id: "encontro", titulo: "Encontro", dim: [157, 90], status: "disponivel", paleta: [G, B, W], preco: "R$ 9.800,00" },
  { id: "flores-pelo-caminho", titulo: "Flores pelo caminho", tecnica: ACR, dim: [130, 220], ano: 2019, status: "disponivel", paleta: [V, O, W], preco: "R$ 20.000,00" },
  { id: "caminhando", titulo: "Caminhando", dim: [110, 210], status: "disponivel", paleta: [O, G, W], preco: "R$ 16.200,00" },
  { id: "lembrando", titulo: "Lembrando", dim: [130, 150], status: "disponivel", paleta: [B, G, W], preco: "R$ 13.600,00" },
  { id: "sabia-canta-ii-iv", titulo: "O sabiá canta II e IV", dim: [100, 140], status: "disponivel", paleta: [O, V, G], preco: "R$ 4.900,00 o díptico", diptico: true, detalhe: "Díptico da série O sabiá canta: cada tela tem 70 × 100 cm." },
  { id: "sinfonia-das-cores", titulo: "Sinfonia das cores", dim: [130, 150], status: "disponivel", paleta: [V, A, G], preco: "R$ 13.600,00" },
  { id: "ser", titulo: "Ser", dim: [175, 188], status: "disponivel", paleta: [B, G, W], preco: "R$ 23.000,00" },
  { id: "comecar-de-novo", titulo: "Começar de novo", dim: [180, 120], status: "disponivel", paleta: [O, W, G], preco: "R$ 15.120,00" },
  { id: "alegria-da-alma", titulo: "Alegria da alma", dim: [120, 80], status: "disponivel", paleta: [V, G, W], preco: "R$ 6.720,00" },
  { id: "tons-do-cafe", titulo: "Tons do café", dim: [90, 100], status: "disponivel", paleta: [G, B, O], preco: "R$ 6.300,00" },
  { id: "cores-e-registros", titulo: "Cores e registros", dim: [80, 70], status: "disponivel", paleta: [A, G, W], preco: "R$ 3.920,00", detalhe: "Da série Cores e registros. É o único que sobrou: os outros foram vendidos na Itália." },
  { id: "tons-claros-e-escuros", titulo: "Tons claros e escuros", dim: [160, 100], status: "disponivel", paleta: [W, B, G], preco: "R$ 11.200,00" },
  { id: "ir", titulo: "Ir I e II", dim: [120, 200], status: "disponivel", paleta: [A, V, W], preco: "R$ 8.400,00 cada", diptico: true, detalhe: "Díptico de 120 × 200 cm: cada tela tem 100 × 120 cm, e o valor é de cada uma." },

  // ---- Aguardando a artista confirmar (vendida ou acervo). Escondidas do site por enquanto. ----
  { id: "fluir", titulo: "Fluir", tecnica: ACR, dim: [69, 187], ano: 2026, status: "aguardando", paleta: [A, W, G] },
  { id: "o-tempo-2026", titulo: "O tempo", tecnica: ACR, dim: [187, 68], ano: 2026, status: "aguardando", paleta: [O, W, G] },
  { id: "memorias", titulo: "Memórias", tecnica: ACR, dim: [120, 100], ano: 2026, status: "aguardando", paleta: [G, B, W] },
  { id: "vestigios", titulo: "Vestígios", tecnica: ACR, dim: [100, 120], ano: 2026, status: "aguardando", paleta: [O, G, W] },
  { id: "sobre-sustentabilidade", titulo: "Sobre sustentabilidade", tecnica: ACR, dim: [80, 80], ano: 2026, status: "aguardando", paleta: [O, A, W] },
  { id: "linguagem-urbana", titulo: "Linguagem urbana", tecnica: ACR, dim: [160, 100], ano: 2026, status: "aguardando", paleta: [B, V, W] },
  { id: "ceu-de-estrelas", titulo: "Céu de Estrelas", tecnica: ACR, dim: [130, 220], ano: 2025, status: "aguardando", paleta: [A, B, W] },
  { id: "livre-expressao", titulo: "Livre Expressão", tecnica: ACR, dim: [135, 230], ano: 2025, status: "aguardando", paleta: [V, O, G] },
  // Enviadas em 13/10/2026, sem preço ainda
  { id: "quando-o-sol-vem", titulo: "Quando o sol vem", tecnica: "Mista sobre tela", dim: [90, 145], status: "aguardando", paleta: [G, O, W] },
  { id: "natureza-morta-ii", titulo: "Natureza morta II", tecnica: OLEO, dim: [46, 38], status: "aguardando", paleta: [G, B, W], detalhe: "Da primeira fase, antes de pintar de modo abstrato." },
  { id: "natureza-morta-i", titulo: "Natureza morta I", tecnica: OLEO, dim: [58, 70], status: "aguardando", paleta: [G, B, W], detalhe: "Da primeira fase, antes de pintar de modo abstrato." },
  { id: "flores-do-jardim", titulo: "Flores do jardim", tecnica: OLEO, dim: [80, 100], status: "aguardando", paleta: [V, O, W], detalhe: "Da primeira fase, antes de pintar de modo abstrato." },
  { id: "libertacao", titulo: "Libertação", tecnica: "Mista", dim: [80, 90], status: "aguardando", paleta: [A, B, W], detalhe: "Da segunda fase, quando começou a abstrair." },
  { id: "maternidade", titulo: "Maternidade", tecnica: "Mista", dim: [80, 90], status: "aguardando", paleta: [V, G, W], detalhe: "Da segunda fase, quando começou a abstrair." },

  // ---- Vendidas (provisório, vindo do Instagram; a artista vai mandar a lista oficial) ----
  { id: "poliptico-unir", titulo: "Unir (políptico)", tecnica: ACR, dim: [100, 160], ano: 2024, status: "vendida", paleta: [A, G, W] },
  { id: "poliptico-amor", titulo: "Amor (políptico)", tecnica: ACR, dim: [100, 160], ano: 2024, status: "vendida", paleta: [V, G, W] },
  { id: "poliptico-pensador", titulo: "Pensador (políptico)", tecnica: ACR, dim: [100, 160], ano: 2024, status: "vendida", paleta: [B, G, W] },
  { id: "poliptico-imaginacao", titulo: "Imaginação (políptico)", tecnica: ACR, dim: [100, 160], ano: 2024, status: "vendida", paleta: [O, G, W] },
  { id: "tela-100x160", titulo: "Tela de 2023", tecnica: ACR, dim: [100, 160], ano: 2023, status: "vendida", paleta: [W, G, B], detalhe: "Marcada como vendida no Instagram da artista." },
  { id: "amar", titulo: "Amar", tecnica: ACR, dim: [90, 200], ano: 2022, status: "vendida", paleta: [V, B, W] },
  { id: "o-tempo-na-memoria", titulo: "Sustentabilidade, o tempo na memória", tecnica: "Mista com colagem", dim: [83, 83], ano: 2022, status: "vendida", paleta: [G, O, W] },
  { id: "azul-da-cor-do-mar", titulo: "Azul da cor do mar I e II", tecnica: ACR, dim: [120, 100], ano: 2020, status: "vendida", paleta: [A, W, A] },
  { id: "agua", titulo: "Água", tecnica: "Mista sobre tela", dim: [110, 135], ano: 2020, status: "vendida", paleta: [A, O, W] },
  { id: "silencio-e-luz", titulo: "Silêncio e luz", tecnica: ACR, dim: [130, 220], ano: 2019, status: "vendida", paleta: [W, G, O] },
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

// ---------------------------------------------------------------
// RESERVA DE OBRA (sinal por Pix)
// Os mesmos números são usados pelo site e pelo servidor (pasta api/).
// ---------------------------------------------------------------
export const reserva = {
  sinal: 200, // reais, valor fixo
  dias: 7, // quanto tempo a obra fica reservada depois do pagamento
  minutosParaPagar: 30, // tempo para pagar o Pix antes de a obra ser liberada
  condicoes: [
    "O sinal de R$ 200 garante a tela por 7 dias e é abatido do valor final.",
    "Depois do pagamento, a Antônia (ou quem ela indicar) entra em contato para combinar valor final, entrega e instalação.",
    "Se o negócio não for fechado, o sinal é devolvido. Podem ser descontadas as tarifas do meio de pagamento.",
    "Passados 7 dias sem acordo, a tela volta a ficar disponível para outras pessoas.",
  ],
};

export const links = {
  instagram: `https://instagram.com/${artista.instagram}`,
  whatsapp: (msg?: string) =>
    `https://wa.me/${artista.whatsapp}${msg ? `?text=${encodeURIComponent(msg)}` : ""}`,
};

export const medidaTexto = (d: [number, number]) =>
  `${(d[0] / 100).toFixed(2).replace(".", ",")} × ${(d[1] / 100).toFixed(2).replace(".", ",")} m`;
