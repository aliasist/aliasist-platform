import type { MockSourceChunk } from "../../data/mockMemory";
import { GlassCard } from "./GlassCard";
import { SectionLabel } from "./SectionChrome";

export interface SourceChunksPreviewProps {
  chunks: MockSourceChunk[];
  activeSpaceName: string;
}

export const SourceChunksPreview = ({ chunks, activeSpaceName }: SourceChunksPreviewProps) => (
  <section aria-label="Retrieved source chunks" className="space-y-4">
    <SectionLabel
      eyebrow="Retrieval"
      title="Source chunks (preview)"
      right={
        <span className="text-[10px] uppercase tracking-[0.14em] text-zinc-600">
          {chunks.length} shown · {activeSpaceName}
        </span>
      }
    />
    <GlassCard glow="purple" className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-scanlines opacity-[0.28]"
        aria-hidden
      />
      <div className="relative">
        <p className="text-sm text-zinc-500">
          Illustrative chunks for the active space only—paths and scores are placeholders (not from a live index).
        </p>
        {chunks.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-white/[0.1] bg-memory-void/35 px-5 py-10 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-600">// no_chunks</p>
            <p className="mt-2 text-sm text-zinc-400">
              No source chunks in the mock set for <span className="text-zinc-200">{activeSpaceName}</span>.
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {chunks.map((c) => (
              <li
                key={c.id}
                className="rounded-2xl border border-white/[0.07] bg-memory-void/75 px-3.5 py-3.5 ring-1 ring-white/[0.03]"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <code className="text-xs text-memory-green/95">{c.source}</code>
                  <span className="font-mono text-[10px] text-memory-orange/95">cosine {c.scoreLabel}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">{c.text}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </GlassCard>
  </section>
);
