# Myrias — página completa do portfólio

Conteúdo pronto para a capa e para as quatro seções da planta técnica.
Arquitetura documentada em outubro de 2026.

---

# CAPA

**Kicker**
`PLATAFORMA DE OPERAÇÕES DE MARKETPLACE`

**Nome**
`Myrias`

**Subtítulo**
> Gestão de anúncios do Mercado Livre em múltiplas contas, com catálogo espelhado
> localmente, automações que escrevem sozinhas e um assistente que não escreve sem
> confirmação humana.

**Linha de contexto**
> Sistema interno em produção na HRB Imports. Substituiu um SaaS pago de terceiros
> e virou o padrão de operação da empresa.

### STACK
`Java 21` · `Spring Boot 3` · `PostgreSQL` · `Redis` · `Flyway` · `Vue 3` · `Vite` · `Tailwind` · `Docker` · `GitHub Actions` · `Python`

### CAPACIDADES
`Multi-conta` · `Catálogo espelhado` · `Automações` · `Fila distribuída` · `Rate limiting com prioridade` · `Auditoria append-only` · `Criptografia em repouso` · `Assistente com confirmação humana` · `Webhooks` · `Import/export por planilha`

### ARQUITETURA (parágrafo da capa)
> Backend organizado por domínio, com o catálogo do Mercado Livre espelhado numa
> tabela local que serve todas as telas. Uma varredura noturna alimenta o espelho;
> o retorno das edições e os webhooks mantêm ele fresco. Duas identidades
> independentes atravessam quase toda rota: quem opera o painel e em nome de qual
> conta a ação acontece. Roda num host de 1 vCPU, e isso não é detalhe de
> infraestrutura — é a restrição que moldou quase toda decisão de performance.

**Botão:** `Explorar planta técnica`
**Nota abaixo do botão:** Código em repositório fechado por ser sistema interno em produção.

---
---

# SEÇÃO 1 — VISÃO GERAL

> Diagrama: **contexto do sistema**.

### O problema

A HRB opera anúncios de autopeças no Mercado Livre em até quatro contas. Manter
esse catálogo alinhado era trabalho manual, anúncio por anúncio. Existia um SaaS
pago para copiar anúncios, mas ele resolvia só a criação, não a manutenção
contínua nem a operação em lote.

### A solução

Um painel próprio que fala direto com a API do Mercado Livre: conecta várias
contas por OAuth, espelha o catálogo inteiro numa base local, aplica alterações em
lote, audita cada escrita, automatiza promoções e preços por quantidade, e expõe
um assistente de IA que analisa a conta e propõe mudanças — sempre com confirmação
humana antes de qualquer escrita.

### Resultados

- **~40 mil anúncios** sob gestão.
- **~10 mil anúncios espelhados entre contas em 3 dias** — o mesmo trabalho levava
  meses no processo manual.
- **SaaS de terceiros cancelado** depois que a ferramenta interna virou padrão.
- **De quatro varreduras noturnas para uma.** O pico de memória de inventário,
  qualidade e concorrência varrendo em paralelo derrubava o backend; hoje uma
  varredura alimenta todas as telas.

### Estado atual

Em produção, com usuários internos, recebendo features novas. Arquitetura
documentada em outubro de 2026.

---
---

# SEÇÃO 2 — ARQUITETURA

> Diagramas: **mapa de pacotes**, **fluxo do catálogo local** e **modelo de dados**.

### Organização por domínio

O pacote raiz se divide por área de negócio, não por camada técnica: `auth`,
`meli`, `catalog`, `perf`, `sales`, `partresearch`, `descriptions`, `ai`,
`quality`, `competition`, `dashboard`, `ops`, `scripts` e `config`. Cada um traz
controller, service e entidades juntos. O fluxo padrão tem três camadas, sem
interface para implementação única.

### O catálogo local é a espinha

A mudança estrutural mais recente, e a que mais mudou o sistema. Antes, cada tela
perguntava ao Mercado Livre — inventário, qualidade e concorrência faziam cada uma
a sua varredura completa por noite, e o pico das três derrubava o backend. A tela
de promoções por anúncio, que exige um GET por anúncio porque a API não tem
multiget, ficava presa a 100 anúncios por página, com total e filtros valendo só
sobre a janela varrida.

Hoje existe um espelho local do catálogo. A varredura das 00:30 é a única, e as
demais telas leem dela. O que isso muda:

- **Filtro virou `where`.** Cada consumidor recebe só as linhas que pediu, em vez
  de desserializar o corpo inteiro de um snapshot.
