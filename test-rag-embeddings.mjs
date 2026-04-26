/**
 * Small checks for @aliasist/rag semantic utilities (no live Ollama required).
 * Run from repo root after: pnpm --filter @aliasist/rag build
 *
 *   node test-rag-embeddings.mjs
 */

import { strict as assert } from "node:assert";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ragRoot = join(__dirname, "packages/rag/dist/index.js");
const { cosineSimilarity, createOllamaEmbeddings, retrieveChunksSemantic, chunkText } =
  await import(ragRoot);

// --- cosineSimilarity
assert.equal(cosineSimilarity([1, 0, 0], [1, 0, 0]), 1);
assert.ok(Math.abs(cosineSimilarity([1, 0, 0], [0, 1, 0])) < 1e-10);
assert.equal(cosineSimilarity([0, 0, 0], [1, 0, 0]), 0);

// --- Ollama embed path + semantic ranking (mocked /api/embed)
const mockFetch = (vectors) => async (url, init) => {
  const u = String(url);
  if (!u.includes("/api/embed") || u.includes("embeddings")) {
    return new Response("not used", { status: 500 });
  }
  const body = JSON.parse(/** @type {string} */ (init?.body));
  const inputs = Array.isArray(body.input) ? body.input : [body.input];
  const embeddings = inputs.map((_, i) => vectors[i] ?? [0, 0, 1]);
  return new Response(JSON.stringify({ embeddings }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

const filler = (n) => Array.from({ length: n }, () => "word").join(" ");
const longText = `${filler(100)}. FIRST_MARK ${filler(100)}. SECOND_MARK ${filler(50)}.`;
const textChunks = chunkText(longText, { source: "doc", chunkSize: 200, overlap: 0 });
assert.ok(textChunks.length >= 2, "fixture should yield multiple chunks");
// Mock API order: [question, ...chunkTexts] — set the last chunk's vector most aligned with the question.
const vecs = [[1, 0, 0]];
for (let i = 0; i < textChunks.length; i++) {
  vecs.push(i === textChunks.length - 1 ? [0.99, 0.1, 0] : [0, 1, 0]);
}
const emb = createOllamaEmbeddings({
  host: "http://ollama-mock",
  model: "embeddinggemma:latest",
  fetchImpl: mockFetch(vecs),
});
const ranked = await retrieveChunksSemantic("alignment probe", textChunks, emb, {
  topK: 2,
});
const lastChunk = textChunks[textChunks.length - 1];
assert.equal(ranked[0]?.id, lastChunk?.id, "highest cosine should be the last chunk in this fixture");

console.log("test-rag-embeddings: ok");
