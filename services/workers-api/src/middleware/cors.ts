import { createMiddleware } from "hono/factory";
import type { Env } from "../env";

/**
 * Origin-allowlisted CORS. Echoes the request Origin only when it matches
 * ALLOWED_ORIGIN (comma-separated). No wildcards in production.
 */
export const corsMiddleware = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  const origin = c.req.header("Origin") ?? "";
  const allowed = (c.env.ALLOWED_ORIGIN ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const match = allowed.includes(origin);

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