- **Custo, estoque real e SKU ganharam onde morar.** A tela de vendas monta margem
  sem uma chamada por anúncio.
- **Frescor sem custo de API.** O `PUT` de edição já devolve o anúncio atualizado,
  então a linha é gravada com o que voltou. Zero chamadas extras. O que muda fora
  do painel chega por webhook.

O custo está escrito: os dados são de ontem enquanto o webhook não chega, e a
tabela local vira uma segunda fonte de verdade que pode divergir do marketplace.

### As duas identidades, e uma terceira

| | Quem usa o painel | Qual conta operar |
|---|---|---|
| Sujeito | operador do painel | conta conectada do Mercado Livre |
| Credencial | cookie de sessão assinado por HMAC | token OAuth |
| Erro típico | 401 não autenticado / 403 sem permissão | 401 faça login via OAuth |

*Quem é você* e *em nome de qual loja você age* são perguntas separadas. Trocar a
conta ativa não mexe na sessão; sair do painel não desconecta as contas.

Acima disso existe um terceiro portão: uma chave de permissão pode ser marcada
como exclusiva de desenvolvedor, e nem administrador passa. É assim que uma tela em
teste fica no ar em produção sem aparecer para a operação.

A sessão é revogável: o cookie assinado exige um registro vivo no banco, com teto
de oito horas e rotação de chave sem derrubar quem está logado.

### Integração com o Mercado Livre

Um único cliente concentra quatro responsabilidades: garantir token válido por
chamada com renovação proativa, recuperar de 401 forçando refresh uma vez por
requisição, aplicar backoff exponencial com jitter em 429/423/409 e 5xx, e
respeitar o limite de requisições. O limitador tem prioridade: o clique do
operador passa na frente da varredura noturna.

Os tokens ficam cifrados em repouso, com rotação que relê e recifra no startup.

### Webhooks, ligados por medição

O marketplace manda cerca de 1.300 notificações por hora. Em vez de consumir tudo,
os tópicos foram religados por etapas, com medição a cada uma: preços primeiro,
depois o tópico de item, depois a ação de preço por quantidade. Dois tópicos
ficaram de fora por decisão medida — um porque não entregou um evento sequer em
quatro janelas de observação, outro porque é a tarefa mais pesada de uma fila que
já tem backlog.

O dedupe é por anúncio, não por evento: repetição do mesmo anúncio colapsa numa
tarefa só.

### Automações

Duas escrevem no Mercado Livre sozinhas — promoções por categoria e preços por
quantidade — e seguem o mesmo desenho: a regra é uma função pura, sem I/O, que
recebe dados já gravados e devolve a decisão. Quem escreve é o service que já trata
cache, evento e auditoria.

Como a decisão inteira são alguns `select`s, a simulação responde no tempo de uma
requisição: o operador vê o que aconteceria antes de ligar, usando exatamente a
mesma função da execução real. A automação se recusa a agir sobre varredura com
mais de 26 horas.

### O host é o teto

O backend roda num host de **1 vCPU e 2 GB**. Isso moldou boot preguiçoso, GC
serial, concorrência de fila em 3 e virtual threads ligadas. O trabalho é espera de
HTTP, não CPU — o backend fica entre 0,3% e 5,8% de uso.

---
---

# SEÇÃO 3 — CONTRATO DA API

> Diagrama: **sequência dos portões de autorização**.

### Convenções

Base `/api`, JSON nas duas direções, datas em ISO-8601, dinheiro como número.

Campos em **`snake_case`**. Começou assim porque o frontend original consumia esse
formato, e continua assim por consistência — as telas novas, que nasceram aqui e
não têm equivalente no backend anterior, seguem o mesmo padrão. No Java os campos
são `camelCase` e o mapeamento é explícito por anotação: renomear um campo interno
não pode mudar o contrato.

**Não há versionamento de URL.** Cliente e servidor sobem juntos; o contrato é
estável por disciplina, não por `/v1`.

### Autenticação e CSRF

Duas credenciais independentes. A sessão do painel é um cookie `HttpOnly`,
`SameSite=Lax`, `Secure`, com teto de oito horas. A conta do Mercado Livre é
implícita: o endpoint opera sobre a conta ativa, e nenhuma rota recebe conta por
parâmetro — as exceções são as rotas multiconta, que agem sobre todas.

Todo método que altera exige `X-CSRF-Token`. O servidor devolve o token vigente no
header de toda resposta autenticada, e o cliente reenvia o último que recebeu.

### Erros

