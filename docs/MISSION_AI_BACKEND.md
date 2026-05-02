# Mission — AI, agents, and backend (`api.aliasist.tech`)

This document states **why the unified Worker and model layer exist**, independent of any single frontend. Product UX lives in the portal; **this** is the contract for automation (agents), operators, and contributors working on inference and data planes.

## Mission

**Run trustworthy, observable intelligence at the edge**—so every explanation and retrieval-backed answer is **grounded**, **attributable**, **rate-aware**, and **safe to chain** into tools or agents later without bypassing the platform.

Concretely:

1. **Single trust boundary.** All LLM and embedding traffic that carries platform context goes through **`services/workers-api`**. Clients (browser or agent) never hold provider secrets; they call Aliasist routes only.

2. **Grounding over swagger.** Routes like **`POST /ai/explain`** and **`POST /space/ask`** are built to **prefer evidence** (page context, retrieval chunks, curated corpus) and to **refuse fabrication** when prompts ask for certainty the system does not have.

3. **Predictable degradation.** Provider waterfalls (e.g. Ollama → Groq → fallback; Workers AI / Gemini where configured) are **explicit**, **logged**, and **bounded** so outages become measurable noise, not silent wrong answers.

4. **Agent-ready, not agent-loose.** Future agents should **compose existing HTTP contracts** (explain, ask, domain reads)—not embed raw SDK keys or skip retrieval. New capabilities extend the Worker with **typed inputs**, **caps**, and **audit hooks** before any autonomous loop ships.

5. **Operational honesty.** Rate limits, payload caps, and correlation IDs exist so support and incident response can tie **one bad request** to **one trace** without scraping unstructured logs.

---

Space-specific RAG rollout detail stays in [`SPACESIST_RAG_PLAN.md`](SPACESIST_RAG_PLAN.md). Cross-cutting backend phases are in [`PHASE_PLAN_AI_BACKEND.md`](PHASE_PLAN_AI_BACKEND.md).
