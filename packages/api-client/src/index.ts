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

export const SIST_IDS = ["data", "eco", "pulse", "space"] as const;
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

// --- SpaceSist ---

export const SpaceAskRequest = z.object({
  question: z.string().min(1).max(4000),
  topK: z.number().int().min(1).max(8).optional(),
});
export type SpaceAskRequest = z.infer<typeof SpaceAskRequest>;

export const SpaceAskResponse = z.object({
  answer: z.string(),
  model: z.string(),
  source: z.enum(["ollama", "workers-ai", "gemini", "local-rag"]),
  latencyMs: z.number(),
  chunks: z.array(
    z.object({
      id: z.string(),
      source: z.string(),
      score: z.number(),
      text: z.string(),
      metadata: z.record(z.string(), z.unknown()),
    }),
  ),
});
export type SpaceAskResponse = z.infer<typeof SpaceAskResponse>;

/** Worker introspection for Space RAG — safe for production (no secrets). */
export const SpaceRagStatus = z.object({
  generatedAt: z.string(),
  corpusDocuments: z.number(),
  chunkCount: z.number(),
  retrievalMode: z.enum(["keyword", "semantic"]),
  semanticEmbeddingsReady: z.boolean(),
  embeddingGatewayConfigured: z.boolean(),
  providers: z.object({
    ollamaChat: z.boolean(),
    workersAi: z.boolean(),
    gemini: z.boolean(),
  }),
});
export type SpaceRagStatus = z.infer<typeof SpaceRagStatus>;

export const SpaceApod = z.object({
  source: z.string(),
  title: z.string(),
  date: z.string(),
  explanation: z.string(),
  imageUrl: z.string(),
  hdUrl: z.string().nullable(),
  mediaType: z.string(),
  copyright: z.string().nullable(),
});
export type SpaceApod = z.infer<typeof SpaceApod>;

export const SpaceIss = z.object({
  source: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  altitudeKm: z.number().nullable(),
  velocityKmh: z.number().nullable(),
  dayNight: z.enum(["day", "night", "terminator"]),
  timestamp: z.string(),
});
export type SpaceIss = z.infer<typeof SpaceIss>;

export const SpacePerson = z.object({
  name: z.string(),
  craft: z.string(),
  agency: z.string(),
  countryCode: z.string(),
});
export type SpacePerson = z.infer<typeof SpacePerson>;

export const SpacePeople = z.object({
  source: z.string(),
  count: z.number(),
  people: z.array(SpacePerson),
});
export type SpacePeople = z.infer<typeof SpacePeople>;

export const SpaceNextLaunch = z.object({
  source: z.string(),
  mission: z.string(),
  rocket: z.string(),
  launchIso: z.string(),
  site: z.string(),
  status: z.enum(["go", "hold", "tbd", "success", "scrubbed"]),
  webcastLabel: z.string(),
  webcastUrl: z.string(),
  windowSummary: z.string(),
  details: z.string().nullable(),
  flightNumber: z.number().nullable(),
  patchImageUrl: z.string().nullable(),
});
export type SpaceNextLaunch = z.infer<typeof SpaceNextLaunch>;

export const SpaceWeatherEvent = z.object({
  id: z.string(),
  source: z.string(),
  kind: z.enum(["flare", "geomagnetic-storm", "cme"]),
  title: z.string(),
  startTime: z.string(),
  endTime: z.string().nullable(),
  peakTime: z.string().nullable(),
  severity: z.string().nullable(),
  score: z.number().nullable(),
  location: z.string().nullable(),
  note: z.string().nullable(),
  linkedEventIds: z.array(z.string()),
});
export type SpaceWeatherEvent = z.infer<typeof SpaceWeatherEvent>;

export const SpaceWeatherEventList = z.object({
  source: z.string(),
  generatedAt: z.string(),
  count: z.number(),
  items: z.array(SpaceWeatherEvent),
});
export type SpaceWeatherEventList = z.infer<typeof SpaceWeatherEventList>;

export const SpaceWeatherEventDetail = z.object({
  source: z.string(),
  item: SpaceWeatherEvent,
});
export type SpaceWeatherEventDetail = z.infer<typeof SpaceWeatherEventDetail>;

export const SpaceWeatherSummary = z.object({
  source: z.string(),
  generatedAt: z.string(),
  status: z.enum(["quiet", "watch", "active"]),
  latestHeadline: z.string().nullable(),
  strongestFlareClass: z.string().nullable(),
  maxKpIndex: z.number().nullable(),
  latestCmeSpeedKms: z.number().nullable(),
  eventCounts: z.object({
    flares: z.number(),
    geomagneticStorms: z.number(),
    cmes: z.number(),
  }),
});
export type SpaceWeatherSummary = z.infer<typeof SpaceWeatherSummary>;

