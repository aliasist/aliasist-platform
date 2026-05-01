import { createMiddleware } from "hono/factory";
import type { Env } from "../env";

const allowPagesPreview = (origin: string, env: Env): boolean => {
  if (env.CORS_ALLOW_CF_PAGES !== "true" || !origin) return false;
  try {
    const { protocol, hostname } = new URL(origin);
    return protocol === "https:" && hostname.endsWith(".pages.dev");
  } catch {
    return false;
  }
};

/**
 * Origin-allowlisted CORS. Echoes the request Origin only when it matches
 * ALLOWED_ORIGIN (comma-separated), or when CORS_ALLOW_CF_PAGES enables
 * `https://*.pages.dev` for Cloudflare Pages preview URLs.
 */
export const corsMiddleware = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  const origin = c.req.header("Origin") ?? "";
  const allowed = (c.env.ALLOWED_ORIGIN ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const match = allowed.includes(origin) || allowPagesPreview(origin, c.env);

  if (c.req.method === "OPTIONS") {
    const headers = new Headers();
    if (match) {
      headers.set("Access-Control-Allow-Origin", origin);
      headers.set("Vary", "Origin");
      headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      );
      headers.set(
        "Access-Control-Allow-Headers",
        "Authorization, Content-Type",
      );
      headers.set("Access-Control-Max-Age", "86400");
    }
    return new Response(null, { status: 204, headers });
  }

  await next();

  if (match) {
    c.res.headers.set("Access-Control-Allow-Origin", origin);
    c.res.headers.set("Vary", "Origin");
  }
});
