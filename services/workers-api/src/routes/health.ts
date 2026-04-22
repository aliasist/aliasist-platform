import { Hono } from "hono";
import type { Env } from "../env";

export const health = new Hono<{ Bindings: Env }>();

health.get("/", (c) =>
  c.json({
    ok: true as const,
    service: "aliasist-workers-api",
    version: "0.0.1",
    time: new Date().toISOString(),
    upstreams: {
      ollama: c.env.AI_OLLAMA_URL ? "unknown" : "down",
      groq: c.env.GROQ_API_KEY ? "unknown" : "down",
    },
  }),
);