export const SpaceTargetLookupItem = z.object({
  id: z.string(),
  name: z.string(),
  objectType: z.string(),
  primaryDesignation: z.string().nullable(),
  spkId: z.string(),
  aliases: z.array(z.string()),
});
export type SpaceTargetLookupItem = z.infer<typeof SpaceTargetLookupItem>;

export const SpaceTargetLookupResponse = z.object({
  source: z.string(),
  query: z.string(),
  count: z.number(),
  items: z.array(SpaceTargetLookupItem),
});
export type SpaceTargetLookupResponse = z.infer<typeof SpaceTargetLookupResponse>;

export const SpaceTargetEphemerisRow = z.object({
  time: z.string(),
  ra: z.string(),
  dec: z.string(),
  apparentMagnitude: z.number().nullable(),
  distanceAu: z.number().nullable(),
  deltaDotKms: z.number().nullable(),
  raw: z.string(),
});
export type SpaceTargetEphemerisRow = z.infer<typeof SpaceTargetEphemerisRow>;

export const SpaceTargetEphemeris = z.object({
  source: z.string(),
  target: z.object({
    id: z.string(),
    name: z.string(),
  }),
  center: z.object({
    code: z.string(),
    bodyName: z.string(),
    siteName: z.string(),
  }),
  startTime: z.string(),
  stopTime: z.string(),
  stepSize: z.string(),
  rowCount: z.number(),
  rows: z.array(SpaceTargetEphemerisRow),
  summary: z.object({
    firstTime: z.string().nullable(),
    lastTime: z.string().nullable(),
    brightestMagnitude: z.number().nullable(),
    closestDistanceAu: z.number().nullable(),
    fastestRangeRateKms: z.number().nullable(),
  }),
});
export type SpaceTargetEphemeris = z.infer<typeof SpaceTargetEphemeris>;

export const SpaceObservationItem = z.object({
  obsId: z.string(),
  obsTitle: z.string(),
  collection: z.string(),
  instrument: z.string(),
  targetName: z.string(),
  dataProductType: z.string(),
  accessUrl: z.string().nullable(),
  accessFormat: z.string().nullable(),
  previewUrl: z.string().nullable(),
  observationTime: z.string().nullable(),
  isVisual: z.boolean(),
});
export type SpaceObservationItem = z.infer<typeof SpaceObservationItem>;

export const SpaceObservationSearchResponse = z.object({
  source: z.string(),
  query: z.string(),
  resolvedName: z.string().nullable(),
  ra: z.number().nullable(),
  dec: z.number().nullable(),
  radius: z.number(),
  count: z.number(),
  items: z.array(SpaceObservationItem),
});
export type SpaceObservationSearchResponse = z.infer<typeof SpaceObservationSearchResponse>;

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

export const DataCenterOverview = z.object({
  generatedAt: z.string(),
  dataset: z.object({
    totalFacilities: z.number(),
    totalCapacityMW: z.number(),
    newestUpdatedAt: z.string().nullable(),
    oldestUpdatedAt: z.string().nullable(),
  }),
  freshness: z.object({
    freshCount: z.number(),
    agingCount: z.number(),
    staleCount: z.number(),
    freshWindowHours: z.number(),
    staleWindowHours: z.number(),
  }),
  provenance: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      reliability: z.enum(["high", "medium", "low"]),
    }),
  ),
});
export type DataCenterOverview = z.infer<typeof DataCenterOverview>;

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

// --- EcoSist ---

export const EcoAlert = z.object({
  id: z.string(),
  event: z.string(),
  severity: z.string().nullable(),
  urgency: z.string().nullable(),
  certainty: z.string().nullable(),
  headline: z.string().nullable(),
  areaDesc: z.string().nullable(),
  sent: z.string().nullable(),
  effective: z.string().nullable(),
  expires: z.string().nullable(),
  description: z.string().nullable(),
  instruction: z.string().nullable(),
  senderName: z.string().nullable(),
  geometry: z.unknown(),
});
export type EcoAlert = z.infer<typeof EcoAlert>;

export const EcoAlertList = z.object({
  source: z.string(),
  count: z.number(),
  items: z.array(EcoAlert),
});
export type EcoAlertList = z.infer<typeof EcoAlertList>;

export const EcoQuake = z.object({
  id: z.string(),
  magnitude: z.number(),
  place: z.string().nullable(),
  time: z.number().nullable(),
  url: z.string().nullable(),
  tsunami: z.boolean(),
  status: z.string().nullable(),
  lat: z.number(),
  lng: z.number(),
  depth: z.number().nullable(),
  alert: z.string().nullable(),
});
export type EcoQuake = z.infer<typeof EcoQuake>;

export const EcoQuakeList = z.object({
  source: z.string(),
  count: z.number(),
  items: z.array(EcoQuake),
});
export type EcoQuakeList = z.infer<typeof EcoQuakeList>;

