const flowchartTheme = `%%{init: {'theme':'base','themeVariables':{'fontFamily':'ui-monospace, SFMono-Regular, Menlo, monospace','fontSize':'14px','primaryColor':'#173F3D','primaryTextColor':'#EDE6D6','primaryBorderColor':'#C8A45C','secondaryColor':'#0F2E2C','tertiaryColor':'#1E4B48','mainBkg':'#173F3D','nodeBorder':'#C8A45C','lineColor':'#8FA8A6','textColor':'#EDE6D6','titleColor':'#C8A45C','edgeLabelBackground':'#0F2E2C','clusterBkg':'#0F2E2C','clusterBorder':'#3A6663'}}}%%`;

const sequenceTheme = `%%{init: {'theme':'base','themeVariables':{'fontFamily':'ui-monospace, SFMono-Regular, Menlo, monospace','fontSize':'14px','primaryColor':'#173F3D','primaryTextColor':'#EDE6D6','primaryBorderColor':'#C8A45C','lineColor':'#8FA8A6','textColor':'#EDE6D6','actorBkg':'#173F3D','actorBorder':'#C8A45C','actorTextColor':'#EDE6D6','actorLineColor':'#8FA8A6','signalColor':'#EDE6D6','signalTextColor':'#EDE6D6','labelBoxBkgColor':'#1E4B48','labelBoxBorderColor':'#C8A45C','labelTextColor':'#EDE6D6','loopTextColor':'#EDE6D6','noteBkgColor':'#C8A45C','noteTextColor':'#12302E','noteBorderColor':'#C8A45C','activationBkgColor':'#1E4B48','activationBorderColor':'#C8A45C','sequenceNumberColor':'#12302E'}}}%%`;

// rowOdd/rowEven: sem isto o mermaid clareia o mainBkg para as linhas de atributo
// do erDiagram e o texto claro do tema some no fundo quase branco.
const erTheme = flowchartTheme.replace(
  `'clusterBorder':'#3A6663'`,
  `'clusterBorder':'#3A6663','rowOdd':'#173F3D','rowEven':'#0F2E2C'`,
);

export const myriasContextFlow = `${flowchartTheme}
flowchart LR
    OP(["Operador da HRB"])
    XLS["Planilha CSV · xlsx<br/>só a célula que mudou vira escrita"]

    subgraph MY["Myrias"]
        direction TB
        UI["Painel Vue 3"]
        API["Backend Spring Boot<br/>host de 1 vCPU · 2 GB"]
        CAT[("Espelho do catálogo<br/>PostgreSQL")]
        Q[("Fila de tarefas<br/>Redis")]
    end

    ML(["Mercado Livre<br/>API · webhooks · até 4 contas"])
    OR(["OpenRouter<br/>modelo de linguagem"])

    OP --> UI
    OP -->|edição em massa| XLS
    XLS --> API
    UI --> API
    API --> CAT
    API --> Q
    API -->|"varredura 00:30 · escrita auditada"| ML
    ML -->|"~1.300 notificações por hora"| Q
    Q -->|"dedupe por anúncio"| API
    API -->|"chat com tools · escrita só após confirmação"| OR`;

export const myriasCatalogFlow = `${flowchartTheme}
flowchart TD
    CRON["Varredura das 00:30<br/>a única do dia"]
    ML(["API do Mercado Livre"])
    EDIT["Edição pelo painel<br/>a resposta do PUT já traz o anúncio"]
    WH["POST /api/webhooks<br/>preço · item · preço por quantidade"]
    Q[("Fila Redis<br/>dedupe por anúncio, não por evento")]
    CAT[("Espelho do catálogo<br/>uma linha por anúncio<br/>custo · estoque real · SKU")]
    INV["Inventário"]
    QUA["Qualidade"]
    CON["Concorrência"]
    PRO["Promoções"]
    VEN["Vendas e margem"]
    AUT["Automações<br/>recusam varredura com mais de 26h"]

    CRON --> ML
    ML -->|catálogo inteiro| CAT
    EDIT -->|grava o que voltou · zero chamada extra| CAT
    WH --> Q
    Q -->|atualiza a linha| CAT
    CAT --> INV
    CAT --> QUA
    CAT --> CON
    CAT --> PRO
    CAT --> VEN
    CAT --> AUT`;

export const myriasDataModel = `${erTheme}
erDiagram
    APP_USERS ||--o{ APP_SESSIONS : abre
    APP_USERS ||--o{ OPERATION_LOG : assina
    APP_USERS ||--o{ AI_PENDING_ACTIONS : confirma
    MELI_ACCOUNTS ||--|| MELI_TOKENS : guarda
    MELI_ACCOUNTS ||--o{ PKCE_STATES : consome
    MELI_ACCOUNTS ||--o{ CATALOG_ITEMS : espelha
    CATALOG_ITEMS ||--o| ITEM_COSTS : custa
    CATALOG_ITEMS ||--o{ OPERATION_LOG : registra
    AI_PENDING_ACTIONS ||--o| OPERATION_LOG : vira

    APP_USERS {
        json permission_keys "chaves, algumas exclusivas de dev"
        string password_hash "BCrypt"
    }
    APP_SESSIONS {
        timestamp expires_at "teto de 8h"
        int key_version "rotação sem derrubar sessão"
    }
    MELI_TOKENS {
        bytea access_token "cifrado em repouso"
        bytea refresh_token "cifrado em repouso"
    }
    CATALOG_ITEMS {
        timestamp synced_at "é por aqui que se sabe se o dado é de ontem"
        numeric price
        int available_quantity
    }
    ITEM_COSTS {
        numeric cost "esparso: ausente nunca vira zero"
    }
    OPERATION_LOG {
        string request_id "o mesmo X-Request-ID do clique"
        json payload "sanitizado antes de gravar"
        string append_only "update e delete bloqueados por trigger"
    }
    AI_PENDING_ACTIONS {
        timestamp expires_at "10 minutos"
        string required_permission "revalidada no confirm"
    }`;

