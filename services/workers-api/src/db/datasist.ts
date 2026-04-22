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
    where.push("(name LIKE ? OR company LIKE ? OR city LIKE ? OR state LIKE ?)");
    const needle = `%${filters.q}%`;
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
