import { createMiddleware } from "hono/factory";
import type { AliasistHonoEnv } from "../hono-env";

const encoder = new TextEncoder();

/**
 * Constant-time string comparison that does not leak the length of either
 * input. Both inputs are HMAC-SHA256'd with a random per-request key and the
 * resulting fixed-width digests are compared byte-by-byte. This gives us a
 * timing-safe compare that also normalizes length.
 */
const constantTimeEquals = async (a: string, b: string): Promise<boolean> => {
  const keyMaterial = crypto.getRandomValues(new Uint8Array(32));
  const key = await crypto.subtle.importKey(
    "raw",
    keyMaterial,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const [da, db] = await Promise.all([
    crypto.subtle.sign("HMAC", key, encoder.encode(a)),
    crypto.subtle.sign("HMAC", key, encoder.encode(b)),
  ]);
  const av = new Uint8Array(da);
  const bv = new Uint8Array(db);
  let diff = 0;
  for (let i = 0; i < av.length; i++) {
    diff |= (av[i] ?? 0) ^ (bv[i] ?? 0);
  }
  return diff === 0;
};

/** Requires a bearer token matching env.ADMIN_TOKEN. Fails closed. */
export const requireAdmin = createMiddleware<AliasistHonoEnv>(async (c, next) => {
  const expected = c.env.ADMIN_TOKEN;
  if (!expected) return c.json({ error: "not_configured" }, 503);
  const header = c.req.header("Authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token || !(await constantTimeEquals(token, expected))) {
    return c.json({ error: "unauthorized" }, 401);
  }
  await next();
});
