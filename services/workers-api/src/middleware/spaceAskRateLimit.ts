import { createMiddleware } from "hono/factory";
import type { AliasistHonoEnv } from "../hono-env";

type Bucket = { windowStart: number; count: number };

/** Per-isolate fixed window; sufficient to dampen abuse until KV/DO backing if needed. */
const buckets = new Map<string, Bucket>();

/** Vitest: clear between tests so counts do not leak. */
export function __resetSpaceAskRateLimitForTests(): void {
  buckets.clear();
}

const clientKey = (c: { req: { header: (name: string) => string | undefined } }): string =>
  c.req.header("CF-Connecting-IP") ??
  c.req.header("True-Client-IP") ??
  c.req.header("X-Forwarded-For")?.split(",")[0]?.trim() ??
  "unknown";

export const spaceAskRateLimit = createMiddleware<AliasistHonoEnv>(async (c, next) => {
  const windowMsRaw = Number(c.env.SPACE_ASK_RATE_WINDOW_MS ?? 60_000);
  const windowMs = Number.isFinite(windowMsRaw) ? Math.max(10_000, Math.min(600_000, windowMsRaw)) : 60_000;
  const maxRaw = Number(c.env.SPACE_ASK_RATE_MAX ?? 24);
  const max = Number.isFinite(maxRaw) ? Math.max(1, Math.min(500, maxRaw)) : 24;

  const key = clientKey(c);
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || now - b.windowStart >= windowMs) {
    b = { windowStart: now, count: 0 };
    buckets.set(key, b);
  }
  b.count += 1;
  if (b.count > max) {
    const retryMs = windowMs - (now - b.windowStart);
    const retrySec = Math.max(1, Math.ceil(retryMs / 1000));
    return c.json(
      { error: "rate_limited", message: "Too many SpaceSist questions. Try again shortly.", retryAfterSec: retrySec },
      429,
      { "Retry-After": String(retrySec) },
    );
  }
  await next();
});
