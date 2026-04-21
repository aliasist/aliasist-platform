import { Hono } from "hono";
import type { Env } from "../env";

export const data = new Hono<{ Bindings: Env }>();

/**
 * DataSist — data center intelligence.
 * Phase 3a will bind a D1 database (DATA_DB) and migrate the existing
 * datasist-api routes here with consolidated schema. For now, a stub
 * returns an empty list so the portal can render skeleton states.
 */
data.get("/data-centers", (c) =>
  c.json({
    items: [],
    total: 0,
    note: "stub — full DataSist migration lands in Phase 3a",
  }),
);
