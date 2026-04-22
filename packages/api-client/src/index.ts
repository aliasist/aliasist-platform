import { z } from "zod";

/**
 * Typed client for the Aliasist unified API (services/workers-api).
 * Schemas are duplicated intentionally (tiny, stable shapes) so this package
 * doesn't import the worker and stays browser-safe. When the schemas grow,
 * promote them into @aliasist/types.
 */

export const HealthResponse = z.object({
  ok: z.literal(true),
  service: z.string(),
  version: z.string(),
  time: z.string(),
  upstreams: z.record(z.string(), z.enum(["ok", "degraded", "down", "unknown"])).optional(),
});
export type HealthResponse = z.infer<typeof HealthResponse>;

export const SIST_IDS = ["data", "eco", "pulse", "space", "tika"] as const;
export type SistId = (typeof SIST_IDS)[number];

export const AiExplainRequest = z.object({
  sist: z.enum(SIST_IDS),
  question: z.string().min(1).max(2000),
  context: z.record(z.string(), z.unknown()).optional(),
});
export type AiExplainRequest = z.infer<typeof AiExplainRequest>;

export const AiExplainResponse = z.object({
  answer: z.string(),
  model: z.string(),
  source: z.enum(["ollama", "groq", "fallback"]),
  latencyMs: z.number(),
});
export type AiExplainResponse = z.infer<typeof AiExplainResponse>;

// --- DataSist ---

export const DC_STATUSES = [
  "operational",
  "under_construction",
  "planned",
  "canceled",
] as const;
export const DC_COMPANY_TYPES = ["hyperscale", "colocation", "neocloud"] as const;
export const DC_GRID_RISKS = ["low", "medium", "high"] as const;

export const DataCenter = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string(),
  company: z.string(),
  companyType: z.enum(DC_COMPANY_TYPES),
  lat: z.number(),
  lng: z.number(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  capacityMW: z.number().nullable(),
  estimatedAnnualGWh: z.number().nullable(),
  waterUsageMillionGallons: z.number().nullable(),
  status: z.enum(DC_STATUSES),
  yearOpened: z.number().nullable(),
  yearPlanned: z.number().nullable(),
  investmentBillions: z.number().nullable(),
  acreage: z.number().nullable(),
  primaryModels: z.array(z.string()),
  communityImpact: z.string().nullable(),
  communityResistance: z.boolean(),
  gridRisk: z.enum(DC_GRID_RISKS).nullable(),
  renewablePercent: z.number().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type DataCenter = z.infer<typeof DataCenter>;

export const DataCenterList = z.object({
  items: z.array(DataCenter),
  total: z.number(),
  note: z.string().optional(),
});
export type DataCenterList = z.infer<typeof DataCenterList>;

export const DataCenterStats = z.object({
  totalFacilities: z.number(),
  operational: z.number(),
  underConstruction: z.number(),
  planned: z.number(),
  totalCapacityMW: z.number(),
  totalEstimatedGWh: z.number(),
  totalWaterMillionGallons: z.number(),
  byCountry: z.array(z.object({ country: z.string(), count: z.number() })),
  byCompanyType: z.array(
    z.object({ companyType: z.string(), count: z.number() }),
  ),
  byGridRisk: z.array(z.object({ gridRisk: z.string(), count: z.number() })),
  topCompanies: z.array(
    z.object({
      company: z.string(),
      count: z.number(),
      capacityMW: z.number(),
    }),
  ),
});
export type DataCenterStats = z.infer<typeof DataCenterStats>;

export interface ListDataCentersFilters {
  country?: string;
  state?: string;
  status?: (typeof DC_STATUSES)[number];
  companyType?: (typeof DC_COMPANY_TYPES)[number];
  gridRisk?: (typeof DC_GRID_RISKS)[number];
  q?: string;
  limit?: number;
  offset?: number;
}

/** Input for admin create. Slug is optional — worker derives it from company+name+city if missing. */
export const DataCenterInput = z.object({
  slug: z.string().optional(),
  name: z.string().min(1),
  company: z.string().min(1),
  companyType: z.enum(DC_COMPANY_TYPES),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().optional(),
  capacityMW: z.number().nonnegative().nullable().optional(),
  estimatedAnnualGWh: z.number().nonnegative().nullable().optional(),
  waterUsageMillionGallons: z.number().nonnegative().nullable().optional(),
  status: z.enum(DC_STATUSES),
  yearOpened: z.number().int().nullable().optional(),
  yearPlanned: z.number().int().nullable().optional(),
  investmentBillions: z.number().nonnegative().nullable().optional(),
  acreage: z.number().nonnegative().nullable().optional(),
  primaryModels: z.array(z.string()).optional(),
  communityImpact: z.string().nullable().optional(),
  communityResistance: z.boolean().optional(),
  gridRisk: z.enum(DC_GRID_RISKS).nullable().optional(),
  renewablePercent: z.number().min(0).max(100).nullable().optional(),
  notes: z.string().nullable().optional(),
});
export type DataCenterInput = z.infer<typeof DataCenterInput>;

export const DataCenterPatch = DataCenterInput.partial();
export type DataCenterPatch = z.infer<typeof DataCenterPatch>;

export const AuditEntry = z.object({
  id: z.number(),
  action: z.enum(["create", "update", "delete"]),
  slug: z.string(),
  actor: z.string().nullable(),
  payload: z.unknown(),
  createdAt: z.string(),
});
export type AuditEntry = z.infer<typeof AuditEntry>;

export const AuditList = z.object({ items: z.array(AuditEntry) });
export type AuditList = z.infer<typeof AuditList>;

// --- Client ---

export interface ClientOptions {
  baseUrl: string;
  fetchImpl?: typeof fetch;
  /** Optional bearer token for privileged routes. */
  token?: string | (() => string | null);
}

export class AliasistApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body?: unknown,
  ) {
    super(`Aliasist API ${status} ${statusText}`);
    this.name = "AliasistApiError";
  }
}

