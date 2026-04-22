/**
 * DataSist D1 query helpers.
 *
 * Thin typed wrappers over the `DATA_DB` binding. All routes live in
 * src/routes/data.ts and compose these helpers — keeping SQL out of the
 * route layer so we can swap DBs or bolt on caching without rewriting
 * every handler.
 */
import type { Env } from "../env";

/** Row-shape as stored in D1 (snake_case columns). */
export interface DataCenterRow {
  id: number;
  slug: string;
  name: string;
  company: string;
  company_type: "hyperscale" | "colocation" | "neocloud";
  lat: number;
  lng: number;
  city: string;
  state: string;
  country: string;
  capacity_mw: number | null;
  estimated_annual_gwh: number | null;
  water_usage_million_gallons: number | null;
  status: "operational" | "under_construction" | "planned" | "canceled";
  year_opened: number | null;
  year_planned: number | null;
  investment_billions: number | null;
  acreage: number | null;
  primary_models: string | null;
  community_impact: string | null;
  community_resistance: number;
  grid_risk: "low" | "medium" | "high" | null;
  renewable_percent: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** API-facing shape: camelCase, primary_models decoded to string[]. */
export interface DataCenter {
  id: number;
  slug: string;
  name: string;
  company: string;
  companyType: "hyperscale" | "colocation" | "neocloud";
  lat: number;
  lng: number;
  city: string;
  state: string;
  country: string;
  capacityMW: number | null;
  estimatedAnnualGWh: number | null;
  waterUsageMillionGallons: number | null;
  status: "operational" | "under_construction" | "planned" | "canceled";
  yearOpened: number | null;
  yearPlanned: number | null;
  investmentBillions: number | null;
  acreage: number | null;
  primaryModels: string[];
  communityImpact: string | null;
  communityResistance: boolean;
  gridRisk: "low" | "medium" | "high" | null;
  renewablePercent: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export const rowToCenter = (r: DataCenterRow): DataCenter => {
  let primaryModels: string[] = [];
  if (r.primary_models) {
    try {
      const parsed = JSON.parse(r.primary_models);
      if (Array.isArray(parsed)) primaryModels = parsed.map(String);
    } catch {
      primaryModels = [];
    }
  }
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    company: r.company,
    companyType: r.company_type,
    lat: r.lat,
    lng: r.lng,
    city: r.city,
    state: r.state,
    country: r.country,
    capacityMW: r.capacity_mw,
    estimatedAnnualGWh: r.estimated_annual_gwh,
    waterUsageMillionGallons: r.water_usage_million_gallons,
    status: r.status,
    yearOpened: r.year_opened,
    yearPlanned: r.year_planned,
    investmentBillions: r.investment_billions,
    acreage: r.acreage,
    primaryModels,
    communityImpact: r.community_impact,
    communityResistance: r.community_resistance === 1,
    gridRisk: r.grid_risk,
    renewablePercent: r.renewable_percent,
    notes: r.notes,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
};

export interface ListFilters {
  country?: string;
  state?: string;
  status?: DataCenterRow["status"];
  companyType?: DataCenterRow["company_type"];
  gridRisk?: NonNullable<DataCenterRow["grid_risk"]>;
  q?: string;
  limit?: number;
  offset?: number;
}

export const listDataCenters = async (
  env: Env,
  filters: ListFilters,
): Promise<{ items: DataCenter[]; total: number }> => {
  if (!env.DATA_DB) throw new Error("data_db_not_configured");
  const where: string[] = [];
  const binds: (string | number)[] = [];

  if (filters.country) {
    where.push("country = ?");
    binds.push(filters.country);
  }
  if (filters.state) {
    where.push("state = ?");
    binds.push(filters.state);
  }
  if (filters.status) {
    where.push("status = ?");
    binds.push(filters.status);
  }
  if (filters.companyType) {
    where.push("company_type = ?");
    binds.push(filters.companyType);
  }
  if (filters.gridRisk) {
    where.push("grid_risk = ?");
    binds.push(filters.gridRisk);
  }
  if (filters.q) {
    // Escape LIKE wildcards so literal % and _ in user input match literally.
    where.push(
      "(name LIKE ? ESCAPE '\\' OR company LIKE ? ESCAPE '\\' OR city LIKE ? ESCAPE '\\' OR state LIKE ? ESCAPE '\\')",
    );
    const escaped = filters.q.replace(/[%_\\]/g, "\\$&");
    const needle = `%${escaped}%`;
    binds.push(needle, needle, needle, needle);
  }

  const whereSql = where.length ? ` WHERE ${where.join(" AND ")}` : "";
  const limit = Math.min(Math.max(filters.limit ?? 200, 1), 1000);
  const offset = Math.max(filters.offset ?? 0, 0);

  const countStmt = env.DATA_DB.prepare(
    `SELECT COUNT(*) AS c FROM data_centers${whereSql}`,
  ).bind(...binds);
  const count = await countStmt.first<{ c: number }>();

  const listStmt = env.DATA_DB.prepare(
    `SELECT * FROM data_centers${whereSql}
     ORDER BY capacity_mw DESC NULLS LAST, name ASC
     LIMIT ? OFFSET ?`,
  ).bind(...binds, limit, offset);
  const rows = await listStmt.all<DataCenterRow>();

  return {
    items: (rows.results ?? []).map(rowToCenter),
    total: count?.c ?? 0,
  };
};

export const getDataCenterBySlug = async (
  env: Env,
  slug: string,
): Promise<DataCenter | null> => {
  if (!env.DATA_DB) throw new Error("data_db_not_configured");
  const row = await env.DATA_DB.prepare(
    "SELECT * FROM data_centers WHERE slug = ?",
  )
    .bind(slug)
    .first<DataCenterRow>();
  return row ? rowToCenter(row) : null;
};

export interface Stats {
  totalFacilities: number;
  operational: number;
  underConstruction: number;
  planned: number;
  totalCapacityMW: number;
  totalEstimatedGWh: number;
  totalWaterMillionGallons: number;
  byCountry: { country: string; count: number }[];
  byCompanyType: { companyType: string; count: number }[];
  byGridRisk: { gridRisk: string; count: number }[];
  topCompanies: { company: string; count: number; capacityMW: number }[];
}

/** Fields accepted from the admin API. Slug is derived server-side if absent. */
export interface DataCenterInput {
  slug?: string;
  name: string;
  company: string;
  companyType: DataCenterRow["company_type"];
  lat: number;
  lng: number;
  city: string;
  state: string;
  country?: string;
  capacityMW?: number | null;
  estimatedAnnualGWh?: number | null;
  waterUsageMillionGallons?: number | null;
  status: DataCenterRow["status"];
  yearOpened?: number | null;
  yearPlanned?: number | null;
  investmentBillions?: number | null;
  acreage?: number | null;
  primaryModels?: string[];
  communityImpact?: string | null;
  communityResistance?: boolean;
  gridRisk?: NonNullable<DataCenterRow["grid_risk"]> | null;
  renewablePercent?: number | null;
  notes?: string | null;
}

export type DataCenterPatch = Partial<DataCenterInput>;

/**
 * Slug from `${company}-${name}-${city}` lowercased, non-alphanumerics
 * collapsed to `-`. Matches the convention used by the seed migration so
 * admin-created rows look the same as curated ones.
 */
export const deriveSlug = (input: {
  company: string;
  name: string;
  city: string;
}): string => {
  const raw = `${input.company}-${input.name}-${input.city}`;
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 128);
};

const COLUMNS = [
  "slug",
  "name",
  "company",
  "company_type",
  "lat",
  "lng",
  "city",
  "state",
  "country",
  "capacity_mw",
  "estimated_annual_gwh",
  "water_usage_million_gallons",
  "status",
  "year_opened",
  "year_planned",
  "investment_billions",
  "acreage",
  "primary_models",
  "community_impact",
  "community_resistance",
  "grid_risk",
  "renewable_percent",
  "notes",
] as const;

const inputToRow = (input: DataCenterInput, slug: string) => ({
  slug,
  name: input.name,
  company: input.company,
  company_type: input.companyType,
  lat: input.lat,
  lng: input.lng,
  city: input.city,
  state: input.state,
  country: input.country ?? "USA",
  capacity_mw: input.capacityMW ?? null,
  estimated_annual_gwh: input.estimatedAnnualGWh ?? null,
  water_usage_million_gallons: input.waterUsageMillionGallons ?? null,
  status: input.status,
  year_opened: input.yearOpened ?? null,
  year_planned: input.yearPlanned ?? null,
  investment_billions: input.investmentBillions ?? null,
  acreage: input.acreage ?? null,
  primary_models: input.primaryModels ? JSON.stringify(input.primaryModels) : null,
  community_impact: input.communityImpact ?? null,
  community_resistance: input.communityResistance ? 1 : 0,
  grid_risk: input.gridRisk ?? null,
  renewable_percent: input.renewablePercent ?? null,
  notes: input.notes ?? null,
});

const CAMEL_TO_COLUMN: Record<keyof DataCenterInput, string> = {
  slug: "slug",
  name: "name",
  company: "company",
  companyType: "company_type",
  lat: "lat",
  lng: "lng",
  city: "city",
  state: "state",
  country: "country",
  capacityMW: "capacity_mw",
  estimatedAnnualGWh: "estimated_annual_gwh",
  waterUsageMillionGallons: "water_usage_million_gallons",
  status: "status",
  yearOpened: "year_opened",
  yearPlanned: "year_planned",
  investmentBillions: "investment_billions",
  acreage: "acreage",
  primaryModels: "primary_models",
  communityImpact: "community_impact",
  communityResistance: "community_resistance",
  gridRisk: "grid_risk",
  renewablePercent: "renewable_percent",
  notes: "notes",
};

export class DataCenterError extends Error {
  constructor(
    public code: "slug_conflict" | "not_found",
    message: string,
  ) {
    super(message);
    this.name = "DataCenterError";
  }
}

export const createDataCenter = async (
  env: Env,
  input: DataCenterInput,
): Promise<DataCenter> => {
  if (!env.DATA_DB) throw new Error("data_db_not_configured");
  const slug = input.slug?.trim() || deriveSlug(input);
  const row = inputToRow(input, slug);
  const placeholders = COLUMNS.map(() => "?").join(", ");
  const values = COLUMNS.map((c) => row[c as keyof typeof row]);

  try {
    await env.DATA_DB.prepare(
      `INSERT INTO data_centers (${COLUMNS.join(", ")}) VALUES (${placeholders})`,
    )
      .bind(...values)
      .run();
  } catch (err) {
    if (err instanceof Error && /UNIQUE constraint/i.test(err.message)) {
      throw new DataCenterError("slug_conflict", `slug '${slug}' already exists`);
    }
    throw err;
  }

  const created = await getDataCenterBySlug(env, slug);
  if (!created) throw new Error("create_race");
  return created;
};

export const updateDataCenter = async (
  env: Env,
  slug: string,
  patch: DataCenterPatch,
): Promise<DataCenter> => {
  if (!env.DATA_DB) throw new Error("data_db_not_configured");

  const sets: string[] = [];
  const binds: (string | number | null)[] = [];
  for (const [key, value] of Object.entries(patch) as [
    keyof DataCenterInput,
    unknown,
  ][]) {
    const col = CAMEL_TO_COLUMN[key];
    if (!col || col === "slug") continue; // slug is immutable by design
    sets.push(`${col} = ?`);
    if (key === "primaryModels") {
      binds.push(value == null ? null : JSON.stringify(value));
    } else if (key === "communityResistance") {
      binds.push(value ? 1 : 0);
    } else {
      binds.push(value as string | number | null);
    }
  }
  if (!sets.length) {
    const existing = await getDataCenterBySlug(env, slug);
    if (!existing) throw new DataCenterError("not_found", `slug '${slug}' not found`);
    return existing;
  }
  sets.push("updated_at = datetime('now')");

  const result = await env.DATA_DB.prepare(
    `UPDATE data_centers SET ${sets.join(", ")} WHERE slug = ?`,
  )
    .bind(...binds, slug)
    .run();

  if (result.meta?.changes === 0) {
    throw new DataCenterError("not_found", `slug '${slug}' not found`);
  }

  const updated = await getDataCenterBySlug(env, slug);
  if (!updated) throw new DataCenterError("not_found", `slug '${slug}' not found`);
  return updated;
};

export const deleteDataCenter = async (
  env: Env,
  slug: string,
): Promise<void> => {
  if (!env.DATA_DB) throw new Error("data_db_not_configured");
  const result = await env.DATA_DB.prepare(
    "DELETE FROM data_centers WHERE slug = ?",
  )
    .bind(slug)
    .run();
  if (result.meta?.changes === 0) {
    throw new DataCenterError("not_found", `slug '${slug}' not found`);
  }
};

export interface AuditEntry {
  id: number;
  action: "create" | "update" | "delete";
  slug: string;
  actor: string | null;
  payload: unknown;
  createdAt: string;
}

interface AuditRow {
  id: number;
  action: "create" | "update" | "delete";
  slug: string;
  actor: string | null;
  payload: string | null;
  created_at: string;
}

/**
 * Append a row to dc_audit_log. `actor` is a SHA-256 fingerprint of the
 * bearer token (never the token itself) so the log is useful without
 * leaking credentials.
 */
export const appendAudit = async (
  env: Env,
  entry: {
    action: "create" | "update" | "delete";
    slug: string;
    actor: string | null;
    payload: unknown;
  },
): Promise<void> => {
  if (!env.DATA_DB) return;
  await env.DATA_DB.prepare(
    "INSERT INTO dc_audit_log (action, slug, actor, payload) VALUES (?, ?, ?, ?)",
  )
    .bind(
      entry.action,
      entry.slug,
      entry.actor,
      entry.payload === undefined ? null : JSON.stringify(entry.payload),
    )
    .run();
};

export const listAudit = async (
  env: Env,
  limit = 50,
): Promise<AuditEntry[]> => {
  if (!env.DATA_DB) throw new Error("data_db_not_configured");
  const capped = Math.min(Math.max(limit, 1), 200);
  const rows = await env.DATA_DB.prepare(
    "SELECT * FROM dc_audit_log ORDER BY id DESC LIMIT ?",
  )
    .bind(capped)
    .all<AuditRow>();
  return (rows.results ?? []).map((r) => ({
    id: r.id,
    action: r.action,
    slug: r.slug,
    actor: r.actor,
    payload: r.payload ? safeJsonParse(r.payload) : null,
    createdAt: r.created_at,
  }));
};

const safeJsonParse = (s: string): unknown => {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
};

export const getStats = async (env: Env): Promise<Stats> => {
  if (!env.DATA_DB) throw new Error("data_db_not_configured");

  const totals = await env.DATA_DB.prepare(
    `SELECT
       COUNT(*)                                                          AS total,
       SUM(CASE WHEN status = 'operational'         THEN 1 ELSE 0 END)   AS operational,
       SUM(CASE WHEN status = 'under_construction'  THEN 1 ELSE 0 END)   AS underc,
       SUM(CASE WHEN status = 'planned'             THEN 1 ELSE 0 END)   AS planned,
       COALESCE(SUM(capacity_mw), 0)                                     AS mw,
       COALESCE(SUM(estimated_annual_gwh), 0)                            AS gwh,
       COALESCE(SUM(water_usage_million_gallons), 0)                     AS water
     FROM data_centers`,
  ).first<{
    total: number;
    operational: number;
    underc: number;
    planned: number;
    mw: number;
    gwh: number;
    water: number;
  }>();

  const country = await env.DATA_DB.prepare(
    `SELECT country, COUNT(*) AS c FROM data_centers GROUP BY country ORDER BY c DESC`,
  ).all<{ country: string; c: number }>();

  const compType = await env.DATA_DB.prepare(
    `SELECT company_type AS t, COUNT(*) AS c FROM data_centers GROUP BY company_type ORDER BY c DESC`,
  ).all<{ t: string; c: number }>();

  const grid = await env.DATA_DB.prepare(
    `SELECT COALESCE(grid_risk, 'unknown') AS g, COUNT(*) AS c FROM data_centers GROUP BY grid_risk ORDER BY c DESC`,
  ).all<{ g: string; c: number }>();

  const top = await env.DATA_DB.prepare(
    `SELECT company, COUNT(*) AS c, COALESCE(SUM(capacity_mw), 0) AS mw
     FROM data_centers GROUP BY company ORDER BY mw DESC LIMIT 8`,
  ).all<{ company: string; c: number; mw: number }>();

  return {
    totalFacilities: totals?.total ?? 0,
    operational: totals?.operational ?? 0,
    underConstruction: totals?.underc ?? 0,
    planned: totals?.planned ?? 0,
    totalCapacityMW: totals?.mw ?? 0,
    totalEstimatedGWh: totals?.gwh ?? 0,
    totalWaterMillionGallons: totals?.water ?? 0,
    byCountry: (country.results ?? []).map((r) => ({ country: r.country, count: r.c })),
    byCompanyType: (compType.results ?? []).map((r) => ({ companyType: r.t, count: r.c })),
    byGridRisk: (grid.results ?? []).map((r) => ({ gridRisk: r.g, count: r.c })),
    topCompanies: (top.results ?? []).map((r) => ({
      company: r.company,
      count: r.c,
      capacityMW: r.mw,
    })),
  };
};
