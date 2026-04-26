import type { MockIndexStatus } from "../../data/mockMemory";
import { GlassCard } from "./GlassCard";
import { SectionLabel, StatusDot } from "./SectionChrome";

export interface RagIndexStatusProps {
  status: MockIndexStatus;
  /** Space name for the memory UI scope (index is still global in mock). */
  activeSpaceName: string;
}

export const RagIndexStatus = ({ status, activeSpaceName }: RagIndexStatusProps) => (
  <section aria-label="RAG and index status" className="space-y-4">
    <SectionLabel eyebrow="packages/rag" title="RAG / index status" />
    <GlassCard glow="purple" className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15] bg-[linear-gradient(135deg,rgba(109,40,217,0.4),transparent_45%)]"
        aria-hidden
      />
      <div className="relative">
        <div className="mb-4 font-mono text-xs text-zinc-500">
          <span className="text-zinc-600">UI scope · </span>
          {activeSpaceName}
          <span className="text-zinc-600"> (index below is still global in mock data)</span>
        </div>
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-memory-amber/30 bg-memory-amber/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-memory-amber">
            <StatusDot live={false} />
            Mock index
          </span>
          <span className="text-xs text-zinc-500">No on-disk index in this browser session.</span>
        </div>
        <div className="grid gap-px overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.04] sm:grid-cols-2">
          <div className="bg-memory-void/50 p-4 sm:rounded-tl-xl">
            <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
              Embed model
            </div>
            <p className="mt-1.5 font-mono text-sm text-memory-green/95">{status.embedModel}</p>
          </div>
          <div className="bg-memory-void/50 p-4 sm:rounded-tr-xl">
            <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
              Ollama (dev)
            </div>
            <p className="mt-1.5 font-mono text-sm text-zinc-400">{status.hostLabel}</p>
          </div>
          <div className="bg-memory-void/50 p-4 sm:col-span-2">
            <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
              Index path (mock)
            </div>
            <p className="mt-1.5 break-all font-mono text-xs text-zinc-400">{status.indexLabel}</p>
          </div>
          <div className="bg-memory-void/50 p-4 sm:rounded-bl-xl">
            <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
              Entries
            </div>
            <p className="mt-1.5 font-mono text-sm text-zinc-200">{status.entryCount}</p>
          </div>
          <div className="bg-memory-void/50 p-4 sm:rounded-br-xl">
            <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
              Last build
            </div>
            <p className="mt-1.5 text-sm text-zinc-500">{status.builtAtLabel}</p>
          </div>
        </div>
      </div>
    </GlassCard>
  </section>
);
