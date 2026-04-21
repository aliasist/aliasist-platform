import { createMiddleware } from "hono/factory";
import type { Env } from "../env";

const timingSafeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

/** Requires a bearer token matching env.ADMIN_TOKEN. Fails closed. */
export const requireAdmin = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  const expected = c.env.ADMIN_TOKEN;
  if (!expected) return c.json({ error: "not_configured" }, 503);
  const header = c.req.header("Authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token || !timingSafeEqual(token, expected)) {
    return c.json({ error: "unauthorized" }, 401);
  }
  await next();
});
