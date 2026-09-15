const flowchartTheme = `%%{init: {'theme':'base','themeVariables':{'fontFamily':'ui-monospace, SFMono-Regular, Menlo, monospace','fontSize':'14px','primaryColor':'#173F3D','primaryTextColor':'#EDE6D6','primaryBorderColor':'#C8A45C','secondaryColor':'#0F2E2C','tertiaryColor':'#1E4B48','mainBkg':'#173F3D','nodeBorder':'#C8A45C','lineColor':'#8FA8A6','textColor':'#EDE6D6','titleColor':'#C8A45C','edgeLabelBackground':'#0F2E2C','clusterBkg':'#0F2E2C','clusterBorder':'#3A6663'}}}%%`;

const sequenceTheme = `%%{init: {'theme':'base','themeVariables':{'fontFamily':'ui-monospace, SFMono-Regular, Menlo, monospace','fontSize':'14px','primaryColor':'#173F3D','primaryTextColor':'#EDE6D6','primaryBorderColor':'#C8A45C','lineColor':'#8FA8A6','textColor':'#EDE6D6','actorBkg':'#173F3D','actorBorder':'#C8A45C','actorTextColor':'#EDE6D6','actorLineColor':'#8FA8A6','signalColor':'#EDE6D6','signalTextColor':'#EDE6D6','labelBoxBkgColor':'#1E4B48','labelBoxBorderColor':'#C8A45C','labelTextColor':'#EDE6D6','loopTextColor':'#EDE6D6','noteBkgColor':'#C8A45C','noteTextColor':'#12302E','noteBorderColor':'#C8A45C','activationBkgColor':'#1E4B48','activationBorderColor':'#C8A45C','sequenceNumberColor':'#12302E'}}}%%`;

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
    S["@Service<br/>regra de negócio · classe concreta, sem interface · D3"]
    R["Repository<br/>Spring Data JPA"]
    MC["MeliClient<br/>token válido · backoff · rate limit"]
    OC["OpenRouterClient<br/>chat com tools · catálogo de modelos"]
    DB[("PostgreSQL em prod · H2 em dev<br/>ddl-auto, sem Flyway · D4")]
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
