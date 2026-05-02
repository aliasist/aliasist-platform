import { createMiddleware } from "hono/factory";
import type { AliasistHonoEnv } from "../hono-env";

const MAX_LEN = 128;

/**
 * Assign a correlation id for logs and support: reuse `x-request-id` when
 * present and short enough; otherwise generate a UUID. Always echoed on the response.
 */
export const requestIdMiddleware = createMiddleware<AliasistHonoEnv>(async (c, next) => {
  const raw = c.req.header("x-request-id")?.trim();
  const requestId =
    raw && raw.length > 0 && raw.length <= MAX_LEN ? raw : crypto.randomUUID();
  c.set("requestId", requestId);
  await next();
  c.res.headers.set("x-request-id", requestId);
});
