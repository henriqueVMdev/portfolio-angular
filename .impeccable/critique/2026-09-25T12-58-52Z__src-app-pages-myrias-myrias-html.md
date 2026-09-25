---
target: projetos/myrias
total_score: 18
max_score: 32
na_heuristics: 5,10
p0_count: 0
p1_count: 4
timestamp: 2026-09-25T12-58-52Z
slug: src-app-pages-myrias-myrias-html
---
Method: dual-agent (A: design review · B: detector) · browser unavailable (Chrome extension disconnected); evidence from source + SSR HTML

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 2 | Sticky index has no active-section state on a very long page |
| 2 | Match System / Real World | 2 | Mint metaphor on navigation ("Fechar planta", "Descer à placa técnica"); dense jargon, no plain layer |
| 3 | User Control and Freedom | 3 | Fixed back link ok; no back-to-top, no contact exit |
| 4 | Consistency and Standards | 2 | Three numbering systems; 4→1 vs 3→1 scans; "O host é o teto" twice |
| 5 | Error Prevention | n/a | No input on this surface |
| 6 | Recognition Rather Than Recall | 2 | Endpoint table splits the Contrato ledger; cross-refs by memory |
| 7 | Flexibility and Efficiency | 2 | Serves deep readers; nothing for skimmers (no summary, no disclosure) |
| 8 | Aesthetic and Minimalist Design | 2 | Strong type, but 7 diagrams + 24 ledger entries + 21 chips, ideas repeated 2-3x |
| 9 | Error Recovery | 3 | Mermaid failure state exists, no text fallback |
| 10 | Help and Documentation | n/a | Case study is itself the documentation |
| **Total** | | **18/32** | **Acceptable (56%)** |

## Design Specificity Verdict
LLM: specific in the frame (PLANTA I, OBV strip, bronze seal, PRÓXIMA CUNHAGEM, limestone technical plate, cost/gain ledger, μυριάς etymology). Weakens in the middle: 7 identical mermaid cards with off-token theme (#173F3D/#C8A45C/#EDE6D6, system mono instead of Azeret) and a heavy drop shadow that breaks the Relief Rule; reads as generic mermaid-on-dark.
Detector: 3 design-system-color findings, all in hero-particles.ts:62 (home only, not this page). myrias.html, its components and styles.css clean for this surface. Browser overlay not available.

## Priority Issues
- [P1] Placeholder "Trabalhando nas previews" fills half the hero (interface-preview.ts:17, myrias.html:55; also basanos/omniseg). Fix: real sanitized screenshot, or results strip / context diagram in that slot, or drop the column. → /impeccable layout
- [P1] OG meta is site-generic on project pages and og:image is relative (/media/hero-1920-poster.jpg); LinkedIn card won't say Myrias and may show no image. Fix: absolute og:image URL + per-page og:title/description. → /impeccable harden
- [P1] Diagrams unreadable on phones: ≤680px canvas shrinks 54-68rem SVG to ~5px labels (styles.css:3800-3811); 3 of 7 diagrams have no long description. Fix: visible text version (<details> "Ler como texto") or horizontal scroll with cue at ~40rem; add descriptions. → /impeccable adapt
- [P1] Outcome buried and ending doesn't convert: results (~40 mil anúncios, SaaS cancelado) several screens down; page ends only with next project, no contact/résumé. Fix: results strip right after hero; primary "Falar sobre este projeto" + résumé at end, next project secondary. → /impeccable layout
- [P2] Redundancy and factual slips: scans 4→1 (portfolio.ts:79) vs "Três varreduras" (myrias.html:262); "Arquitetura documentada em outubro de 2026" (myrias.html:114, future date); catalog mirror told 4x; captions 0.55rem (~8.8px). Fix: one home per idea, reconcile numbers, collapse Decisões into <details>, raise mono floor to ~0.68rem. → /impeccable distill, /impeccable typeset

## Persona Red Flags
- Jordan (recruiter): first sees all-caps category + jargon + empty preview; no role/team statement (solo vs team); nav labels need translation; no contact at end.
- Casey (mobile, LinkedIn): hero = 80-word lead + 9px notice + 11 chips + full-screen placeholder; "Descer" hidden ≤680px; sticky index under fixed header eats ~8rem; diagrams micro-text; generic OG card.
- Sam (a11y): mono text 0.52-0.58rem throughout; next-project aria-label "Abrir a planta do projeto Basanos" doesn't contain visible "Examinar próxima planta" (WCAG 2.5.3); 7 extra tab stops on diagrams; 3 diagrams without long description.
- Tech lead: depth is real (auth gates, PKCE, append-only trigger, priority limiter); repetition reads as padding; 3-vs-4 inconsistency and future date hurt credibility; no substitute evidence for closed code.

## Minor Observations
- Missing punctuation in origin paragraph (myrias.html:192).
- <title> uses all-caps category string.
- "03 / MEDIÇÃO" eyebrow after the h3 (myrias.html:174-175), unlike other blocks.
- .chapter-mark font-size declared twice (styles.css:118-130).
- Endpoint table caption "vive no repositório" references an inaccessible repo.
- Index has no "Resultados" entry.

## Questions to Consider
- If a recruiter reads only the first viewport, what sentence should they repeat? Is it above the fold today?
- Case study or system documentation? Would 3 deeply argued decisions beat 24 ledger entries?
- Should the mint metaphor touch navigation copy, or only surfaces?
- Is an empty frame better than no frame?
