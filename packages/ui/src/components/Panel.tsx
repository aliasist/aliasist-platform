import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export interface PanelProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  eyebrow?: ReactNode;
  /** Render subtle scanlines for that "lab" feel. */
  lab?: boolean;
}

export const Panel = ({
  title,
  eyebrow,
  lab = false,
  className,
  children,
  ...rest
}: PanelProps) => (
  <section
    className={cn(
      "group relative overflow-hidden rounded-panel border border-white/[0.08] bg-ink-900/72 shadow-panel backdrop-blur-xl",
      "transition-all duration-350 ease-out",
      "hover:border-ufo-400/25 hover:shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_22px_50px_-28px_rgba(47,149,220,0.35)]",
      lab && "bg-ink-900/72",
      className,
    )}
    {...rest}
  >
    {/* Hover: soft inner sheen */}
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute -inset-px rounded-panel opacity-0 transition-opacity duration-450 ease-out group-hover:opacity-100",
        "bg-[linear-gradient(125deg,transparent_42%,rgba(47,149,220,0.07)_52%,transparent_62%)]",
      )}
    />
    {lab && (
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 opacity-[0.12] motion-reduce:hidden",
          "bg-scanlines [background-size:auto_4px]",
          "motion-reduce:animate-none animate-scanlines",
        )}
      />
    )}
    {(title || eyebrow) && (
      <header className="relative flex items-baseline justify-between gap-3 border-b border-white/[0.08] px-5 py-3">
        <div className="flex flex-col">
          {eyebrow && (
            <span className="text-[11px] font-medium text-ufo-300/90">
              {eyebrow}
            </span>
          )}
          {title && (
            <h3 className="font-display text-base font-semibold text-ink-50">
              {title}
            </h3>
          )}
        </div>
      </header>
    )}
    <div className="relative px-5 py-4">{children}</div>
  </section>
);
