export interface Env {
  ALLOWED_ORIGIN: string;
  AI_OLLAMA_MODEL: string;
  AI_GROQ_MODEL: string;

  // Secrets (optional at runtime; handlers fail-closed when missing)
  ADMIN_TOKEN?: string;
  GROQ_API_KEY?: string;
  AI_OLLAMA_URL?: string;
}
