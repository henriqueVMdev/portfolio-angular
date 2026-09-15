export type TrajectoryMilestone = {
  id: string;
  ano: string;
  titulo: string;
  /** cargo ou natureza do marco; so os marcos principais tem */
  subtitulo?: string;
  texto: string;
  /** magnitude aparente: define tamanho, halo e escala do titulo */
  peso: "principal" | "intermediario";
  /** estrela das Pleiades associada ao marco; `null` = posicao vazia (o Futuro) */
  estrela: string | null;
  /** coordenadas normalizadas 0-1 sobre a carta 100x60 (x direita, y baixo) */
  x: number;
  y: number;
};

// ponytail: coordenadas sao DADO, nao CSS. Para acrescentar um marco basta uma
// entrada aqui, na ordem cronologica - as linhas seguem a ordem do array, e os
// x/y sao os pontos do traco original da carta, na sequencia em que ele desenha.
export const trajectory: TrajectoryMilestone[] = [
  {
    id: "grafica",
    ano: "2019",
    titulo: "Gráfica",
    texto:
      "Primeiro emprego, operando plotter. Fila de impressão, prazo apertado e a última validação da arte antes de virar produto.",
    peso: "intermediario",
    estrela: "Merope",
    x: 0.194,
    y: 0.614,
  },
  {
    id: "virtutrust",
    ano: "jun/2022",
    titulo: "VirtuTrust",
    subtitulo: "E-commerce próprio · Fundador",
    texto:
      "Abri minha própria operação em Mercado Livre, Shopee e site próprio. Comprar, anunciar, vender e atender. Tudo passava por mim. Foi o laboratório onde todo problema era meu para resolver.",
    peso: "principal",
    estrela: "Alcyone",
    x: 0.211,
    y: 0.707,
  },
  {
    id: "primeiro-codigo",
    ano: "2022",
    titulo: "Primeiro código",
    texto:
      "Curso de Python voltado a finanças. O primeiro contato, ainda sem saber onde ia dar.",
    peso: "intermediario",
    estrela: "Taygeta",
    x: 0.5,
    y: 0.676,
  },
  {
    id: "automacao",
    ano: "2022",
    titulo: "Automação",
    texto:
      "Adaptei um projeto open source de WhatsApp às regras do meu negócio: mensagens automáticas e filtragem de atendimento.",
    peso: "intermediario",
    estrela: "Pleione",
    x: 0.692,
    y: 0.827,
  },
  {
    id: "hrb-imports",
    ano: "set/2025",
    titulo: "HRB Imports",
    subtitulo: "Analista de operações e desenvolvimento",
    texto:
      "Vim para operar o catálogo, não para programar. Mas passei os primeiros meses corrigindo anúncio por anúncio: repetitivo, previsível, grande demais. Exatamente o tipo de coisa que se resolve com código.",
    peso: "principal",
    estrela: "Celaeno",
    x: 0.94,
    y: 0.676,
  },
  {
    id: "calculadora",
    ano: "2025",
    titulo: "Calculadora",
    texto:
      "Primeira coisa que construí do zero: uma calculadora de precificação, no primeiro mês de HRB. Dor real, solução minha.",
    peso: "intermediario",
    estrela: "Electra",
    x: 0.954,
    y: 0.493,
  },
  {
    id: "migracao-shopee",
    ano: "2025",
    titulo: "Script migração para Shopee",
    texto:
      "A empresa ia abrir loja na Shopee e precisava levar 20 mil anúncios do Mercado Livre. À mão, a equipe estimava um mês. Escrevi um script em Python que lia, tratava e criava tudo do outro lado. Levou uma semana e meia.",
    peso: "intermediario",
    estrela: "Asterope",
    x: 0.9,
    y: 0.339,
  },
  {
    id: "senai",
    ano: "2026",
    titulo: "SENAI",
    subtitulo: "Análise e desenvolvimento de sistemas",
    texto:
      "Aprendi Java e Spring Boot por necessidade, resolvendo problema real. O SENAI veio depois, colocou fundação embaixo do que eu já usava e acrescentou o que eu não teria procurado sozinho: banco de dados, redes, DevOps. Conclusão em 2027.",
    peso: "principal",
    estrela: "Maia",
    x: 0.784,
    y: 0.403,
  },
  {
    id: "myrias",
    ano: "mar/2026",
    titulo: "Myrias",
    subtitulo: "Sistema interno em produção",
    texto:
      "Apresentei o projeto à diretoria e comecei a desenvolver. Deixou de ser script pessoal e virou sistema com usuários, contratos e consequência.",
    peso: "principal",
    estrela: "Atlas",
    x: 0.747,
    y: 0.207,
  },
  {
    id: "futuro",
    ano: "Em aberto",
    titulo: "Futuro",
    texto:
      "Próximo passo: Fullstack, Java. Um time onde revisão de código e decisão documentada sejam prática, não exceção.",
    peso: "principal",
    estrela: null,
    x: 0.589,
    y: 0.04,
  },
];
