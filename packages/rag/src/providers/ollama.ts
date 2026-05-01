import type { RagProvider } from "../query.js";

interface RuntimeGlobal {
  process?: {
    env?: Record<string, string | undefined>;
  };
}

export interface OllamaProviderOptions {
  host?: string;
  model?: string;
  fetchImpl?: typeof fetch;
}

const env = () => (globalThis as typeof globalThis & RuntimeGlobal).process?.env ?? {};

export const createOllamaProvider = (options: OllamaProviderOptions = {}): RagProvider => {
  const host = (options.host ?? env().OLLAMA_HOST ?? "http://localhost:11434").replace(/\/$/, "");
  const model = options.model ?? env().OLLAMA_MODEL ?? "llama3.1";
  const fetchImpl = options.fetchImpl ?? fetch;

  return {
    name: "ollama",
    model,
    async answer({ question, context, systemPrompt }) {
      const prompt = [
        systemPrompt ??
          "Answer using only the provided local context. If the context is insufficient, say so.",
        "",
        `Context:\n${context}`,
        "",
        `Question: ${question}`,
      ].join("\n");

      const response = await fetchImpl(`${host}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: {
            temperature: 0.2,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama RAG request failed: ${response.status} ${response.statusText}`);
      }

      const json = (await response.json()) as { response?: string };
      return json.response?.trim() ?? "";
    },
  };
};
