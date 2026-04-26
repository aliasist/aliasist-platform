import { cn } from "@aliasist/ui";
import type { ReactNode } from "react";

type Glow = "none" | "purple" | "green";

export interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: Glow;
  /** Extra inner padding on top for eyebrow rows */
  padded?: boolean;
}

export const GlassCard = ({
  children,
  className,
  glow = "none",
  padded = true,
}: GlassCardProps) => (
  <div
    className={cn(
      "rounded-2xl border border-white/[0.08] bg-memory-mist/75 shadow-memory-inset ring-1 ring-white/[0.04] backdrop-blur-xl",
      glow === "purple" && "border-memory-purple/30 shadow-memory-purple",
      glow === "green" && "border-memory-green/25 shadow-memory-green",
      padded && "p-5 sm:p-6",
      className,
    )}
  >
    {children}
  </div>
);
