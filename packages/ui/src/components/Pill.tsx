import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

type Tone = "default" | "live" | "beta" | "alpha" | "soon" | "warn" | "danger";

export interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const tones: Record<Tone, string> = {
  default: "border-ink-600 text-ink-200 bg-ink-800/60",
  live:
    "relative overflow-hidden border-ufo-500/40 text-ufo-300 bg-ufo-500/10 shadow-[0_0_14px_-4px_rgba(47,149,220,0.45)] motion-safe:before:pointer-events-none motion-safe:before:absolute motion-safe:before:inset-0 motion-safe:before:-translate-x-full motion-safe:before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)] motion-safe:before:animate-sheen motion-safe:before:content-[''] motion-reduce:before:hidden",
  beta: "border-signal-500/40 text-signal-400 bg-signal-500/10",
  alpha: "border-ink-500 text-ink-300 bg-ink-800/60",
  soon: "border-ink-700 text-ink-400 bg-ink-900/60",
  warn: "border-signal-500/60 text-signal-400 bg-signal-500/15",
  danger: "border-danger-500/60 text-danger-500 bg-danger-500/10",
};

export const Pill = ({ tone = "default", className, ...props }: PillProps) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em]",
      tones[tone],
      className,
    )}
    {...props}
  />
);
