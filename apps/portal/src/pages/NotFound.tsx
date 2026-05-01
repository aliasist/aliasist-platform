import { Link } from "react-router-dom";
import { cn } from "@aliasist/ui";

export const NotFound = () => (
  <div className="relative flex min-h-[52vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_44%_at_50%_40%,rgba(47,149,220,0.07),transparent_70%)]"
    />
    <div className="relative motion-safe:animate-fade-up motion-safe:opacity-0 motion-reduce:animate-none motion-reduce:opacity-100">
      <div className="font-mono text-xs uppercase tracking-[0.18em] text-ufo-400">
        404 · off-grid
      </div>
      <h2 className="mt-3 font-display text-3xl sm:text-4xl">
        <span className="bg-gradient-to-br from-ink-50 via-ufo-200/90 to-ink-200/80 bg-clip-text text-transparent">
          That path isn&apos;t on the map.
        </span>
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-300">
        The URL you followed doesn&apos;t match a sist or portal route. Try the home
        page or pick a lab from the header.
      </p>
      <Link
        to="/"
        className={cn(
          "mt-6 inline-flex items-center gap-2 rounded-md border border-ink-600 bg-white/[0.02] px-4 py-2 text-sm text-ink-100",
          "transition-all duration-250 hover:-translate-y-0.5 hover:border-ufo-500 hover:text-ufo-400 hover:shadow-[0_12px_40px_-28px_rgba(47,149,220,0.45)]",
          "active:translate-y-0",
        )}
      >
        ← Return to base
      </Link>
    </div>
  </div>
);
