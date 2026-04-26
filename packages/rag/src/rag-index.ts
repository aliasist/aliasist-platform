import type { OllamaEmbeddings } from "./embed/ollama.js";
import { ingestDocuments, type IngestDocument, type TextChunk, type ChunkTextOptions } from "./ingest.js";
import {
  buildContext,
  type ChunkEmbedder,
  type QueryResult,
  type RagProvider,
  type RetrievedChunk,
  type RetrieveOptions,
} from "./query.js";
import { cosineSimilarity } from "./similarity.js";

export const RAG_INDEX_VERSION = 1 as const;

export interface RagIndexEntry {
  chunk: TextChunk;
  embedding: number[];
}

/**
 * Serializable index: `TextChunk` plus precomputed vectors for semantic lookup (JSON on disk, no vector DB).
 */
export interface RagIndex {
  version: typeof RAG_INDEX_VERSION;
  /** Embedding model name used to build the index (align `createOllamaEmbeddings` when querying). */
  embedModel: string;
  /** ISO-8601 time when the index was built. */
  builtAt: string;
  entries: RagIndexEntry[];
}

export interface BuildRagIndexOptions extends Omit<ChunkTextOptions, "source" | "metadata"> {
  /** Must match the model used for `queryRagIndex` (same dimension). */
  embedder: OllamaEmbeddings;
}

export const buildRagIndex = async (
  documents: IngestDocument[],
  options: BuildRagIndexOptions,
): Promise<RagIndex> => {
  const chunks = ingestDocuments(documents, {
    chunkSize: options.chunkSize,
    overlap: options.overlap,
  });
  if (chunks.length === 0) {
    return {
      version: RAG_INDEX_VERSION,
      embedModel: options.embedder.model,
      builtAt: new Date().toISOString(),
      entries: [],
    };
  }

  const texts = chunks.map((c) => c.text);
  const vectors = await options.embedder.embedTexts(texts);
  if (vectors.length !== chunks.length) {
    throw new Error(
      `buildRagIndex: expected ${chunks.length} embeddings, got ${vectors.length}.`,
    );
  }

  const entries: RagIndexEntry[] = chunks.map((chunk, i) => ({
    chunk,
    embedding: vectors[i]!,
  }));

  return {
    version: RAG_INDEX_VERSION,
    embedModel: options.embedder.model,
    builtAt: new Date().toISOString(),
    entries,
  };
};

export interface QueryRagIndexOptions extends RetrieveOptions {
  provider: RagProvider;
  /**
   * Same kind of embedder and **same model** as used in `buildRagIndex` (e.g. `createOllamaEmbeddings` with
   * matching `OLLAMA_EMBED_MODEL` / options).
   */
  embedder: ChunkEmbedder;
  systemPrompt?: string;
  noContextMessage?: string;
}

const assertModelMatch = (index: RagIndex, embedder: ChunkEmbedder) => {
  const m = (embedder as { model?: string }).model;
  if (typeof m === "string" && m !== index.embedModel) {
    throw new Error(
      `queryRagIndex: embedder model "${m}" does not match index embedModel "${index.embedModel}".`,
    );
  }
};

/**
 * Embeds the question, ranks by cosine similarity to stored vectors, then runs the same LLM `answer` as `query()`.
 */
export const queryRagIndex = async (
  index: RagIndex,
  question: string,
  options: QueryRagIndexOptions,
): Promise<QueryResult> => {
  if (index.version !== RAG_INDEX_VERSION) {
    throw new Error(`queryRagIndex: unsupported index version ${String(index.version)}.`);
  }

  assertModelMatch(index, options.embedder);

  if (index.entries.length === 0) {
    return {
      answer: options.noContextMessage ?? "No matching local context was found.",
      provider: options.provider.name,
      model: options.provider.model,
      chunks: [],
    };
  }

  const { question: qVec } = await options.embedder.embedForChunks(question, []);
  if (qVec.length === 0) {
    throw new Error("queryRagIndex: question embedding is empty.");
  }

  const topK = Math.max(1, options.topK ?? 4);
  const scored: RetrievedChunk[] = index.entries.map((entry) => {
    const v = entry.embedding;
    if (v.length !== qVec.length) {
      throw new Error(
        `queryRagIndex: dimension mismatch (question ${qVec.length} vs index ${v.length}).`,
      );
    }
    return { ...entry.chunk, score: cosineSimilarity(qVec, v) };
  });

  const matches = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  if (matches.length === 0) {
    return {
      answer: options.noContextMessage ?? "No matching local context was found.",
      provider: options.provider.name,
      model: options.provider.model,
      chunks: matches,
    };
  }

  const answer = await options.provider.answer({
    question,
    context: buildContext(matches),
    systemPrompt: options.systemPrompt,
  });

  return {
    answer,
    provider: options.provider.name,
    model: options.provider.model,
    chunks: matches,
  };
};
