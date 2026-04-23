import { createClient, type AliasistClient } from "@aliasist/api-client";

let _client: AliasistClient | null = null;

const resolveBaseUrl = (): string => {
  const fromEnv = (import.meta as unknown as { env?: Record<string, string> })
    .env?.VITE_API_BASE;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "https://aliasist-workers-api.bchooper0730.workers.dev";
};

export const api = (): AliasistClient => {
  if (!_client) _client = createClient({ baseUrl: resolveBaseUrl() });
  return _client;
};
