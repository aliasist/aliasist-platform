export interface IngestDocument {
  text: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

export interface TextChunk {
  id: string;
  text: string;
  source: string;
  index: number;
  metadata?: Record<string, unknown>;
}

export interface ChunkTextOptions {
  chunkSize?: number;
  overlap?: number;
  source?: string;
  metadata?: Record<string, unknown>;
}

const DEFAULT_CHUNK_SIZE = 1200;
const DEFAULT_OVERLAP = 160;

const normalizeWhitespace = (text: string) => text.replace(/\s+/g, " ").trim();

const makeChunkId = (source: string, index: number) =>
  `${source.replace(/[^a-z0-9_-]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "document"}:${index}`;

export const chunkText = (text: string, options: ChunkTextOptions = {}): TextChunk[] => {
  const normalized = normalizeWhitespace(text);
  if (!normalized) return [];

  const chunkSize = Math.max(200, options.chunkSize ?? DEFAULT_CHUNK_SIZE);
  const overlap = Math.max(0, Math.min(options.overlap ?? DEFAULT_OVERLAP, chunkSize - 1));
  const source = options.source ?? "document";
  const chunks: TextChunk[] = [];

  let start = 0;
  while (start < normalized.length) {
    const hardEnd = Math.min(start + chunkSize, normalized.length);
    const sentenceEnd = normalized.lastIndexOf(". ", hardEnd);
    const end = sentenceEnd > start + chunkSize * 0.6 ? sentenceEnd + 1 : hardEnd;
    const chunk = normalized.slice(start, end).trim();

    if (chunk) {
      const index = chunks.length;
      chunks.push({
        id: makeChunkId(source, index),
        text: chunk,
        source,
        index,
        metadata: options.metadata,
      });
    }

    if (end >= normalized.length) break;
    start = Math.max(0, end - overlap);
  }

  return chunks;
};

export const ingestDocuments = (
  documents: IngestDocument[],
  options: Omit<ChunkTextOptions, "source" | "metadata"> = {},
): TextChunk[] =>
  documents.flatMap((document, documentIndex) =>
    chunkText(document.text, {
      ...options,
      source: document.source ?? `document-${documentIndex + 1}`,
      metadata: document.metadata,
    }),
  );
