import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeHarness } from "./helpers";

/**
 * EcoSist route tests — all upstream HTTP is stubbed via vi.stubGlobal("fetch")
 * so tests are deterministic and don't hit NWS/USGS/NASA/NOAA. Each test
 * installs exactly the responses it expects the handler to consume.
 */

type StubMap = Record<string, () => Response>;

const matchUrl = (url: string, stubs: StubMap): (() => Response) | null => {
  for (const [needle, factory] of Object.entries(stubs)) {
    if (url.includes(needle)) return factory;
  }
  return null;
};

const stubFetch = (stubs: StubMap) => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      const f = matchUrl(url, stubs);
      if (f) return f();
      return new Response("unstubbed", { status: 599 });
    }),
  );
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

beforeEach(() => vi.restoreAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe("GET /eco/forecast", () => {
  it("400 when lat/lng missing", async () => {
    const { request } = makeHarness();
    const res = await request("/eco/forecast");
    expect(res.status).toBe(400);
  });

  it("400 when lat/lng are not numbers", async () => {
    const { request } = makeHarness();
    const res = await request("/eco/forecast?lat=abc&lng=xyz");
    expect(res.status).toBe(400);
  });

  it("proxies Open-Meteo and returns source + data", async () => {
    stubFetch({
      "api.open-meteo.com": () =>
        json({
          current: { temperature_2m: 72.1 },
          daily: { time: ["2025-01-01"] },
        }),
    });
    const { request } = makeHarness();
    const res = await request("/eco/forecast?lat=40.44&lng=-79.99");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { source: string; data: unknown };
    expect(body.source).toBe("open-meteo");
    expect(body.data).toBeTruthy();
  });

  it("502 when upstream fails", async () => {
    stubFetch({
      "api.open-meteo.com": () => new Response("oops", { status: 500 }),
    });
    const { request } = makeHarness();
    const res = await request("/eco/forecast?lat=40&lng=-80");
    expect(res.status).toBe(502);
  });
});

describe("GET /eco/alerts", () => {
  it("rejects malformed area codes", async () => {
    const { request } = makeHarness();
    const res = await request("/eco/alerts?area=longname");
    expect(res.status).toBe(400);
  });

  it("normalizes NWS alert features", async () => {
    stubFetch({
      "api.weather.gov/alerts/active": () =>
        json({
          features: [
            {
              id: "urn:oid:1",
              geometry: {
                type: "Polygon",
                coordinates: [
                  [
                    [-100, 35],
                    [-99, 35],
                    [-99, 36],
                    [-100, 36],
                  ],
                ],
              },
              properties: {
                event: "Tornado Warning",
                severity: "Extreme",
                urgency: "Immediate",
                certainty: "Observed",
                headline: "TORNADO WARNING issued",
                areaDesc: "Canadian County, OK",
                sent: "2025-04-01T00:00:00Z",
                effective: "2025-04-01T00:00:00Z",
                expires: "2025-04-01T01:00:00Z",
                senderName: "NWS Norman",
              },
            },
            // bad row — no event — must be dropped
            { id: "urn:oid:2", properties: {} },
          ],
        }),
    });
    const { request } = makeHarness();
    const res = await request("/eco/alerts?area=OK");
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      source: string;
      count: number;
      items: { id: string; event: string; severity: string }[];
    };
    expect(body.source).toBe("nws");
    expect(body.count).toBe(1);
    expect(body.items[0].event).toBe("Tornado Warning");
    expect(body.items[0].severity).toBe("Extreme");
  });

  it("502 when upstream errors", async () => {
    stubFetch({
      "api.weather.gov/alerts/active": () =>
        new Response("oops", { status: 503 }),
    });
    const { request } = makeHarness();
    const res = await request("/eco/alerts?area=OK");
    expect(res.status).toBe(502);
  });
});

describe("GET /eco/earthquakes", () => {
  it("rejects out-of-range minMag", async () => {
    const { request } = makeHarness();
    const res = await request("/eco/earthquakes?minMag=15");
    expect(res.status).toBe(400);
  });

  it("normalizes USGS quake features and filters by min magnitude", async () => {
    stubFetch({
      "earthquake.usgs.gov": () =>
        json({
          features: [
            {
              id: "q1",
              geometry: { coordinates: [-118.1, 34.2, 12.3] },
              properties: {
                mag: 5.4,
                place: "6km N of Somewhere, CA",
                time: 1712000000000,
                url: "https://earthquake.usgs.gov/events/q1",
                tsunami: 0,
                status: "reviewed",
                alert: "yellow",
              },
            },
            {
              id: "q2",
              geometry: { coordinates: [-100, 35, 5.0] },
              properties: { mag: 2.0, place: "tiny", time: 1711000000000 },
            },
            // bad row — missing mag — must be dropped
            { id: "q3", geometry: { coordinates: [0, 0, 0] }, properties: {} },
          ],
        }),
    });
    const { request } = makeHarness();
    const res = await request("/eco/earthquakes?minMag=2.5&days=7");
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      source: string;
      count: number;
      items: { id: string; magnitude: number; tsunami: boolean }[];
    };
    expect(body.source).toBe("usgs");
    expect(body.count).toBe(1);
    expect(body.items[0].id).toBe("q1");
    expect(body.items[0].magnitude).toBe(5.4);
    expect(body.items[0].tsunami).toBe(false);
  });
});

