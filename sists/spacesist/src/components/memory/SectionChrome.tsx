import { cn } from "@aliasist/ui";
import type { ReactNode } from "react";

export const SectionLabel = ({
  eyebrow,
  title,
  right,
  className,
}: {
  eyebrow?: string;
  title: string;
  right?: ReactNode;
  className?: string;
}) => (
  <div className={cn("mb-4 flex flex-wrap items-end justify-between gap-3", className)}>
    <div className="min-w-0 border-l-2 border-memory-purple/45 pl-4">
      {eyebrow ? (
        <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-memory-purple/95">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-0.5 font-display text-lg font-semibold tracking-tight text-zinc-50">
        {title}
      </h2>
    </div>
    {right}
  </div>
);

export const StatusDot = ({ live }: { live?: boolean }) => (
  <span
    className={cn(
      "inline-block size-1.5 rounded-full",
      live ? "bg-memory-green shadow-[0_0_8px_rgba(52,211,153,0.85)]" : "bg-zinc-600",
    )}
    aria-hidden
  />
);
