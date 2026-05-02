import { Hono } from "hono";
import { z } from "zod";
import {
  buildContext,
  createOllamaEmbeddings,
  ingestDocuments,
  retrieveChunks,
  retrieveChunksSemantic,
  type RetrievedChunk,
} from "@aliasist/rag";
import type { Env } from "../env";
import { spaceAskRateLimit } from "../middleware/spaceAskRateLimit";
import { spaceCorpus } from "../rag/spaceCorpus";

export const space = new Hono<{ Bindings: Env }>();

const AskBody = z.object({
  question: z.string().min(1).max(4000),
  topK: z.number().int().min(1).max(8).optional(),
});

const TargetLookupQuery = z.object({
  q: z.string().min(1).max(120),
  group: z.enum(["ast", "com", "pln", "sat", "sct", "mb", "sb"]).optional(),
});

const TargetEphemerisQuery = z.object({
  days: z.coerce.number().int().min(1).max(14).optional(),
  stepHours: z.coerce.number().int().min(1).max(24).optional(),
});

const ObservationSearchQuery = z.object({
  q: z.string().min(1).max(120),
  radius: z.coerce.number().positive().max(2).optional(),
  limit: z.coerce.number().int().min(1).max(12).optional(),
});

type SpaceAskSource = "ollama" | "workers-ai" | "gemini" | "local-rag";
type SpaceRagRetrievalMode = "keyword" | "semantic";

const chunks = ingestDocuments(spaceCorpus, { chunkSize: 900, overlap: 120 });

const upstreamJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Accept": "application/json",
      "User-Agent": "Aliasist-SpaceSist/0.1",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`upstream_${res.status}_${text.slice(0, 120)}`);
  }
  return (await res.json()) as T;
};

const mastQuery = async <T>(request: Record<string, unknown>): Promise<T> => {
  const url = new URL("https://mast.stsci.edu/api/v0/invoke");
  url.searchParams.set("request", JSON.stringify(request));
  return upstreamJson<T>(url.toString());
};

const cacheHeaders = (seconds: number) => ({
  "Cache-Control": `public, max-age=${seconds}, s-maxage=${seconds}`,
});

const asNumber = (value: unknown): number | null => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const isoDay = (date: Date): string => date.toISOString().slice(0, 10);

const daysAgo = (days: number): string => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return isoDay(date);
};

const daysAhead = (days: number): string => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return isoDay(date);
};

const normalizeLaunchStatus = (launch: SpaceXLaunch): "go" | "hold" | "tbd" | "success" | "scrubbed" => {
  if (launch.success === true) return "success";
  if (launch.success === false) return "scrubbed";
  if (launch.tbd || launch.date_precision === "tbd") return "tbd";
  return "go";
};

const flareClassScore = (classType?: string): number | null => {
  if (!classType) return null;
  const normalized = classType.trim().toUpperCase();
  const match = normalized.match(/^([ABCMX])\s*([0-9.]+)?$/);
  if (!match) return null;
  const band = match[1];
  const value = Number(match[2] ?? "1");
  const base =
    band === "X" ? 500 :
    band === "M" ? 400 :
    band === "C" ? 300 :
    band === "B" ? 200 : 100;
  return base + (Number.isFinite(value) ? value : 0);
};

const classifySpaceWeatherStatus = (events: SpaceWeatherEvent[]): "quiet" | "watch" | "active" => {
  const maxStorm = events
    .filter((event) => event.kind === "geomagnetic-storm")
    .reduce((max, event) => Math.max(max, event.score ?? 0), 0);
  const maxFlare = events
    .filter((event) => event.kind === "flare")
    .reduce((max, event) => Math.max(max, event.score ?? 0), 0);

  if (maxStorm >= 6 || maxFlare >= 500) return "active";
  if (maxStorm >= 5 || maxFlare >= 400 || events.some((event) => event.kind === "cme")) return "watch";
  return "quiet";
};

const trimNote = (value: string | undefined): string | null => {
  const note = value?.replace(/\s+/g, " ").trim();
  return note ? note : null;
};

const parseHorizonsNumber = (value: string | undefined): number | null => {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized === "n.a." || normalized === "n/a") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const parseHorizonsHeading = (result: string, label: string): string | null => {
  const line = result.split(/\r?\n/).find((entry) => entry.includes(label));
  if (!line) return null;
  const value = line.split(label)[1]?.split("{")[0]?.trim();
  return value ? value : null;
};

