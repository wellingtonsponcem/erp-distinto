# Agent — ERP Distinto

> Histórico vivo para qualquer IDE/agent que abrir o projeto. Mantenha este arquivo atualizado a cada mudança de arquitetura (não criar outro MD).

## Projeto
ERP Distinto — Next.js 15 + MySQL (Hostinger) + PHP legado (p.php / api/propostas). Módulo de Propostas com visualizador público `/p/[slug]` em `scroll-snap` + moldura `proposal-frame`.

## Stack
- Next.js 15.5 / React / Tailwind / `assets/css/propostas.css` + `propostas-mobile.css`
- MySQL (`srv952.hstgr.io`, DB `u306254544_distinto`) via `src/lib/db.ts`
- Templates: `includes/propostas/template-*.php` (PHP) e `src/lib/propostas/templates/*.ts` (TS)
- Auth: `src/lib/helpers.ts` (`generateId`, `requireAuth`)

## Tipos de Proposta
`casamento` | `marketing` | `filmmaker` | `15anos` | **`site` (novo, 2026-09)**
- `site`: até 5 páginas, pagamento parametrizável (`site_pagamento_parcelas[]`), sem manutenção, 10 dias validade, 12 dias úteis. Seed em `proposta/sites/proposta-site-flavia-2200.md`.

## Estrutura relevante
```
proposta/sites/                  # seeds site (ex: proposta-site-flavia-2200.md)
includes/propostas/template-site.php
src/lib/propostas/templates/site.ts   # theme-marketing (6 etapas IMERSÃO→GESTÃO)
src/pages/p/[slug].tsx                # HUD + proposal-wrapper + CSS (paridade p.php)
src/lib/propostas/wizard-nova.ts      # card Site (globe) + editor parcelas parametrizável
src/pages/api/propostas/gerar.ts      # normaliza FormData site_pagamento_parcelas[0][valor]
src/pages/api/propostas/fechamento.ts # branch isSite (50% entrada, parcelas = site array)
opencode.json                         # MCP stitch (secure, {env:STITCH_API_KEY})
.env                                  # STITCH_API_KEY (nova), GOOGLE_STITCH_API_KEY
```

## MCP
- `opencode.json: $schema https://opencode.ai/config.json` → `mcp.stitch` `https://stitch.googleapis.com/mcp` `enabled:true` `headers.X-Goog-Api-Key={env:STITCH_API_KEY}`
- `STITCH_API_KEY=<valor só no .env>` em `.env` (gitignored). Validado: `opencode mcp list` → `● stitch connected`.
- Reiniciar TUI após editar: `Ctrl+C` → `opencode`

## Regras
- Manter `agent.md` atualizado a cada feature/fix (regra `.agents/rules/solucoes.md:5`).
- Templates site devem espelhar `template-marketing` (6 pills, cápsulas semana, investimento validado) — não criar CSS isolado.
- Propostas validam `validadeISO < hojeStr` via `normalizarValidade` (aceita Date/ISO/GMT).
- Não commitar segredos: usar `{env:...}` em `opencode.json`.

## Histórico 2026-09
- 2026-09-21: Criado tipo `site`, templates marketing-like, pagamento parametrizável 2×1100, proposta `proposta-site-flavia-2200` (`vwnl8dskmuc1925v`) para Flávia Personal Chef.
- 2026-09-22: Fix HUD/CSS em `p/[slug].tsx` (propostas esmagadas), validade `GMT→01/10/2026`, parcelas humanizadas. Adicionado MCP stitch seguro.

## Comandos úteis
```
npm run build
opencode mcp list
node -e "require('mysql2/promise')"
```
