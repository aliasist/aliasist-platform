import { Hono } from "hono";
import { z } from "zod";
import type { Env } from "../env";
import { getDataCenterBySlug, getStats, listDataCenters } from "../db/datasist";

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

const notConfigured = (e: unknown) =>
  e instanceof Error && e.message === "data_db_not_configured";

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
      return c.json(
        {
          items: [],
          total: 0,
          note: "DATA_DB is not bound in this environment. Run `pnpm d1:migrate` against aliasist-datasist and bind DATA_DB in wrangler.toml.",
        },
        503,
      );
    }
    throw err;
  }
});

/** GET /data/data-centers/:slug — single entry lookup. */
data.get("/data-centers/:slug", async (c) => {
  const slug = c.req.param("slug");
  if (!/^[a-z0-9-]{2,128}$/.test(slug)) {
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
