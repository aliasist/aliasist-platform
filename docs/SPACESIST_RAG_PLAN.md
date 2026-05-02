# SpaceSist + RAG integration — phased plan

This document breaks **`integrate/spacesist-rag`** (and follow-up work) into phases with **exit criteria**. For day-to-day notes, append to **`INTEGRATION_LOG.md`** (newest entries at the top).

For the longer-term flagship roadmap after this integration branch, see **`SPACESIST_PREMIUM_PHASES.md`**.

## Current shape (reference)

| Layer | Path | Notes |
| ----- | ---- | ----- |
| Portal manifest | `apps/portal/src/sists.ts` | `spaceManifest` registered (`alpha`) |
| SpaceSist UI | `sists/spacesist/` | Routes, memory/RAG UX, live panels |
| Shared RAG lib | `packages/rag/` | Ingest, chunk, retrieve, providers |
| Worker | `services/workers-api/src/routes/space.ts` | Live feeds + `POST /space/ask` |
| Corpus | `services/workers-api/src/rag/spaceCorpus.ts` | Grounding documents |
| Tests | `services/workers-api/test/space.routes.test.ts` | Feeds + ask (local RAG, Workers AI, Gemini stubs) |

## Phase 0 — Foundation *(in progress on branch)*

**Goal:** SpaceSist ships as a first-class sist with a working `/space` API and RAG-backed Q&A in dev.

**Includes**

- `@aliasist/rag` wired into the worker; static corpus → chunk → retrieve → LLM or `local-rag` fallback.
- Portal loads SpaceSist; shell / app switcher consistent with Data + Eco.
- Vitest coverage for normalized live endpoints and `/space/ask` variants.

**Exit criteria**

- [x] `pnpm typecheck` and `pnpm test` pass locally *(currently passing)*.
- [ ] Same on CI for the PR targeting `main`.
- [ ] `pnpm dev`: portal + worker behave end-to-end for at least one ask + one live tile.

**Log checkpoint:** Record branch tip and any env vars used in **`INTEGRATION_LOG.md`**.

---

## Phase 1 — PR hygiene & documentation

**Goal:** Reviewers can merge without guessing; no stray noise in the tree.

**Includes**

- Meaningful commit history (or squash strategy agreed with team).
- Root-level **`test-*.mjs`** scripts: move under `scripts/` with a one-line README note **or** delete if redundant vs Vitest.
- **`docs/ARCHITECTURE.md`**: add a short “Space + RAG” subsection linking here (optional but nice).
- **`README.md`**: SpaceSist bullet under architecture / local dev if missing.

**Exit criteria**

- [ ] PR description links this plan + log.
- [x] `pnpm build` green in CI (already in workflow).
- [x] Root **`test-*.mjs`** scripts moved under **`scripts/rag/`** (see root `package.json` `test:rag-*`).
- [x] **`docs/ARCHITECTURE.md`**: “Space + RAG” subsection links here.
- [x] **`README.md`**: SpaceSist / `/space` / `packages/rag` called out in layout + diagram.

---

## Phase 2 — Production hardening (`/space`)

**Goal:** Public surface matches the bar set elsewhere on `api.aliasist.tech` (abuse resistance, predictable costs).

**Includes**

- Rate limiting for **`POST /space/ask`** (per IP or token bucket; align with existing middleware patterns if any).
- Request body size cap and strict JSON parsing for ask payloads.
- CORS: confirm `ALLOWED_ORIGIN` in `wrangler.toml` covers production Pages origins only.
- Observability: structured logs or tags for `space_ask` errors / provider fallbacks (optional).

**Exit criteria**

- [ ] Load tests or manual verification that burst traffic is throttled *(default: 24 asks / 60s / IP in each isolate; upgrade path KV/DO if stricter global limits are required)*.
- [x] Document limits in **`INTEGRATION_LOG.md`** and/or worker README *(vars: `SPACE_ASK_RATE_MAX`, `SPACE_ASK_RATE_WINDOW_MS`, JSON cap 20 480 bytes; `CORS_ALLOW_CF_PAGES`)*.

---

## Phase 3 — RAG evolution *(optional / later)*

**Goal:** Scale corpus and quality without blowing worker size or latency.

**Ideas (pick when needed)**

- Precomputed embeddings in KV/R2; incremental ingest pipeline.
- Separate “admin only” ingest route with `ADMIN_TOKEN`.
- Evaluate Workers AI embeddings vs external for cost/latency.

**Exit criteria**

- [ ] Decisions recorded in **`INTEGRATION_LOG.md`** before implementation.

---

## Phase 4 — Product polish

**Goal:** SpaceSist feels finished next to DataSist/EcoSist.

**Includes**

- Loading and error states for AI and live feeds; empty corpus / `NO_ANSWER` UX.
- Copy and pedagogy pass (aligned with platform mission in `ARCHITECTURE.md`).
- Accessibility sweep on new components.

**Exit criteria**

- [ ] Smoke checklist run on staging/preview deploy.

---

## Phase 5 — Suite continuity

**Goal:** Return to roadmap in **`README.md`** / **`ARCHITECTURE.md`** — PulseSist and auth phases.

SpaceSist patterns (manifest, worker sub-router, shared package) become the template for the next sist.

---

## How we keep logs

After meaningful work (merge, deploy, decision, incident):

1. Open **`docs/INTEGRATION_LOG.md`**.
2. Add a **new block at the top** under `## Log` using the template there.
3. Tick boxes in **this file** when a phase’s exit criteria are met.
