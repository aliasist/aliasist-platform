import { Hono } from "hono";
import { z } from "zod";
import type { Env } from "../env";
import { requireAdmin } from "../middleware/auth";
import {
  appendAudit,
  createDataCenter,
  DataCenterError,
  deleteDataCenter,
  getDataCenterBySlug,
  getStats,
  listAudit,
  listDataCenters,
  updateDataCenter,
} from "../db/datasist";

export const data = new Hono<{ Bindings: Env }>();

const STATUSES = ["operational", "under_construction", "planned", "canceled"] as const;
const COMPANY_TYPES = ["hyperscale", "colocation", "neocloud"] as const;
const GRID_RISKS = ["low", "medium", "high"] as const;

const ListQuery = z.object({
  country: z.string().min(1).max(64).optional(),
  state: z.string().min(1).max(64).optional(),
  status: z.enum(STATUSES).optional(),
  companyType: z.enum(COMPANY_TYPES).optional(),
  gridRisk: z.enum(GRID_RISKS).optional(),
  q: z.string().max(128).optional(),
  limit: z.coerce.number().int().min(1).max(1000).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

const SLUG_RE = /^[a-z0-9-]{2,128}$/;

const DataCenterInput = z.object({
  slug: z.string().regex(SLUG_RE).optional(),
  name: z.string().min(1).max(200),
  company: z.string().min(1).max(200),
  companyType: z.enum(COMPANY_TYPES),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  city: z.string().min(1).max(120),
  state: z.string().min(1).max(120),
  country: z.string().min(1).max(64).optional(),
  capacityMW: z.number().nonnegative().nullable().optional(),
  estimatedAnnualGWh: z.number().nonnegative().nullable().optional(),
  waterUsageMillionGallons: z.number().nonnegative().nullable().optional(),
  status: z.enum(STATUSES),
  yearOpened: z.number().int().min(1900).max(2100).nullable().optional(),
  yearPlanned: z.number().int().min(1900).max(2100).nullable().optional(),
  investmentBillions: z.number().nonnegative().nullable().optional(),
  acreage: z.number().nonnegative().nullable().optional(),
  primaryModels: z.array(z.string().min(1).max(64)).max(32).optional(),
  communityImpact: z.string().max(4000).nullable().optional(),
  communityResistance: z.boolean().optional(),
  gridRisk: z.enum(GRID_RISKS).nullable().optional(),
  renewablePercent: z.number().min(0).max(100).nullable().optional(),
  notes: z.string().max(8000).nullable().optional(),
});

const DataCenterPatch = DataCenterInput.partial();

const notConfigured = (e: unknown) =>
  e instanceof Error && e.message === "data_db_not_configured";

/**
 * Short fingerprint of the bearer so the audit log shows *who* made each
 * change without storing the raw token. SHA-256 → first 12 hex chars.
 */
const fingerprintActor = async (token: string): Promise<string> => {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );
  return Array.from(new Uint8Array(buf))
    .slice(0, 6)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const actorFromHeader = async (authHeader: string | undefined): Promise<string | null> => {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;
  return fingerprintActor(token);
};

/** GET /data/data-centers — paginated, filterable list. */
data.get("/data-centers", async (c) => {
  const parsed = ListQuery.safeParse(c.req.query());
  if (!parsed.success) {
    return c.json({ error: "invalid_query", issues: parsed.error.issues }, 400);
  }
  try {
    const result = await listDataCenters(c.env, parsed.data);
    return c.json(result);
  } catch (err) {
    if (notConfigured(err)) {
      return c.json({
        items: [],
        total: 0,
        note: "DATA_DB is not bound in this environment. Run `pnpm d1:migrate` against aliasist-datasist and bind DATA_DB in wrangler.toml.",
      });
    }
    throw err;
  }
});

/** GET /data/data-centers/:slug — single entry lookup. */
data.get("/data-centers/:slug", async (c) => {
  const slug = c.req.param("slug");
  if (!SLUG_RE.test(slug)) {
    return c.json({ error: "invalid_slug" }, 400);
  }
  try {
    const entry = await getDataCenterBySlug(c.env, slug);
    if (!entry) return c.json({ error: "not_found" }, 404);
    return c.json(entry);
  } catch (err) {
    if (notConfigured(err)) return c.json({ error: "not_configured" }, 503);
    throw err;
  }
});

/** GET /data/stats — aggregate dashboard stats. */
data.get("/stats", async (c) => {
  try {
    const stats = await getStats(c.env);
    return c.json(stats);
  } catch (err) {
    if (notConfigured(err)) return c.json({ error: "not_configured" }, 503);
    throw err;
  }
});

/** POST /data/data-centers — admin create. */
data.post("/data-centers", requireAdmin, async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "invalid_json" }, 400);
  }
  const parsed = DataCenterInput.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "invalid_body", issues: parsed.error.issues }, 400);
  }
  try {
    const created = await createDataCenter(c.env, parsed.data);
    const actor = await actorFromHeader(c.req.header("Authorization"));
    await appendAudit(c.env, {
      action: "create",
      slug: created.slug,
      actor,
      payload: parsed.data,
    });
    return c.json(created, 201);
  } catch (err) {
    if (notConfigured(err)) return c.json({ error: "not_configured" }, 503);
    if (err instanceof DataCenterError && err.code === "slug_conflict") {
      return c.json({ error: "slug_conflict", message: err.message }, 409);
    }
    throw err;
  }
});

