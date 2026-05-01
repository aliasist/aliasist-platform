# Aliasist Platform

> Intelligence labs for the systems that shape the world — data centers, space, markets, and environmental events.

**Aliasist vNext** consolidates the core "sist" apps (DataSist, EcoSist, PulseSist, SpaceSist) into a single monorepo, shipping one unified SPA backed by one unified Cloudflare Worker.

**Product thesis:** Aliasist is a multi-domain intelligence hub. Each sist is a focused lens on a fast-changing system: infrastructure (`DataSist`), space (`SpaceSist`), markets (`PulseSist`), and weather / disaster / economic impact (`EcoSist`).

## Architecture at a glance

```
                         aliasist.tech
                              │
                ┌─────────────┴─────────────┐
                │                           │
       apps/portal (Vite SPA)        api.aliasist.tech
       /, /data, /eco, /space, …     (services/workers-api, Hono)
                │                           │
                │                           ├── /health
                │                           ├── /data/* ──► D1 (DATA_DB)
                │                           ├── /eco/*  ──► Open-Meteo, NWS, SPC, …
                │                           ├── /space/* ──► live feeds + RAG Q&A (`POST /space/ask`)
                │                           └── /ai/explain ──► Ollama (Azure) → Groq fallback
                │
                └──► packages/ui, packages/api-client, packages/rag, sists/*
```

- One deployed frontend. Every sist is a lazy-loaded feature module under `sists/`, auto-registered in the app switcher via its `SistManifest`.
- One deployed worker. Every domain (eco, data, pulse, space, ai) is a sub-route mounted from `src/routes/*`. SpaceSist combines curated corpus RAG (`packages/rag`), `POST /space/ask`, and live feed normalization — see `docs/SPACESIST_RAG_PLAN.md`.
- One design system (`@aliasist/ui`) — dark lab panels, UFO-green accents, shared components.

## Monorepo layout

```
apps/
  portal/            Vite + React SPA (the only deployed frontend)
services/
  workers-api/       Cloudflare Worker (Hono) @ api.aliasist.tech
sists/
  datasist/          DataSist vNext module (routes + manifest + AI prompts)
  ecosist/           EcoSist vNext module
  spacesist/         SpaceSist (live feeds + RAG Q&A; see docs/SPACESIST_RAG_PLAN.md)
  (PulseSist migrates in Phase 5)
packages/
  ui/                Design system + components
  api-client/        Typed client for the unified Worker
  config/            Shared tsconfig + tailwind preset
  rag/               Shared ingest, retrieval, and provider helpers (SpaceSist + future sists)
docs/
  ARCHITECTURE.md    Decisions, trade-offs, Mermaid diagrams
  SPACESIST_RAG_PLAN.md  Phased SpaceSist + RAG rollout (reference for `/space` API)
scripts/
  rag/               Optional Node smoke scripts (`pnpm test:rag-*`, `test:spacesist-rag-dry`)
```

## Requirements

- Node ≥ 20.11 (see `.nvmrc`)
- pnpm 9.15+

## Local development

```bash
pnpm install
pnpm dev          # runs portal (5173) + workers-api (8787) in parallel
```

- Portal: http://localhost:5173
- API:    http://localhost:8787/health

## Workspace scripts

```bash
pnpm build        # build every workspace (respects turbo graph)
pnpm typecheck    # tsc --noEmit across all packages
pnpm lint         # (wired up in Phase 2b)
```

## Deployment

Automated deploys run on push to **`main`** via **[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)** (Workers + Pages). **[`.github/workflows/ci.yml`](.github/workflows/ci.yml)** runs typecheck, tests, and build on PRs and `main`, but does **not** publish.

Branch-to-domain mapping:

- `main` → `aliasist.tech`
- `master` → `aliasist.com`

The split is intentional and kept separate for release management.

GitHub repository secrets (Workers + `wrangler pages deploy`):

| Secret | Purpose |
| ------ | ------- |
| `CLOUDFLARE_API_TOKEN` | API token with **Workers Scripts** + **D1** (if used) + **Cloudflare Pages** edit permissions for the account |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID (`dash.cloudflare.com` → Workers overview sidebar) |

Local worker deploy (after `pnpm install`):

```bash
pnpm --filter @aliasist/rag build   # required: package exports only dist/
cd services/workers-api && pnpm exec wrangler deploy --env production
```

If Wrangler reports `Could not resolve "@aliasist/rag"`, the RAG package was not built — run the filter command above.

The worker deploys to `api.aliasist.tech`. The portal deploys to Cloudflare Pages project **`aliasist-platform`** (see workflow for `wrangler pages deploy` paths).

Required secrets (set once with `wrangler secret put` in `services/workers-api/`):

| Name           | Purpose                                      |
| -------------- | -------------------------------------------- |
| `ADMIN_TOKEN`  | Bearer for privileged routes (DataSist etc.) |
| `OLLAMA_URL`   | URL of the Azure Ollama gateway via CF Tunnel / HTTPS proxy |
| `OLLAMA_TOKEN` | Bearer token shared between the Worker and Ollama gateway |
| `GEMINI_API_KEY` | Gemini fallback provider after Workers AI |
| `GROQ_API_KEY` | Legacy AI fallback provider for older routes |
| `AI_OLLAMA_URL`| Legacy Ollama URL name; prefer `OLLAMA_URL` |

SpaceSist RAG answers use the Worker-side waterfall:

1. Azure Ollama (`OLLAMA_URL`, `OLLAMA_TOKEN`, `OLLAMA_MODEL`)
2. Cloudflare Workers AI (`[ai] binding = "AI"`, `WORKERS_AI_MODEL`)
3. Gemini (`GEMINI_API_KEY`, `GEMINI_MODEL`)
4. Local retrieval-only response when no generator is available

**Space `/space/ask` limits** (see `services/workers-api/wrangler.toml`): **`SPACE_ASK_RATE_MAX`** (default 24) and **`SPACE_ASK_RATE_WINDOW_MS`** (default 60000) throttle bursts per client IP inside each isolate; JSON bodies larger than **20480** bytes are rejected. **`CORS_ALLOW_CF_PAGES`** is **`true`** in the default worker vars for `https://*.pages.dev` preview sites and **`false`** under **`[env.production]`**.

## Status

| Phase | Scope                                                | State        |
| ----- | ---------------------------------------------------- | ------------ |
| 1     | Architecture + discovery                             | done         |
| 2     | Scaffold monorepo + portal + workers-api + UI        | **you are here** |
| 3a    | DataSist vNext rebuild (D1-bound, curated, admin)    | next         |
| 3b    | EcoSist vNext rebuild (radar, alerts, OK panel, AI)  | next         |
| 4     | Polish + overview docs                               | planned      |
| 5     | Migration of Pulse/Space + DNS cutover               | planned      |

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full design rationale.

SpaceSist + RAG integration work is tracked in [`docs/SPACESIST_RAG_PLAN.md`](docs/SPACESIST_RAG_PLAN.md) (phased roadmap) and [`docs/INTEGRATION_LOG.md`](docs/INTEGRATION_LOG.md) (running log).
