import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

type Tone = "default" | "live" | "beta" | "alpha" | "soon" | "warn" | "danger";

export interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const tones: Record<Tone, string> = {
  default: "aliasist-pill",
  live: "aliasist-pill aliasist-pill-live",
  beta: "aliasist-pill aliasist-pill-beta",
  alpha: "aliasist-pill aliasist-pill-alpha",
  soon: "aliasist-pill aliasist-pill-soon",
  warn: "aliasist-pill aliasist-pill-warn",
  danger: "aliasist-pill aliasist-pill-danger",
};

export const Pill = ({ tone = "default", className, ...props }: PillProps) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em]",
      tones[tone],
      className,
    )}
    {...props}
  />
);
