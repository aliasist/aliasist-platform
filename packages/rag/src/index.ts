import { createOllamaProvider } from "./providers/ollama.js";
import { createOpenAiProvider } from "./providers/openai.js";

export type { ChunkTextOptions, IngestDocument, TextChunk } from "./ingest.js";
export { chunkText, ingestDocuments } from "./ingest.js";

export type {
  AnswerInput,
  AnswerQuestionOptions,
  ChunkEmbedder,
  QueryResult,
  RagProvider,
  RetrievedChunk,
  RetrievalMode,
  RetrieveOptions,
} from "./query.js";

export {
  answerQuestion,
  buildContext,
  query,
  retrieveChunks,
  retrieveChunksSemantic,
} from "./query.js";

export { cosineSimilarity } from "./similarity.js";

export type { OllamaEmbeddings, OllamaEmbeddingsOptions } from "./embed/ollama.js";
export { createOllamaEmbeddings } from "./embed/ollama.js";

export type {
  BuildRagIndexOptions,
  QueryRagIndexOptions,
  RagIndex,
  RagIndexEntry,
} from "./rag-index.js";
export { RAG_INDEX_VERSION, buildRagIndex, queryRagIndex } from "./rag-index.js";

export { loadRagIndex, saveRagIndex } from "./storage/json.js";

export type { OpenAiProviderOptions } from "./providers/openai.js";
export { createOpenAiProvider } from "./providers/openai.js";

export type { OllamaProviderOptions } from "./providers/ollama.js";
export { createOllamaProvider } from "./providers/ollama.js";

interface RuntimeGlobal {
  process?: {
    env?: Record<string, string | undefined>;
  };
}

const env = () =>
  (globalThis as typeof globalThis & RuntimeGlobal).process?.env ?? {};

export const createRagProvider = () => {
  const runtimeEnv = env();
  const provider = runtimeEnv.RAG_PROVIDER ?? "hybrid";

  if (provider === "openai") {
    return createOpenAiProvider();
  }

  if (provider === "ollama") {
    return createOllamaProvider();
  }

  if (provider === "hybrid") {
    return runtimeEnv.OPENAI_API_KEY
      ? createOpenAiProvider()
      : createOllamaProvider();
  }

  throw new Error(`Unsupported RAG_PROVIDER: ${provider}`);
};