Formato único: `{"detail": "..."}`. Os códigos seguem o esperado, com duas
particularidades.

**`502` significa falha ao falar com o Mercado Livre ou com o provedor de LLM** —
não é erro do cliente, é integração externa caindo, e a tela precisa distinguir
uma coisa da outra.

**`429` é o único com corpo estendido**, porque o cliente precisa decidir se
repete:

```json
{
  "detail": "Você passou de 15 operações pesadas por minuto — este limite é do app, não do Mercado Livre, e o pedido nem chegou a ser enviado. Aguarde 60s e refaça só o que faltou.",
  "code": "app_rate_limit",
  "retry_after_seconds": 60
}
```

A mensagem diz explicitamente que o limite é do app. O rate limit do marketplace é
tratado dentro do backend com backoff e **nunca vaza como 429 para a tela** — se
vazasse, o operador não teria como saber se o problema é dele ou do Mercado Livre.

### Rastreio

`X-Request-ID` é aceito do cliente ou gerado pelo backend, e sempre volta na
resposta. O mesmo id entra nos logs e na coluna correspondente da trilha de
auditoria: é por ele que se liga um clique numa tela a uma escrita registrada no
marketplace.

### Operações longas

Tudo que varre muitos anúncios segue o mesmo par: um `POST` que devolve
`{job_id}` e um `GET` de progresso que a tela consulta em polling. O job pertence a
quem o criou e vive no Redis com lease, então um deploy no meio do lote não o
perde. O padrão se repete em edição em massa, clone e busca de kits.

### Autorização por rota

| Método | Rota | Permissão |
|---|---|---|
| POST | `/api/app/login` | aberta |
| GET | `/api/app/session` | aberta |
| GET | `/api/auth/login` | `manage_accounts` |
| POST | `/api/auth/accounts/switch` | `manage_accounts` |
| GET | `/api/items` | `performance` |
| PUT | `/api/items/{itemId}` | `bulk_edit`, ou `delete_listing` se o status for encerrar |
| POST | `/api/items/upload-picture` | `upload_images` |
| GET | `/api/bulk/skus/all` | só sessão |
| POST | `/api/bulk/update-multi/jobs` | `bulk_edit` |
| GET | `/api/bulk/jobs/{jobId}` | `bulk_edit` |
| GET | `/api/catalog/spreadsheet` | só sessão; colunas de edição exigem `bulk_edit` |
| POST | `/api/promotions/automation/preview` | `promocoes` |
| POST | `/api/promotions/items` | `manage_promotions` |
| GET | `/api/sales` | `vendas`, chave isolada para desenvolvedor |
| POST | `/api/ai/chat` | `assistente` |
| POST | `/api/ai/actions/{id}/confirm` | `assistente` **mais a permissão real da ação** |
| POST | `/api/webhooks` | aberta |

*Recorte representativo. O contrato completo tem cerca de 120 rotas e vive no
repositório.*

Três linhas dessa tabela carregam o desenho inteiro:

**A permissão pode depender do conteúdo, não só da rota.** Editar um anúncio exige
`bulk_edit`; encerrar exige `delete_listing`. É o mesmo `PUT`.

**A permissão pode recortar a resposta.** Quem não tem `bulk_edit` exporta a
planilha só com as colunas internas, e a importação grava só essas. Preço, estoque
e status continuam sendo edição em massa.

**A confirmação da IA revalida.** O chat nunca escreve: uma ferramenta de escrita
vira pendência com prazo, e no confirm a permissão real da ação é checada de novo.
Se o usuário perdeu a permissão nesse meio tempo, a ação morre com `403`.

### Webhooks

Autenticam pelo corpo, não por cookie, e **sempre respondem `200`** — para o
marketplace, recebido é recebido, e devolver erro só faria ele reenviar. O que vira
trabalho de verdade é decidido por configuração, e o dedupe é por anúncio, não por
id de evento.

---
---

# SEÇÃO 4 — DECISÕES

Formato: **decisão · por quê · custo · ganho.**

### As cinco principais

**O catálogo do marketplace espelhado numa tabela local**
Cada tela perguntava ao Mercado Livre, e três varreduras noturnas concorrentes
estouravam a memória do host. A varredura das 00:30 passou a ser a única fonte, e
as demais telas leem dela em SQL.
**Custo:** o dado é de ontem até o webhook chegar, e a tabela vira uma segunda
fonte de verdade que pode divergir do marketplace.
**Ganho:** um scan em vez de quatro, filtros e totais reais sobre o catálogo
inteiro, e telas que respondem em SQL em vez de em chamadas de API.

