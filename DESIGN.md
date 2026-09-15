---
name: Tétradrachma Digital
description: Engenharia contemporânea cunhada como relevo, catálogo e sistema helênico.
colors:
  aegean-abyss: "#071316"
  aegean-deep: "#0B262B"
  aegean-raised: "#102E32"
  limestone: "#E8E1D2"
  limestone-light: "#F4F0E7"
  limestone-muted: "#DDD5C5"
  carbon-ink: "#151B1B"
  quarry: "#8C8A82"
  bronze: "#B8783F"
  bronze-dark: "#8B572E"
  bronze-light: "#D2A062"
  verdigris: "#5AA395"
  telemetry: "#7AB4BC"
  saffron: "#E0A536"
typography:
  display:
    fontFamily: "Unbounded, Arial Black, sans-serif"
    fontSize: "clamp(3.1rem, 8vw, 6rem)"
    fontWeight: 500
    lineHeight: 0.88
    letterSpacing: "-0.035em"
  display-compact:
    fontFamily: "Unbounded, Arial Black, sans-serif"
    fontSize: "clamp(2.75rem, 14vw, 4.5rem)"
    fontWeight: 500
    lineHeight: 0.9
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Unbounded, Arial Black, sans-serif"
    fontSize: "clamp(2.5rem, 5.4vw, 5.5rem)"
    fontWeight: 500
    lineHeight: 0.94
    letterSpacing: "-0.03em"
  headline-compact:
    fontFamily: "Unbounded, Arial Black, sans-serif"
    fontSize: "clamp(2.25rem, 11vw, 3.8rem)"
    fontWeight: 500
    lineHeight: 0.94
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Unbounded, Arial Black, sans-serif"
    fontSize: "clamp(1.2rem, 2.2vw, 1.8rem)"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.02em"
  body-large:
    fontFamily: "Archivo, Segoe UI, sans-serif"
    fontSize: "clamp(1.15rem, 1.8vw, 1.45rem)"
    fontWeight: 500
    lineHeight: 1.28
  body:
    fontFamily: "Archivo, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.58
  body-small:
    fontFamily: "Archivo, Segoe UI, sans-serif"
    fontSize: "0.86rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Azeret Mono, ui-monospace, monospace"
    fontSize: "0.62rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.08em"
  caption:
    fontFamily: "Azeret Mono, ui-monospace, monospace"
    fontSize: "0.55rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.06em"
  micro:
    fontFamily: "Azeret Mono, ui-monospace, monospace"
    fontSize: "0.52rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.05em"
  diagram:
    fontFamily: "Azeret Mono, ui-monospace, monospace"
    fontSize: "1.6px"
    fontWeight: 500
    lineHeight: 1
rounded:
  cut: "0px"
  instrument: "3px"
  seal: "50%"
spacing:
  detail: "0.625rem"
  content: "1.5rem"
  section: "clamp(6rem, 12vw, 12rem)"
  gutter: "clamp(1rem, 4vw, 4.75rem)"
components:
  seal-button:
    backgroundColor: "{colors.bronze}"
    textColor: "{colors.aegean-abyss}"
    typography: "{typography.label}"
    rounded: "{rounded.seal}"
    size: "4.25rem"
  mint-link:
    backgroundColor: "transparent"
    textColor: "{colors.limestone}"
    typography: "{typography.label}"
    rounded: "{rounded.cut}"
    padding: "0.8rem 0"
  project-stratum:
    backgroundColor: "{colors.aegean-deep}"
    textColor: "{colors.limestone}"
    typography: "{typography.body}"
    rounded: "{rounded.cut}"
    padding: "clamp(2rem, 5vw, 5rem)"
  technical-chip:
    backgroundColor: "transparent"
    textColor: "{colors.carbon-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.instrument}"
    padding: "0.5rem 0.7rem"
---

# Design System: Tétradrachma Digital

## Overview

**Creative North Star: "A Casa da Moeda Helênica"**

O sistema trata cada projeto como uma peça cunhada em três leituras: de longe, uma forma inesquecível; à distância de uso, um produto compreensível; de perto, decisões e arquitetura. Relevo de bronze, pedra calcária, pátina e marcações de catálogo criam uma Grécia contemporânea, sem transformar a interface em fantasia histórica.

O vídeo é o relevo vivo da abertura. Tipografia geométrica monumental, faixas horizontais e órbitas de medição substituem hero genérico, cartões e pergaminho cenográfico. A ornamentação nunca compete com evidência técnica.

**Key Characteristics:**

- Escuro e mineral no prólogo; claro e preciso nas áreas de leitura.
- Uma única massa tipográfica domina cada composição.
- Círculos pertencem a selos, mostradores e recortes de moeda, não a containers.
- O filme de abertura acontece uma única vez e preserva o último frame como relevo concluído.
- Um único pilar jônico atravessa os estratos de projeto como datum espacial: à frente do Egeu e atrás da placa calcária.

## Colors

A estratégia é comprometida: o azul-negro do Egeu ocupa o palco, a calcária cria pausas documentais e bronze/verdete aparecem apenas como material funcional.

### Primary

- **Abismo Egeu:** fundo principal, contraste do vídeo e páginas de projeto.
- **Calcária Solar:** superfícies documentais, títulos e diagramas de alta legibilidade.

