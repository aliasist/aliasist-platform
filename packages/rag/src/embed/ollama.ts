interface RuntimeGlobal {
  process?: {
    env?: Record<string, string | undefined>;
  };
}

const env = () => (globalThis as typeof globalThis & RuntimeGlobal).process?.env ?? {};

/**
 * Batches the question and chunk texts in one call when `POST /api/embed` is available.
 */
export interface OllamaEmbeddings {
  readonly model: string;
  /** Embed one question plus chunk texts in one or more API calls. */
  embedForChunks(
    question: string,
    chunkTexts: string[],
  ): Promise<{ question: number[]; chunks: number[][] }>;
  /** Embed multiple passage strings (e.g. for index building; no question prefix). */
  embedTexts(texts: string[]): Promise<number[][]>;
}

export interface OllamaEmbeddingsOptions {
  host?: string;
  model?: string;
  fetchImpl?: typeof fetch;
}

const normalizeHost = (raw: string) => raw.replace(/\/$/, "");

const parseEmbedResponse = (json: unknown): number[][] | null => {
  if (!json || typeof json !== "object") return null;
  const rec = json as { embeddings?: unknown; embedding?: unknown };
  if (Array.isArray(rec.embeddings) && rec.embeddings.length > 0) {
    return rec.embeddings as number[][];
  }
  if (Array.isArray(rec.embedding)) {
    return [rec.embedding as number[]];
  }
  return null;
};

const postEmbed = async (
  host: string,
  model: string,
  inputs: string[],
  fetchImpl: typeof fetch,
): Promise<number[][]> => {
  if (inputs.length === 0) {
    return [];
  }

  const body = { model, input: inputs.length === 1 ? inputs[0]! : inputs };
  const response = await fetchImpl(`${host}/api/embed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let vectors: number[][];

  if (response.ok) {
    const json = (await response.json()) as unknown;
    const parsed = parseEmbedResponse(json);
    if (parsed && parsed.length === inputs.length) {
      vectors = parsed;
    } else if (parsed && inputs.length === 1 && parsed.length === 1) {
      vectors = parsed;
    } else {
      vectors = await embedWithLegacy(host, model, inputs, fetchImpl);
    }
  } else if (response.status === 404) {
    vectors = await embedWithLegacy(host, model, inputs, fetchImpl);
  } else {
    const text = await response.text();
    throw new Error(`Ollama /api/embed failed: ${response.status} ${response.statusText} ${text}`);
  }

  if (vectors.length !== inputs.length) {
    throw new Error(
      `Ollama embeddings: expected ${inputs.length} vectors, got ${vectors.length}.`,
    );
  }

  return vectors;
};

const embedWithLegacy = async (
  host: string,
  model: string,
  texts: string[],
  fetchImpl: typeof fetch,
): Promise<number[][]> => {
  const results = await Promise.all(
    texts.map(async (prompt) => {
      const response = await fetchImpl(`${host}/api/embeddings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, prompt }),
      });
      if (!response.ok) {
        throw new Error(
          `Ollama legacy /api/embeddings failed: ${response.status} ${response.statusText}`,
        );
      }
      const json = (await response.json()) as { embedding?: number[] };
      if (!Array.isArray(json.embedding)) {
        throw new Error("Ollama /api/embeddings: missing embedding array.");
      }
      return json.embedding;
    }),
  );
  return results;
};

/**
 * Ollama embedding client using `POST /api/embed`, with a fallback to
 * legacy `POST /api/embeddings` (one request per string).
 * Reads `OLLAMA_HOST` and `OLLAMA_EMBED_MODEL` (default `embeddinggemma:latest`).
 */
export const createOllamaEmbeddings = (options: OllamaEmbeddingsOptions = {}): OllamaEmbeddings => {
  const host = normalizeHost(options.host ?? env().OLLAMA_HOST ?? "http://localhost:11434");
  const model = options.model ?? env().OLLAMA_EMBED_MODEL ?? "embeddinggemma:latest";
  const fetchImpl = options.fetchImpl ?? fetch;

  return {
    model,
    async embedTexts(texts) {
      return postEmbed(host, model, texts, fetchImpl);
    },
    async embedForChunks(question, chunkTexts) {
      const inputs = [question, ...chunkTexts];
      if (inputs.length === 0) {
        return { question: [], chunks: [] };
      }
      const vectors = await postEmbed(host, model, inputs, fetchImpl);
      const [q, ...rest] = vectors;
      return { question: q ?? [], chunks: rest };
    },
  };
};
