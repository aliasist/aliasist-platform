import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { __resetSpaceAskRateLimitForTests } from "../src/middleware/spaceAskRateLimit";
import { jsonBody, makeHarness } from "./helpers";

beforeEach(() => {
  vi.restoreAllMocks();
  __resetSpaceAskRateLimitForTests();
});
afterEach(() => vi.unstubAllGlobals());

type StubMap = Record<string, () => Response>;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const stubFetch = (stubs: StubMap) => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      for (const [needle, response] of Object.entries(stubs)) {
        if (url.includes(needle)) return response();
      }
      return new Response("unstubbed", { status: 599 });
    }),
  );
};

describe("GET /space live feeds", () => {
  it("normalizes NASA APOD", async () => {
    stubFetch({
      "api.nasa.gov/planetary/apod": () =>
        json({
          title: "A Galaxy",
          date: "2026-04-28",
          explanation: "A NASA image description.",
          url: "https://example.com/image.jpg",
          hdurl: "https://example.com/hd.jpg",
          media_type: "image",
          copyright: "NASA",
        }),
    });
    const { request } = makeHarness();
    const res = await request("/space/apod");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { source: string; title: string; imageUrl: string };
    expect(body.source).toBe("nasa-apod");
    expect(body.title).toBe("A Galaxy");
    expect(body.imageUrl).toBe("https://example.com/image.jpg");
  });

  it("normalizes ISS position", async () => {
    stubFetch({
      "api.wheretheiss.at": () =>
        json({
          latitude: "12.34",
          longitude: "-56.78",
          altitude: 421.5,
          velocity: 27600,
          visibility: "daylight",
          timestamp: 1777399200,
        }),
    });
    const { request } = makeHarness();
    const res = await request("/space/iss");
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      source: string;
      latitude: number;
      longitude: number;
      dayNight: string;
    };
    expect(body.source).toBe("wheretheiss");
    expect(body.latitude).toBeCloseTo(12.34);
    expect(body.longitude).toBeCloseTo(-56.78);
    expect(body.dayNight).toBe("day");
  });

  it("normalizes people in space", async () => {
    stubFetch({
      "people-in-space.json": () =>
        json({
          number: 2,
          people: [
            { name: "Ada Lovelace", craft: "ISS", agency: "NASA", countryCode: "US" },
            { name: "Katherine Johnson", craft: "ISS" },
          ],
        }),
    });
    const { request } = makeHarness();
    const res = await request("/space/people");
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      count: number;
      people: { name: string; agency: string }[];
    };
    expect(body.count).toBe(2);
    expect(body.people[0]?.name).toBe("Ada Lovelace");
    expect(body.people[1]?.agency).toBe("Unknown");
  });

  it("normalizes next SpaceX launch", async () => {
    stubFetch({
      "api.spacexdata.com/v5/launches/upcoming": () =>
        json([
          {
            name: "Starlink Test",
            date_utc: "2026-04-29T12:00:00.000Z",
            flight_number: 401,
            rocket: "r1",
            launchpad: "p1",
            links: { webcast: "https://youtube.example/live", patch: { small: "https://example.com/patch.png" } },
          },
        ]),
      "api.spacexdata.com/v4/rockets": () => json([{ id: "r1", name: "Falcon 9" }]),
      "api.spacexdata.com/v4/launchpads": () =>
        json([{ id: "p1", full_name: "Cape Canaveral SLC-40" }]),
    });
    const { request } = makeHarness();
    const res = await request("/space/launches/next");
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      mission: string;
      rocket: string;
      site: string;
      status: string;
    };
    expect(body.mission).toBe("Starlink Test");
    expect(body.rocket).toBe("Falcon 9");
    expect(body.site).toBe("Cape Canaveral SLC-40");
    expect(body.status).toBe("go");
  });

  it("normalizes target lookup results", async () => {
    stubFetch({
      "ssd-api.jpl.nasa.gov/api/horizons_lookup.api": () =>
        json({
          count: 1,
          result: [
            {
              name: "99942 Apophis",
              type: "asteroid (integrated barycenter)",
              pdes: "2004 MN4",
              spkid: "2099942",
              alias: ["3264226", "K04M04N"],
            },
          ],
        }),
    });
    const { request } = makeHarness();
    const res = await request("/space/targets/lookup?q=Apophis&group=ast");
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      source: string;
      query: string;
      count: number;
      items: Array<{ id: string; name: string; objectType: string; aliases: string[] }>;
    };
    expect(body.source).toBe("jpl-horizons-lookup");
    expect(body.query).toBe("Apophis");
    expect(body.count).toBe(1);
    expect(body.items[0]?.id).toBe("2099942");
    expect(body.items[0]?.name).toBe("99942 Apophis");
    expect(body.items[0]?.objectType).toContain("asteroid");
    expect(body.items[0]?.aliases).toContain("K04M04N");
  });

  it("supports multiple target lookup matches", async () => {
    stubFetch({
      "ssd-api.jpl.nasa.gov/api/horizons_lookup.api": () =>
        json({
          count: 2,
          result: [
            {
              name: "Juno (spacecraft)",
              type: "spacecraft",
              pdes: null,
              spkid: "-61",
              alias: [],
            },
            {
              name: "3 Juno",
              type: "asteroid (integrated barycenter)",
              pdes: "A804 RA",
              spkid: "20000003",
              alias: ["I04R00A"],
            },
          ],
        }),
    });
    const { request } = makeHarness();
    const res = await request("/space/targets/lookup?q=Juno");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { count: number; items: Array<{ name: string }> };
    expect(body.count).toBe(2);
    expect(body.items[0]?.name).toContain("Juno");
    expect(body.items[1]?.name).toContain("Juno");
  });

  it("rejects invalid target lookup queries", async () => {
    const { request } = makeHarness();
    const res = await request("/space/targets/lookup?q=");
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("invalid_query");
  });

  it("normalizes target ephemeris results", async () => {
    stubFetch({
      "ssd-api.jpl.nasa.gov/api/horizons.api": () =>
        json({
          signature: { version: "1.3", source: "NASA/JPL Horizons API" },
          result: [
            "Target body name: 99942 Apophis (2004 MN4)",
            "Center body name: Earth (399)",
            "Center-site name: GEOCENTRIC",
            "Target SPK ID: 2099942",
            "$$SOE",
            " 2026-Apr-29 00:00     20 55 41.20 -18 33 23.0    1.199   4.107  2.13799045474771   5.6049390",
            " 2026-Apr-29 06:00     20 55 49.17 -18 32 49.7    1.205   4.112  2.13812533287512   5.6044117",
            "$$EOE",
          ].join("\n"),
        }),
    });
    const { request } = makeHarness();
    const res = await request("/space/targets/2099942/ephemeris?days=3&stepHours=6");
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      source: string;
      target: { id: string; name: string };
      center: { bodyName: string; siteName: string };
      rowCount: number;
      rows: Array<{ time: string; apparentMagnitude: number | null }>;
      summary: { brightestMagnitude: number | null; closestDistanceAu: number | null };
    };
    expect(body.source).toBe("jpl-horizons");
    expect(body.target.id).toBe("2099942");
    expect(body.target.name).toContain("Apophis");
    expect(body.center.bodyName).toContain("Earth");
    expect(body.rowCount).toBe(2);
    expect(body.rows[0]?.time).toContain("2026-Apr-29");
    expect(body.summary.brightestMagnitude).toBe(1.199);
    expect(body.summary.closestDistanceAu).toBeCloseTo(2.13799045474771);
  });

  it("searches MAST observations for a named target", async () => {
    stubFetch({
      "mast.stsci.edu/api/v0/invoke": () =>
        json({
          status: "COMPLETE",
          resolvedCoordinate: [{ canonicalName: "MESSIER 101", ra: 210.80227, decl: 54.34895 }],
          data: [
            {
              obsid: "jwst-01234",
              obs_title: "JWST observation of M101",
              obs_collection: "JWST",
              instrument_name: "NIRCam",
              target_name: "M101",
              dataproduct_type: "image",
              access_url: "https://mast.stsci.edu/files/jwst-preview.png",
              access_format: "image/png",
              t_min: "2026-04-29T00:00:00Z",
            },
            {
              obsid: "hst-45678",
              obs_title: "HST observation of M101",
              obs_collection: "HST",
              instrument_name: "WFC3/UVIS",
              target_name: "M101",
              dataproduct_type: "image",
              access_url: "https://mast.stsci.edu/files/hst-preview.jpg",
              access_format: "image/jpeg",
              t_min: "2026-04-28T00:00:00Z",
            },
          ],
        }),
    });
    const { request } = makeHarness();
    const res = await request("/space/observations/search?q=M101&radius=0.2&limit=2");
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      source: string;
      resolvedName: string;
      count: number;
      items: Array<{ collection: string; isVisual: boolean; previewUrl: string | null }>;
    };
    expect(body.source).toBe("mast");
    expect(body.resolvedName).toBe("MESSIER 101");
    expect(body.count).toBe(2);
    expect(body.items[0]?.collection).toBe("JWST");
    expect(body.items[0]?.isVisual).toBe(true);
    expect(body.items[0]?.previewUrl).toContain("preview");
  });

  it("normalizes space weather summary", async () => {
    stubFetch({
      "api.nasa.gov/DONKI/FLR": () =>
        json([
          {
            flrID: "2026-04-29T10:30:00-FLR-001",
            beginTime: "2026-04-29T10:30Z",
            peakTime: "2026-04-29T10:42Z",
            endTime: "2026-04-29T10:54Z",
            classType: "M2.3",
            sourceLocation: "N18W12",
            activeRegionNum: 13664,
            linkedEvents: [{ activityID: "2026-04-29T11:18:00-CME-001" }],
          },
        ]),
      "api.nasa.gov/DONKI/GST": () =>
        json([
          {
            gstID: "2026-04-28T18:00:00-GST-001",
            startTime: "2026-04-28T18:00Z",
            allKpIndex: [{ observedTime: "2026-04-28T21:00Z", kpIndex: 6.33 }],
          },
        ]),
      "api.nasa.gov/DONKI/CME": () =>
        json([
          {
            activityID: "2026-04-29T11:18:00-CME-001",
            startTime: "2026-04-29T11:18Z",
            sourceLocation: "N18W12",
            cmeAnalyses: [{ speed: 812 }],
          },
        ]),
    });
    const { request } = makeHarness();
    const res = await request("/space/weather/summary");
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      source: string;
      status: string;
      strongestFlareClass: string | null;
      maxKpIndex: number | null;
      latestCmeSpeedKms: number | null;
      eventCounts: { flares: number; geomagneticStorms: number; cmes: number };
    };
    expect(body.source).toBe("donki");
    expect(body.status).toBe("active");
    expect(body.strongestFlareClass).toBe("M2.3");
    expect(body.maxKpIndex).toBeCloseTo(6.33);
    expect(body.latestCmeSpeedKms).toBe(812);
    expect(body.eventCounts.flares).toBe(1);
    expect(body.eventCounts.geomagneticStorms).toBe(1);
    expect(body.eventCounts.cmes).toBe(1);
  });

  it("normalizes space weather events", async () => {
    stubFetch({
      "api.nasa.gov/DONKI/FLR": () =>
        json([
          {
            flrID: "2026-04-29T10:30:00-FLR-001",
            beginTime: "2026-04-29T10:30Z",
            peakTime: "2026-04-29T10:42Z",
            classType: "X1.1",
            sourceLocation: "N18W12",
            activeRegionNum: 13664,
          },
        ]),
      "api.nasa.gov/DONKI/GST": () => json([]),
      "api.nasa.gov/DONKI/CME": () =>
        json([
          {
            activityID: "2026-04-29T11:18:00-CME-001",
            startTime: "2026-04-29T11:18Z",
            sourceLocation: "N18W12",
            note: "Fast halo candidate.",
            cmeAnalyses: [{ speed: 812 }],
            linkedEvents: [{ activityID: "2026-04-29T10:30:00-FLR-001" }],
          },
        ]),
    });
    const { request } = makeHarness();
    const res = await request("/space/weather/events");
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      source: string;
      count: number;
      items: Array<{
        kind: string;
        title: string;
        severity: string | null;
        linkedEventIds: string[];
      }>;
    };
    expect(body.source).toBe("donki");
    expect(body.count).toBe(2);
    expect(body.items[0]?.kind).toBe("cme");
    expect(body.items[0]?.severity).toBe("812 km/s");
    expect(body.items[0]?.linkedEventIds).toContain("2026-04-29T10:30:00-FLR-001");
    expect(body.items[1]?.title).toContain("X1.1");
  });

  it("fetches a normalized space weather event by id", async () => {
    stubFetch({
      "api.nasa.gov/DONKI/FLR": () =>
        json([
          {
            flrID: "2026-04-29T10:30:00-FLR-001",
            beginTime: "2026-04-29T10:30Z",
            peakTime: "2026-04-29T10:42Z",
            classType: "X1.1",
            sourceLocation: "N18W12",
            activeRegionNum: 13664,
          },
        ]),
      "api.nasa.gov/DONKI/GST": () => json([]),
      "api.nasa.gov/DONKI/CME": () => json([]),
    });
    const { request } = makeHarness();
    const res = await request("/space/weather/events/2026-04-29T10:30:00-FLR-001");
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      source: string;
      item: { id: string; kind: string; severity: string | null };
    };
    expect(body.source).toBe("donki");
    expect(body.item.id).toBe("2026-04-29T10:30:00-FLR-001");
    expect(body.item.kind).toBe("flare");
    expect(body.item.severity).toBe("X1.1");
  });

  it("returns 404 for missing space weather event id", async () => {
    stubFetch({
      "api.nasa.gov/DONKI/FLR": () => json([]),
      "api.nasa.gov/DONKI/GST": () => json([]),
      "api.nasa.gov/DONKI/CME": () => json([]),
    });
    const { request } = makeHarness();
    const res = await request("/space/weather/events/missing-id");
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: string; source: string };
    expect(body.error).toBe("not_found");
    expect(body.source).toBe("donki");
  });
});