const buildQuery = (params: Record<string, unknown>): string => {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
};

export const createClient = ({ baseUrl, fetchImpl, token }: ClientOptions) => {
  const fx = fetchImpl ?? fetch;
  const resolveToken = () => (typeof token === "function" ? token() : token);

  const request = async <T>(
    path: string,
    init: RequestInit,
    schema: z.ZodSchema<T>,
  ): Promise<T> => {
    const headers = new Headers(init.headers);
    const t = resolveToken();
    if (t) headers.set("Authorization", `Bearer ${t}`);
    headers.set("Accept", "application/json");
    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    const res = await fx(`${baseUrl}${path}`, { ...init, headers });
    const text = await res.text();
    let json: unknown = null;
    if (text) {
      try {
        json = JSON.parse(text);
      } catch {
        // non-JSON body (HTML error page, plain-text upstream error, etc.)
      }
    }
    if (!res.ok) {
      throw new AliasistApiError(res.status, res.statusText, json ?? text);
    }
    return schema.parse(json);
  };

  return {
    health: () => request("/health", { method: "GET" }, HealthResponse),

    aiExplain: (body: AiExplainRequest) =>
      request(
        "/ai/explain",
        { method: "POST", body: JSON.stringify(AiExplainRequest.parse(body)) },
        AiExplainResponse,
      ),

    listDataCenters: (filters: ListDataCentersFilters = {}) =>
      request(
        `/data/data-centers${buildQuery(filters as Record<string, unknown>)}`,
        { method: "GET" },
        DataCenterList,
      ),

    getDataCenter: (slug: string) =>
      request(
        `/data/data-centers/${encodeURIComponent(slug)}`,
        { method: "GET" },
        DataCenter,
      ),

    getDataCenterStats: () =>
      request("/data/stats", { method: "GET" }, DataCenterStats),

    // --- admin (requires bearer token) ---

    createDataCenter: (body: DataCenterInput) =>
      request(
        "/data/data-centers",
        { method: "POST", body: JSON.stringify(DataCenterInput.parse(body)) },
        DataCenter,
      ),

    updateDataCenter: (slug: string, body: DataCenterPatch) =>
      request(
        `/data/data-centers/${encodeURIComponent(slug)}`,
        { method: "PUT", body: JSON.stringify(DataCenterPatch.parse(body)) },
        DataCenter,
      ),

    deleteDataCenter: (slug: string) =>
      request(
        `/data/data-centers/${encodeURIComponent(slug)}`,
        { method: "DELETE" },
        z.object({ ok: z.literal(true) }),
      ),

    listAudit: (limit = 50) =>
      request(
        `/data/audit?limit=${limit}`,
        { method: "GET" },
        AuditList,
      ),
  };
};

export type AliasistClient = ReturnType<typeof createClient>;
