import type { RagProvider } from "../query.js";

interface RuntimeGlobal {
  process?: {
    env?: Record<string, string | undefined>;
  };
}

export interface OpenAiProviderOptions {
  apiKey?: string;
  model?: string;
  fetchImpl?: typeof fetch;
}

const env = () => (globalThis as typeof globalThis & RuntimeGlobal).process?.env ?? {};

export const createOpenAiProvider = (options: OpenAiProviderOptions = {}): RagProvider => {
  const apiKey = options.apiKey ?? env().OPENAI_API_KEY;
  const model = options.model ?? env().OPENAI_MODEL ?? "gpt-4o-mini";
  const fetchImpl = options.fetchImpl ?? fetch;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required for the OpenAI RAG provider.");
  }

  return {
    name: "openai",
    model,
    async answer({ question, context, systemPrompt }) {
      const response = await fetchImpl("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content:
                systemPrompt ??
                "Answer using only the provided local context. If the context is insufficient, say so.",
            },
            {
              role: "user",
              content: `Context:\n${context}\n\nQuestion: ${question}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI RAG request failed: ${response.status} ${response.statusText}`);
      }

      const json = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      return json.choices?.[0]?.message?.content?.trim() ?? "";
    },
  };
};
