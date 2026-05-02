export interface Env {
  ALLOWED_ORIGIN: string;
  /** When `"true"`, HTTPS origins on `*.pages.dev` pass CORS (preview deploys). Off in production. */
  CORS_ALLOW_CF_PAGES?: string;
  /** Fixed window in ms for `POST /space/ask` (default 60000). */
  SPACE_ASK_RATE_WINDOW_MS?: string;
  /** Max requests per window per IP for `POST /space/ask` (default 24). */
  SPACE_ASK_RATE_MAX?: string;
  AI_OLLAMA_MODEL: string;
  AI_GROQ_MODEL: string;
  OLLAMA_MODEL?: string;
  OLLAMA_EMBED_MODEL?: string;
  WORKERS_AI_MODEL?: string;
  GEMINI_MODEL?: string;
  RAG_MAX_TOKENS?: string;
  RAG_TEMPERATURE?: string;
  RAG_RETRIEVAL?: string;

  // Bindings
  DATA_DB?: D1Database;
  AI?: Ai;

  // Secrets (optional at runtime; handlers fail-closed when missing)
  ADMIN_TOKEN?: string;
  GROQ_API_KEY?: string;
  AI_OLLAMA_URL?: string;
  OLLAMA_URL?: string;
  OLLAMA_TOKEN?: string;
  GEMINI_API_KEY?: string;
  NASA_API_KEY?: string;
}
