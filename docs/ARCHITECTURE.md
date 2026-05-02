# Architecture

## Goals

1. **One coherent product.** Single shell, single design system, single auth, single URL — the suite feels like one platform, not five apps stapled together.
2. **Professional-grade engineering.** Types at every network boundary, incremental builds, CI typecheck gate, edge-first deploy, observability wired from day one.
3. **Educational mission.** Every sist teaches the system it visualizes. AI explainers are grounded in the data visible on the page and are safety-first.
4. **Easy to grow.** Adding a sist is a one-line manifest registration; adding an API surface is a one-line `app.route()` call.

Backend / AI / agent goals for the Worker are stated in **[`MISSION_AI_BACKEND.md`](MISSION_AI_BACKEND.md)** and phased in **[`PHASE_PLAN_AI_BACKEND.md`](PHASE_PLAN_AI_BACKEND.md)**.

## Product statement

Aliasist is a multi-domain intelligence hub. It helps users understand fast-changing systems by combining live data, curated context, and grounded explanations in one interface.

The current pillar set is:

- **DataSist** for data centers and infrastructure intelligence
- **SpaceSist** for SpaceX, NASA, Space Force, orbital context, and telescope/archive exploration
- **PulseSist** for markets and macro movement
- **EcoSist** for weather, disasters, and their environmental and economic impact

The product is strongest when each sist answers three questions:

- What is happening now?
- Why does it matter?
- Where can I drill deeper?

## Top-level decisions

| Decision                           | Choice                                                         | Why                                                                                                         |
| ---------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Monorepo tool                      | pnpm workspaces + Turborepo                                    | Industry-standard, fast, first-class Vite + Wrangler support; lower ceremony than Nx.                       |
| Frontend                           | Vite + React 18 + TypeScript + Tailwind (+ Framer in EcoSist)  | Already the suite's strongest stack; keeps velocity high.                                                   |
| Deployment topology                | Single SPA with lazy-loaded sists                              | Coherence + shared shell/header/auth/analytics. Easy to split later; hard to consolidate once split.        |
| Backend                            | One Hono-based Cloudflare Worker behind `api.aliasist.tech`    | Replaces 5+ fragmented workers, one CORS allowlist, one observability wiring.                               |
| AI                                 | Ollama (Azure) primary, Groq fallback, browser never talks direct | Protects Azure endpoint, centralizes prompt engineering, survives Ollama being off most of the time.        |
| Data                               | D1 per domain bound into the same worker (`DATA_DB`, `ECO_DB`) | Cheap, zero-ops, per-app blast radius.                                                                      |
| Auth                               | Phased — token-gated admin routes now; federated SSO when needed | Avoid premature blockers; keep the public surface read-only by default.                                     |

## Single-SPA rationale

The prompt called for "one portal with an app switcher" *and* `apps/ecosist`, `apps/pulsesist`. Those mean different things. We picked:

**One deployed SPA (`apps/portal`).** Each sist is a library under `sists/<id>/` that exports its routes + manifest (`SistManifest`). The portal lazy-loads each sist’s route module at `/data`, `/eco`, `/space`, etc., while manifest metadata (`manifest-meta` subpath) stays eager for nav and the app switcher.

Pros:
- Shared shell, header, analytics, auth, session — no duplication.
- One Pages project, one DNS record, one preview deploy per PR.
- Cross-sist navigation is instant (no page reload between labs).
- The app switcher populates itself from the sist registry — add a line, get nav.

Cons (acceptable at this scale):
- A long-lived bundle bloat risk across 5+ sists. Mitigated via `React.lazy` + route-level code splitting; each sist's chunk is independent.
- A big refactor inside one sist risks touching shared infra. Acceptable, and arguably desirable: it forces coherence.

Escape hatch: if one sist grows its own audience/team/stack, lift it out to `apps/<sist>/` and point a subdomain at it. Cheap to do later.

## Sist manifest contract

Each sist ships **`src/manifest-meta.ts`** (exported as `@aliasist/sist-*/manifest-meta`) with nav fields only — no route imports — so the portal can stay slim. The package root still exports a full **`manifest`** (meta + `element`) for consumers that load the whole module.

The portal **`apps/portal/src/sists.ts`** merges meta with `React.lazy(() => import("@aliasist/sist-*").then(...))` and wraps routes in **`Suspense`**. `AppSwitcher` reads the combined list. React Router mounts each lazy `element` at `path/*`.

```ts
// manifest-meta.ts — safe to import eagerly from the portal
import type { SistManifestMeta } from "@aliasist/ui";
export const manifestMeta: SistManifestMeta = {
  id: "data",
  name: "DataSist",
  tagline: "AI data center intelligence — live map, curated entries.",
  path: "/data",
  accent: "ufo",
  icon: "◎",
  status: "alpha",
};
```

