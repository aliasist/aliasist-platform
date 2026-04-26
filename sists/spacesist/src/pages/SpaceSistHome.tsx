import { useState } from "react";
import { Button, Panel, Pill } from "@aliasist/ui";
import {
  mockAskAnswer,
  mockAskQuestion,
  mockBundles,
  mockIndexStatus,
  mockNotes,
  mockSourceChunks,
  mockSpaces,
} from "../data/mockMemory";

const kindLabel = (kind: (typeof mockNotes)[number]["kind"]) => {
  switch (kind) {
    case "log":
      return "Log";
    case "decision":
      return "Decision";
    default:
      return "Note";
  }
};

export const SpaceSistHome = () => {
  const [activeSpaceId, setActiveSpaceId] = useState("aliasist");
  const activeSpace = mockSpaces.find((s) => s.id === activeSpaceId) ?? mockSpaces[0]!;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-ink-400">SpaceSist</div>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink-50">
            AI that remembers our work
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-300">
            Project spaces, notes, dev logs, and context bundles in one place. RAG indexes and
            “ask this space” will use the shared <span className="font-mono text-ink-200">@aliasist/rag</span>{" "}
            engine via the API layer—this page is a static map of the experience.
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2 sm:pt-1">
          <Pill tone="alpha">Alpha · static mock</Pill>
          <span className="text-right text-[10px] uppercase tracking-[0.16em] text-ink-500">
            No persistence · no worker calls
          </span>
        </div>
      </header>

      <section aria-label="Project spaces" className="space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-display text-lg font-medium text-ink-100">Project spaces</h2>
          <Pill tone="soon">Mock data</Pill>
        </div>
        <p className="text-sm text-ink-400">
          Select a space to focus the ask panel. Cards are in-memory only.
        </p>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {mockSpaces.map((s) => {
            const on = s.id === activeSpaceId;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setActiveSpaceId(s.id)}
                  className={`w-full rounded-panel border p-4 text-left transition ${
                    on
                      ? "border-ufo-500/50 bg-ink-800/90 shadow-[0_0_0_1px_rgba(0,255,200,0.12)]"
                      : "border-ink-700 bg-ink-900/40 hover:border-ink-600 hover:bg-ink-900/70"
                  }`}
                >
                  <div className="font-medium text-ink-50">{s.name}</div>
                  <p className="mt-1.5 text-xs leading-snug text-ink-400">{s.description}</p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {s.highlights.map((h) => (
                      <Pill key={h} tone="default" className="normal-case tracking-tight">
                        {h}
                      </Pill>
                    ))}
                  </ul>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-label="Recent notes and logs" className="space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-display text-lg font-medium text-ink-100">Recent notes & logs</h2>
            <Pill tone="soon">Mock</Pill>
          </div>
          <div className="overflow-hidden rounded-xl border border-ink-800 bg-ink-950/30">
            <ul className="divide-y divide-ink-800/80">
              {mockNotes.map((n) => (
                <li key={n.id} className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-ink-500">
                    <span>{n.at}</span>
                    <span className="text-ink-600">·</span>
                    <span className="font-mono text-ink-400">{n.spaceId}</span>
                    <Pill tone="default" className="!normal-case !tracking-tight !text-[10px]">
                      {kindLabel(n.kind)}
                    </Pill>
                  </div>
                  <div className="mt-1 font-medium text-ink-100">{n.title}</div>
                  <p className="mt-1 text-sm text-ink-400">{n.summary}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-label="Context bundles" className="space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-display text-lg font-medium text-ink-100">Context bundles</h2>
            <Pill tone="soon">Mock</Pill>
          </div>
          <Panel eyebrow="Curated" title="Hand-picked text groups for RAG" lab>
            <p className="text-sm text-ink-400">
              Bundles group related notes and exports into one retrievable slice. Counts are fake for
              now.
            </p>
            <ul className="mt-4 space-y-3">
              {mockBundles.map((b) => (
                <li
                  key={b.id}
                  className="flex gap-3 rounded-lg border border-ink-800/80 bg-ink-900/30 px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-ink-100">{b.name}</div>
                    <div className="mt-0.5 text-xs text-ink-500">
                      <span className="font-mono">{b.spaceId}</span>
                    </div>
                    <p className="mt-1 text-xs text-ink-400">{b.summary}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-mono text-sm text-ink-200">~{b.chunkCount} chunks</div>
                    <div className="text-[10px] text-ink-500">est.</div>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </section>
      </div>

      <section aria-label="RAG and index status" className="space-y-3">
        <h2 className="font-display text-lg font-medium text-ink-100">RAG / index status</h2>
        <Panel
          eyebrow="packages/rag"
          title="Local index (JSON) · Ollama embeddings"
          lab
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-ink-500">State</div>
              <div className="mt-1 flex items-center gap-2">
                <Pill tone="warn">Static</Pill>
                <span className="text-sm text-ink-300">No on-disk index in this session</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-ink-500">Embed model</div>
              <p className="mt-1 font-mono text-sm text-ink-200">{mockIndexStatus.embedModel}</p>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-ink-500">Index path (mock)</div>
              <p className="mt-1 break-all font-mono text-xs text-ink-300">
                {mockIndexStatus.indexLabel}
              </p>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-ink-500">Ollama host (dev)</div>
              <p className="mt-1 font-mono text-sm text-ink-300">{mockIndexStatus.hostLabel}</p>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-ink-500">Entries</div>
              <p className="mt-1 font-mono text-sm text-ink-200">{mockIndexStatus.entryCount}</p>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-ink-500">Last build</div>
              <p className="mt-1 text-sm text-ink-400">{mockIndexStatus.builtAtLabel}</p>
            </div>
          </div>
        </Panel>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-label="Ask this space">
          <div className="space-y-3">
            <h2 className="font-display text-lg font-medium text-ink-100">Ask this space</h2>
            <Panel eyebrow="Mock" title="Question → answer (not wired)">
              <p className="text-xs text-ink-500">
                Active space: <span className="font-mono text-ink-300">{activeSpace.name}</span>
              </p>
              <div className="mt-3">
                <div className="text-[10px] uppercase tracking-[0.16em] text-ink-500">Question</div>
                <p className="mt-1.5 rounded-md border border-ink-800 bg-ink-950/50 p-3 text-sm leading-relaxed text-ink-200">
                  {mockAskQuestion}
                </p>
              </div>
              <div className="mt-4">
                <div className="text-[10px] uppercase tracking-[0.16em] text-ink-500">Answer</div>
                <p className="mt-1.5 rounded-md border border-ink-800/60 bg-ink-900/40 p-3 text-sm leading-relaxed text-ink-200">
                  {mockAskAnswer}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button type="button" disabled variant="primary" size="sm">
                  Run query (coming soon)
                </Button>
                <Pill tone="soon">@aliasist/rag not imported here yet</Pill>
              </div>
            </Panel>
          </div>
        </section>

        <section aria-label="Retrieved source chunks" className="space-y-3">
          <h2 className="font-display text-lg font-medium text-ink-100">Source chunks (preview)</h2>
          <Panel eyebrow="Retrieval" title="What a real answer could cite" lab>
            <p className="text-sm text-ink-400">
              Example chunk metadata for the mock answer above. Scores and paths are illustrative.
            </p>
            <ul className="mt-3 space-y-2">
              {mockSourceChunks.map((c) => (
                <li
                  key={c.id}
                  className="rounded-lg border border-ink-800/80 bg-ink-950/40 px-3 py-2.5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <code className="text-xs text-ufo-400/90">{c.source}</code>
                    <span className="font-mono text-[10px] text-ink-500">
                      cosine {c.scoreLabel}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-300">{c.text}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </section>
      </div>
    </div>
  );
};
