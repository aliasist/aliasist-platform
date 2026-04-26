import type { IssSnapshot, SpacePerson, SpacexLaunchPreview } from "../data/spaceMock";

/**
 * RAG-friendly document slice — matches `@aliasist/rag` `IngestDocument` (`source`, `text`, `metadata`)
 * so you can pass these into `ingestDocuments` / `buildRagIndex` later without changing this module.
 * Phase 4A does not import or run the RAG engine, embeddings, or Ollama.
 */
export type SpaceRagDocument = {
  source: string;
  text: string;
  metadata?: Record<string, unknown>;
};

/**
 * Bundle of space API-shaped data for ingestion. Field names align with common
 * public APIs (Where The ISS, Open Notify, NASA APOD, SpaceX) so workers can
 * map JSON → this shape → RAG documents without UI types.
 */
export type SpaceRagInput = {
  iss: IssSnapshot;
  people: SpacePerson[];
  apod: {
    title: string;
    date: string;
    explanation: string;
    imageUrl?: string;
    copyright?: string;
  };
  spacex: SpacexLaunchPreview;
};

const fmtLat = (n: number) => `${Math.abs(n).toFixed(4)}° ${n >= 0 ? "N" : "S"}`;
const fmtLon = (n: number) => `${Math.abs(n).toFixed(4)}° ${n >= 0 ? "E" : "W"}`;

function formatIss(iss: IssSnapshot): string {
  const illum =
    iss.dayNight === "day" ? "day side" : iss.dayNight === "night" ? "night side" : "terminator / mixed";
  return [
    "SpaceSist feed: International Space Station (ISS) orbital state (normalized).",
    `Subsatellite latitude (WGS-84): ${fmtLat(iss.latitude)}; longitude: ${fmtLon(iss.longitude)}.`,
    `Approximate altitude: ${iss.altitudeKm} km; approximate speed: ${iss.velocityKmh.toLocaleString()} km/h.`,
    `Illumination proxy (dashboard): ${illum}.`,
    "Source: Where The ISS or equivalent position API — data ingested for retrieval, not flight planning.",
  ].join(" ");
}

function formatPeople(people: SpacePerson[]): string {
  const lines = people.map(
    (p) => `${p.name} on ${p.craft} (${p.agency}${p.countryCode ? `, ${p.countryCode}` : ""})`,
  );
  return [
    "SpaceSist feed: humans currently in Earth orbit (normalized from Open Notify–style astros data).",
    `Count: ${people.length}.`,
    `Crew and visitors: ${lines.join("; ")}.`,
    "Source: Open Notify `http://api.open-notify.org/astros.json` or successor — ingested for mission awareness.",
  ].join(" ");
}

function formatApod(apod: SpaceRagInput["apod"]): string {
  const img = apod.imageUrl ? ` Image URL (when available): ${apod.imageUrl}.` : "";
  const cr = apod.copyright ? ` Copyright: ${apod.copyright}.` : "";
  return [
    "SpaceSist feed: NASA Astronomy Picture of the Day (APOD) — science communication text for retrieval.",
    `Date: ${apod.date}. Title: ${apod.title}.`,
    `Explanation: ${apod.explanation}`,
    `${img}${cr}`,
    "Source: NASA `planetary/apod` API — use official `url` / `hdurl` fields in production through a cached worker route.",
  ].join(" ");
}

function formatSpacex(launch: SpacexLaunchPreview): string {
  return [
    "SpaceSist feed: SpaceX launch schedule snapshot (normalized from SpaceX API–style manifest).",
    `Mission: ${launch.mission}. Vehicle: ${launch.rocket}.`,
    `Launch window / note: ${launch.windowSummary}. Target date (ISO): ${launch.launchIso}.`,
    `Pad: ${launch.site}. Status: ${launch.status}.`,
    `Webcast (if any): ${launch.webcastLabel} — ${launch.webcastUrl}.`,
    "Source: api.spacexdata.com v4/v5 or cached worker proxy — ingested for launch awareness only.",
  ].join(" ");
}

/**
 * Converts normalized space telemetry / science payloads into plain-text RAG
 * documents (one per upstream feed). Chunking, embeddings, and `buildRagIndex` stay in
 * `@aliasist/rag` when you wire a worker or local pipeline later.
 */
export function buildSpaceRagDocuments(input: SpaceRagInput): SpaceRagDocument[] {
  return [
    {
      source: "spacesist/iss-location",
      text: formatIss(input.iss),
      metadata: { feed: "iss", kind: "orbit" },
    },
    {
      source: "spacesist/people-in-space",
      text: formatPeople(input.people),
      metadata: { feed: "people", kind: "crew" },
    },
    {
      source: "spacesist/nasa-apod",
      text: formatApod(input.apod),
      metadata: { feed: "apod", kind: "astronomy" },
    },
    {
      source: "spacesist/spacex-launch",
      text: formatSpacex(input.spacex),
      metadata: { feed: "spacex", kind: "launch" },
    },
  ];
}
