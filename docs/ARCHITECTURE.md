# Architecture

## Goals

1. **One coherent product.** Single shell, single design system, single auth, single URL — the suite feels like one platform, not five apps stapled together.
2. **Professional-grade engineering.** Types at every network boundary, incremental builds, CI typecheck gate, edge-first deploy, observability wired from day one.
3. **Educational mission.** Every sist teaches the system it visualizes. AI explainers are grounded in the data visible on the page and are safety-first.
4. **Easy to grow.** Adding a sist is a one-line manifest registration; adding an API surface is a one-line `app.route()` call.

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

**One deployed SPA (`apps/portal`).** Each sist is a library under `sists/<id>/` that exports its routes + manifest (`SistManifest`). The portal lazy-loads each sist at `/data`, `/eco`, `/pulse`, etc.

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

Every sist exports:

```ts
import type { SistManifest } from "@aliasist/ui";
export const manifest: SistManifest = {
  id: "data",
  name: "DataSist",
  tagline: "AI data center intelligence — live map, curated entries.",
  path: "/data",
  element: DataSistRoutes,
  accent: "ufo",
  icon: "◎",
  status: "alpha",
};
```

`apps/portal/src/sists.ts` imports and orders these. `AppSwitcher` renders them. React Router mounts `element` at `path/*`.

## API gateway shape

```
POST /ai/explain
GET  /health
GET  /eco/weather?lat&lon                → Open-Meteo (Phase 3b adds NWS/SPC/USGS/EONET)
GET  /eco/alerts?state                   (Phase 3b)
GET  /data/data-centers                  → D1 DATA_DB (Phase 3a)
POST /data/data-centers (bearer)         (Phase 3a)
GET  /pulse/* /space/* /tika/*           (Phase 5)
```

Each sub-router lives in `services/workers-api/src/routes/<id>.ts` and is mounted by `src/index.ts`. Auth middleware (`requireAdmin`) is applied at the router level for privileged routes only — public GETs stay public.

## AI layer

`/ai/explain` is the only AI entrypoint from the browser.

1. **Attempt Ollama** (Azure, behind Cloudflare Tunnel) with a 2.5s budget.
2. **Fall through to Groq** if Ollama errors, times out, or isn't configured.
3. **Return a soft 503** with a polite message if both are down.

System prompt is templated per sist. Each sist owns its prompt pack (`sists/<id>/src/ai-prompts.ts` — coming in Phase 3). Rate-limiting and prompt-version logging land in Phase 4.

## Design system (`@aliasist/ui`)

- **Palette:** `ink.*` (deep neutrals for the dark lab chrome), `ufo.*` (green accents, primary CTA), `signal.*` (warm highlights, storm warnings), `danger.*`.
- **Typography:** Inter (UI) + Cabinet Grotesk / General Sans (display) + JetBrains Mono (data).
- **Primitives:** `Button`, `Panel` (optionally "lab" scanlines), `Pill`, `BrandMark` (custom UFO + tractor beam glyph), `Shell` (grid-backdrop layout), `AppSwitcher`.
- **Motion language:** subtle glow on CTAs, scanline overlays on status panels, zero decorative animation.

## CI / deploy

- GitHub Actions runs `pnpm install --frozen-lockfile`, then `pnpm typecheck` and `pnpm build` on every PR.
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