/** PUT /data/data-centers/:slug — admin update. */
data.put("/data-centers/:slug", requireAdmin, async (c) => {
  const slug = c.req.param("slug");
  if (!SLUG_RE.test(slug)) return c.json({ error: "invalid_slug" }, 400);
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "invalid_json" }, 400);
  }
  const parsed = DataCenterPatch.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "invalid_body", issues: parsed.error.issues }, 400);
  }
  try {
    const updated = await updateDataCenter(c.env, slug, parsed.data);
    const actor = await actorFromHeader(c.req.header("Authorization"));
    await appendAudit(c.env, {
      action: "update",
      slug,
      actor,
      payload: parsed.data,
    });
    return c.json(updated);
  } catch (err) {
    if (notConfigured(err)) return c.json({ error: "not_configured" }, 503);
    if (err instanceof DataCenterError && err.code === "not_found") {
      return c.json({ error: "not_found" }, 404);
    }
    throw err;
  }
});

/** DELETE /data/data-centers/:slug — admin delete. */
data.delete("/data-centers/:slug", requireAdmin, async (c) => {
  const slug = c.req.param("slug");
  if (!SLUG_RE.test(slug)) return c.json({ error: "invalid_slug" }, 400);
  try {
    await deleteDataCenter(c.env, slug);
    const actor = await actorFromHeader(c.req.header("Authorization"));
    await appendAudit(c.env, { action: "delete", slug, actor, payload: null });
    return c.json({ ok: true });
  } catch (err) {
    if (notConfigured(err)) return c.json({ error: "not_configured" }, 503);
    if (err instanceof DataCenterError && err.code === "not_found") {
      return c.json({ error: "not_found" }, 404);
    }
    throw err;
  }
});

/** GET /data/audit — admin audit log (latest first). */
data.get("/audit", requireAdmin, async (c) => {
  const limitParam = c.req.query("limit");
  const limit = limitParam ? Number(limitParam) : 50;
  if (!Number.isFinite(limit) || limit < 1) {
    return c.json({ error: "invalid_limit" }, 400);
  }
  try {
    const entries = await listAudit(c.env, limit);
    return c.json({ items: entries });
  } catch (err) {
    if (notConfigured(err)) return c.json({ error: "not_configured" }, 503);
    throw err;
  }
});
