import { GlassCard } from "./GlassCard";
import { HeroOrnament } from "./HeroOrnament";
import { StatusDot } from "./SectionChrome";

export const MemoryHero = () => (
  <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-memory-void ring-1 ring-memory-purple/15">
    {/* Decorative layers — CSS + inline SVG; no full-bleed bitmap UI */}
    <div
      className="pointer-events-none absolute inset-0 bg-memory-hero-glow"
      aria-hidden
    />
    <div
      className="pointer-events-none absolute inset-0 bg-memory-hero-vignette"
      aria-hidden
    />
    <div
      className="pointer-events-none absolute inset-0 bg-memory-grid bg-[length:28px_28px] opacity-[0.45]"
      aria-hidden
    />
    <HeroOrnament className="pointer-events-none absolute -right-4 top-1/2 h-[min(18rem,48vw)] w-[min(22rem,90vw)] -translate-y-1/2 opacity-[0.55] sm:right-0 sm:opacity-70" />
    <div
      className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-memory-purpledeep/25 blur-3xl"
      aria-hidden
    />
    <div
      className="pointer-events-none absolute -bottom-28 left-1/3 h-52 w-[28rem] rounded-full bg-memory-green/8 blur-3xl"
      aria-hidden
    />
    <div
      className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-memory-purple/20 via-memory-green/20 to-transparent"
      aria-hidden
    />

    <div className="relative px-6 py-10 sm:px-10 sm:py-12">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
        <div className="max-w-2xl space-y-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-memory-purple">
              SpaceSist
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-memory-green/30 bg-memory-green/8 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-memory-green shadow-[0_0_20px_-8px_rgba(52,211,153,0.4)]">
              <StatusDot live />
              Memory layer
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-memory-orange/25 bg-memory-orange/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-memory-orange/95">
              <span
                className="size-1 rounded-full bg-memory-amber/90 shadow-[0_0_8px_rgba(251,191,36,0.55)]"
                aria-hidden
              />
              Static mock
            </span>
          </div>
          <h1 className="font-display text-3xl font-semibold leading-[1.12] tracking-tight text-zinc-50 sm:text-[2.35rem] sm:leading-tight">
            AI that remembers{" "}
            <span className="bg-gradient-to-r from-memory-purple via-memory-purple to-memory-green bg-clip-text text-transparent">
              our work
            </span>
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-zinc-400">
            Project spaces, notes, dev logs, and context bundles—grounded in what you actually built. RAG
            indexes and “ask this space” will route through{" "}
            <code className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[13px] text-memory-green/95">
              @aliasist/rag
            </code>{" "}
            and the API when wired. This is a live UI shell with mock data.
          </p>
        </div>

        <GlassCard glow="purple" className="max-w-sm shrink-0" padded>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-memory-amber/95">
            Session
          </p>
          <p className="mt-2.5 font-mono text-xs leading-relaxed text-zinc-300/95">
            No persistence · no worker · UI-only preview of memory workflows.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-md border border-memory-green/25 bg-memory-green/[0.08] px-2.5 py-1 text-[10px] font-medium text-memory-green">
              Online UI
            </span>
            <span className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-zinc-500">
              API later
            </span>
            <span className="rounded-md border border-memory-orange/20 bg-memory-orange/[0.06] px-2.5 py-1 text-[10px] text-memory-orange/90">
              Activity
            </span>
          </div>
        </GlassCard>
      </div>
    </div>
  </div>
);
