const flowchartTheme = `%%{init: {'theme':'base','themeVariables':{'fontFamily':'ui-monospace, SFMono-Regular, Menlo, monospace','fontSize':'14px','primaryColor':'#173F3D','primaryTextColor':'#EDE6D6','primaryBorderColor':'#C8A45C','secondaryColor':'#0F2E2C','tertiaryColor':'#1E4B48','mainBkg':'#173F3D','nodeBorder':'#C8A45C','lineColor':'#8FA8A6','textColor':'#EDE6D6','titleColor':'#C8A45C','edgeLabelBackground':'#0F2E2C','clusterBkg':'#0F2E2C','clusterBorder':'#3A6663'}}}%%`;

export const basanosFunnel = `${flowchartTheme}
flowchart TD
    idea["Hipótese"] --> impl["Implementação sob contrato"]
    impl --> back["Backtest"]
    back --> costs["Aplicação de custos<br/>e cenário pessimista"]
    costs --> wfa["Validação walk-forward"]
    wfa --> robust{"Retenção fora<br/>da amostra?"}
    robust -->|"Não"| kill["Reprovada"]
    robust -->|"Sim"| mc["Monte Carlo e<br/>teste de permutação"]
    mc --> stable{"Sobrevive ao<br/>reembaralhamento?"}
    stable -->|"Não"| kill
    stable -->|"Sim"| paper["Execução simulada"]
    paper --> parity{"Paridade com<br/>o backtest?"}
    parity -->|"Não"| diag["Diagnóstico de dados,<br/>preenchimento e custos"]
    diag --> impl
    parity -->|"Sim"| approved["Aprovada para<br/>capital reduzido"]`;

export const basanosArchitecture = `${flowchartTheme}
flowchart LR
    ui["SPA Vue 3"] -->|"REST"| api["API Flask"]
    api --> quant["Motores quantitativos<br/>backtest, otimizador,<br/>walk-forward, Monte Carlo"]
    api --> exec["Automação<br/>runner e executores"]
    quant --> plug["Estratégias<br/>plugáveis"]
    exec --> plug
    quant --> md["Camada de dados<br/>de mercado"]
    exec --> md
    md --> ext["Fontes externas<br/>normalizadas"]
    exec --> db[("SQLite WAL<br/>estado operacional")]
    quant --> cache[("Parquet e cache<br/>em memória")]`;

export const basanosLimits = [
  {
    title: "Não escala horizontalmente",
    body: "O runner é uma thread do próprio servidor web e o otimizador mantém estado de progresso em memória do processo. Rodar múltiplos workers sem coordenação persistente produziria execução duplicada. A separação em processo de worker dedicado está mapeada como o próximo passo estrutural.",
  },
  {
    title: "Não tem autenticação",
    body: "O sistema foi construído para operação local single-node. Expor a API à internet exigiria autenticação, controle de acesso, limitação de taxa e auditoria imutável antes de qualquer outra coisa. Nenhum deles existe hoje, e o projeto declara isso em vez de fingir o contrário.",
  },
  {
    title: "O backtest não conhece o intrabar",
    body: "Trabalhando sobre dados agregados por período, o sistema não sabe a sequência real de preços dentro de cada intervalo. Quando alvo e stop são atingidos no mesmo período, a resolução é uma convenção, não um fato. Isso limita a precisão para estratégias de horizonte muito curto e é a razão de o sistema não pretender validá-las.",
  },
  {
    title: "Simulação estocástica tem premissas",
    body: "As projeções assumem um modelo de retornos que não captura integralmente caudas pesadas nem mudanças de regime. O resultado é uma distribuição sob um modelo, não uma previsão.",
  },
];
