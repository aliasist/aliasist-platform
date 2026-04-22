import type { Env } from "../src/env";
import app from "../src/index";
import { createD1Shim, type D1Shim } from "./d1-shim";
import { resolve } from "node:path";

export interface TestHarness {
  env: Env;
  db: D1Shim;
  request: (path: string, init?: RequestInit) => Promise<Response>;
}

export const TEST_TOKEN = "test-admin-token-0123456789";

const MIGRATIONS_DIR = resolve(
  new URL(".", import.meta.url).pathname,
  "..",
  "migrations",
);

/**
 * Boot a fresh Hono app + in-memory D1 per test. `env` is merged into the
 * default Env so individual tests can omit ADMIN_TOKEN (to exercise 503) or
 * override CORS.
 */
export const makeHarness = (overrides: Partial<Env> = {}): TestHarness => {
  const db = createD1Shim(MIGRATIONS_DIR);
  const env: Env = {
    ALLOWED_ORIGIN: "http://localhost:5173",
    AI_OLLAMA_MODEL: "llama3.1:8b",
    AI_GROQ_MODEL: "llama-3.3-70b-versatile",
    ADMIN_TOKEN: TEST_TOKEN,
    DATA_DB: db as unknown as D1Database,
    ...overrides,
  };
  return {
    env,
    db,
    request: (path, init) => app.fetch(new Request(`http://test${path}`, init), env),
  };
};

export const jsonBody = (value: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(value),
});

export const authHeader = (token: string = TEST_TOKEN) => ({
  Authorization: `Bearer ${token}`,
});

export const validDataCenter = (overrides: Record<string, unknown> = {}) => ({
  name: "Alpha Compute Campus",
  company: "Aliasist Labs",
  companyType: "hyperscale" as const,
  lat: 40.4406,
  lng: -79.9959,
  city: "Pittsburgh",
  state: "PA",
  country: "USA",
  capacityMW: 250,
  status: "operational" as const,
  ...overrides,
});
