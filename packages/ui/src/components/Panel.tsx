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
      "group relative overflow-hidden rounded-panel aliasist-panel backdrop-blur-xl",
      "transition-all duration-350 ease-out",
      "hover:border-[color:var(--aliasist-accent-soft)] hover:shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_22px_50px_-28px_rgba(47,149,220,0.24)]",
      lab && "aliasist-panel-lab",
      className,
    )}
    {...rest}
  >
    {/* Hover: soft inner sheen */}
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute -inset-px rounded-panel opacity-0 transition-opacity duration-450 ease-out group-hover:opacity-100",
        "bg-[linear-gradient(125deg,transparent_42%,color-mix(in_srgb,var(--aliasist-accent)_12%,transparent)_52%,transparent_62%)]",
      )}
    />
    {lab && (
      <div
        aria-hidden
        className={cn("pointer-events-none absolute inset-0 opacity-[0.12] motion-reduce:hidden", "motion-reduce:animate-none")}
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 3px)",
          backgroundSize: "auto 4px",
          animation: "aliasist-scanlines 6s linear infinite",
        }}
      />
    )}
    {(title || eyebrow) && (
      <header className="relative flex items-baseline justify-between gap-3 border-b px-5 py-3" style={{ borderColor: "var(--aliasist-border)" }}>
        <div className="flex flex-col">
          {eyebrow && (
            <span className="text-[11px] font-medium" style={{ color: "var(--aliasist-accent)" }}>
              {eyebrow}
            </span>
          )}
          {title && (
            <h3 className="font-display text-base font-semibold" style={{ color: "var(--aliasist-text)" }}>
              {title}
            </h3>
          )}
        </div>
      </header>
    )}
    <div className="relative px-5 py-4">{children}</div>
  </section>
);
