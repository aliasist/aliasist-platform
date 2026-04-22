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
      "relative rounded-panel border border-ink-700 bg-ink-900/80 shadow-panel backdrop-blur-sm",
      lab && "bg-scanlines",
      className,
    )}
    {...rest}
  >
    {(title || eyebrow) && (
      <header className="flex items-baseline justify-between gap-3 border-b border-ink-700/60 px-5 py-3">
        <div className="flex flex-col">
          {eyebrow && (
            <span className="text-[10px] uppercase tracking-[0.18em] text-ufo-400/80">
              {eyebrow}
            </span>
          )}
          {title && (
            <h3 className="font-display text-base font-medium text-ink-50">
              {title}
            </h3>
          )}
        </div>
      </header>
    )}
    <div className="px-5 py-4">{children}</div>
  </section>
);
