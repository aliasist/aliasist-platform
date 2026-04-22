import { Hono } from "hono";
import type { Env } from "../env";

export const eco = new Hono<{ Bindings: Env }>();

/**
 * EcoSist gateway — fans out to free public earth-science APIs and
 * normalizes the responses so the browser never has to know where a
 * signal came from. All upstream calls are edge-cached so a single
 * burst of traffic doesn't hammer NWS / USGS / NASA / NOAA.
 */

const UA = "aliasist-ecosist/1.0 (+https://aliasist.tech)";

const nwsHeaders = {
  Accept: "application/geo+json",
  "User-Agent": UA,
};

const pickNumber = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

const safeString = (v: unknown, max = 512): string | null => {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed ? trimmed.slice(0, max) : null;
};

const cached = (ttl: number) =>
  ({ cf: { cacheTtl: ttl, cacheEverything: true } } as RequestInit);

/** GET /eco/forecast?lat=&lng= — Open-Meteo current + 7-day. */
eco.get("/forecast", async (c) => {
  const lat = c.req.query("lat");
  const lng = c.req.query("lng") ?? c.req.query("lon");
  if (!lat || !lng) return c.json({ error: "lat_lng_required" }, 400);
  if (!Number.isFinite(+lat) || !Number.isFinite(+lng)) {
    return c.json({ error: "lat_lng_invalid" }, 400);
  }

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", lat);
  url.searchParams.set("longitude", lng);
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,precipitation",
  );
  url.searchParams.set(
    "daily",
    "temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,weather_code",
  );
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "7");

  const res = await fetch(url, cached(300));
  if (!res.ok) return c.json({ error: "upstream_error", status: res.status }, 502);
  const data = (await res.json()) as Record<string, unknown>;
  return c.json({ source: "open-meteo", data });
});

/**
 * GET /eco/alerts?area=OK — active NWS alerts normalized to a flat shape.
 * Accepts a two-letter state/territory code, or lat/lng for a point query.
 */
eco.get("/alerts", async (c) => {
  const area = c.req.query("area");
  const lat = c.req.query("lat");
  const lng = c.req.query("lng");

  const upstream = new URL("https://api.weather.gov/alerts/active");
  if (area) {
    if (!/^[A-Z]{2}$/.test(area)) {
      return c.json({ error: "area_invalid" }, 400);
    }
    upstream.searchParams.set("area", area);
  } else if (lat && lng) {
    if (!Number.isFinite(+lat) || !Number.isFinite(+lng)) {
      return c.json({ error: "lat_lng_invalid" }, 400);
    }
    upstream.searchParams.set("point", `${lat},${lng}`);
  } else {
    upstream.searchParams.set("area", "US");
  }

  const res = await fetch(upstream, { ...cached(60), headers: nwsHeaders });
  if (!res.ok) return c.json({ error: "upstream_error", status: res.status }, 502);
  const body = (await res.json()) as { features?: NwsAlertFeature[] };
  const items = (body.features ?? [])
    .map(normalizeNwsAlert)
    .filter((a): a is NormalizedAlert => a !== null);
  return c.json({ source: "nws", count: items.length, items });
});

/** GET /eco/earthquakes?minMag=2.5&days=7 — USGS summary feed, normalized. */
eco.get("/earthquakes", async (c) => {
  const minMag = Number(c.req.query("minMag") ?? "2.5");
  const days = Number(c.req.query("days") ?? "7");
  if (!Number.isFinite(minMag) || minMag < 0 || minMag > 10) {
    return c.json({ error: "minMag_invalid" }, 400);
  }
  if (!Number.isFinite(days) || days < 1 || days > 30) {
    return c.json({ error: "days_invalid" }, 400);
  }
  const feed = pickUsgsFeed(minMag, days);
  if (!feed) return c.json({ error: "feed_unavailable" }, 400);

  const res = await fetch(feed, cached(120));
  if (!res.ok) return c.json({ error: "upstream_error", status: res.status }, 502);
  const body = (await res.json()) as { features?: UsgsQuakeFeature[] };
  const items = (body.features ?? [])
    .map(normalizeUsgsQuake)
    .filter((q): q is NormalizedQuake => q !== null)
    .filter((q) => q.magnitude >= minMag);
  return c.json({ source: "usgs", count: items.length, items });
});

