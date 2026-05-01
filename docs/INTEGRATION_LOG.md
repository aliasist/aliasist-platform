# Integration log — Aliasist Platform

Append-only diary for **SpaceSist + RAG** and related platform integration work.  
**Convention:** add the newest entry **at the top** of the `## Log` section (below this paragraph).

See **`SPACESIST_RAG_PLAN.md`** for phased goals and exit criteria.

---

## Log template

Copy this block when adding an entry:

```markdown
### YYYY-MM-DD — short title

- **Context:** branch / PR / env (e.g. `integrate/spacesist-rag`, local only)
- **What changed:** bullets
- **Verification:** e.g. `pnpm typecheck`, `pnpm test`, manual URL
- **Follow-ups:** optional
```

---

## Log

### 2026-04-29 — Phases 1–2: RAG scripts layout, `/space/ask` hardening

- **Context:** local `integrate/spacesist-rag` continuation; workers-api + docs.
- **What changed:** Moved root `test-rag*.mjs` into **`scripts/rag/`**; root `package.json` scripts updated (`test:rag-smoke`, etc.). **`POST /space/ask`**: per-IP fixed-window rate limit (`SPACE_ASK_RATE_MAX` default 24 / `SPACE_ASK_RATE_WINDOW_MS` default 60000), **20 480 byte** JSON cap, explicit **invalid JSON** → 400. **CORS:** `CORS_ALLOW_CF_PAGES` (`*.pages.dev` when `"true"`, **off** in `[env.production]`). Vitest: malformed JSON, payload size, rate limit, CORS. **`docs/ARCHITECTURE.md`** + **`README.md`** updated; **`SPACESIST_RAG_PLAN.md`** checkboxes advanced.
- **Verification:** `pnpm --filter @aliasist/workers-api test` (67 tests) ✅ · `node scripts/rag/test-spacesist-documents.mjs` ✅.
- **Follow-ups:** PR to `main` + CI; optional KV/DO-backed limiter if isolates feel too leaky; Phase 0 e2e `pnpm dev` smoke in log.

### 2026-04-29 — Cloudflare deploy: RAG build missing in CI

- **Context:** `deploy.yml` worker job; clean checkout on GitHub Actions.
- **What changed:** Worker job now runs `pnpm --filter @aliasist/rag build` before `wrangler deploy`; both jobs use `node-version-file: .nvmrc`. README deployment section lists correct workflow, secrets, and local deploy order.
- **Verification:** With `packages/rag/dist` removed, `wrangler deploy --dry-run` fails on `@aliasist/rag`; after `pnpm --filter @aliasist/rag build`, dry-run succeeds.
- **Follow-ups:** If deploy still fails, confirm `CLOUDFLARE_API_TOKEN` includes **Account — Workers Scripts — Edit**, **Account — Cloudflare Pages — Edit**, and **Account — Workers KV Storage — Edit** / **D1** if applicable; check Pages project name `aliasist-platform` exists for the same account.

### 2026-04-28 — Phased plan + log files

- **Context:** branch `integrate/spacesist-rag`, repo `/home/blake/aliasist-platform`, not yet pushed with these docs.
- **What changed:** Added `docs/SPACESIST_RAG_PLAN.md` (phases 0–5, exit criteria) and `docs/INTEGRATION_LOG.md` (this file).
- **Verification:** `pnpm typecheck` ✅ · `pnpm test` ✅ (62 tests, including `space.routes.test.ts`).
- **Follow-ups:** Commit docs with branch work; open PR to `main`; Phase 2 rate limits for `/space/ask`.