export const EcoEvent = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  link: z.string().nullable(),
  category: z.string().nullable(),
  source: z.string().nullable(),
  date: z.string().nullable(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
});
export type EcoEvent = z.infer<typeof EcoEvent>;

export const EcoEventList = z.object({
  source: z.string(),
  count: z.number(),
  items: z.array(EcoEvent),
});
export type EcoEventList = z.infer<typeof EcoEventList>;

export const EcoSpaceWeather = z.object({
  source: z.string(),
  latest: z
    .object({
      time: z.string().nullable(),
      kpIndex: z.number().nullable(),
      aRunning: z.number().nullable(),
      stationCount: z.number().nullable(),
    })
    .nullable(),
  history: z.array(
    z.object({
      time: z.string().nullable(),
      kpIndex: z.number().nullable(),
      aRunning: z.number().nullable(),
      stationCount: z.number().nullable(),
    }),
  ),
});
export type EcoSpaceWeather = z.infer<typeof EcoSpaceWeather>;

export const EcoSignals = z.object({
  alerts: z.array(EcoAlert),
  earthquakes: z.array(EcoQuake),
  events: z.array(EcoEvent),
  spaceWeather: z
    .object({ time: z.string().nullable(), kpIndex: z.number().nullable() })
    .nullable(),
  generatedAt: z.string(),
});
export type EcoSignals = z.infer<typeof EcoSignals>;

export const EcoForecast = z.object({
  source: z.string(),
  data: z.record(z.string(), z.unknown()),
});
export type EcoForecast = z.infer<typeof EcoForecast>;

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

    spaceAsk: (body: SpaceAskRequest) =>
      request(
        "/space/ask",
        { method: "POST", body: JSON.stringify(SpaceAskRequest.parse(body)) },
        SpaceAskResponse,
      ),

    spaceRagStatus: () =>
      request("/space/rag/status", { method: "GET" }, SpaceRagStatus),

    spaceApod: () => request("/space/apod", { method: "GET" }, SpaceApod),

    spaceIss: () => request("/space/iss", { method: "GET" }, SpaceIss),

    spacePeople: () => request("/space/people", { method: "GET" }, SpacePeople),

    spaceNextLaunch: () =>
      request("/space/launches/next", { method: "GET" }, SpaceNextLaunch),

    spaceWeatherSummary: () =>
      request("/space/weather/summary", { method: "GET" }, SpaceWeatherSummary),

    spaceWeatherEvents: () =>
      request("/space/weather/events", { method: "GET" }, SpaceWeatherEventList),

    spaceWeatherEvent: (id: string) =>
      request(`/space/weather/events/${encodeURIComponent(id)}`, { method: "GET" }, SpaceWeatherEventDetail),

    spaceTargetLookup: (query: string, group?: string) =>
      request(
        `/space/targets/lookup${buildQuery({ q: query, group })}`,
        { method: "GET" },
        SpaceTargetLookupResponse,
      ),

    spaceTargetEphemeris: (id: string, opts: { days?: number; stepHours?: number } = {}) =>
      request(
        `/space/targets/${encodeURIComponent(id)}/ephemeris${buildQuery(opts)}`,
        { method: "GET" },
        SpaceTargetEphemeris,
      ),

    spaceObservationSearch: (query: string, opts: { radius?: number; limit?: number } = {}) =>
      request(
        `/space/observations/search${buildQuery({ q: query, ...opts })}`,
        { method: "GET" },
        SpaceObservationSearchResponse,
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

    getDataCenterOverview: () =>
      request("/data/overview", { method: "GET" }, DataCenterOverview),

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

    // --- EcoSist ---

    ecoForecast: (lat: number, lng: number) =>
      request(
        `/eco/forecast${buildQuery({ lat, lng })}`,
        { method: "GET" },
        EcoForecast,
      ),

    ecoAlerts: (opts: { area?: string; lat?: number; lng?: number } = {}) =>
      request(
        `/eco/alerts${buildQuery(opts as Record<string, unknown>)}`,
        { method: "GET" },
        EcoAlertList,
      ),

    ecoEarthquakes: (opts: { minMag?: number; days?: number } = {}) =>
      request(
        `/eco/earthquakes${buildQuery(opts as Record<string, unknown>)}`,
        { method: "GET" },
        EcoQuakeList,
      ),

    ecoEvents: (opts: { category?: string; days?: number } = {}) =>
      request(
        `/eco/events${buildQuery(opts as Record<string, unknown>)}`,
        { method: "GET" },
        EcoEventList,
      ),

    ecoSpaceWeather: () =>
      request("/eco/space-weather", { method: "GET" }, EcoSpaceWeather),

    ecoSignals: (area = "US") =>
      request(`/eco/signals${buildQuery({ area })}`, { method: "GET" }, EcoSignals),
  };
};

export type AliasistClient = ReturnType<typeof createClient>;