const parseHorizonsEphemerisRows = (result: string): TargetEphemerisRow[] => {
  const lines = result.split(/\r?\n/);
  const start = lines.findIndex((line) => line.includes("$$SOE"));
  const end = lines.findIndex((line) => line.includes("$$EOE"));
  if (start === -1 || end === -1 || end <= start + 1) return [];

  const rows: TargetEphemerisRow[] = [];
  for (const rawLine of lines.slice(start + 1, end)) {
    const line = rawLine.trim();
    if (!line) continue;
    const match = line.match(
      /^(\S+\s+\S+)\s+([0-9]{1,2}\s+[0-9]{2}\s+[0-9]{2}(?:\.\d+)?)\s+([+-]?[0-9]{1,2}\s+[0-9]{2}\s+[0-9]{2}(?:\.\d+)?)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)$/,
    );
    if (!match) continue;
    const [, time, ra, dec, apparentMagnitude, , distanceAu, deltaDotKms] = match;
    rows.push({
      time: time!,
      ra: ra!,
      dec: dec!,
      apparentMagnitude: parseHorizonsNumber(apparentMagnitude!),
      distanceAu: parseHorizonsNumber(distanceAu!),
      deltaDotKms: parseHorizonsNumber(deltaDotKms!),
      raw: line,
    });
  }
  return rows;
};

const pickString = (row: Record<string, unknown>, keys: string[]): string | null => {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return null;
};

const normalizeObservation = (row: Record<string, unknown>): SpaceObservation | null => {
  const obsId = pickString(row, ["obsid", "obs_id", "obsID"]);
  const obsTitle: string = pickString(row, ["obs_title", "title", "target_name"]) ?? obsId ?? "Unknown";
  const collection = pickString(row, ["obs_collection", "collection"]) ?? "MAST";
  const instrument = pickString(row, ["instrument_name", "instrument"]) ?? "Unknown";
  const targetName = pickString(row, ["target_name", "target"]) ?? "Unknown";
  const dataProductType = pickString(row, ["dataproduct_type", "productType"]) ?? "unknown";
  if (!obsId) return null;
  const accessUrl = pickString(row, ["access_url", "preview_url", "url"]);
  const accessFormat = pickString(row, ["access_format", "format"]);
  const previewUrl =
    accessUrl &&
    (/\.(png|jpe?g|gif|webp)$/i.test(accessUrl) || (accessFormat?.toLowerCase().startsWith("image/") ?? false))
      ? accessUrl
      : null;
  const observationTime = pickString(row, ["t_min", "t_max", "obs_collection_date", "obs_date"]);
  return {
    obsId,
    obsTitle,
    collection,
    instrument,
    targetName,
    dataProductType,
    accessUrl,
    accessFormat,
    previewUrl,
    observationTime,
    isVisual: Boolean(previewUrl),
  };
};

const summarizeEphemerisRows = (rows: TargetEphemerisRow[]): TargetEphemerisSummary => {
  const magnitudes = rows.flatMap((row) => (row.apparentMagnitude === null ? [] : [row.apparentMagnitude]));
  const distances = rows.flatMap((row) => (row.distanceAu === null ? [] : [row.distanceAu]));
  const rangeRates = rows.flatMap((row) =>
    row.deltaDotKms === null ? [] : [Math.abs(row.deltaDotKms)],
  );
  return {
    firstTime: rows[0]?.time ?? null,
    lastTime: rows.at(-1)?.time ?? null,
    brightestMagnitude: magnitudes.length > 0 ? Math.min(...magnitudes) : null,
    closestDistanceAu: distances.length > 0 ? Math.min(...distances) : null,
    fastestRangeRateKms: rangeRates.length > 0 ? Math.max(...rangeRates) : null,
  };
};

const linkedEventIds = (linked: DonkiLinkedEvent[] | undefined): string[] =>
  (linked ?? [])
    .map((event) => event.activityID?.trim())
    .filter((value): value is string => Boolean(value));

const normalizeFlare = (item: DonkiFlare): SpaceWeatherEvent | null => {
  if (!item.beginTime || !item.flrID) return null;
  const classType = item.classType?.trim() || null;
  const region =
    item.activeRegionNum !== undefined && item.activeRegionNum !== null
      ? `AR ${String(item.activeRegionNum)}`
      : null;
  const location = [item.sourceLocation?.trim(), region].filter(Boolean).join(" · ") || null;
  return {
    id: item.flrID,
    source: "donki-flr",
    kind: "flare",
    title: classType ? `Solar flare ${classType}` : "Solar flare",
    startTime: item.beginTime,
    endTime: item.endTime ?? null,
    peakTime: item.peakTime ?? null,
    severity: classType,
    score: flareClassScore(classType ?? undefined),
    location,
    note: trimNote(item.note),
    linkedEventIds: linkedEventIds(item.linkedEvents),
  };
};

const normalizeGeomagneticStorm = (item: DonkiGeomagneticStorm): SpaceWeatherEvent | null => {
  if (!item.startTime || !item.gstID) return null;
  const kpEntries = item.allKpIndex ?? [];
  const strongest = kpEntries.reduce((max, entry) => {
    const kp = asNumber(entry.kpIndex);
    if (kp === null) return max;
    return kp > (max.kp ?? -Infinity) ? { kp, observedTime: entry.observedTime ?? null } : max;
  }, { kp: null as number | null, observedTime: null as string | null });
  const severity = strongest.kp !== null ? `Kp ${strongest.kp.toFixed(2)}` : null;
  return {
    id: item.gstID,
    source: "donki-gst",
    kind: "geomagnetic-storm",
    title: severity ? `Geomagnetic storm ${severity}` : "Geomagnetic storm",
    startTime: item.startTime,
    endTime: null,
    peakTime: strongest.observedTime,
    severity,
    score: strongest.kp,
    location: "Earth magnetosphere",
    note: null,
    linkedEventIds: linkedEventIds(item.linkedEvents),
  };
};

