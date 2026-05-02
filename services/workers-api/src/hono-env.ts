import type { Env } from "./env";

/** Shared Hono context: Worker bindings + request-scoped variables. */
export type AliasistHonoEnv = {
  Bindings: Env;
  Variables: {
    requestId: string;
  };
};
