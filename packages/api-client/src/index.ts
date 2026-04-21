import { z } from "zod";

/**
 * Typed client for the Aliasist unified API (services/workers-api).
 * Schemas are duplicated intentionally (tiny, stable shapes) so this package
 * doesn't import the worker and stays browser-safe. When the schemas grow,
 * promote them into @aliasist/types.
 */

export const HealthResponse = z.object({
  ok: z.literal(true),
  service: z.string(),
  version: z.string(),
  time: z.string(),
  upstreams: z.record(z.string(), z.enum(["ok", "degraded", "down", "unknown"])).optional(),
});
export type HealthResponse = z.infer<typeof HealthResponse>;

export const AiExplainRequest = z.object({
  sist: z.string(),
  question: z.string().min(1).max(2000),
  context: z.record(z.string(), z.unknown()).optional(),
});
export type AiExplainRequest = z.infer<typeof AiExplainRequest>;

export const AiExplainResponse = z.object({
  answer: z.string(),
  model: z.string(),
  source: z.enum(["ollama", "groq", "fallback"]),
  latencyMs: z.number(),
});
export type AiExplainResponse = z.infer<typeof AiExplainResponse>;

export interface ClientOptions {
  baseUrl: string;
  fetchImpl?: typeof fetch;
  /** Optional bearer token for privileged routes. */
  token?: string | (() => string | null);
}

export class AliasistApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body?: unknown,
  ) {
    super(`Aliasist API ${status} ${statusText}`);
    this.name = "AliasistApiError";
  }
}

export const createClient = ({ baseUrl, fetchImpl, token }: ClientOptions) => {
  const fx = fetchImpl ?? fetch;
  const resolveToken = () => (typeof token === "function" ? token() : token);

  const request = async <T>(
    path: string,
    init: RequestInit,
    schema: z.ZodSchema<T>,
  ): Promise<T> => {
    const headers = new Headers(init.headers);
    const t = resolveToken();
    if (t) headers.set("Authorization", `Bearer ${t}`);
    headers.set("Accept", "application/json");
    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    const res = await fx(`${baseUrl}${path}`, { ...init, headers });
    const text = await res.text();
    const json = text ? JSON.parse(text) : null;
    if (!res.ok) throw new AliasistApiError(res.status, res.statusText, json);
    return schema.parse(json);
  };

  return {
    health: () => request("/health", { method: "GET" }, HealthResponse),
    aiExplain: (body: AiExplainRequest) =>
      request(
        "/ai/explain",
        { method: "POST", body: JSON.stringify(AiExplainRequest.parse(body)) },
        AiExplainResponse,
      ),
  };
};

export type AliasistClient = ReturnType<typeof createClient>;
