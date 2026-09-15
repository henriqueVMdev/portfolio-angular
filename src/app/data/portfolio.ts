export type DiagramNode = {
  id: string;
  label: string;
  x: number;
  y: number;
};

export type DiagramEdge = {
  from: string;
  to: string;
};

export type PortfolioProject = {
  slug: string;
  index: string;
  name: string;
  category: string;
  summary: string;
  description: string;
  coverDescription?: string;
  technicalSummary?: string;
  placeholderNotice: string;
  repositoryUrl?: string;
  detailsAvailable?: boolean;
  stack: string[];
  capabilities: string[];
  decisions: { title: string; body: string; cost?: string; gain?: string }[];
  endpoints: { method: string; path: string; purpose: string }[];
  diagram: { nodes: DiagramNode[]; edges: DiagramEdge[] };
  preview: "operations" | "finance" | "observability" | "custody";
};

export const profile = {
  name: "Henrique de Paula Valim Melo",
  role: "Backend / Fullstack",
  statement: "Código é estrutura. Arquitetura é propósito.",
  shortBio:
    "Desenvolvedor focado em sistemas claros, integrações resilientes e produtos que continuam compreensíveis quando crescem.",
  contacts: [
    { label: "Email", value: "henrique.de.paula.valim@gmail.com", href: "mailto:henrique.de.paula.valim@gmail.com" },
    { label: "GitHub", value: "https://github.com/henriqueVMdev", href: "https://github.com/henriqueVMdev" },
    { label: "LinkedIn", value: "https://www.linkedin.com/in/henrique-de-paula-valim-melo/", href: "https://www.linkedin.com/in/henrique-de-paula-valim-melo/" },
    { label: "Currículo", value: "Visualizar PDF", href: "/curriculo-henrique-valim.pdf" },
  ],
};

