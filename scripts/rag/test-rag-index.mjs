/**
 * Rounds-trip JSON index and checks query ranking (no live Ollama).
 * Prerequisite: pnpm --filter @aliasist/rag build
 *
 *   node scripts/rag/test-rag-index.mjs
 */

import { strict as assert } from "node:assert";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rag = join(__dirname, "../../packages/rag/dist/index.js");
const {
  buildRagIndex,
  loadRagIndex,
  queryRagIndex,
  saveRagIndex,
} = await import(rag);

const pad = (n) => "word ".repeat(n);

const createMockEmbeddings = () => {
  const m = {
    model: "mock-embed",
    async embedTexts(texts) {
      return texts.map((_, i) =>
        i === texts.length - 1 ? [0.99, 0.1, 0] : [0, 1, 0],
      );
    },
    async embedForChunks(question, chunkTexts) {
      if (chunkTexts.length === 0) {
        return { question: [1, 0, 0], chunks: [] };
      }
      const all = await m.embedTexts([question, ...chunkTexts]);
      return { question: all[0] ?? [], chunks: all.slice(1) };
    },
  };
  return m;
};

const provider = {
  name: "mock",
  model: "mock-llm",
  async answer({ context }) {
    return `ok:${context.slice(0, 20)}`;
  },
};

const emb = createMockEmbeddings();
const longDoc = {
  text: `${pad(80)}. MARK_A ${pad(80)}. MARK_B ${pad(40)}.`,
  source: "doc",
};

const index = await buildRagIndex([longDoc], {
  embedder: emb,
  chunkSize: 200,
  overlap: 0,
});
assert.ok(index.entries.length >= 2, "expected multiple index entries");
assert.equal(index.embedModel, "mock-embed");

const tempDir = await mkdtemp(join(tmpdir(), "rag-index-"));
const indexPath = join(tempDir, "index.json");
try {
  await saveRagIndex(indexPath, index);
  const roundtrip = await loadRagIndex(indexPath);
  assert.equal(roundtrip.entries.length, index.entries.length);
  assert.equal(roundtrip.embedModel, index.embedModel);

  const res = await queryRagIndex(roundtrip, "probe", {
    provider,
    embedder: emb,
    topK: 2,
  });
  const last = index.entries[index.entries.length - 1];
  assert.equal(res.chunks[0]?.id, last?.chunk.id, "top score should be last chunk in fixture");
} finally {
  await rm(tempDir, { recursive: true, force: true });
}

console.log("test-rag-index: ok");
