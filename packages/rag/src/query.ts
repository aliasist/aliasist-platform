import type { TextChunk } from "./ingest.js";

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

export interface AnswerQuestionOptions extends RetrieveOptions {
  provider: RagProvider;
  systemPrompt?: string;
  noContextMessage?: string;
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

export const buildContext = (chunks: TextChunk[]): string =>
  chunks
    .map((chunk, index) => `[${index + 1}] ${chunk.source}\n${chunk.text}`)
    .join("\n\n");

export const query = async (
  question: string,
  chunks: TextChunk[],
  options: AnswerQuestionOptions,
): Promise<QueryResult> => {
  const matches = retrieveChunks(question, chunks, options);

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
