/** Static fixture for the SpaceSist Memory MVP UI — not loaded from an API. */

export interface MockSpace {
  id: string;
  name: string;
  description: string;
  highlights: string[];
}

export interface MockNote {
  id: string;
  spaceId: string;
  title: string;
  kind: "note" | "log" | "decision";
  at: string;
  summary: string;
}

export interface MockBundle {
  id: string;
  name: string;
  spaceId: string;
  summary: string;
  chunkCount: number;
}

export interface MockIndexStatus {
  embedModel: string;
  indexLabel: string;
  entryCount: number;
  builtAtLabel: string;
  hostLabel: string;
  state: "mock" | "ready";
}

export interface MockSourceChunk {
  id: string;
  spaceId: string;
  source: string;
  scoreLabel: string;
  text: string;
}

/** Per-space copy for the Ask panel (examples only; not from @aliasist/rag). */
export interface SpaceAskCopy {
  inputPlaceholder: string;
  exampleQuestion: string;
  exampleAnswer: string;
}

export const mockSpaces: MockSpace[] = [
  {
    id: "aliasist",
    name: "Aliasist",
    description: "Platform monorepo, portal, workers, and shared packages.",
    highlights: ["pnpm / Turbo", "packages/rag", "Cloudflare"],
  },
  {
    id: "datasist",
    name: "DataSist",
    description: "Data center map, filters, and curated facility context.",
    highlights: ["Live dataset", "Map + drawer"],
  },
  {
    id: "ecosist",
    name: "EcoSist",
    description: "Severe weather lab and storm-adjacent workflows.",
    highlights: ["Radar story", "Alpha"],
  },
  {
    id: "spacesist",
    name: "SpaceSist",
    description: "Project memory, notes, RAG indexes, and ask-the-space.",
    highlights: ["Memory MVP", "Static mock"],
  },
  {
    id: "penovia",
    name: "Penovia",
    description: "Writing and long-form capture (placeholder area).",
    highlights: ["Drafts", "Exports"],
  },
  {
    id: "school",
    name: "School Notes",
    description: "Coursework and study context kept out of production code.",
    highlights: ["Semester tags", "PDFs"],
  },
  {
    id: "career",
    name: "Career / Resume",
    description: "Résumé versions, interview prep, and role targets.",
    highlights: ["ATS", "Talking points"],
  },
];

export const mockNotes: MockNote[] = [
  {
    id: "n1",
    spaceId: "aliasist",
    kind: "log",
    at: "2026-04-24",
    title: "RAG v2 index round-trip",
    summary: "Confirmed JSON save/load for chunk + embedding pairs; test script at repo root.",
  },
  {
    id: "n2",
    spaceId: "aliasist",
    kind: "decision",
    at: "2026-04-22",
    title: "Keep RAG in packages/rag only",
    summary: "Sists stay UI-facing; no duplicate retrieval logic in feature modules.",
  },
  {
    id: "n3",
    spaceId: "spacesist",
    kind: "note",
    at: "2026-04-20",
    title: "Memory MVP layout",
    summary: "Hero + spaces + mock ask + source chunk preview before workers-api wiring.",
  },
  {
    id: "n4",
    spaceId: "datasist",
    kind: "log",
    at: "2026-04-18",
    title: "Filter rail performance",
    summary: "Client-side refilter after initial load; consider server caps later.",
  },
  {
    id: "n5",
    spaceId: "ecosist",
    kind: "note",
    at: "2026-04-16",
    title: "Storm overlay opacity",
    summary: "Keep radar base readable; cap alpha on warning polygons during animation.",
  },
  {
    id: "n6",
    spaceId: "ecosist",
    kind: "log",
    at: "2026-04-12",
    title: "SPC convective outlook layer",
    summary: "Day-1 and Day-2 toggles; lazy-load heavy GeoJSON in worker chunk.",
  },
  {
    id: "n7",
    spaceId: "school",
    kind: "note",
    at: "2026-04-10",
    title: "CIS final project scope",
    summary: "Narrowed to data pipeline + dashboard; no mobile app in this term.",
  },
  {
    id: "n8",
    spaceId: "career",
    kind: "decision",
    at: "2026-04-08",
    title: "Resume: lead with platform work",
    summary: "Aliasist + Cloudflare + RAG first; long-form writing second on page two.",
  },
];

export const mockBundles: MockBundle[] = [
  {
    id: "b1",
    spaceId: "aliasist",
    name: "Monorepo architecture",
    summary: "Turbo tasks, workspace layout, and where RAG hooks in.",
    chunkCount: 42,
  },
  {
    id: "b2",
    spaceId: "aliasist",
    name: "workers-api surface",
    summary: "Hono routes, health, and future /space endpoints (not wired yet).",
    chunkCount: 18,
  },
  {
    id: "b3",
    spaceId: "spacesist",
    name: "SpaceSist product notes",
    summary: "Spaces, logs, bundles, and ask-this-space behaviors (this page).",
    chunkCount: 24,
  },
  {
    id: "b4",
    spaceId: "datasist",
    name: "US facility seed set",
    summary: "Curated data center rows, IDs, and rough geo for map + drawer.",
    chunkCount: 60,
  },
  {
    id: "b5",
    spaceId: "ecosist",
    name: "Severe weather context pack",
    summary: "Glossary, chart legends, and watch/warning semantics for the lab UI.",
    chunkCount: 33,
  },
];

