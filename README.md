# Aliasist Platform

> Intelligence labs for the systems that shape the world — data centers, storms, markets, space, social signal.

**Aliasist vNext** consolidates the five original "sist" apps (DataSist, EcoSist, PulseSist, SpaceSist, TikaSist) into a single monorepo, shipping one unified SPA backed by one unified Cloudflare Worker.

## Architecture at a glance

```
                         aliasist.tech
                              │
                ┌─────────────┴─────────────┐
                │                           │
       apps/portal (Vite SPA)        api.aliasist.tech
       /, /data, /eco, /pulse, …     (services/workers-api, Hono)
                │                           │
                │                           ├── /health
                │                           ├── /data/* ──► D1 (DATA_DB)
                │                           ├── /eco/*  ──► Open-Meteo, NWS, SPC, …
                │                           └── /ai/explain ──► Ollama (Azure) → Groq fallback
                │
                └──► packages/ui, packages/api-client, sists/*
```

- One deployed frontend. Every sist is a lazy-loaded feature module under `sists/`, auto-registered in the app switcher via its `SistManifest`.
- One deployed worker. Every domain (eco, data, pulse, space, tika, ai) is a sub-route mounted from `src/routes/*`.
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
  (pulse/space/tika migrate in Phase 5)
packages/
  ui/                Design system + components
  api-client/        Typed client for the unified Worker
  config/            Shared tsconfig + tailwind preset
docs/
  ARCHITECTURE.md    Decisions, trade-offs, Mermaid diagrams
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

The worker deploys to `api.aliasist.tech` via `wrangler deploy --env production`, driven by GitHub Actions (`.github/workflows/ci.yml`). The portal deploys to Cloudflare Pages against `aliasist.tech`.

Required secrets (set once with `wrangler secret put` in `services/workers-api/`):

| Name           | Purpose                                      |
| -------------- | -------------------------------------------- |
| `ADMIN_TOKEN`  | Bearer for privileged routes (DataSist etc.) |
| `GROQ_API_KEY` | AI fallback provider                         |
| `AI_OLLAMA_URL`| URL of the Azure Ollama server via CF Tunnel |

## Status

| Phase | Scope                                                | State        |
| ----- | ---------------------------------------------------- | ------------ |
| 1     | Architecture + discovery                             | done         |
| 2     | Scaffold monorepo + portal + workers-api + UI        | **you are here** |
| 3a    | DataSist vNext rebuild (D1-bound, curated, admin)    | next         |
| 3b    | EcoSist vNext rebuild (radar, alerts, OK panel, AI)  | next         |
| 4     | Polish + overview docs                               | planned      |
| 5     | Migration of Pulse/Space/Tika + DNS cutover          | planned      |

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full design rationale.
