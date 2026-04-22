import { createClient, type AliasistClient } from "@aliasist/api-client";

/**
 * Lazy singleton client pointed at `VITE_API_BASE` (or the production
 * api.aliasist.tech custom domain once the zone redirect is cleared).
 * Kept inside the sist so each sist can choose its own base override
 * without the portal needing to thread a context.
 */
let _client: AliasistClient | null = null;

const resolveBaseUrl = (): string => {
  const fromEnv = (import.meta as unknown as { env?: Record<string, string> })
    .env?.VITE_API_BASE;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  // Fallback: worker .workers.dev URL (used until api.aliasist.tech resolves).
  return "https://aliasist-workers-api.bchooper0730.workers.dev";
};

export const api = (): AliasistClient => {
  if (!_client) {
    _client = createClient({
      baseUrl: resolveBaseUrl(),
      // Admin token is wired per-feature (see admin panel) not globally.
    });
  }
  return _client;
};

export const DATASIST_ADMIN_TOKEN_KEY = "aliasist.datasist.admin-token";
