import { Hono } from "hono";
import { corsMiddleware } from "./middleware/cors";
import { health } from "./routes/health";
import { eco } from "./routes/eco";
import { data } from "./routes/data";
import { ai } from "./routes/ai";
import type { Env } from "./env";

const app = new Hono<{ Bindings: Env }>();

app.use("*", corsMiddleware);

app.route("/health", health);
app.route("/eco", eco);
app.route("/data", data);
app.route("/ai", ai);

app.notFound((c) =>
  c.json({ error: "not_found", path: new URL(c.req.url).pathname }, 404),
);

app.onError((err, c) => {
  console.error("worker_error", err);
  return c.json(
    { error: "internal", message: "An unexpected error occurred." },
    500,
  );
});

export default app;
export type AliasistApi = typeof app;
