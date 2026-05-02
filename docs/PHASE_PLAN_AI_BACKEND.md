# Phased plan — AI gateway & backend (`workers-api`)

This plan sequences **cross-cutting** backend work (models, RAG contracts, observability, agent readiness). It **does not replace** [`SPACESIST_RAG_PLAN.md`](SPACESIST_RAG_PLAN.md); Space/RAG UI and corpus phases stay there—link both when planning sprints.

## Phase 1 — Traceability baseline *(started)*

**Goal:** Every response can be tied to a stable correlation id for logs and support.

**Deliverables**

- [x] `x-request-id` middleware: honor inbound header when sane; else generate UUID; echo on response (see `services/workers-api/src/middleware/request-id.ts`).
- [ ] Extend high-traffic AI logs (`space_ask`, `ollama_fallback`, etc.) to include `requestId` once handlers read `c.get("requestId")` consistently *(optional follow-up)*.

**Exit**

- [x] Tests assert `x-request-id` on at least one canonical route (e.g. `GET /health`).
- [x] `pnpm typecheck` / `pnpm test` green.

---

## Phase 2 — Explain-path parity with `/space`

**Goal:** `POST /ai/explain` meets the same abuse and payload discipline as Space ask where applicable.

**Includes**

- Body size / JSON hardening aligned with `POST /space/ask` patterns.
- Rate limiting strategy (per IP or shared bucket) documented and implemented or explicitly deferred with ticket link.
- Structured log tags: `sist`, `source`, `latencyMs`, `requestId`.

**Exit**

- Document limits in worker README or [`INTEGRATION_LOG.md`](INTEGRATION_LOG.md) if used.
- Vitest coverage for 400 on oversize / malformed body.

---

## Phase 3 — Retrieval & corpus lifecycle

**Goal:** RAG quality and ops scale without bloating the Worker bundle.

**Includes**

- Coordinate with [`SPACESIST_RAG_PLAN.md`](SPACESIST_RAG_PLAN.md) Phase 3 (embeddings storage, admin ingest, eval).
- Shared conventions for chunk metadata, source labels, and “no answer” responses across sists.

**Exit**

- Decisions recorded before large schema or binding changes.

---

## Phase 4 — Agent-shaped APIs *(later)*

**Goal:** Allow careful automation without opening raw provider access.

**Includes**

- Tool definitions as **typed Worker routes** (not ad-hoc prompts with secrets).
- Optional signed internal tokens or scoped keys for server-side agents only.
- Evaluation harness (golden questions + chunk citations).

**Exit**

- Threat model note (who can call what) checked into `docs/` or ADR.

---

## How to use this doc

1. Pick the **next unchecked** item in the earliest phase with open work.
2. For Space-only scope, still skim Phase 1–2 here so limits and ids stay consistent.
3. After merging substantive backend changes, update **checkboxes** and optionally append dated notes to `INTEGRATION_LOG.md` if your branch uses it.