export const myriasAuthGates = `${sequenceTheme}
sequenceDiagram
    autonumber
    participant FE as Painel
    participant F as AppAuthFilter
    participant DB as Banco
    participant C as Controller
    participant PS as PanelSecurity
    participant ML as Mercado Livre

    FE->>F: PUT em /api/items · cookie app_session · X-CSRF-Token
    F->>F: confere HMAC, versão da chave e teto de 8h
    F->>DB: a sessão ainda existe?

    alt sessão revogada ou expirada
        DB-->>F: sem registro
        F-->>FE: 401 não autenticado
    else sessão viva
        DB-->>F: appUserId e CurrentActor, a conta ativa
        F->>C: segue com as duas identidades
        C->>C: X-CSRF-Token bate com o emitido?
        C->>PS: require bulk_edit

        alt o corpo pede encerrar o anúncio
            C->>PS: require delete_listing também
        end

        PS->>DB: chaves de permissão do usuário

        alt chave exclusiva de desenvolvedor e o usuário não é dev
            PS-->>FE: 403 sem permissão
        else autorizado
            C->>ML: escreve na conta ativa, nunca numa conta por parâmetro
            ML-->>C: anúncio já atualizado
            C->>DB: grava o espelho e o operation_log com o X-Request-ID
            C-->>FE: 200
        end
    end

    Note over F,ML: a IA passa pelos mesmos portões: escrita vira pendência,<br/>e no confirm o require roda de novo`;

export const myriasPackageMap = `${flowchartTheme}
flowchart LR
    auth["auth<br/>sessão · usuários · permissões"]
    meli["meli<br/>OAuth · items · bulk · clone<br/>perguntas · mensagens · promoções · webhooks"]
    ai["ai<br/>agente · tools · auditoria · memória"]
    perf["perf<br/>performance sobre snapshots"]
    quality["quality<br/>auditoria de qualidade"]
    competition["competition<br/>análise de concorrência"]
    dashboard["dashboard<br/>consolidado"]
    ops["ops<br/>OperationLog · CurrentActor"]
    config["config<br/>CORS · conversores JPA · seeder de dev"]

    auth --> meli
    ai --> meli
    perf --> meli
    quality --> meli
    competition --> meli
    dashboard --> perf
    dashboard --> quality
    meli --> ops
    ai --> ops
    config -.-> auth
    config -.-> meli`;

export const myriasLayerFlow = `${flowchartTheme}
flowchart TD
    FE["Frontend Vue 3 + Vite<br/>proxy /api para :8000"]
    F["AppAuthFilter<br/>OncePerRequestFilter"]
    C["@RestController<br/>valida entrada e chama PanelSecurity.require"]
    S["@Service<br/>regra de negócio · classe concreta, sem interface"]
    R["Repository<br/>Spring Data JPA"]
    MC["MeliClient<br/>token válido · backoff · rate limit"]
    OC["OpenRouterClient<br/>chat com tools · catálogo de modelos"]
    DB[("PostgreSQL em prod · H2 em dev<br/>schema por Flyway · Hibernate só valida")]
    ML(["api.mercadolibre.com"])
    OR(["openrouter.ai"])

    FE -->|cookie app_session| F
    F -->|appUserId + CurrentActor| C
    C --> S
    S --> R
    S --> MC
    S --> OC
    R --> DB
    MC --> ML
    OC --> OR`;

export const myriasOauthFlow = `${sequenceTheme}
sequenceDiagram
    autonumber
    participant OP as Operador
    participant BE as Backend · meli/auth
    participant DB as Banco
    participant ML as API do Mercado Livre

    OP->>BE: GET /api/auth/login
    BE->>BE: gera code_verifier e code_challenge S256
    BE->>DB: grava code_verifier em pkce_states, indexado por state
    Note over DB: o verifier vive no banco, não em memória.<br/>O handshake sobrevive a restart do container
    BE-->>OP: 302 para a autorização do ML
    OP->>ML: autoriza a aplicação
    ML-->>BE: GET /api/auth/callback com code e state

    BE->>DB: busca o code_verifier pelo state
    alt state inexistente ou já consumido
        BE->>DB: auth_events success=false
        BE-->>OP: 400 fluxo inválido
    else state válido
        BE->>DB: consome e apaga a linha, uso único
        BE->>ML: POST /oauth/token com code e code_verifier
        ML-->>BE: access_token, refresh_token, expires_in
        alt já existem 4 contas conectadas
            BE-->>OP: 409 limite de contas atingido
        else há vaga
            BE->>DB: grava meli_tokens com expires_at e is_active
            BE->>DB: auth_events success=true
            BE-->>OP: conta conectada
        end
    end

    Note over BE,ML: a partir daqui o MeliClient renova o token<br/>proativamente, 5 min antes de expirar`;
