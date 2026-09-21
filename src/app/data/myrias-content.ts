export const myriasResults = [
  {
    figure: "~40 mil",
    caption: "anúncios sob gestão nas contas conectadas.",
  },
  {
    figure: "~10 mil",
    caption:
      "anúncios espelhados entre contas em 3 dias. O mesmo trabalho levava meses no processo manual.",
  },
  {
    figure: "4 → 1",
    caption:
      "varreduras noturnas. O pico de inventário, qualidade e concorrência varrendo em paralelo derrubava o backend; hoje uma varredura alimenta todas as telas.",
  },
];

export const myriasIdentities = [
  {
    aspect: "Sujeito",
    panel: "operador do painel",
    account: "conta conectada do Mercado Livre",
  },
  {
    aspect: "Credencial",
    panel: "cookie de sessão assinado por HMAC",
    account: "token OAuth",
  },
  {
    aspect: "Erro típico",
    panel: "401 não autenticado / 403 sem permissão",
    account: "401 faça login via OAuth",
  },
];

export const myriasLimits = [
  {
    title: "Uma réplica, na prática",
    body:
      "A fila é distribuída; o limitador não. Ligar o caminho distribuído hoje custaria a prioridade que a operação sente — o clique do operador deixaria de passar na frente da varredura noturna.",
  },
  {
    title: "O host é o teto",
    body:
      "1 vCPU e 2 GB moldam boot preguiçoso, GC serial e concorrência de fila em 3. Crescimento de volume esbarra primeiro na máquina, não no código.",
  },
  {
    title: "Dado de ontem",
    body:
      "Catálogo varrido à meia-noite e meia, promoções às 06:30. O webhook cobre preço, título, estoque e status; o resto envelhece durante o dia.",
  },
  {
    title: "Verificação de permissão explícita por endpoint",
    body:
      "A escolha por autenticação própria troca configuração de framework por disciplina ao adicionar rotas. Rota nova sem checagem é rota aberta.",
  },
  {
    title: "Multi-tenant ainda é ponte",
    body:
      "O identificador de organização circula na auditoria; o isolamento de dados não existe. A estrutura está no lugar, a garantia não.",
  },
  {
    title: "Scraping por padrão de texto sobre HTML de terceiros",
    body:
      "Mudança de layout quebra em silêncio: o sintoma é resultado vazio, não exceção.",
  },
  {
    title: "Frontend sem teste automatizado",
    body:
      "A integração contínua roda verificação de tipos e build; não há teste de componente nem de fluxo.",
  },
];
