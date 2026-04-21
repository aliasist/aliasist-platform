import { cn } from "../lib/cn";

export interface BrandMarkProps {
  className?: string;
  size?: number;
  /** Show the wordmark alongside the glyph. */
  wordmark?: boolean;
}

/**
 * Aliasist brandmark — a minimalist UFO silhouette emitting a single tractor beam.
 * Colors adapt to currentColor for flexibility; beam uses ufo-500.
 */
export const BrandMark = ({ className, size = 28, wordmark = true }: BrandMarkProps) => (
  <div className={cn("inline-flex items-center gap-2.5", className)}>
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-label="Aliasist"
      className="shrink-0"
    >
      {/* dome */}
      <path
        d="M10 13c0-3.3 2.7-6 6-6s6 2.7 6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* saucer */}
      <ellipse cx="16" cy="15" rx="12" ry="3" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.5" />
      {/* tractor beam */}
      <path
        d="M12 18l-2 8h12l-2-8"
        stroke="#0bcf72"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="#0bcf72"
        fillOpacity="0.12"
      />
      {/* dome light */}
      <circle cx="16" cy="11" r="1" fill="#0bcf72" />
    </svg>
    {wordmark && (
      <span className="font-display text-[15px] font-semibold tracking-tight text-ink-50">
        Aliasist
      </span>
    )}
  </div>
);
