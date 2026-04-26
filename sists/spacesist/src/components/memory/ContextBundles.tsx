import type { MockBundle } from "../../data/mockMemory";
import { GlassCard } from "./GlassCard";
import { SectionLabel } from "./SectionChrome";

export interface ContextBundlesProps {
  bundles: MockBundle[];
  activeSpaceName: string;
  spaceScoped?: boolean;
}

export const ContextBundles = ({ bundles, activeSpaceName, spaceScoped = false }: ContextBundlesProps) => (
  <section aria-label="Context bundles" className="space-y-4">
    <SectionLabel
      eyebrow="RAG context"
      title="Context bundles"
      right={
        <span className="rounded-full border border-memory-purple/25 bg-memory-purple/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-memory-purple">
          {bundles.length} {bundles.length === 1 ? "bundle" : "bundles"} · {activeSpaceName}
        </span>
      }
    />
    <GlassCard glow="green" className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top_right,rgba(52,211,153,0.12),transparent_60%)]"
        aria-hidden
      />
      <div className="relative">
        <p className="text-sm leading-relaxed text-zinc-500">
          Text groups for retrieval, filtered to the active project space. Counts are placeholders until indexes are real.
        </p>
        {bundles.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-white/[0.1] bg-memory-void/30 px-5 py-10 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-600">// no_bundles</p>
            <p className="mt-2 text-sm text-zinc-400">
              No bundles in the mock set for <span className="text-zinc-200">{activeSpaceName}</span>.
            </p>
          </div>
        ) : (
          <ul className="mt-5 space-y-3">
            {bundles.map((b) => (
              <li
                key={b.id}
                className="flex gap-3 rounded-2xl border border-white/[0.07] bg-memory-void/70 px-3.5 py-3.5 ring-1 ring-white/[0.02] transition hover:border-memory-green/15"
              >
                <div className="mt-0.5 shrink-0">
                  <span className="block size-1.5 rounded-full bg-memory-green/80 shadow-[0_0_10px_rgba(52,211,153,0.45)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-zinc-100">{b.name}</div>
                  {!spaceScoped ? (
                    <div className="mt-0.5 font-mono text-[11px] text-memory-green/85">{b.spaceId}</div>
                  ) : null}
                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{b.summary}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-mono text-sm text-memory-green">~{b.chunkCount}</div>
                  <div className="text-[10px] uppercase tracking-[0.12em] text-zinc-600">chunks</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </GlassCard>
  </section>
);