/** GET /eco/events?category= — NASA EONET live natural events. */
eco.get("/events", async (c) => {
  const category = c.req.query("category");
  const days = c.req.query("days") ?? "7";
  if (!/^\d{1,3}$/.test(days)) return c.json({ error: "days_invalid" }, 400);

  const upstream = new URL("https://eonet.gsfc.nasa.gov/api/v3/events");
  upstream.searchParams.set("status", "open");
  upstream.searchParams.set("days", days);
  if (category) {
    if (!/^[a-zA-Z]{3,32}$/.test(category)) {
      return c.json({ error: "category_invalid" }, 400);
    }
    upstream.searchParams.set("category", category);
  }

  const res = await fetch(upstream, cached(300));
  if (!res.ok) return c.json({ error: "upstream_error", status: res.status }, 502);
  const body = (await res.json()) as { events?: EonetEvent[] };
  const items = (body.events ?? [])
    .map(normalizeEonetEvent)
    .filter((e): e is NormalizedEvent => e !== null);
  return c.json({ source: "nasa-eonet", count: items.length, items });
});

/** GET /eco/space-weather — NOAA SWPC Kp index + planetary K. */
eco.get("/space-weather", async (c) => {
  const res = await fetch(
    "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json",
    cached(300),
  );
  if (!res.ok) return c.json({ error: "upstream_error", status: res.status }, 502);
  const raw = (await res.json()) as unknown;
  const rows = parseKpFeed(raw);
  const latest = rows[rows.length - 1] ?? null;
  return c.json({
    source: "noaa-swpc",
    latest,
    history: rows.slice(-24),
  });
});

/**
 * NOAA SWPC has shipped the planetary-k-index feed as both array-of-arrays
 * (`[[headers], [row], ...]`) and array-of-objects
 * (`[{time_tag, Kp, a_running, station_count}, ...]`) at different points
 * in time. Support both shapes so we don't silently flatline if they flip
 * it again.
 */
export interface KpRow {
  time: string | null;
  kpIndex: number | null;
  aRunning: number | null;
  stationCount: number | null;
}

export const parseKpFeed = (raw: unknown): KpRow[] => {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  const first = raw[0];
  const isObject =
    first !== null && typeof first === "object" && !Array.isArray(first);
  if (isObject) {
    return (raw as Record<string, unknown>[]).map((r) => ({
      time: safeString(r["time_tag"], 32),
      kpIndex: pickNumber(Number(r["Kp"] ?? r["kp_index"] ?? r["kp"])),
      aRunning: pickNumber(Number(r["a_running"])),
      stationCount: pickNumber(Number(r["station_count"])),
    }));
  }
  return (raw as unknown[][]).slice(1).map((r) => ({
    time: safeString(r[0], 32),
    kpIndex: pickNumber(Number(r[1])),
    aRunning: pickNumber(Number(r[2])),
    stationCount: pickNumber(Number(r[3])),
  }));
};

/**
 * GET /eco/signals — aggregated "what's happening on Earth right now"
 * feed. Fans out to alerts + earthquakes + EONET in parallel; if any one
 * upstream is down, that section returns an error marker but the
 * response as a whole still 200s.
 */
