/// <reference path="../svg.d.ts" />
import { cn } from "../lib/cn";
import logoBrand from "../assets/aliasist-logo-brand.svg";

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
  <div className={cn("group inline-flex items-center gap-2.5", className)}>
    <img
      src={logoBrand}
      alt="Aliasist"
      width={size}
      height={size}
      className="shrink-0 rounded-sm object-contain motion-safe:transition-transform motion-safe:duration-350 motion-safe:ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
      style={{
        filter: "drop-shadow(0 0 10px rgba(11, 207, 114, 0.25))",
      }}
    />
    {wordmark && (
      <span className="font-display text-[15px] font-semibold tracking-tight" style={{ color: "var(--aliasist-text)" }}>
        Aliasist
      </span>
    )}
  </div>
);
