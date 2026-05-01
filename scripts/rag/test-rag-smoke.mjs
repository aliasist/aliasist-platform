/**
 * Smoke query against built @aliasist/rag (optional OpenAI/Ollama from env).
 * Prerequisites: pnpm --filter @aliasist/rag build
 *
 *   node scripts/rag/test-rag-smoke.mjs
 */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ragEntry = join(__dirname, "../../packages/rag/dist/index.js");

const { ingestDocuments, query, createRagProvider } = await import(ragEntry);

const documents = [
  {
    source: "aliasist-overview",
    text: `
Aliasist is a developer platform built around multiple app modules including datasist, ecosist, spacesist, and future sist apps.
aliasist.com is the developer portfolio website.
aliasist.tech is planned as the improved app hub where the apps are integrated.
The project is adding a hybrid RAG system that can use OpenAI or Ollama.
The RAG system will eventually connect across the whole Aliasist platform.
    `,
  },
];

const chunks = ingestDocuments(documents);
const provider = createRagProvider();
const question = "What is Aliasist building?";
const result = await query(question, chunks, { provider, topK: 4 });

console.log("\nProvider:");
console.log(`${result.provider} / ${result.model}`);

console.log("\nAnswer:");
console.log(result.answer);

console.log("\nRetrieved chunks:");
console.log(result.chunks);