export const projects: PortfolioProject[] = [
  {
    slug: "myrias",
    index: "I",
    name: "Myrias",
    category: "PLATAFORMA DE OPERAÇÕES DE MARKETPLACE",
    summary:
      "Gestão de dezenas de milhares de anúncios do Mercado Livre em múltiplas contas, com edição em massa, auditoria e um assistente de IA que escreve com conferência e permissão do usuário.",
    description:
      "Backend Spring Boot organizado por domínio, não por camada: cada pacote traz seu controller, service e entidades juntos. Duas identidades independentes atravessam quase toda rota: quem opera o painel e em nome de qual conta do Mercado Livre a ação acontece. O acesso à API externa passa por um único cliente que concentra token, retry e rate limit, porque o gargalo do sistema é a cota do marketplace, não o servidor.",
    placeholderNotice:
      "Sistema interno em produção na HRB Imports.",
    repositoryUrl: "https://github.com/henriqueVMdev/MyriasPublic",
    stack: [
      "Java 21",
      "Spring Boot 3",
      "PostgreSQL",
      "JPA / Hibernate",
      "Vue 3",
      "Vite",
      "Docker",
      "JUnit",
      "OpenRouter",
    ],
    capabilities: [
      "OAuth 2.0 PKCE",
      "Multi-conta",
      "Edição em massa",
      "Rate limiting",
      "Trilha de auditoria",
      "Agente de IA com confirmação humana",
      "Webhooks",
      "Jobs agendados",
      "CI/CD",
    ],
    decisions: [
      {
        title: "Autenticação própria em vez de Spring Security",
        body:
          "O modelo de acesso é uma lista de chaves de permissão por usuário, guardada em coluna JSON, deliberadamente simples, porque a operação tem rotatividade alta e adicionar alguém precisa ser questão de marcar caixas. Trazer o Spring Security significaria traduzir esse modelo para o vocabulário do framework sem ganhar nada em troca. Entrou só o BCrypt; a sessão e a checagem são um filtro e uma classe chamada explicitamente nos controllers.",
        cost:
          "A verificação é explícita por endpoint, o que exige disciplina ao adicionar rotas.",
        gain:
          "O caminho de autenticação inteiro cabe em duas classes; dá para auditar o fluxo de ponta a ponta sem sair do código do projeto.",
      },
      {
        title: "Spring MVC bloqueante em vez de WebFlux",
        body:
          "O teto de throughput do sistema não é CPU nem número de threads. É a cota de requisições da API do Mercado Livre, e o rate limiter já a respeita. Reativo compraria complexidade de leitura e de depuração sem comprar vazão. O paralelismo onde importa vem de CompletableFuture sobre um pool fixo, dimensionado pela mesma concorrência do limitador.",
        cost:
          "Uma thread ocupada por requisição enquanto ela espera a resposta do marketplace.",
        gain:
          "Stack trace inteiro e depuração direta: um erro em produção aponta a linha, não um encadeamento de operadores.",
      },
      {
        title: "Escrita da IA sempre confirmada por humano",
        body:
          "O assistente recebe as ferramentas que a permissão do usuário libera, e o modelo decide quais chamar. As de leitura executam direto dentro do loop. As de escrita não executam: viram uma pendência com prazo de validade, e a permissão real da ação é revalidada no momento em que o operador confirma, não apenas quando a ferramenta foi oferecida ao modelo.",
        cost: "Um clique a mais, e as pendências se perdem no restart.",
        gain: "Um modelo alucinando não altera preço de anúncio.",
      },
      {
        title: "Chave de sessão que falha no startup fora de desenvolvimento",
        body:
          "O cookie de sessão é assinado por HMAC, e a chave tem um valor padrão no repositório para o ambiente local. Um deploy sem a variável configurada assinaria sessões de produção com uma chave pública. Qualquer um forjaria o cookie de qualquer usuário. A aplicação recusa subir nessa condição.",
        cost:
          "Nenhum. Configuração errada vira falha visível em vez de brecha silenciosa.",
        gain:
          "A falha mais grave possível no sistema deixa de depender de alguém lembrar de configurar uma variável.",
      },
      {
        title: "Cache curto em vez de truncar a varredura",
        body:
          "Listar os SKUs disponíveis exige varrer todos os anúncios de todas as contas conectadas, uma operação cara. A alternativa descartada era parar num teto e devolver o que deu tempo, porque mostrar uma lista incompleta como se fosse completa é pior que demorar. A saída foi varrer inteiro e guardar o resultado por alguns minutos.",
        cost:
          "Edição feita fora do painel demora esse intervalo para aparecer.",
        gain:
          "A lista sempre reflete o catálogo inteiro, e a varredura cara roda uma vez a cada poucos minutos em vez de a cada abertura de tela.",
      },
    ],
    endpoints: [
      { method: "POST", path: "/operations", purpose: "Registra uma nova operação idempotente" },
      { method: "GET", path: "/operations/:id", purpose: "Consulta estado e trilha de eventos" },
      { method: "POST", path: "/webhooks/provider", purpose: "Recebe atualizações externas verificadas" },
    ],
    diagram: {
      nodes: [
        { id: "client", label: "Cliente", x: 8, y: 38 },
        { id: "api", label: "API", x: 34, y: 38 },
        { id: "queue", label: "Fila", x: 61, y: 17 },
        { id: "worker", label: "Workers", x: 61, y: 61 },
        { id: "db", label: "PostgreSQL", x: 87, y: 38 },
      ],
      edges: [
        { from: "client", to: "api" }, { from: "api", to: "queue" }, { from: "queue", to: "worker" },
        { from: "worker", to: "db" }, { from: "api", to: "db" },
      ],
    },
    preview: "operations",
  },
  {
    slug: "basanos",
    index: "II",
    name: "Basanos",
    category: "LABORATÓRIO DE VALIDAÇÃO QUANTITATIVA",
    summary:
      "Laboratório que reprova estratégias de investimento antes que elas cheguem ao mercado. Backtest com causalidade garantida, validação fora da amostra, custos de operação e paridade entre pesquisa e execução automatizada.",
    description:
      "Monólito modular em Flask com os motores quantitativos em processo, e estratégias carregadas como plugins que declaram o próprio schema de parâmetros. Adicionar uma estratégia não toca no núcleo. Uma camada de normalização converte toda fonte externa para um formato temporal único, de modo que o motor de backtest não sabe de onde veio o dado. O executor automatizado trabalha exclusivamente sobre períodos fechados e reconcilia estado antes de calcular qualquer sinal, porque o gargalo do sistema é a honestidade temporal do dado, não a velocidade do cálculo.",
    placeholderNotice:
      "Projeto pessoal de pesquisa. Uso local single-node; repositório privado por conter configuração operacional.",
    stack: [
      "Python",
      "Flask",
      "Pandas",
      "NumPy",
      "SciPy",
      "statsmodels",
      "Vue 3",
      "Pinia",
      "Vite",
      "Tailwind",
      "Plotly",
      "SQLite WAL",
      "Parquet",
      "scikit-learn",
      "Docker",
      "Nginx",
      "pytest",
    ],
    capabilities: [
      "Walk-forward analysis",
      "Monte Carlo",
      "Teste de permutação",
      "Custos e funding por corretora",
      "Estratégias plugáveis",
      "Otimização de parâmetros",
      "Paridade backtest-execução",
      "Detecção de regimes",
      "Execução simulada",
      "Normalização multi-fonte",
    ],
    decisions: [
      {
        title: "Causalidade antes de performance",
        body: "Nenhum cálculo pode usar informação que não estaria disponível no instante avaliado. Candles ainda em formação são descartados; o sinal é calculado no fechamento e executado na abertura seguinte. Indicadores que precisam de histórico recebem um período de aquecimento anterior à janela avaliada, mas as métricas são medidas somente dentro da janela. Um backtest que viola isso parece melhor e não é reproduzível.",
      },
      {
        title: "Fora da amostra como portão",
        body: "A validação walk-forward divide o histórico em blocos temporais sucessivos, calibra em cada bloco e mede no bloco seguinte, nunca visto. A métrica de eficiência compara o desempenho retido fora da amostra com o desempenho calibrado. Janelas com trades insuficientes são excluídas da agregação em vez de contaminá-la.",
      },
      {
        title: "Custo faz parte da tese",
        body: "Taxas de corretagem e custo de financiamento de posição são aplicados por corretora, com cenário pessimista disponível. Uma estratégia de alto giro que só é lucrativa antes dos custos não é uma estratégia; é uma conta de taxas. O sistema torna isso visível antes da decisão, não depois.",
      },
      {
        title: "Paridade entre pesquisa e execução",
        body: "A mesma função que gera o sinal no backtest gera o sinal na execução automatizada, sob um contrato explícito de regra de preenchimento, validade da ordem e condição de saída. Uma suíte de testes verifica que backtest e executor produzem o mesmo resultado sobre os mesmos dados. Sem essa garantia, validar uma estratégia e operar outra é o resultado padrão.",
      },
    ],
    endpoints: [],
    diagram: {
      nodes: [
        { id: "sources", label: "Fontes", x: 8, y: 38 },
        { id: "normalizer", label: "Normalização", x: 34, y: 38 },
        { id: "engine", label: "Backtest", x: 61, y: 18 },
        { id: "strategies", label: "Plugins", x: 61, y: 60 },
        { id: "executor", label: "Executor", x: 87, y: 38 },
      ],
      edges: [
        { from: "sources", to: "normalizer" },
        { from: "normalizer", to: "engine" },
        { from: "strategies", to: "engine" },
        { from: "engine", to: "executor" },
      ],
    },
    preview: "finance",
  },
  {
    slug: "omniseg",
    index: "III",
    name: "OmniSeg",
    category: "CONTROLE DE CUSTÓDIA E ESTOQUE",
    summary:
      "Ciclo de custódia de equipamentos de proteção individual: solicitação, aprovação por exceção, entrega com débito de estoque e devolução, com visibilidade por setor e limite por papel.",
    description:
      "SPA servida como arquivos estáticos falando direto com o Supabase, sem servidor de aplicação próprio. Isso torna o cliente substituível por uma chamada HTTP e empurra toda regra crítica para o banco. O guard de rota e o menu por papel orientam o usuário, não o contêm. O ciclo de custódia é a entidade central: uma entrega não é um booleano, é um estado que registra quem solicitou, quem autorizou a exceção, quando o item saiu e se voltou, com a validade do equipamento congelada no instante da entrega.",
    coverDescription:
      "SPA servida como arquivos estáticos falando direto com o Supabase, sem servidor de aplicação próprio. Isso torna o cliente substituível por uma chamada HTTP e empurra toda regra crítica para o banco. O ciclo de custódia é a entidade central: uma entrega não é um booleano, é um estado que registra quem solicitou, quem autorizou a exceção, quando o item saiu e se voltou.",
    technicalSummary:
      "Sistema web que substitui o controle em papel de EPIs por um ciclo rastreável de solicitação, aprovação, entrega e devolução, além de documentar onde ainda não é confiável.",
    placeholderNotice:
      "Projeto acadêmico individual. Documentado e auditado contra o próprio código, com os defeitos publicados.",
    repositoryUrl: "https://github.com/henriqueVMdev/sistema-epi",
    stack: [
      "Vue 3",
      "Vue Router 4",
      "Vite 8",
      "JavaScript ESM",
      "Supabase",
      "PostgreSQL",
      "Supabase Auth",
      "Storage",
      "Vitest",
      "Vue Test Utils",
      "CSS com tokens",
    ],
    capabilities: [
      "Ciclo de custódia em cinco estados",
      "Limite por papel",
      "Exceção com justificativa",
      "Concorrência otimista no estoque",
      "Visibilidade por setor",
      "Validade e estoque mínimo",
      "Painel operacional",
      "Administração de papéis e limites",
      "Contraste verificado automaticamente",
      "Carregamento por rota",
    ],
    decisions: [
      {
        title: "O cliente não é a fronteira",
        body:
          "A aplicação é servida como arquivo estático e conversa direto com o banco usando uma chave pública. Isso a torna auditável por qualquer pessoa e contornável por uma chamada HTTP. O guard de rota e o menu por papel existem para orientar o usuário, não para contê-lo. A consequência é declarada e não escondida: se o banco não repetir a regra, a regra não existe.",
      },
      {
        title: "Custódia é estado, não flag",
        body:
          "Uma entrega percorre pendente_aprovacao ou pendente_entrega, e daí para entregue, devolvido ou recusado. Cada transição grava quem decidiu e quando. Um booleano \"entregue\" responderia à pergunta errada. O que precisa ser provado não é que o item saiu, é sob autorização de quem, e se voltou.",
      },
      {
        title: "O limite é do papel, a exceção é do humano",
        body:
          "Aluno e professor têm teto de unidades em uso por item; administração e almoxarifado não têm. Pedir acima do teto não é bloqueado; é desviado para uma fila de aprovação com justificativa obrigatória. Bloquear produziria contorno informal, que é exatamente o comportamento que o papel já permitia.",
      },
    ],
    endpoints: [],
    diagram: {
      nodes: [
        { id: "spa", label: "SPA Vue", x: 8, y: 38 },
        { id: "supabase", label: "Supabase", x: 38, y: 38 },
        { id: "auth", label: "Auth", x: 67, y: 16 },
        { id: "storage", label: "Storage", x: 67, y: 60 },
        { id: "db", label: "PostgreSQL", x: 90, y: 38 },
      ],
      edges: [
        { from: "spa", to: "supabase" },
        { from: "supabase", to: "auth" },
        { from: "supabase", to: "storage" },
        { from: "supabase", to: "db" },
      ],
    },
    preview: "custody",
  },
  {
    slug: "kairos",
    index: "IV",
    name: "Kairós",
    category: "INTELIGÊNCIA COMERCIAL · EM DESENVOLVIMENTO",
    summary:
      "Tratamento e análise da carteira comercial da Provedor CTI para transformar planilhas operacionais em informações gerenciais, padrões de contratação e oportunidades de ação.",
    description:
      "Projeto Integrador SENAI 2026/01 voltado à limpeza, padronização e análise de dados comerciais mantidos em Excel. O sistema deverá consolidar informações sobre consultores, clientes, segmentos, níveis A, B e C, faixas de faturamento e serviços contratados.",
    coverDescription:
      "Da planilha operacional a uma visão consistente da carteira: dados tratados para apoiar decisões comerciais com mais clareza.",
    technicalSummary:
      "Aplicação em desenvolvimento para ingestão, padronização, análise e visualização de dados comerciais.",
    placeholderNotice:
      "Em desenvolvimento · Projeto Integrador SENAI 2026/01 em parceria com a Provedor CTI. A arquitetura e os detalhes técnicos serão publicados após a consolidação do projeto.",
    detailsAvailable: false,
    stack: [
      "Vue 3",
      "Python",
      "Java",
      "Spring Boot",
      "PostgreSQL",
    ],
    capabilities: [
      "Limpeza e padronização de planilhas Excel",
      "Análise por segmento e nível de cliente",
      "Mapeamento dos serviços mais contratados",
      "Identificação de padrões de faturamento",
      "Visualização gerencial da carteira",
      "Geração de insights para ações comerciais",
    ],
    decisions: [],
    endpoints: [],
    diagram: {
      nodes: [],
      edges: [],
    },
    preview: "observability",
  },
];

export const getProject = (slug: string) => projects.find((project) => project.slug === slug);
