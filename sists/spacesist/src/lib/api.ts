import { createClient, type AliasistClient } from "@aliasist/api-client";

let _client: AliasistClient | null = null;

const resolveBaseUrl = (): string => {
  const env = (import.meta as unknown as {
    env?: Record<string, string | boolean>;
  }).env;
  const fromEnv = typeof env?.VITE_API_BASE === "string" ? env.VITE_API_BASE : undefined;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (env?.DEV) return "http://localhost:8787";
  return "https://api.aliasist.tech";
};

export const api = (): AliasistClient => {
  if (!_client) _client = createClient({ baseUrl: resolveBaseUrl() });
  return _client;
};
