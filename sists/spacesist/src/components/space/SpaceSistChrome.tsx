import type { ReactNode } from "react";

export const SCard = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div
    className={`rounded-lg border border-white/[0.08] bg-memory-mist/80 shadow-memory-inset ring-1 ring-white/[0.04] backdrop-blur-xl ${className}`}
  >
    {children}
  </div>
);

export const SectionTitle = ({ eyebrow, title }: { eyebrow: string; title: string }) => (
  <div className="border-l-2 border-memory-purple/50 pl-4">
    <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-memory-purple">
      {eyebrow}
    </p>
    <h2 className="mt-1 font-display text-xl font-semibold tracking-tight text-zinc-50">
      {title}
    </h2>
  </div>
);

type BadgeTone = "green" | "orange" | "purple";

export const ToneBadge = ({ children, tone }: { children: ReactNode; tone: BadgeTone }) => (
  <span
    className={
      tone === "green"
        ? "rounded-md border border-memory-green/25 bg-memory-green/[0.08] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-memory-green"
        : tone === "orange"
          ? "rounded-md border border-memory-orange/25 bg-memory-orange/[0.06] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-memory-orange"
          : "rounded-md border border-memory-purple/30 bg-memory-purple/[0.08] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-memory-purple"
    }
  >
    {children}
  </span>
);

/** Small pill for API / feed attribution (NASA, Open Notify, etc.) */
export const SourcePill = ({ id, label }: { id: string; label: string }) => (
  <span
    className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-white/[0.1] bg-black/35 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-400"
    title={id}
  >
    <span className="shrink-0 text-memory-orange">src</span>
    <span className="min-w-0 truncate text-zinc-300">{label}</span>
  </span>
);

export const Telemetry = ({
  label,
  value,
  sub,
  state,
}: {
  label: string;
  value: string;
  sub?: string;
  state?: "ok" | "dim" | "live";
}) => (
  <div
    className={`rounded-lg border p-3 ${
      state === "live"
        ? "border-memory-green/20 bg-memory-green/[0.04] shadow-[0_0_0_1px_rgba(52,211,153,0.12)]"
        : state === "ok"
          ? "border-white/[0.08] bg-memory-void/60"
          : "border-white/[0.06] bg-memory-void/40 opacity-80"
    }`}
  >
    <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">{label}</div>
    <div className="mt-1 break-words font-mono text-sm text-zinc-100">{value}</div>
    {sub ? <div className="mt-0.5 font-mono text-[10px] text-zinc-600">{sub}</div> : null}
  </div>
);

export const StatCard = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "green" | "purple" | "orange";
}) => (
  <div className="rounded-lg border border-white/[0.08] bg-memory-void/60 p-3">
    <div
      className={
        tone === "green"
          ? "font-mono text-xl text-memory-green"
          : tone === "orange"
            ? "font-mono text-xl text-memory-orange"
            : "font-mono text-xl text-memory-purple"
      }
    >
      {value}
    </div>
    <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-zinc-500">{label}</div>
  </div>
);
