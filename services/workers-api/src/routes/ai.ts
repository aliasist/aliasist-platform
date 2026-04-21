import { Hono } from "hono";
import { z } from "zod";
import type { Env } from "../env";

export const ai = new Hono<{ Bindings: Env }>();

const ExplainBody = z.object({
  sist: z.string(),
  question: z.string().min(1).max(2000),
  context: z.record(z.string(), z.unknown()).optional(),
});

type Source = "ollama" | "groq" | "fallback";

const systemPrompt = (sist: string) =>
  `You are the Aliasist ${sist.toUpperCase()} explainer. ` +
  "Be concise, educational, and safety-first. Ground answers in the provided context. " +
  "If you are uncertain, say so. Do not invent sources.";

const callOllama = async (
  env: Env,
  sist: string,
  question: string,
  context: unknown,
  signal: AbortSignal,
): Promise<string> => {
  if (!env.AI_OLLAMA_URL) throw new Error("ollama_not_configured");
  const res = await fetch(`${env.AI_OLLAMA_URL.replace(/\/$/, "")}/api/chat`, {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: env.AI_OLLAMA_MODEL,
      stream: false,
      messages: [
        { role: "system", content: systemPrompt(sist) },
        { role: "user", content: `${question}\n\nContext: ${JSON.stringify(context ?? {})}` },
      ],
    }),
  });
  if (!res.ok) throw new Error(`ollama_${res.status}`);
  const json = (await res.json()) as { message?: { content?: string } };
  const text = json.message?.content?.trim();
  if (!text) throw new Error("ollama_empty");
  return text;
};

const callGroq = async (
  env: Env,
  sist: string,
  question: string,
  context: unknown,
): Promise<string> => {
  if (!env.GROQ_API_KEY) throw new Error("groq_not_configured");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.AI_GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt(sist) },
        { role: "user", content: `${question}\n\nContext: ${JSON.stringify(context ?? {})}` },
      ],
    }),
  });
  if (!res.ok) throw new Error(`groq_${res.status}`);
  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("groq_empty");
  return text;
};

/**
 * POST /ai/explain — Ollama primary (when on), Groq fallback.
 * Azure-hosted Ollama is often offline, so we race with a short timeout
 * and fall through on any failure.
 */
ai.post("/explain", async (c) => {
  const body = ExplainBody.safeParse(await c.req.json().catch(() => null));
  if (!body.success) return c.json({ error: "invalid_body", issues: body.error.issues }, 400);
  const { sist, question, context } = body.data;

  const start = Date.now();

  // Try Ollama with a 2.5s budget; if it's slow/off, fail fast.
  if (c.env.AI_OLLAMA_URL) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 2500);
    try {
      const answer = await callOllama(c.env, sist, question, context, ac.signal);
      clearTimeout(timer);
      return c.json({
        answer,
        model: c.env.AI_OLLAMA_MODEL,
        source: "ollama" satisfies Source,
        latencyMs: Date.now() - start,
      });
    } catch (err) {
      clearTimeout(timer);
      console.warn("ollama_fallback", (err as Error).message);
    }
  }

  if (c.env.GROQ_API_KEY) {
    try {
      const answer = await callGroq(c.env, sist, question, context);
      return c.json({
        answer,
        model: c.env.AI_GROQ_MODEL,
        source: "groq" satisfies Source,
        latencyMs: Date.now() - start,
      });
    } catch (err) {
      console.error("groq_failed", (err as Error).message);
    }
  }

  return c.json(
    {
      answer:
        "AI is temporarily unavailable. Your question is logged; try again soon.",
      model: "fallback",
      source: "fallback" satisfies Source,
      latencyMs: Date.now() - start,
    },
    503,
  );
});