const normalizeCme = (item: DonkiCme): SpaceWeatherEvent | null => {
  if (!item.startTime || !item.activityID) return null;
  const analysis = item.cmeAnalyses?.[0];
  const speed = asNumber(analysis?.speed);
  const severity = speed !== null ? `${Math.round(speed)} km/s` : null;
  return {
    id: item.activityID,
    source: "donki-cme",
    kind: "cme",
    title: speed !== null ? `CME ~${Math.round(speed)} km/s` : "Coronal mass ejection",
    startTime: item.startTime,
    endTime: null,
    peakTime: null,
    severity,
    score: speed,
    location: item.sourceLocation?.trim() || null,
    note: trimNote(analysis?.note) ?? trimNote(item.note),
    linkedEventIds: linkedEventIds(item.linkedEvents),
  };
};

const sortWeatherEvents = (events: SpaceWeatherEvent[]): SpaceWeatherEvent[] =>
  [...events].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

const fetchSpaceWeatherEvents = async (
  env: Env,
  startDate = daysAgo(14),
  endDate = isoDay(new Date()),
): Promise<SpaceWeatherEvent[]> => {
  const key = env.NASA_API_KEY ?? "DEMO_KEY";
  const makeUrl = (path: string) => {
    const url = new URL(`https://api.nasa.gov/DONKI/${path}`);
    url.searchParams.set("startDate", startDate);
    url.searchParams.set("endDate", endDate);
    url.searchParams.set("api_key", key);
    return url.toString();
  };

  const [flares, storms, cmes] = await Promise.all([
    upstreamJson<DonkiFlare[]>(makeUrl("FLR")),
    upstreamJson<DonkiGeomagneticStorm[]>(makeUrl("GST")),
    upstreamJson<DonkiCme[]>(makeUrl("CME")),
  ]);

  return sortWeatherEvents([
    ...flares.map(normalizeFlare).filter((event): event is SpaceWeatherEvent => Boolean(event)),
    ...storms.map(normalizeGeomagneticStorm).filter((event): event is SpaceWeatherEvent => Boolean(event)),
    ...cmes.map(normalizeCme).filter((event): event is SpaceWeatherEvent => Boolean(event)),
  ]);
};

type ApodUpstream = {
  title?: string;
  date?: string;
  explanation?: string;
  url?: string;
  hdurl?: string;
  thumbnail_url?: string;
  media_type?: string;
  copyright?: string;
};

type IssUpstream = {
  latitude?: number | string;
  longitude?: number | string;
  altitude?: number | string;
  velocity?: number | string;
  visibility?: string;
  timestamp?: number;
};

type PeopleUpstream = {
  number?: number;
  people?: Array<{ name?: string; craft?: string; agency?: string; countryCode?: string }>;
};

type SpaceXLaunch = {
  name?: string;
  date_utc?: string;
  date_local?: string;
  date_precision?: string;
  flight_number?: number;
  success?: boolean | null;
  tbd?: boolean;
  details?: string | null;
  links?: { webcast?: string | null; patch?: { small?: string | null } };
  rocket?: string;
  launchpad?: string;
};

type SpaceXRocket = {
  id?: string;
  name?: string;
};

type SpaceXLaunchpad = {
  id?: string;
  name?: string;
  full_name?: string;
  locality?: string;
  region?: string;
};

type DonkiLinkedEvent = {
  activityID?: string;
};

type DonkiFlare = {
  flrID?: string;
  beginTime?: string;
  peakTime?: string;
  endTime?: string;
  classType?: string;
  sourceLocation?: string;
  activeRegionNum?: number | string;
  note?: string;
  linkedEvents?: DonkiLinkedEvent[];
};

type DonkiGeomagneticStorm = {
  gstID?: string;
  startTime?: string;
  allKpIndex?: Array<{
    observedTime?: string;
    kpIndex?: number | string;
  }>;
  linkedEvents?: DonkiLinkedEvent[];
};

type DonkiCme = {
  activityID?: string;
  startTime?: string;
  note?: string;
  sourceLocation?: string;
  linkedEvents?: DonkiLinkedEvent[];
  cmeAnalyses?: Array<{
    speed?: number | string;
    note?: string;
  }>;
};

type SpaceWeatherKind = "flare" | "geomagnetic-storm" | "cme";

type SpaceWeatherEvent = {
  id: string;
  source: string;
  kind: SpaceWeatherKind;
  title: string;
  startTime: string;
  endTime: string | null;
  peakTime: string | null;
  severity: string | null;
  score: number | null;
  location: string | null;
  note: string | null;
  linkedEventIds: string[];
};

type HorizonsLookupResult = {
  name?: string;
  type?: string;
  pdes?: string | null;
  spkid?: string;
  alias?: string[];
};

type HorizonsLookupResponse = {
  count?: number | string;
  result?: HorizonsLookupResult[];
};

