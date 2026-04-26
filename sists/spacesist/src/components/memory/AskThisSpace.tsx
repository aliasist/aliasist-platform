import { useEffect, useId, useState } from "react";
import { Button } from "@aliasist/ui";
import type { SpaceAskCopy } from "../../data/mockMemory";
import { GlassCard } from "./GlassCard";
import { SectionLabel, StatusDot } from "./SectionChrome";

export interface AskThisSpaceProps {
  activeSpaceId: string;
  activeSpaceName: string;
  askCopy: SpaceAskCopy;
}

export const AskThisSpace = ({ activeSpaceId, activeSpaceName, askCopy }: AskThisSpaceProps) => {
  const [questionDraft, setQuestionDraft] = useState("");
  const qId = useId();
  const exampleId = `${qId}-example`;

  useEffect(() => {
    setQuestionDraft("");
  }, [activeSpaceId]);

  return (
    <section aria-label="Ask this space" className="space-y-4">
      <SectionLabel eyebrow="Query" title="Ask this space" />
      <GlassCard glow="green" className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-memory-green/10 blur-3xl"
          aria-hidden
        />
        <div className="relative space-y-5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span className="inline-flex items-center gap-2 rounded-full border border-memory-green/25 bg-memory-green/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-memory-green">
              <StatusDot live />
              Client-only
            </span>
            <span>
              Target: <span className="font-mono text-memory-purple">{activeSpaceName}</span>
            </span>
            <span className="font-mono text-[10px] text-zinc-600">{activeSpaceId}</span>
          </div>

          <div>
            <label
              htmlFor={qId}
              className="flex items-center gap-2"
            >
              <span className="h-1 w-1 rounded-full bg-memory-orange/90" aria-hidden />
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">Your question</span>
            </label>
            <textarea
              id={qId}
              name="ask-space-question"
              value={questionDraft}
              onChange={(e) => setQuestionDraft(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder={askCopy.inputPlaceholder}
              className="mt-2 w-full resize-y rounded-2xl border border-white/[0.08] bg-memory-void/85 px-3.5 py-3 text-sm leading-relaxed text-zinc-200 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] placeholder:text-zinc-600 focus:border-memory-green/35 focus:outline-none focus:ring-1 focus:ring-memory-green/25"
            />
            <p className="mt-1.5 text-right font-mono text-[10px] text-zinc-600">
              {questionDraft.length} / 2000
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-memory-purple/90" aria-hidden />
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">Answer</span>
            </div>
            <div className="mt-2 rounded-2xl border border-dashed border-white/[0.1] bg-memory-void/40 p-4 ring-1 ring-white/[0.04]">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">// not_run</p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                No response here yet. Queries are not sent: connect{" "}
                <code className="rounded border border-white/10 bg-white/[0.04] px-1 py-0.5 font-mono text-xs text-zinc-400">
                  workers-api
                </code>{" "}
                and{" "}
                <code className="rounded border border-white/10 bg-white/[0.04] px-1 py-0.5 font-mono text-xs text-zinc-400">
                  @aliasist/rag
                </code>{" "}
                to run retrieval and generation for this space.
              </p>
            </div>
          </div>

          <div
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
            role="region"
            aria-label="Illustrative example for this space"
            aria-describedby={exampleId}
          >
            <p
              id={exampleId}
              className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600"
            >
              Example (mock) — not from RAG
            </p>
            <p className="mt-2 text-sm font-medium text-zinc-300">{askCopy.exampleQuestion}</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">{askCopy.exampleAnswer}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              type="button"
              disabled
              variant="primary"
              size="sm"
              className="border border-memory-green/30 bg-memory-green/90 text-memory-void shadow-memory-green hover:bg-memory-green disabled:cursor-not-allowed disabled:opacity-50"
              title="Waits on workers-api + RAG route"
            >
              Run query
            </Button>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-zinc-500">
              API not connected
            </span>
          </div>
        </div>
      </GlassCard>
    </section>
  );
};
