import type { TextChunk } from "./ingest.js";
import { cosineSimilarity } from "./similarity.js";

export interface RagProvider {
  name: string;
  model: string;
  answer(input: AnswerInput): Promise<string>;
}

export interface AnswerInput {
  question: string;
  context: string;
  systemPrompt?: string;
}

export interface RetrievedChunk extends TextChunk {
  score: number;
}

export interface RetrieveOptions {
  topK?: number;
}

export type RetrievalMode = "keyword" | "semantic";

/**
 * In-process embedder for semantic retrieval. Use `createOllamaEmbeddings()` from `embed/ollama.js` for Ollama.
 */
export interface ChunkEmbedder {
  embedForChunks(
    question: string,
    chunkTexts: string[],
  ): Promise<{ question: number[]; chunks: number[][] }>;
}

export interface AnswerQuestionOptions extends RetrieveOptions {
  provider: RagProvider;
  systemPrompt?: string;
  noContextMessage?: string;
  /**
   * `keyword` (default) uses token overlap. `semantic` uses cosine similarity of embeddings (no vector DB; in-memory only).
   */
  retrieval?: RetrievalMode;
  /**
   * Required when `retrieval` is `"semantic"`. Typically `createOllamaEmbeddings()`.
   */
  embeddings?: ChunkEmbedder;
}

export interface QueryResult {
  answer: string;
  provider: string;
  model: string;
  chunks: RetrievedChunk[];
}

const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .match(/[a-z0-9][a-z0-9-]{2,}/g)
    ?.filter((token) => !STOP_WORDS.has(token)) ?? [];

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "are",
  "was",
  "were",
  "but",
  "not",
  "you",
  "your",
  "about",
  "what",
  "when",
  "where",
  "why",
  "how",
]);

const scoreChunk = (questionTokens: Set<string>, chunk: TextChunk): number => {
  if (questionTokens.size === 0) return 0;
  const chunkTokens = new Set(tokenize(chunk.text));
  let overlap = 0;
  for (const token of questionTokens) {
    if (chunkTokens.has(token)) overlap += 1;
  }
  return overlap / Math.sqrt(chunkTokens.size || 1);
};

export const retrieveChunks = (
  question: string,
  chunks: TextChunk[],
  options: RetrieveOptions = {},
): RetrievedChunk[] => {
  const topK = Math.max(1, options.topK ?? 4);
  const questionTokens = new Set(tokenize(question));

  return chunks
    .map((chunk) => ({ ...chunk, score: scoreChunk(questionTokens, chunk) }))
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
};

/**
 * Ranks chunks by cosine similarity between the question embedding and each chunk embedding.
 */
export const retrieveChunksSemantic = async (
  question: string,
  chunks: TextChunk[],
  embedder: ChunkEmbedder,
  options: RetrieveOptions = {},
): Promise<RetrievedChunk[]> => {
  if (chunks.length === 0) return [];

  const topK = Math.max(1, options.topK ?? 4);
  const texts = chunks.map((c) => c.text);
  const { question: qVec, chunks: chunkVecs } = await embedder.embedForChunks(question, texts);

  if (qVec.length === 0) {
    throw new Error("Semantic retrieval: question embedding is empty.");
  }

  const scored: RetrievedChunk[] = chunks.map((chunk, i) => {
    const v = chunkVecs[i];
    if (!v || v.length === 0) {
      return { ...chunk, score: 0 };
    }
    if (v.length !== qVec.length) {
      throw new Error(
        `Semantic retrieval: dimension mismatch (question ${qVec.length} vs chunk ${v.length}).`,
      );
    }
    return { ...chunk, score: cosineSimilarity(qVec, v) };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
};

export const buildContext = (chunks: TextChunk[]): string =>
  chunks
    .map((chunk, index) => `[${index + 1}] ${chunk.source}\n${chunk.text}`)
    .join("\n\n");

export const query = async (
  question: string,
  chunks: TextChunk[],
  options: AnswerQuestionOptions,
): Promise<QueryResult> => {
  const mode = options.retrieval ?? "keyword";
  let matches: RetrievedChunk[];
  if (mode === "semantic") {
    if (!options.embeddings) {
      throw new Error(
        'query: retrieval "semantic" requires `embeddings` (e.g. createOllamaEmbeddings()).',
      );
    }
    matches = await retrieveChunksSemantic(question, chunks, options.embeddings, options);
  } else {
    matches = retrieveChunks(question, chunks, options);
  }

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

export const answerQuestion = query;