type MastNameLookupResponse = {
  status?: string;
  resolvedCoordinate?: Array<{
    canonicalName?: string;
    ra?: number | string;
    decl?: number | string;
    objectType?: string;
    searchRadius?: number | string;
  }>;
};

type MastCaomConeResponse = {
  status?: string;
  data?: Array<Record<string, unknown>>;
  paging?: {
    rows?: number;
    rowsTotal?: number;
  };
};

type HorizonsEphemerisResponse = {
  result?: string;
  error?: string;
  message?: string;
  signature?: {
    source?: string;
    version?: string;
  };
};

type TargetEphemerisRow = {
  time: string;
  ra: string;
  dec: string;
  apparentMagnitude: number | null;
  distanceAu: number | null;
  deltaDotKms: number | null;
  raw: string;
};

type TargetEphemerisSummary = {
  firstTime: string | null;
  lastTime: string | null;
  brightestMagnitude: number | null;
  closestDistanceAu: number | null;
  fastestRangeRateKms: number | null;
};

type SpaceObservation = {
  obsId: string;
  obsTitle: string;
  collection: string;
  instrument: string;
  targetName: string;
  dataProductType: string;
  accessUrl: string | null;
  accessFormat: string | null;
  previewUrl: string | null;
  observationTime: string | null;
  isVisual: boolean;
};

const sourceShape = (chunk: RetrievedChunk) => ({
  id: chunk.id,
  source: chunk.source,
  score: Number(chunk.score.toFixed(4)),
  text: chunk.text,
  metadata: chunk.metadata ?? {},
});

const systemPrompt =
  "You are SpaceSist, the Aliasist space-program research assistant. " +
  "Answer questions about NASA, space history, space programs, missions, spacecraft, astronomy, planetary science, and spaceflight engineering. " +
  "Use only the provided retrieved context as grounding. If the context is incomplete or the question needs current live data, say so plainly and give the closest grounded answer. " +
  'If the context cannot support even a partial answer, respond with "NO_ANSWER". Do not invent sources.';

const ragMaxTokens = (env: Env): number => {
  const n = Number(env.RAG_MAX_TOKENS ?? 900);
  return Number.isFinite(n) ? Math.max(64, Math.min(4096, n)) : 900;
};

const ragTemperature = (env: Env): number => {
  const n = Number(env.RAG_TEMPERATURE ?? 0.2);
  return Number.isFinite(n) ? Math.max(0, Math.min(2, n)) : 0.2;
};

const ragRetrievalMode = (env: Env): SpaceRagRetrievalMode =>
  env.RAG_RETRIEVAL === "semantic" ? "semantic" : "keyword";

const semanticEmbeddingHost = (env: Env): string | null =>
  (env.OLLAMA_URL ?? env.AI_OLLAMA_URL ?? "").replace(/\/$/, "") || null;

const semanticEmbedderFor = (env: Env) => {
  const host = semanticEmbeddingHost(env);
  if (!host) return null;
  return createOllamaEmbeddings({
    host,
    model: env.OLLAMA_EMBED_MODEL ?? env.OLLAMA_MODEL ?? env.AI_OLLAMA_MODEL,
  });
};

const isNoAnswer = (answer: string): boolean => {
  const normalized = answer.trim().toUpperCase();
  return !normalized || normalized === "NO_ANSWER" || normalized.startsWith("NO_ANSWER:");
};

const promptFor = (question: string, context: string) =>
  `Retrieved context:\n${context}\n\nQuestion: ${question}`;

