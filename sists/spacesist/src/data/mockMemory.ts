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
  source: string;
  scoreLabel: string;
  text: string;
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
];

export const mockIndexStatus: MockIndexStatus = {
  embedModel: "embeddinggemma:latest (Ollama)",
  indexLabel: "./.aliasist/mock-rag-index.json",
  entryCount: 0,
  builtAtLabel: "— (not built in this mock)",
  hostLabel: "localhost:11434 (tunnel to Azure Ollama when dev)",
  state: "mock",
};

export const mockAskQuestion =
  "What did we decide about where RAG logic should live in the monorepo?";

export const mockAskAnswer = `Static answer (not from @aliasist/rag): retrieval and providers stay in packages/rag; SpaceSist is the human memory shell. This panel will call the shared engine once workers-api and client schemas exist.`;

export const mockSourceChunks: MockSourceChunk[] = [
  {
    id: "c1",
    source: "notes/architecture.md",
    scoreLabel: "0.84",
    text: "Shared RAG engine lives in packages/rag. Feature sists consume it via API, not duplicated chunking logic.",
  },
  {
    id: "c2",
    source: "spacesist/README.md",
    scoreLabel: "0.79",
    text: "SpaceSist handles project spaces, logs, bundles, and surfaced source chunks after a query.",
  },
  {
    id: "c3",
    source: "log/2026-04-22.md",
    scoreLabel: "0.71",
    text: "Decision: keep provider switching and embeddings in one package; portal stays thin.",
  },
];
