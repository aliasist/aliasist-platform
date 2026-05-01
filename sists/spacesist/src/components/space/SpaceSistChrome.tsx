import type { ReactNode } from "react";

export const SCard = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div
    className={`rounded-lg border border-white/[0.08] bg-white/[0.045] shadow-[0_18px_45px_-34px_rgba(0,0,0,0.85)] ring-1 ring-white/[0.035] backdrop-blur-xl ${className}`}
  >
    {children}
  </div>
);

export const SectionTitle = ({ eyebrow, title }: { eyebrow: string; title: string }) => (
  <div>
    <p className="text-xs font-medium text-ufo-300">
      {eyebrow}
    </p>
    <h2 className="mt-1 font-display text-xl font-semibold tracking-tight text-ink-50">
      {title}
    </h2>
  </div>
);

type BadgeTone = "green" | "orange" | "purple";

export const ToneBadge = ({ children, tone }: { children: ReactNode; tone: BadgeTone }) => (
  <span
    className={
      tone === "green"
        ? "rounded-full border border-ufo-300/25 bg-ufo-400/[0.08] px-2.5 py-1 text-xs font-medium text-ufo-200"
        : tone === "orange"
          ? "rounded-full border border-signal-400/25 bg-signal-400/[0.08] px-2.5 py-1 text-xs font-medium text-signal-400"
          : "rounded-full border border-sky-300/25 bg-sky-400/[0.08] px-2.5 py-1 text-xs font-medium text-sky-200"
    }
  >
    {children}
  </span>
);

/** Small pill for API / feed attribution (NASA, Open Notify, etc.) */
export const SourcePill = ({ id, label }: { id: string; label: string }) => (
  <span
    className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-ink-300"
    title={id}
  >
    <span className="shrink-0 text-ufo-300">source</span>
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
        ? "border-ufo-300/20 bg-ufo-400/[0.06] shadow-[0_0_0_1px_rgba(47,149,220,0.12)]"
        : state === "ok"
          ? "border-white/[0.08] bg-white/[0.035]"
          : "border-white/[0.06] bg-white/[0.025] opacity-80"
    }`}
  >
    <div className="text-xs font-medium text-ink-400">{label}</div>
    <div className="mt-1 break-words text-sm font-semibold text-ink-50">{value}</div>
    {sub ? <div className="mt-0.5 text-xs text-ink-500">{sub}</div> : null}
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
  <div className="rounded-lg border border-white/[0.08] bg-white/[0.045] p-3">
    <div
      className={
        tone === "green"
          ? "text-xl font-semibold text-ufo-200"
          : tone === "orange"
            ? "text-xl font-semibold text-signal-400"
            : "text-xl font-semibold text-sky-200"
      }
    >
      {value}
    </div>
    <div className="mt-1 text-xs font-medium text-ink-400">{label}</div>
  </div>
);