export const mockIndexStatus: MockIndexStatus = {
  embedModel: "embeddinggemma:latest (Ollama)",
  indexLabel: "./.aliasist/mock-rag-index.json",
  entryCount: 0,
  builtAtLabel: "— (not built in this mock)",
  hostLabel: "localhost:11434 (dev placeholder)",
  state: "mock",
};

export const defaultAskCopy: SpaceAskCopy = {
  inputPlaceholder: "Type a question about this space… (API not connected)",
  exampleQuestion: "What context is indexed for this space?",
  exampleAnswer:
    "Example only — not from @aliasist/rag. Once workers-api is connected, answers will use your bundles and source chunks for this project space.",
};

export const askCopyBySpaceId: Record<string, SpaceAskCopy> = {
  aliasist: {
    inputPlaceholder: "e.g. Where does RAG logic live in the monorepo?",
    exampleQuestion: "What did we decide about where RAG logic should live in the monorepo?",
    exampleAnswer:
      "Example: keep retrieval in packages/rag; sists stay UI-facing and call the engine via the API (not duplicated chunking).",
  },
  datasist: {
    inputPlaceholder: "e.g. How are facilities filtered after first load?",
    exampleQuestion: "What’s the current approach to filter performance on the map?",
    exampleAnswer:
      "Example: start with client-side refilter; consider server caps when the live dataset grows.",
  },
  ecosist: {
    inputPlaceholder: "e.g. How do we keep radar base layers readable?",
    exampleQuestion: "What did we log about warning polygon opacity and overlays?",
    exampleAnswer:
      "Example: cap alpha and lazy-load heavy GeoJSON; keep the story readable during animation.",
  },
  spacesist: {
    inputPlaceholder: "e.g. What’s on the memory MVP before workers-api?",
    exampleQuestion: "What does the SpaceSist page include before the API is wired?",
    exampleAnswer:
      "Example: project spaces, notes, bundles, ask UI, and source-chunk preview — all mock-scoped to the active space.",
  },
  penovia: {
    inputPlaceholder: "e.g. What export format are we tracking?",
    exampleQuestion: "What’s the placeholder scope for long-form in Penovia?",
    exampleAnswer: "Example: drafts and export paths are TBD; use this space to park writing context.",
  },
  school: {
    inputPlaceholder: "e.g. What’s in scope for the CIS final project?",
    exampleQuestion: "What was decided about the CIS final project scope?",
    exampleAnswer: "Example: data pipeline + dashboard; mobile app is out of scope for this term.",
  },
  career: {
    inputPlaceholder: "e.g. How should the résumé lead?",
    exampleQuestion: "What’s the current résumé ordering strategy?",
    exampleAnswer: "Example: lead with platform/Cloudflare/RAG; move long-form writing to page two.",
  },
};

export function getAskCopyForSpace(spaceId: string): SpaceAskCopy {
  return askCopyBySpaceId[spaceId] ?? {
    ...defaultAskCopy,
    inputPlaceholder: `${defaultAskCopy.inputPlaceholder} (${spaceId})`,
  };
}

export const mockSourceChunks: MockSourceChunk[] = [
  {
    id: "c1",
    spaceId: "aliasist",
    source: "notes/architecture.md",
    scoreLabel: "0.84",
    text: "Shared RAG engine lives in packages/rag. Feature sists consume it via API, not duplicated chunking logic.",
  },
  {
    id: "c2",
    spaceId: "spacesist",
    source: "sists/spacesist/src/data/mockMemory.ts",
    scoreLabel: "0.79",
    text: "SpaceSist handles project spaces, logs, bundles, and surfaced source chunks after a query.",
  },
  {
    id: "c3",
    spaceId: "aliasist",
    source: "log/2026-04-22.md",
    scoreLabel: "0.71",
    text: "Decision: keep provider switching and embeddings in one package; portal stays thin.",
  },
  {
    id: "c4",
    spaceId: "datasist",
    source: "docs/dataset-curation.md",
    scoreLabel: "0.77",
    text: "Facility rows are curated; IDs align with the map layer; drawer uses the same record.",
  },
  {
    id: "c5",
    spaceId: "ecosist",
    source: "docs/radar-layers.md",
    scoreLabel: "0.68",
    text: "Base reflectivity under warning polygons; user can toggle SPC outlook overlays.",
  },
];