describe("GET /eco/events", () => {
  it("rejects invalid categories", async () => {
    const { request } = makeHarness();
    const res = await request("/eco/events?category=!!!");
    expect(res.status).toBe(400);
  });

  it("normalizes EONET events and extracts latest geometry coords", async () => {
    stubFetch({
      "eonet.gsfc.nasa.gov": () =>
        json({
          events: [
            {
              id: "e1",
              title: "Kilauea Volcanic Activity",
              description: "Ongoing activity",
              link: "https://eonet.gsfc.nasa.gov/events/e1",
              categories: [{ id: "volcanoes", title: "Volcanoes" }],
              sources: [{ id: "SIVolcano" }],
              geometry: [
                { date: "2025-03-01T00:00Z", coordinates: [-155.28, 19.4] },
                { date: "2025-04-01T00:00Z", coordinates: [-155.25, 19.41] },
              ],
            },
            { id: "e2" }, // missing title — dropped
          ],
        }),
    });
    const { request } = makeHarness();
    const res = await request("/eco/events?days=7");
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      count: number;
      items: {
        id: string;
        title: string;
        category: string;
        lat: number;
        lng: number;
        date: string;
      }[];
    };
    expect(body.count).toBe(1);
    expect(body.items[0].title).toBe("Kilauea Volcanic Activity");
    expect(body.items[0].category).toBe("Volcanoes");
    expect(body.items[0].lat).toBeCloseTo(19.41, 2);
    expect(body.items[0].lng).toBeCloseTo(-155.25, 2);
    expect(body.items[0].date).toBe("2025-04-01T00:00Z");
  });
});

describe("GET /eco/space-weather", () => {
  it("returns latest Kp + trimmed history", async () => {
    const header = ["time_tag", "kp_index", "a_running", "station_count"];
    const rows = Array.from({ length: 30 }, (_, i) => [
      `2025-04-01T${String(i).padStart(2, "0")}:00:00`,
      i % 9,
      5,
      8,
    ]);
    stubFetch({
      "services.swpc.noaa.gov": () => json([header, ...rows]),
    });
    const { request } = makeHarness();
    const res = await request("/eco/space-weather");
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      source: string;
      latest: { kpIndex: number | null } | null;
      history: unknown[];
    };
    expect(body.source).toBe("noaa-swpc");
    expect(body.latest?.kpIndex).toBe(29 % 9);
    expect(body.history.length).toBe(24);
  });
});

describe("GET /eco/signals", () => {
  it("aggregates all upstreams and returns a generatedAt timestamp", async () => {
    stubFetch({
      "api.weather.gov/alerts/active": () =>
        json({
          features: [
            {
              id: "a1",
              properties: {
                event: "Flood Warning",
                severity: "Moderate",
              },
            },
          ],
        }),
      "earthquake.usgs.gov": () =>
        json({
          features: [
            {
              id: "q1",
              geometry: { coordinates: [-1, 1, 10] },
              properties: { mag: 4.2, place: "sea", time: 1712000000000 },
            },
          ],
        }),
      "eonet.gsfc.nasa.gov": () =>
        json({
          events: [
            {
              id: "e1",
              title: "Wildfire",
              categories: [{ title: "Wildfires" }],
              geometry: [{ date: "2025-04-01", coordinates: [-120, 38] }],
            },
          ],
        }),
      "services.swpc.noaa.gov": () =>
        json([
          ["time", "kp", "a", "n"],
          ["2025-04-01T00:00:00", 3, 5, 8],
        ]),
    });
    const { request } = makeHarness();
    const res = await request("/eco/signals?area=OK");
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      alerts: unknown[];
      earthquakes: unknown[];
      events: unknown[];
      spaceWeather: { kpIndex: number } | null;
      generatedAt: string;
    };
    expect(body.alerts.length).toBe(1);
    expect(body.earthquakes.length).toBe(1);
    expect(body.events.length).toBe(1);
    expect(body.spaceWeather?.kpIndex).toBe(3);
    expect(Date.parse(body.generatedAt)).toBeGreaterThan(0);
  });

  it("degrades gracefully when an upstream is down", async () => {
    stubFetch({
      "api.weather.gov/alerts/active": () =>
        new Response("boom", { status: 503 }),
      "earthquake.usgs.gov": () => json({ features: [] }),
      "eonet.gsfc.nasa.gov": () => json({ events: [] }),
      "services.swpc.noaa.gov": () => new Response("boom", { status: 503 }),
    });
    const { request } = makeHarness();
    const res = await request("/eco/signals");
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      alerts: unknown[];
      earthquakes: unknown[];
      events: unknown[];
      spaceWeather: unknown;
    };
    expect(body.alerts.length).toBe(0);
    expect(body.earthquakes.length).toBe(0);
    expect(body.events.length).toBe(0);
    expect(body.spaceWeather).toBeNull();
  });
});