**Sessão assinada com revogação no servidor**
O cookie carrega usuário, sessão, emissão e versão de chave sob HMAC, mas a
validação também exige uma linha viva no banco. Assinatura impede adulteração e
não impede que um cookie roubado valha até expirar.
**Custo:** uma consulta curta por requisição — o preço de não ser stateless.
**Ganho:** logout real, revogação imediata em troca de senha, e rotação de chave
sem derrubar sessões ativas.

**Autenticação própria em vez de Spring Security**
O modelo de acesso é uma lista de chaves de permissão por usuário, e o starter
traria configuração para resolver um problema já resolvido. Entra só o BCrypt.
**Custo:** a verificação é explícita em cada controller, o que exige disciplina ao
criar rotas.
**Ganho:** o fluxo de autorização inteiro cabe em dois arquivos auditáveis, sem
indireção entre a rota e a regra.

**Escrita da IA sempre confirmada por humano**
O modelo só enxerga as ferramentas que a permissão do usuário libera. Leitura
executa no loop; escrita vira pendência com prazo, e a permissão é revalidada no
clique de confirmar.
**Custo:** um clique a mais, e a pendência expira em dez minutos.
**Ganho:** um modelo alucinando não altera preço de anúncio — e a mesma regra vale
para escrita em banco e para chamada de API.

**Regra de automação como função pura**
As regras que decidem promoção e preço por quantidade não fazem I/O: recebem os
dados gravados e devolvem a decisão. Quem escreve é o service que já existe.
**Custo:** a regra só enxerga o que a varredura gravou — decisão boa sobre dado
velho continua sendo decisão ruim.
**Ganho:** a simulação da tela usa a mesma função da execução real, então o preview
não mente, e não existe segunda cópia da regra para divergir.

### As demais, se sobrar espaço

**Auditoria append-only por trigger no banco** — update e delete bloqueados, só a
rotina de retenção passa; payloads sanitizados antes de gravar. **Custo:** corrigir
um registro só por linha nova. **Ganho:** a trilha não vira repositório de segredos
nem pode ser reescrita por quem tem acesso ao banco.

**Rate limiter com prioridade** — a versão anterior não tinha, e a previsão escrita
na época era que, se a auditoria noturna atrasasse o operador, prioridade seria o
próximo passo. Foi o que aconteceu. **Custo:** prioridade só existe no modo local,
e todo fan-out precisa capturar o contexto antes de disparar. **Ganho:** o clique do
operador não espera a varredura de milhares de anúncios.

**Custo esparso, nunca zero** — kit cujo componente não tem custo cadastrado fica
sem custo, não com custo zero. **Custo:** um componente sem cadastro tira o kit
inteiro das análises de margem. **Ganho:** a tela mostra um traço em vez de margem
inflada; número errado sobre dinheiro é pior que a ausência dele.

**Planilha como interface de edição em massa** — a operação já vivia no Excel, então
o catálogo exporta e reimporta em CSV ou xlsx, lido sem biblioteca externa, e só a
célula que mudou vira escrita. **Custo:** o import é síncrono, e volume grande vai
estourar o request antes de virar job. **Ganho:** zero dependência nova e nenhuma
escrita desnecessária no marketplace.

**Flyway em produção, Hibernate só valida** — **Custo:** toda mudança de entidade
exige migração antes do deploy, e já são 25. **Ganho:** schema muda apenas por
alteração revisável, com histórico e ordem.

### Limites conhecidos

**Uma réplica, na prática.** A fila é distribuída; o limitador não. Ligar o caminho
distribuído hoje custaria a prioridade que a operação sente.

**O host é o teto.** 1 vCPU e 2 GB moldam boot, GC e concorrência. Crescimento de
volume esbarra primeiro na máquina, não no código.

**Dado de ontem.** Catálogo à meia-noite e meia, promoções às 06:30. O webhook
cobre preço, título, estoque e status; o resto envelhece durante o dia.

**Verificação de permissão explícita por endpoint.** A escolha por autenticação
própria troca configuração por disciplina ao adicionar rotas.

**Multi-tenant ainda é ponte.** O identificador de organização circula na
auditoria; o isolamento de dados não existe.

**Scraping por padrão de texto sobre HTML de terceiros.** Mudança de layout quebra
em silêncio: o sintoma é resultado vazio, não exceção.

**Frontend sem teste automatizado.** A integração contínua roda verificação de
tipos e build; não há teste de componente nem de fluxo.