## API gateway shape

```
POST /ai/explain
GET  /health
GET  /eco/weather?lat&lon                → Open-Meteo (Phase 3b adds NWS/SPC/USGS/EONET)
GET  /eco/alerts?state                   (Phase 3b)
GET  /data/data-centers                  → D1 DATA_DB (Phase 3a)
POST /data/data-centers (bearer)         (Phase 3a)
GET  /space/apod | /iss | /people | …   → normalized live feeds (cached)
POST /space/ask                          → RAG retrieval + Ollama / Workers AI / Gemini / local fallback
GET  /pulse/*                            (Phase 5)
```

### Space + RAG (SpaceSist)

Space routes live in `services/workers-api/src/routes/space.ts`. The **corpus** is curated static text in `services/workers-api/src/rag/spaceCorpus.ts`, chunked and retrieved via **`@aliasist/rag`** (keyword overlap by default). **`POST /space/ask`** applies a **fixed-window rate limit** per client IP (`SPACE_ASK_RATE_MAX`, `SPACE_ASK_RATE_WINDOW_MS`), caps JSON body size, then tries **Ollama → Workers AI → Gemini → retrieval-only** answers. CORS: `ALLOWED_ORIGIN` plus optional **`CORS_ALLOW_CF_PAGES=true`** for `https://*.pages.dev` preview frontends (off in production). Phased product/ops checklist: **`docs/SPACESIST_RAG_PLAN.md`**.

Longer-term premium roadmap: **`docs/SPACESIST_PREMIUM_PHASES.md`**. That document covers the planned evolution toward live space-weather intelligence, target/ephemeris search, telescope/archive exploration, close-approach watchlists, and a stronger knowledge layer.

Each sub-router lives in `services/workers-api/src/routes/<id>.ts` and is mounted by `src/index.ts`. Auth middleware (`requireAdmin`) is applied at the router level for privileged routes only — public GETs stay public.

## AI layer

`/ai/explain` is the primary shared AI entrypoint for early sists.

1. **Attempt Ollama** (Azure, behind Cloudflare Tunnel) with a 2.5s budget.
2. **Fall through to Groq** if Ollama errors, times out, or isn't configured.
3. **Return a soft 503** with a polite message if both are down.

**SpaceSist** adds `POST /space/ask`: retrieval over a static corpus, then the same provider waterfall as documented in `README.md` (Ollama → Workers AI → Gemini → local excerpts). Rate limits and CORS for previews are configured in `wrangler.toml`.

System prompt is templated per sist. Each sist owns its prompt pack (`sists/<id>/src/ai-prompts.ts` — coming in Phase 3). Prompt-version logging lands in Phase 4.

## Design system (`@aliasist/ui`)

- **Palette:** `ink.*` (deep neutrals for the dark lab chrome), `ufo.*` (green accents, primary CTA), `signal.*` (warm highlights, storm warnings), `danger.*`.
- **Typography:** Inter (UI) + Cabinet Grotesk / General Sans (display) + JetBrains Mono (data).
- **Primitives:** `Button`, `Panel` (optionally "lab" scanlines), `Pill`, `BrandMark` (custom UFO + tractor beam glyph), `Shell` (grid-backdrop layout), `AppSwitcher`.
- **Motion language:** layered CSS motion on shell/marketing surfaces; subtle glow on CTAs, optional scanline overlays on lab panels.

## CI / deploy

- GitHub Actions runs `pnpm install --frozen-lockfile`, then `pnpm typecheck` and `pnpm build` on every PR.
- Branch-to-domain mapping is intentional:
  - `main` deploys `aliasist.tech`
  - `master` deploys `aliasist.com`
- Workers deploy on merge to `main` via `wrangler deploy --env production`, using `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` repo secrets.
- Portal deploys to Cloudflare Pages, Pages project bound to this repo, build command `pnpm --filter @aliasist/portal build`, output directory `apps/portal/dist`.

## Observability (Phase 4)

- Sentry browser + Sentry Cloudflare-worker adapter.
- Datadog logs via the worker (already wired in legacy DataSist — port into `packages/observability`).
- Per-sist analytics event taxonomy: `aliasist.portal.nav`, `aliasist.<sist>.view`, `aliasist.ai.explain`, `aliasist.ai.source` (ollama|groq|fallback).

## Assumptions (flag if wrong)

- ☑ `aliasist.tech` is in Cloudflare and we can bind workers routes + a Pages project to it. *Confirm when we hit deploy.*
- ☑ Azure Ollama is intentionally intermittent; design assumes Groq is the de-facto primary from the user's perspective.
- ☑ No personal data stored in D1 during scaffold — only curated DataSist rows and later ecosist journal (user's own writes).
- ☑ The legacy DataSist worker + frontend remain live until Phase 5 cutover; no migration traffic until we say go.