### Secondary

- **Bronze Cunhado:** ações, indicadores de progresso e filetes estruturais.
- **Bronze Iluminado:** foco, hover e pequenos pontos de luz.

### Tertiary

- **Verdete de Arquivo:** arquitetura, estados ativos e rotas de sistema.
- **Açafrão de Sinal:** uso raro em alertas de conteúdo demonstrativo e coordenadas-chave.

### Neutral

- **Tinta Carbonizada:** texto sobre calcária.
- **Cinza Pedreira:** metadados e texto secundário.

**The Field Rule.** Cor ocupa campos inteiros ou cumpre uma função de sistema; nunca aparece como confete decorativo.

## Typography

**Display Font:** Unbounded, com Arial Black e sans-serif como fallback.  
**Body Font:** Archivo, com Segoe UI e sans-serif como fallback.  
**Label/Mono Font:** Azeret Mono, com ui-monospace como fallback.

**Character:** Unbounded dá massa de inscrição sem imitar um alfabeto antigo; Archivo mantém leitura rápida e Azeret Mono marca dados reais, rotas e coordenadas.

### Hierarchy

- **Display:** nome, projeto e chamada principal; máximo de 6rem, peso 500.
- **Headline:** títulos de seção e case study; compactos e balanceados, com versão própria para telas estreitas.
- **Title:** princípios, decisões e subtítulos de leitura intermediária.
- **Body:** narrativa e documentação; largura de 65–72 caracteres e duas densidades auxiliares.
- **Label:** rotas, tecnologias, métodos e estados; caption e micro são reservados a coordenadas e SVGs.

**The One Mass Rule.** Cada viewport tem uma única massa tipográfica dominante; tudo o mais funciona como legenda ou evidência.

## Layout

A home usa um eixo processional: prólogo fixo, faixas de projeto em profundidade, método em placa calcária, trajetória em anéis e contato como fechamento monumental. Projetos aparecem como estratos de largura total, não como uma grade de cartões.

No desktop, cada projeto alterna três distâncias dentro da mesma faixa. Um pilar jônico contínuo ocupa a borda direita dos três estratos: aparece sobre os campos verdes, desaparece atrás do segundo campo calcário e retorna no terceiro. Abaixo de 1100px, a composição se empilha preservando número, nome, preview e ação. Abaixo de 680px, o pilar vira apenas uma lâmina lateral, órbitas viram arcos laterais, a navegação ganha um painel de tela cheia e diagramas densos usam rolagem localizada. Nenhuma ação depende de hover.

## Elevation & Depth

Profundidade vem de recorte, oclusão, luz rasante e contato entre materiais. Sombras são raras: vídeo e pedra podem projetar uma sombra curta sobre o campo; linhas técnicas permanecem planas.

### Shadow Vocabulary

- **Relevo do cunho:** sombra deslocada e macia usada apenas sob mídia recortada.
- **Placa calcária:** sombra larga de contato quando a superfície clara cruza o palco escuro.

**The Relief Rule.** Uma sombra deve explicar relevo ou contato físico; nunca serve como decoração de container.

## Shapes

Containers têm cantos retos ou pequenos cortes mecânicos. Selos e mostradores usam círculos perfeitos. Recortes diagonais vêm da cunhagem e do eixo processional. Pills aparecem somente em pequenos estados ou filtros; texto técnico comum usa linhas e retângulos.

## Components

### Seal Button

- **Shape:** círculo de bronze com seta incisa e alvo mínimo de 68px.
- **State:** hover gira o anel externo e desloca a seta; foco recebe contorno calcário.

### Mint Links

- **Shape:** ação textual sem cápsula, sublinhada por uma régua que se expande.
- **State:** bronze para hover e calcária/verdete para foco conforme o campo.

### Project Strata

- **Structure:** número monumental, categoria, nome, resumo, preview técnico e arquitetura formam uma única faixa.
- **Behavior:** a mídia abre por máscara; o número cruza o plano; a ação continua disponível sem JavaScript.

### Technical Chips

- **Use:** stack, capacidades e métodos reais.
- **Shape:** retângulo mecânico pequeno, sem sombra e sem preencher a superfície.

### Mint Navigation

- **Desktop:** marca circular à esquerda, índice central e disponibilidade à direita.
- **Mobile:** botão de menu com estado explícito; painel inteiro com links grandes e retorno visível.

## Do's and Don'ts

### Do:

- **Do** usar o vídeo real como relevo vivo e manter o pôster idêntico como fallback.
- **Do** deixar projeto, arquitetura e decisão dominarem a experiência depois do prólogo.
- **Do** usar SVG e CSS para órbitas, selos e diagramas, preservando nitidez.
- **Do** oferecer experiência completa em `prefers-reduced-motion`.

### Don't:

- **Don't** usar cartões SaaS arredondados, glassmorphism ou brilho neon.
- **Don't** multiplicar o pilar em colunatas cenográficas, transformar o tema em fantasia ou usar fonte pseudo-antiga.
- **Don't** inventar clientes, métricas, resultados ou provas inexistentes.
- **Don't** rasterizar texto, controles ou diagramas centrais.