eco.get("/signals", async (c) => {
  const state = (c.req.query("area") ?? "US").toUpperCase();
  const [alerts, quakes, events, kp] = await Promise.all([
    safeFetch<NwsAlertFeature>(
      `https://api.weather.gov/alerts/active?area=${encodeURIComponent(state)}`,
      { ...cached(60), headers: nwsHeaders },
      "features",
    ),
    safeFetch<UsgsQuakeFeature>(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson",
      cached(120),
      "features",
    ),
    safeFetch<EonetEvent>(
      "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&days=7",
      cached(300),
      "events",
    ),
    fetch(
      "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json",
      cached(300),
    )
      .then((r) => (r.ok ? (r.json() as Promise<unknown>) : null))
      .catch(() => null),
  ]);

  const kpRows = kp ? parseKpFeed(kp) : [];
  const kpLatest = kpRows[kpRows.length - 1] ?? null;

  return c.json({
    alerts: alerts
      .map(normalizeNwsAlert)
      .filter((a): a is NormalizedAlert => a !== null)
      .slice(0, 50),
    earthquakes: quakes
      .map(normalizeUsgsQuake)
      .filter((q): q is NormalizedQuake => q !== null)
      .slice(0, 30),
    events: events
      .map(normalizeEonetEvent)
      .filter((e): e is NormalizedEvent => e !== null)
      .slice(0, 30),
    spaceWeather: kpLatest
      ? { time: kpLatest.time, kpIndex: kpLatest.kpIndex }
      : null,
    generatedAt: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// Normalizers — keep external API shapes at the edge of the worker only.
// ---------------------------------------------------------------------------

interface NwsAlertFeature {
  id?: string;
  properties?: Record<string, unknown>;
  geometry?: unknown;
}

export interface NormalizedAlert {
  id: string;
  event: string;
  severity: string | null;
  urgency: string | null;
  certainty: string | null;
  headline: string | null;
  areaDesc: string | null;
  sent: string | null;
  effective: string | null;
  expires: string | null;
  description: string | null;
  instruction: string | null;
  senderName: string | null;
  geometry: unknown;
}

export const normalizeNwsAlert = (f: NwsAlertFeature): NormalizedAlert | null => {
  const id = safeString(f.id, 256);
  const p = f.properties ?? {};
  const event = safeString(p["event"], 128);
  if (!id || !event) return null;
  return {
    id,
    event,
    severity: safeString(p["severity"], 32),
    urgency: safeString(p["urgency"], 32),
    certainty: safeString(p["certainty"], 32),
    headline: safeString(p["headline"], 512),
    areaDesc: safeString(p["areaDesc"], 2048),
    sent: safeString(p["sent"], 64),
    effective: safeString(p["effective"], 64),
    expires: safeString(p["expires"], 64),
    description: safeString(p["description"], 4000),
    instruction: safeString(p["instruction"], 2000),
    senderName: safeString(p["senderName"], 256),
    geometry: f.geometry ?? null,
  };
};

interface UsgsQuakeFeature {
  id?: string;
  properties?: Record<string, unknown>;
  geometry?: { coordinates?: unknown };
}

export interface NormalizedQuake {
  id: string;
  magnitude: number;
  place: string | null;
  time: number | null;
  url: string | null;
  tsunami: boolean;
  status: string | null;
  lat: number;
  lng: number;
  depth: number | null;
  alert: string | null;
}

export const normalizeUsgsQuake = (
  f: UsgsQuakeFeature,
): NormalizedQuake | null => {
  const id = safeString(f.id, 128);
  const p = f.properties ?? {};
  const mag = pickNumber(p["mag"]);
  const coords = Array.isArray(f.geometry?.coordinates)
    ? (f.geometry?.coordinates as unknown[])
    : null;
  const lng = coords ? pickNumber(coords[0]) : null;
  const lat = coords ? pickNumber(coords[1]) : null;
  const depth = coords ? pickNumber(coords[2]) : null;
  if (!id || mag === null || lat === null || lng === null) return null;
  return {
    id,
    magnitude: mag,
    place: safeString(p["place"], 256),
    time: pickNumber(p["time"]),
    url: safeString(p["url"], 512),
    tsunami: p["tsunami"] === 1 || p["tsunami"] === true,
    status: safeString(p["status"], 32),
    lat,
    lng,
    depth,
    alert: safeString(p["alert"], 32),
  };
};

interface EonetEvent {
  id?: string;
  title?: string;
  description?: string;
  link?: string;
  categories?: { id?: string; title?: string }[];
  sources?: { id?: string; url?: string }[];
  geometry?: { date?: string; type?: string; coordinates?: unknown }[];
}

export interface NormalizedEvent {
  id: string;
  title: string;
  description: string | null;
  link: string | null;
  category: string | null;
  source: string | null;
  date: string | null;
  lat: number | null;
  lng: number | null;
}

export const normalizeEonetEvent = (e: EonetEvent): NormalizedEvent | null => {
  const id = safeString(e.id, 128);
  const title = safeString(e.title, 512);
  if (!id || !title) return null;
  const latestGeom = e.geometry?.at(-1);
  const coords = Array.isArray(latestGeom?.coordinates)
    ? (latestGeom?.coordinates as unknown[])
    : null;
  const lng = coords && coords.length >= 2 ? pickNumber(coords[0]) : null;
  const lat = coords && coords.length >= 2 ? pickNumber(coords[1]) : null;
  return {
    id,
    title,
    description: safeString(e.description, 2000),
    link: safeString(e.link, 512),
    category: safeString(e.categories?.[0]?.title, 64),
    source: safeString(e.sources?.[0]?.id, 64),
    date: safeString(latestGeom?.date, 64),
    lat,
    lng,
  };
};

const pickUsgsFeed = (minMag: number, days: number): string | null => {
  const magBucket =
    minMag >= 4.5
      ? "4.5"
      : minMag >= 2.5
        ? "2.5"
        : minMag >= 1.0
          ? "1.0"
          : "all";
  const dayBucket = days <= 1 ? "day" : days <= 7 ? "week" : "month";
  return `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${magBucket}_${dayBucket}.geojson`;
};

const safeFetch = async <T>(
  url: string,
  init: RequestInit,
  key: string,
): Promise<T[]> => {
  try {
    const r = await fetch(url, init);
    if (!r.ok) return [];
    const body = (await r.json()) as Record<string, unknown>;
    const value = body[key];
    return Array.isArray(value) ? (value as T[]) : [];
  } catch {
    return [];
  }
};
