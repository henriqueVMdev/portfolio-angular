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
      "Gestão de anúncios do Mercado Livre em múltiplas contas, com catálogo espelhado localmente, automações que escrevem sozinhas e um assistente que não escreve sem confirmação humana.",
    description:
      "Backend organizado por domínio, com o catálogo do Mercado Livre espelhado numa tabela local que serve todas as telas. Uma varredura noturna alimenta o espelho; o retorno das edições e os webhooks mantêm ele fresco. Duas identidades independentes atravessam quase toda rota: quem opera o painel e em nome de qual conta a ação acontece. Roda num host de 1 vCPU, e isso não é detalhe de infraestrutura — é a restrição que moldou quase toda decisão de performance.",
    placeholderNotice:
      "Sistema interno em produção na HRB Imports. Substituiu um SaaS pago de terceiros e virou o padrão de operação da empresa. Código em repositório fechado: abrir não é permitido por contrato.",
    stack: [
      "Java 21",
      "Spring Boot 3",
      "PostgreSQL",
      "Redis",
      "Flyway",
      "Vue 3",
      "Vite",
      "Tailwind",
      "Docker",
      "GitHub Actions",
      "Python",
    ],
    capabilities: [
      "Multi-conta",
      "Catálogo espelhado",
      "Automações",
      "Fila distribuída",
      "Rate limiting com prioridade",
      "Auditoria append-only",
      "Criptografia em repouso",
      "Assistente com confirmação humana",
      "Webhooks",
      "Import/export por planilha",
    ],
    decisions: [
      {
        title: "O catálogo do marketplace espelhado numa tabela local",
        body:
          "Cada tela perguntava ao Mercado Livre, e quatro varreduras noturnas concorrentes estouravam a memória do host. A varredura das 00:30 passou a ser a única fonte, e as demais telas leem dela em SQL.",
        cost:
          "O dado é de ontem até o webhook chegar, e a tabela vira uma segunda fonte de verdade que pode divergir do marketplace.",
        gain:
          "Um scan em vez de quatro, filtros e totais reais sobre o catálogo inteiro, e telas que respondem em SQL em vez de em chamadas de API.",
      },
      {
        title: "Sessão assinada com revogação no servidor",
        body:
          "O cookie carrega usuário, sessão, emissão e versão de chave sob HMAC, mas a validação também exige uma linha viva no banco. Assinatura impede adulteração e não impede que um cookie roubado valha até expirar.",
        cost: "Uma consulta curta por requisição — o preço de não ser stateless.",
        gain:
          "Logout real, revogação imediata em troca de senha, e rotação de chave sem derrubar sessões ativas.",
      },
      {
        title: "Autenticação própria em vez de Spring Security",
        body:
          "O modelo de acesso é uma lista de chaves de permissão por usuário, e o starter traria configuração para resolver um problema já resolvido. Entra só o BCrypt.",
        cost:
          "A verificação é explícita em cada controller, o que exige disciplina ao criar rotas.",
        gain:
          "O fluxo de autorização inteiro cabe em dois arquivos auditáveis, sem indireção entre a rota e a regra.",
      },
      {
        title: "Escrita da IA sempre confirmada por humano",
        body:
          "O modelo só enxerga as ferramentas que a permissão do usuário libera. Leitura executa no loop; escrita vira pendência com prazo, e a permissão é revalidada no clique de confirmar.",
        cost: "Um clique a mais, e a pendência expira em dez minutos.",
        gain:
          "Um modelo alucinando não altera preço de anúncio — e a mesma regra vale para escrita em banco e para chamada de API.",
      },
      {
        title: "Regra de automação como função pura",
        body:
          "As regras que decidem promoção e preço por quantidade não fazem I/O: recebem os dados gravados e devolvem a decisão. Quem escreve é o service que já existe.",
        cost:
          "A regra só enxerga o que a varredura gravou — decisão boa sobre dado velho continua sendo decisão ruim.",
        gain:
          "A simulação da tela usa a mesma função da execução real, então o preview não mente, e não existe segunda cópia da regra para divergir.",
      },
      {
        title: "Auditoria append-only por trigger no banco",
        body:
          "Update e delete bloqueados no próprio banco, só a rotina de retenção passa; payloads sanitizados antes de gravar.",
        cost: "Corrigir um registro só por linha nova.",
        gain:
          "A trilha não vira repositório de segredos nem pode ser reescrita por quem tem acesso ao banco.",
      },
      {
        title: "Rate limiter com prioridade",
        body:
          "A versão anterior não tinha, e a previsão escrita na época era que, se a auditoria noturna atrasasse o operador, prioridade seria o próximo passo. Foi o que aconteceu.",
        cost:
          "Prioridade só existe no modo local, e todo fan-out precisa capturar o contexto antes de disparar.",
        gain: "O clique do operador não espera a varredura de milhares de anúncios.",
      },
      {
        title: "Custo esparso, nunca zero",
        body:
          "Kit cujo componente não tem custo cadastrado fica sem custo, não com custo zero.",
        cost: "Um componente sem cadastro tira o kit inteiro das análises de margem.",
        gain:
          "A tela mostra um traço em vez de margem inflada; número errado sobre dinheiro é pior que a ausência dele.",
      },
      {
        title: "Planilha como interface de edição em massa",
        body:
          "A operação já vivia no Excel, então o catálogo exporta e reimporta em CSV ou xlsx, lido sem biblioteca externa, e só a célula que mudou vira escrita.",
        cost:
          "O import é síncrono, e volume grande vai estourar o request antes de virar job.",
        gain: "Zero dependência nova e nenhuma escrita desnecessária no marketplace.",
      },
      {
        title: "Flyway em produção, Hibernate só valida",
        body:
          "O schema muda por migração versionada, nunca por inferência do ORM no startup.",
        cost: "Toda mudança de entidade exige migração antes do deploy, e já são 25.",
        gain: "Schema muda apenas por alteração revisável, com histórico e ordem.",
      },
    ],
    endpoints: [
      { method: "POST", path: "/api/app/login", purpose: "aberta" },
      { method: "GET", path: "/api/app/session", purpose: "aberta" },
      { method: "GET", path: "/api/auth/login", purpose: "manage_accounts" },
      { method: "POST", path: "/api/auth/accounts/switch", purpose: "manage_accounts" },
      { method: "GET", path: "/api/items", purpose: "performance" },
      {
        method: "PUT",
        path: "/api/items/{itemId}",
        purpose: "bulk_edit, ou delete_listing se o status for encerrar",
      },
      { method: "POST", path: "/api/items/upload-picture", purpose: "upload_images" },
      { method: "GET", path: "/api/bulk/skus/all", purpose: "só sessão" },
      { method: "POST", path: "/api/bulk/update-multi/jobs", purpose: "bulk_edit" },
      { method: "GET", path: "/api/bulk/jobs/{jobId}", purpose: "bulk_edit" },
      {
        method: "GET",
        path: "/api/catalog/spreadsheet",
        purpose: "só sessão; colunas de edição exigem bulk_edit",
      },
      { method: "POST", path: "/api/promotions/automation/preview", purpose: "promocoes" },
      { method: "POST", path: "/api/promotions/items", purpose: "manage_promotions" },
      { method: "GET", path: "/api/sales", purpose: "vendas, chave isolada para desenvolvedor" },
      { method: "POST", path: "/api/ai/chat", purpose: "assistente" },
      {
        method: "POST",
        path: "/api/ai/actions/{id}/confirm",
        purpose: "assistente mais a permissão real da ação",
      },
      { method: "POST", path: "/api/webhooks", purpose: "aberta" },
    ],
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
    preview: "observability",
  },
];

export const getProject = (slug: string) => projects.find((project) => project.slug === slug);