const callOllama = async (
  env: Env,
  question: string,
  context: string,
  signal: AbortSignal,
): Promise<string> => {
  const baseUrl = env.OLLAMA_URL ?? env.AI_OLLAMA_URL;
  if (!baseUrl) throw new Error("ollama_not_configured");
  const headers = new Headers({ "Content-Type": "application/json" });
  if (env.OLLAMA_TOKEN) headers.set("Authorization", `Bearer ${env.OLLAMA_TOKEN}`);

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/chat`, {
    method: "POST",
    signal,
    headers,
    body: JSON.stringify({
      model: env.OLLAMA_MODEL ?? env.AI_OLLAMA_MODEL,
      stream: false,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: promptFor(question, context) },
      ],
      options: {
        temperature: ragTemperature(env),
        num_predict: ragMaxTokens(env),
      },
    }),
  });
  if (!res.ok) throw new Error(`ollama_${res.status}`);
  const json = (await res.json()) as { message?: { content?: string } };
  const text = json.message?.content?.trim();
  if (!text) throw new Error("ollama_empty");
  if (isNoAnswer(text)) throw new Error("ollama_no_answer");
  return text;
};

const callWorkersAi = async (
  env: Env,
  question: string,
  context: string,
): Promise<string> => {
  if (!env.AI) throw new Error("workers_ai_not_configured");
  const model = env.WORKERS_AI_MODEL ?? "@cf/meta/llama-3.1-8b-instruct";
  const json = (await env.AI.run(model, {
    max_tokens: ragMaxTokens(env),
    temperature: ragTemperature(env),
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: promptFor(question, context) },
    ],
  })) as { response?: string };
  const text = json.response?.trim();
  if (!text) throw new Error("workers_ai_empty");
  if (isNoAnswer(text)) throw new Error("workers_ai_no_answer");
  return text;
};

const callGemini = async (
  env: Env,
  question: string,
  context: string,
): Promise<string> => {
  if (!env.GEMINI_API_KEY) throw new Error("gemini_not_configured");
  const model = env.GEMINI_MODEL ?? "gemini-2.5-flash";
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": env.GEMINI_API_KEY,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [
        {
          role: "user",
          parts: [{ text: promptFor(question, context) }],
        },
      ],
      generationConfig: {
        temperature: ragTemperature(env),
        maxOutputTokens: ragMaxTokens(env),
      },
    }),
  });
  if (!res.ok) throw new Error(`gemini_${res.status}`);
  const json = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = json.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();
  if (!text) throw new Error("gemini_empty");
  if (isNoAnswer(text)) throw new Error("gemini_no_answer");
  return text;
};

const localAnswer = (question: string, matches: RetrievedChunk[]): string => {
  if (matches.length === 0) {
    return [
      "I do not have enough local SpaceSist context to answer that yet.",
      "The RAG corpus can be expanded with more NASA program history, mission pages, and live feeds to improve coverage.",
    ].join(" ");
  }

  const topicList = matches
    .slice(0, 3)
    .map((chunk) => String(chunk.metadata?.topic ?? chunk.source))
    .join(", ");

  const excerpts = matches
    .slice(0, 3)
    .map((chunk, index) => {
      const text = chunk.text.length > 460 ? `${chunk.text.slice(0, 457)}...` : chunk.text;
      return `${index + 1}. ${text}`;
    })
    .join("\n\n");

  return [
    `Closest grounded answer for: "${question}"`,
    `Relevant SpaceSist topics: ${topicList}.`,
    excerpts,
    "AI generation is not configured right now, so this is a retrieval-only answer from the local space corpus.",
  ].join("\n\n");
};

space.get("/apod", async (c) => {
  const key = c.env.NASA_API_KEY ?? "DEMO_KEY";
  try {
    const url = new URL("https://api.nasa.gov/planetary/apod");
    url.searchParams.set("api_key", key);
    url.searchParams.set("thumbs", "true");
    const data = await upstreamJson<ApodUpstream>(url.toString());
    return c.json(
      {
        source: "nasa-apod",
        title: data.title ?? "NASA Astronomy Picture of the Day",
        date: data.date ?? new Date().toISOString().slice(0, 10),
        explanation: data.explanation ?? "",
        imageUrl: data.media_type === "video" ? data.thumbnail_url ?? data.url ?? "" : data.url ?? data.hdurl ?? "",
        hdUrl: data.hdurl ?? null,
        mediaType: data.media_type ?? "image",
        copyright: data.copyright?.replace(/\s+/g, " ").trim() ?? null,
      },
      200,
      cacheHeaders(3600),
    );
  } catch (err) {
    console.error("space_apod_failed", (err as Error).message);
    return c.json({ error: "upstream_failed", source: "nasa-apod" }, 502);
  }
});

space.get("/iss", async (c) => {
  try {
    const data = await upstreamJson<IssUpstream>("https://api.wheretheiss.at/v1/satellites/25544");
    const latitude = asNumber(data.latitude);
    const longitude = asNumber(data.longitude);
    if (latitude === null || longitude === null) {
      return c.json({ error: "bad_upstream_shape", source: "wheretheiss" }, 502);
    }
    return c.json(
      {
        source: "wheretheiss",
        latitude,
        longitude,
        altitudeKm: asNumber(data.altitude),
        velocityKmh: asNumber(data.velocity),
        dayNight:
          data.visibility === "daylight"
            ? "day"
            : data.visibility === "eclipsed"
              ? "night"
              : "terminator",
        timestamp: data.timestamp ? new Date(data.timestamp * 1000).toISOString() : new Date().toISOString(),
      },
      200,
      cacheHeaders(5),
    );
  } catch (err) {
    console.error("space_iss_failed", (err as Error).message);
    return c.json({ error: "upstream_failed", source: "wheretheiss" }, 502);
  }
});

space.get("/people", async (c) => {
  try {
    const data = await upstreamJson<PeopleUpstream>(
      "https://corquaid.github.io/international-space-station-APIs/JSON/people-in-space.json",
    );
    const people = (data.people ?? [])
      .filter((p) => p.name && p.craft)
      .map((p) => ({
        name: p.name!,
        craft: p.craft!,
        agency: p.agency ?? "Unknown",
        countryCode: p.countryCode ?? "—",
      }));
    return c.json(
      {
        source: "people-in-space",
        count: typeof data.number === "number" ? data.number : people.length,
        people,
      },
      200,
      cacheHeaders(1800),
    );
  } catch (err) {
    console.error("space_people_failed", (err as Error).message);
    return c.json({ error: "upstream_failed", source: "people-in-space" }, 502);
  }
});

space.get("/launches/next", async (c) => {
  try {
    const [launches, rockets, pads] = await Promise.all([
      upstreamJson<SpaceXLaunch[]>("https://api.spacexdata.com/v5/launches/upcoming"),
      upstreamJson<SpaceXRocket[]>("https://api.spacexdata.com/v4/rockets"),
      upstreamJson<SpaceXLaunchpad[]>("https://api.spacexdata.com/v4/launchpads"),
    ]);
    const now = Date.now();
    const launch = launches
      .filter((row) => row.date_utc && new Date(row.date_utc).getTime() >= now - 3600_000)
      .sort((a, b) => new Date(a.date_utc ?? 0).getTime() - new Date(b.date_utc ?? 0).getTime())[0] ?? launches[0];
    if (!launch) return c.json({ error: "no_launches", source: "spacex" }, 502);

    const rocket = rockets.find((row) => row.id === launch.rocket);
    const pad = pads.find((row) => row.id === launch.launchpad);
    const launchIso = launch.date_utc ?? launch.date_local ?? new Date().toISOString();
    const date = new Date(launchIso);
    const diffMs = date.getTime() - now;
    const diffDays = Math.floor(Math.abs(diffMs) / 86_400_000);
    const diffHours = Math.floor((Math.abs(diffMs) % 86_400_000) / 3_600_000);
    const windowSummary =
      diffMs >= 0
        ? `T-${diffDays}d ${diffHours}h`
        : `T+${diffDays}d ${diffHours}h`;

    return c.json(
      {
        source: "spacex",
        mission: launch.name ?? "Upcoming SpaceX launch",
        rocket: rocket?.name ?? launch.rocket ?? "Unknown vehicle",
        launchIso,
        site: pad?.full_name ?? pad?.name ?? launch.launchpad ?? "Unknown pad",
        status: normalizeLaunchStatus(launch),
        webcastLabel: launch.links?.webcast ? "SpaceX webcast" : "Webcast unavailable",
        webcastUrl: launch.links?.webcast ?? "https://www.spacex.com/launches/",
        windowSummary,
        details: launch.details ?? null,
        flightNumber: launch.flight_number ?? null,
        patchImageUrl: launch.links?.patch?.small ?? null,
      },
      200,
      cacheHeaders(300),
    );
  } catch (err) {
    console.error("space_launch_failed", (err as Error).message);
    return c.json({ error: "upstream_failed", source: "spacex" }, 502);
  }
});

space.get("/targets/lookup", async (c) => {
  const parsed = TargetLookupQuery.safeParse({
    q: c.req.query("q"),
    group: c.req.query("group") ?? undefined,
  });
  if (!parsed.success) return c.json({ error: "invalid_query", issues: parsed.error.issues }, 400);

  try {
    const url = new URL("https://ssd-api.jpl.nasa.gov/api/horizons_lookup.api");
    url.searchParams.set("sstr", parsed.data.q);
    url.searchParams.set("format", "json");
    if (parsed.data.group) url.searchParams.set("group", parsed.data.group);

    const data = await upstreamJson<HorizonsLookupResponse>(url.toString());
    const items = (data.result ?? [])
      .filter((item) => item.name && item.type && item.spkid)
      .map((item) => ({
        id: item.spkid!,
        name: item.name!,
        objectType: item.type!,
        primaryDesignation: item.pdes ?? null,
        spkId: item.spkid!,
        aliases: Array.isArray(item.alias) ? item.alias.filter(Boolean) : [],
      }));

    return c.json(
      {
        source: "jpl-horizons-lookup",
        query: parsed.data.q,
        count: items.length,
        items,
      },
      200,
      cacheHeaders(3600),
    );
  } catch (err) {
    console.error("space_targets_lookup_failed", (err as Error).message);
    return c.json({ error: "upstream_failed", source: "jpl-horizons-lookup" }, 502);
  }
});

space.get("/targets/:id/ephemeris", async (c) => {
  const parsed = TargetEphemerisQuery.safeParse({
    days: c.req.query("days") ?? undefined,
    stepHours: c.req.query("stepHours") ?? undefined,
  });
  if (!parsed.success) return c.json({ error: "invalid_query", issues: parsed.error.issues }, 400);

  const targetId = c.req.param("id");
  const days = parsed.data.days ?? 3;
  const stepHours = parsed.data.stepHours ?? 6;

  try {
    const url = new URL("https://ssd-api.jpl.nasa.gov/api/horizons.api");
    url.searchParams.set("format", "json");
    url.searchParams.set("COMMAND", targetId);
    url.searchParams.set("OBJ_DATA", "YES");
    url.searchParams.set("MAKE_EPHEM", "YES");
    url.searchParams.set("EPHEM_TYPE", "OBSERVER");
    url.searchParams.set("CENTER", "500@399");
    url.searchParams.set("START_TIME", isoDay(new Date()));
    url.searchParams.set("STOP_TIME", daysAhead(days));
    url.searchParams.set("STEP_SIZE", `${stepHours} h`);
    url.searchParams.set("QUANTITIES", "1,9,20,23,24,29");
    url.searchParams.set("ANG_FORMAT", "HMS");
    url.searchParams.set("CAL_FORMAT", "CAL");
    url.searchParams.set("CSV_FORMAT", "NO");

    const data = await upstreamJson<HorizonsEphemerisResponse>(url.toString());
    if (data.error) {
      return c.json({ error: "upstream_failed", source: "jpl-horizons", detail: data.error }, 502);
    }

    const result = data.result ?? "";
    const rows = parseHorizonsEphemerisRows(result);
    if (rows.length === 0) {
      return c.json({ error: "not_found", source: "jpl-horizons", id: targetId }, 404);
    }

    return c.json(
      {
        source: "jpl-horizons",
        target: {
          id: targetId,
          name: parseHorizonsHeading(result, "Target body name:") ?? targetId,
        },
        center: {
          code: "500@399",
          bodyName: parseHorizonsHeading(result, "Center body name:") ?? "Earth",
          siteName: parseHorizonsHeading(result, "Center-site name:") ?? "GEOCENTRIC",
        },
        startTime: `${isoDay(new Date())}T00:00:00Z`,
        stopTime: `${daysAhead(days)}T00:00:00Z`,
        stepSize: `${stepHours} h`,
        rowCount: rows.length,
        rows,
        summary: summarizeEphemerisRows(rows),
      },
      200,
      cacheHeaders(900),
    );
  } catch (err) {
    console.error("space_targets_ephemeris_failed", (err as Error).message);
    return c.json({ error: "upstream_failed", source: "jpl-horizons", id: targetId }, 502);
  }
});

space.get("/observations/search", async (c) => {
  const parsed = ObservationSearchQuery.safeParse({
    q: c.req.query("q"),
    radius: c.req.query("radius") ?? undefined,
    limit: c.req.query("limit") ?? undefined,
  });
  if (!parsed.success) return c.json({ error: "invalid_query", issues: parsed.error.issues }, 400);

  try {
    const resolver = await mastQuery<MastNameLookupResponse>({
      service: "Mast.Name.Lookup",
      params: { input: parsed.data.q, format: "json" },
    });
    const resolved = resolver.resolvedCoordinate?.[0];
    const ra = asNumber(resolved?.ra);
    const dec = asNumber(resolved?.decl);
    if (ra === null || dec === null) {
      return c.json({ error: "not_found", source: "mast", query: parsed.data.q }, 404);
    }

    const search = await mastQuery<MastCaomConeResponse>({
      service: "Mast.Caom.Cone",
      params: {
        ra,
        dec,
        radius: parsed.data.radius ?? 0.2,
      },
      format: "json",
      pagesize: parsed.data.limit ?? 8,
      page: 1,
      removenullcolumns: true,
    });

    const items = (search.data ?? [])
      .map(normalizeObservation)
      .filter((item): item is SpaceObservation => Boolean(item))
      .slice(0, parsed.data.limit ?? 8);

    return c.json(
      {
        source: "mast",
        query: parsed.data.q,
        resolvedName: resolved?.canonicalName ?? parsed.data.q,
        ra,
        dec,
        radius: parsed.data.radius ?? 0.2,
        count: items.length,
        items,
      },
      200,
      cacheHeaders(1800),
    );
  } catch (err) {
    console.error("space_observations_search_failed", (err as Error).message);
    return c.json({ error: "upstream_failed", source: "mast", query: parsed.data.q }, 502);
  }
});

space.get("/weather/events", async (c) => {
  try {
    const events = await fetchSpaceWeatherEvents(c.env);
    return c.json(
      {
        source: "donki",
        generatedAt: new Date().toISOString(),
        count: events.length,
        items: events,
      },
      200,
      cacheHeaders(900),
    );
  } catch (err) {
    console.error("space_weather_events_failed", (err as Error).message);
    return c.json({ error: "upstream_failed", source: "donki" }, 502);
  }
});

space.get("/weather/events/:id", async (c) => {
  try {
    const events = await fetchSpaceWeatherEvents(c.env);
    const id = c.req.param("id");
    const item = events.find((event) => event.id === id);
    if (!item) return c.json({ error: "not_found", source: "donki", id }, 404);
    return c.json(
      {
        source: "donki",
        item,
      },
      200,
      cacheHeaders(900),
    );
  } catch (err) {
    console.error("space_weather_event_failed", (err as Error).message);
    return c.json({ error: "upstream_failed", source: "donki" }, 502);
  }
});

space.get("/weather/summary", async (c) => {
  try {
    const events = await fetchSpaceWeatherEvents(c.env);
    const flares = events.filter((event) => event.kind === "flare");
    const storms = events.filter((event) => event.kind === "geomagnetic-storm");
    const cmes = events.filter((event) => event.kind === "cme");
    const strongestFlare = flares.reduce(
      (best, event) => ((event.score ?? -Infinity) > (best?.score ?? -Infinity) ? event : best),
      null as SpaceWeatherEvent | null,
    );
    const strongestStorm = storms.reduce(
      (best, event) => ((event.score ?? -Infinity) > (best?.score ?? -Infinity) ? event : best),
      null as SpaceWeatherEvent | null,
    );
    const latestCme = cmes.find((event) => typeof event.score === "number") ?? null;
    const latestHeadline = events[0]?.title ?? null;

    return c.json(
      {
        source: "donki",
        generatedAt: new Date().toISOString(),
        status: classifySpaceWeatherStatus(events),
        latestHeadline,
        strongestFlareClass: strongestFlare?.severity ?? null,
        maxKpIndex: strongestStorm?.score ?? null,
        latestCmeSpeedKms: latestCme?.score ?? null,
        eventCounts: {
          flares: flares.length,
          geomagneticStorms: storms.length,
          cmes: cmes.length,
        },
      },
      200,
      cacheHeaders(900),
    );
  } catch (err) {
    console.error("space_weather_summary_failed", (err as Error).message);
    return c.json({ error: "upstream_failed", source: "donki" }, 502);
  }
});

const SPACE_ASK_MAX_BYTES = 20_480;

space.get("/rag/status", async (c) => {
  const retrievalMode = ragRetrievalMode(c.env);
  const embeddingGatewayConfigured = Boolean(semanticEmbeddingHost(c.env));
  const embedder = semanticEmbedderFor(c.env);
  return c.json(
    {
      generatedAt: new Date().toISOString(),
      corpusDocuments: spaceCorpus.length,
      chunkCount: chunks.length,
      retrievalMode,
      semanticEmbeddingsReady: retrievalMode === "semantic" && Boolean(embedder),
      embeddingGatewayConfigured,
      providers: {
        ollamaChat: Boolean(c.env.OLLAMA_URL ?? c.env.AI_OLLAMA_URL),
        workersAi: Boolean(c.env.AI),
        gemini: Boolean(c.env.GEMINI_API_KEY),
      },
    },
    200,
    cacheHeaders(60),
  );
});

space.post("/ask", spaceAskRateLimit, async (c) => {
  const raw = await c.req.text();
  if (raw.length > SPACE_ASK_MAX_BYTES) {
    return c.json({ error: "payload_too_large", maxBytes: SPACE_ASK_MAX_BYTES }, 413);
  }
  let parsed: unknown;
  try {
    parsed = raw.length ? JSON.parse(raw) : null;
  } catch {
    return c.json({ error: "invalid_json" }, 400);
  }
  const body = AskBody.safeParse(parsed);
  if (!body.success) return c.json({ error: "invalid_body", issues: body.error.issues }, 400);

  const start = Date.now();
  const { question } = body.data;
  const topK = body.data.topK ?? 5;
  const retrievalMode = ragRetrievalMode(c.env);
  let matches = retrieveChunks(question, chunks, { topK });
  if (retrievalMode === "semantic") {
    const embedder = semanticEmbedderFor(c.env);
    if (embedder) {
      try {
        matches = await retrieveChunksSemantic(question, chunks, embedder, { topK });
      } catch (err) {
        console.warn("space_semantic_retrieval_fallback", (err as Error).message);
      }
    }
  }
  const context = buildContext(matches);

  if (matches.length === 0) {
    return c.json({
      answer: localAnswer(question, matches),
      model: "local-retrieval",
      source: "local-rag" satisfies SpaceAskSource,
      latencyMs: Date.now() - start,
      chunks: [],
    });
  }

  if (c.env.OLLAMA_URL ?? c.env.AI_OLLAMA_URL) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 4500);
    try {
      const answer = await callOllama(c.env, question, context, ac.signal);
      clearTimeout(timer);
      return c.json({
        answer,
        model: c.env.OLLAMA_MODEL ?? c.env.AI_OLLAMA_MODEL,
        source: "ollama" satisfies SpaceAskSource,
        latencyMs: Date.now() - start,
        chunks: matches.map(sourceShape),
      });
    } catch (err) {
      clearTimeout(timer);
      console.warn("space_ollama_fallback", (err as Error).message);
    }
  }

  if (c.env.AI) {
    try {
      const answer = await callWorkersAi(c.env, question, context);
      return c.json({
        answer,
        model: c.env.WORKERS_AI_MODEL ?? "@cf/meta/llama-3.1-8b-instruct",
        source: "workers-ai" satisfies SpaceAskSource,
        latencyMs: Date.now() - start,
        chunks: matches.map(sourceShape),
      });
    } catch (err) {
      console.warn("space_workers_ai_fallback", (err as Error).message);
    }
  }

  if (c.env.GEMINI_API_KEY) {
    try {
      const answer = await callGemini(c.env, question, context);
      return c.json({
        answer,
        model: c.env.GEMINI_MODEL ?? "gemini-2.5-flash",
        source: "gemini" satisfies SpaceAskSource,
        latencyMs: Date.now() - start,
        chunks: matches.map(sourceShape),
      });
    } catch (err) {
      console.error("space_gemini_failed", (err as Error).message);
    }
  }

  return c.json({
    answer: localAnswer(question, matches),
    model: "local-retrieval",
    source: "local-rag" satisfies SpaceAskSource,
    latencyMs: Date.now() - start,
    chunks: matches.map(sourceShape),
  });
});
