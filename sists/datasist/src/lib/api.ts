import { createClient, type AliasistClient } from "@aliasist/api-client";

/**
 * Lazy-evaluating client that resolves the admin bearer token from
 * sessionStorage on every privileged request. Public reads use the same
 * client; the token is simply absent when no admin session is active.
 *
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

export const DATASIST_ADMIN_TOKEN_KEY = "aliasist.datasist.admin-token";

export const getAdminToken = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(DATASIST_ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setAdminToken = (token: string | null): void => {
  if (typeof window === "undefined") return;
  try {
    if (token) window.sessionStorage.setItem(DATASIST_ADMIN_TOKEN_KEY, token);
    else window.sessionStorage.removeItem(DATASIST_ADMIN_TOKEN_KEY);
  } catch {
    // ignore quota / disabled-storage errors
  }
  // Notify listeners in the same tab (storage event only fires cross-tab).
  window.dispatchEvent(new Event("datasist:admin-token-change"));
};

export const api = (): AliasistClient => {
  if (!_client) {
    _client = createClient({
      baseUrl: resolveBaseUrl(),
      // Resolve per-request so toggling LOCKED/UNLOCKED takes effect without
      // re-creating the client.
      token: () => getAdminToken(),
    });
  }
  return _client;
};
