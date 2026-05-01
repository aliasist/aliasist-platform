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
    .match(/[a-z0-9][a-z0-9-]{1,}/g)
    ?.flatMap((token) => {
      if (STOP_WORDS.has(token)) return [];
      const stemmed = stemToken(token);
      return stemmed !== token ? [token, stemmed] : [token];
    }) ?? [];

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

const stemToken = (token: string): string => {
  if (token.length <= 4) return token;
  if (token.endsWith("ies") && token.length > 5) return `${token.slice(0, -3)}y`;
  if (token.endsWith("ing") && token.length > 6) return token.slice(0, -3);
  if (token.endsWith("ed") && token.length > 5) return token.slice(0, -2);
  if (token.endsWith("es") && token.length > 5) return token.slice(0, -2);
  if (token.endsWith("s") && token.length > 4 && !token.endsWith("ss")) return token.slice(0, -1);
  return token;
};

const normalizeForPhraseMatch = (text: string): string =>
  text.toLowerCase().replace(/[^a-z0-9\s-]+/g, " ").replace(/\s+/g, " ").trim();

const questionPhrases = (question: string): string[] => {
  const terms = question
    .toLowerCase()
    .match(/[a-z0-9][a-z0-9-]{1,}/g)
    ?.filter((token) => !STOP_WORDS.has(token)) ?? [];

  const phrases = new Set<string>();
  for (let size = 2; size <= 3; size += 1) {
    for (let i = 0; i <= terms.length - size; i += 1) {
      const phrase = terms.slice(i, i + size).join(" ").trim();
      if (phrase.length >= 8) phrases.add(phrase);
    }
  }
  return [...phrases];
};

const metadataTerms = (metadata?: Record<string, unknown>): string[] =>
  Object.values(metadata ?? {}).flatMap((value) =>
    typeof value === "string" ? tokenize(value) : [],
  );

const chunkTokenSet = (chunk: TextChunk): Set<string> =>
  new Set([
    ...tokenize(chunk.text),
    ...tokenize(chunk.source),
    ...metadataTerms(chunk.metadata),
  ]);

const scoreChunk = (
  questionTokens: Set<string>,
  phrases: string[],
  chunk: TextChunk,
): number => {
  if (questionTokens.size === 0) return 0;
  const chunkTokens = chunkTokenSet(chunk);
  const topicTokens = new Set(metadataTerms(chunk.metadata));
  const chunkText = normalizeForPhraseMatch(`${chunk.source} ${chunk.text}`);

  let overlap = 0;
  for (const token of questionTokens) {
    if (!chunkTokens.has(token)) continue;
    overlap += token.length >= 8 || token.includes("-") ? 1.25 : 1;
    if (topicTokens.has(token)) overlap += 0.35;
  }

  let phraseBoost = 0;
  for (const phrase of phrases) {
    if (chunkText.includes(phrase)) phraseBoost += 1.5;
  }

  return (overlap + Math.min(3, phraseBoost)) / Math.sqrt(chunkTokens.size || 1);
};

export const retrieveChunks = (
  question: string,
  chunks: TextChunk[],
  options: RetrieveOptions = {},
): RetrievedChunk[] => {
  const topK = Math.max(1, options.topK ?? 4);
  const questionTokens = new Set(tokenize(question));
  const phrases = questionPhrases(question);

  return chunks
    .map((chunk) => ({ ...chunk, score: scoreChunk(questionTokens, phrases, chunk) }))
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
