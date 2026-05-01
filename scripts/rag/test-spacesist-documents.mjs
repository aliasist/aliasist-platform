/**
 * Dry-run: mock SpaceSist data → RAG-friendly documents (print only).
 * No Ollama, no OpenAI, no live HTTP, no embeddings, no @aliasist/rag `buildRagIndex`.
 * The root `tsx` devDependency is only a TypeScript loader for Node.
 *
 *   node scripts/rag/test-spacesist-documents.mjs
 *   pnpm test:spacesist-rag-dry
 */

import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RERUN = "ALIASIST_SPACEDOC_RERUN";
if (process.env[RERUN] !== "1") {
  const scriptPath = fileURLToPath(import.meta.url);
  const r = spawnSync(
    process.execPath,
    ["--import", "tsx", scriptPath],
    { stdio: "inherit", env: { ...process.env, [RERUN]: "1" } },
  );
  process.exit(r.status === null ? 1 : r.status);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "../..");

const { buildSpaceRagDocuments } = await import(
  new URL("../../sists/spacesist/src/rag/spaceRagIngest.ts", import.meta.url).href
);
const {
  MOCK_APOD,
  MOCK_ISS,
  MOCK_PEOPLE_IN_SPACE,
  MOCK_SPACEX_NEXT,
} = await import(new URL("../../sists/spacesist/src/data/spaceMock.ts", import.meta.url).href);

const input = {
  iss: MOCK_ISS,
  people: MOCK_PEOPLE_IN_SPACE,
  apod: { ...MOCK_APOD },
  spacex: MOCK_SPACEX_NEXT,
};

const documents = buildSpaceRagDocuments(input);

if (documents.length !== 4) {
  throw new Error(`Expected 4 SpaceSist documents, got ${documents.length}.`);
}

const bySource = new Map(documents.map((document) => [document.source, document]));
const expectations = [
  {
    source: "spacesist/iss-location",
    feed: "iss",
    kind: "orbit",
    pattern:
      /International Space Station|ISS|latitude|longitude|WGS-84|decimal degrees|altitude|Where The ISS/i,
  },
  {
    source: "spacesist/people-in-space",
    feed: "people",
    kind: "crew",
    pattern: /humans currently in Earth orbit|Crew|Jasmin|Furukawa|Open Notify/i,
  },
  {
    source: "spacesist/nasa-apod",
    feed: "apod",
    kind: "astronomy",
    pattern: /NASA|Astronomy Picture of the Day|APOD|galaxy|NGC 4414|planetary\/apod/i,
  },
  {
    source: "spacesist/spacex-launch",
    feed: "spacex",
    kind: "launch",
    pattern: /SpaceX|launch|Falcon|Starlink|SLC-40|webcast/i,
  },
];

for (const expected of expectations) {
  const document = bySource.get(expected.source);
  if (!document) {
    throw new Error(`Missing document: ${expected.source}`);
  }
  if (document.metadata?.feed !== expected.feed || document.metadata?.kind !== expected.kind) {
    throw new Error(`Bad metadata for ${expected.source}: ${JSON.stringify(document.metadata ?? {})}`);
  }
  if (document.text.length < 160 || !expected.pattern.test(document.text)) {
    throw new Error(`Document is not useful enough for future RAG ingestion: ${expected.source}`);
  }
}

console.log(`# SpaceSist RAG document dry-run (mock data only)\n# repo: ${root}\n`);
for (let i = 0; i < documents.length; i += 1) {
  const d = documents[i];
  console.log(`--- document ${i + 1} ---`);
  console.log(`source: ${d.source}`);
  console.log(`metadata: ${JSON.stringify(d.metadata ?? {})}`);
  console.log("text:\n" + d.text + "\n");
}

console.log(`# total documents: ${documents.length}`);
console.log("# dry-run complete (no network, no embeddings).");