describe("POST /space/ask", () => {
  it("rejects invalid bodies", async () => {
    const { request } = makeHarness();
    const res = await request("/space/ask", jsonBody({ question: "" }));
    expect(res.status).toBe(400);
  });

  it("rejects malformed JSON", async () => {
    const { request } = makeHarness();
    const res = await request("/space/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ not-json",
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("invalid_json");
  });

  it("rejects oversized payloads", async () => {
    const { request } = makeHarness();
    const bigQuestion = "x".repeat(25_000);
    const res = await request("/space/ask", jsonBody({ question: bigQuestion }));
    expect(res.status).toBe(413);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("payload_too_large");
  });

  it("rate limits burst requests per client key", async () => {
    const { request } = makeHarness({
      SPACE_ASK_RATE_MAX: "2",
      SPACE_ASK_RATE_WINDOW_MS: "60000",
    });
    const init = jsonBody({ question: "What did Gemini test for Apollo?" });
    const r1 = await request("/space/ask", init);
    const r2 = await request("/space/ask", init);
    const r3 = await request("/space/ask", init);
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    expect(r3.status).toBe(429);
    const limited = (await r3.json()) as { error: string; retryAfterSec?: number };
    expect(limited.error).toBe("rate_limited");
    expect(limited.retryAfterSec).toBeGreaterThan(0);
    expect(r3.headers.get("Retry-After")).toBeTruthy();
  });

  it("returns local RAG answer and source chunks without configured AI", async () => {
    const { request } = makeHarness();
    const res = await request(
      "/space/ask",
      jsonBody({ question: "How did Gemini help Apollo reach the Moon?" }),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      answer: string;
      source: string;
      model: string;
      chunks: { source: string; text: string }[];
    };
    expect(body.source).toBe("local-rag");
    expect(body.model).toBe("local-retrieval");
    expect(body.answer).toContain("Gemini");
    expect(body.chunks.length).toBeGreaterThan(0);
    expect(body.chunks[0]?.source).toMatch(/spacesist\/corpus/);
  });

  it("uses semantic retrieval when configured", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === "string" ? input : input.toString();
        if (!url.includes("/api/embed")) {
          return new Response("unstubbed", { status: 599 });
        }
        const body =
          typeof init?.body === "string"
            ? (JSON.parse(init.body) as { input?: string | string[] })
            : {};
        const inputs = Array.isArray(body.input) ? body.input : typeof body.input === "string" ? [body.input] : [];
        const embeddings = inputs.map((text) =>
          /gemini|apollo|rendezvous|docking/i.test(text) ? [1, 0] : [0, 1],
        );
        return new Response(JSON.stringify({ embeddings }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }),
    );
    const { request } = makeHarness({
      RAG_RETRIEVAL: "semantic",
      OLLAMA_URL: "http://ollama.example",
      OLLAMA_EMBED_MODEL: "embeddinggemma:latest",
    });
    const res = await request(
      "/space/ask",
      jsonBody({ question: "What did Gemini help Apollo practice before the Moon landing?", topK: 3 }),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      source: string;
      model: string;
      chunks: { text: string; score: number }[];
    };
    expect(body.source).toBe("local-rag");
    expect(body.model).toBe("local-retrieval");
    expect(body.chunks[0]?.text).toMatch(/Gemini|rendezvous|docking/i);
    expect(body.chunks[0]?.score).toBeGreaterThan(0);
  });

  it("uses Workers AI when configured and returns retrieved chunks", async () => {
    const ai = {
      run: vi.fn(async () => ({
        response: "Gemini tested rendezvous and docking for Apollo.",
      })),
    };
    const { request } = makeHarness({ AI: ai as unknown as Ai });
    const res = await request(
      "/space/ask",
      jsonBody({ question: "What did Gemini test for Apollo?", topK: 3 }),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      answer: string;
      source: string;
      model: string;
      chunks: unknown[];
    };
    expect(body.source).toBe("workers-ai");
    expect(body.answer).toContain("Gemini");
    expect(body.chunks.length).toBeGreaterThan(0);
    expect(ai.run).toHaveBeenCalledOnce();
  });

  it("uses Gemini when Workers AI is unavailable and Gemini is configured", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [{ text: "Gemini tested rendezvous and docking for Apollo." }],
                },
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );
    const { request } = makeHarness({ GEMINI_API_KEY: "test-key" });
    const res = await request(
      "/space/ask",
      jsonBody({ question: "What did Gemini test for Apollo?", topK: 3 }),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      answer: string;
      source: string;
      model: string;
      chunks: unknown[];
    };
    expect(body.source).toBe("gemini");
    expect(body.answer).toContain("Gemini");
    expect(body.chunks.length).toBeGreaterThan(0);
  });
});

describe("CORS (Pages previews)", () => {
  it("permits https://*.pages.dev when CORS_ALLOW_CF_PAGES is true", async () => {
    const { request } = makeHarness({
      CORS_ALLOW_CF_PAGES: "true",
      ALLOWED_ORIGIN: "http://localhost:5173",
    });
    const res = await request("/space/ask", {
      method: "OPTIONS",
      headers: {
        Origin: "https://my-branch.aliasist-platform.pages.dev",
        "Access-Control-Request-Method": "POST",
      },
    });
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://my-branch.aliasist-platform.pages.dev");
  });

  it("does not permit pages.dev when CORS_ALLOW_CF_PAGES is false", async () => {
    const { request } = makeHarness({
      CORS_ALLOW_CF_PAGES: "false",
      ALLOWED_ORIGIN: "http://localhost:5173",
    });
    const res = await request("/space/iss", {
      method: "OPTIONS",
      headers: {
        Origin: "https://evil.pages.dev",
        "Access-Control-Request-Method": "GET",
      },
    });
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });
});
