import { cn } from "../lib/cn";
import { Pill } from "./Pill";
import type { SistManifest } from "../types";

export interface AppSwitcherProps {
  sists: SistManifest[];
  currentPath?: string;
  onNavigate: (path: string) => void;
  className?: string;
}

const statusTone: Record<SistManifest["status"], "live" | "beta" | "alpha" | "soon"> = {
  live: "live",
  beta: "beta",
  alpha: "alpha",
  "coming-soon": "soon",
};

export const AppSwitcher = ({
  sists,
  currentPath,
  onNavigate,
  className,
}: AppSwitcherProps) => (
  <nav
    aria-label="Aliasist apps"
    className={cn(
      "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3",
      className,
    )}
  >
    {sists.map((sist, index) => {
      const active = currentPath?.startsWith(sist.path);
      return (
        <button
          key={sist.id}
          type="button"
          onClick={() => onNavigate(sist.path)}
          aria-current={active ? "page" : undefined}
          title={`Open ${sist.name}`}
          style={{ animationDelay: `${index * 65}ms` }}
          className={cn(
            "group relative overflow-hidden rounded-panel border bg-ink-900/68 p-4 text-left shadow-panel",
            "motion-safe:animate-fade-up motion-safe:opacity-0 motion-reduce:opacity-100 motion-reduce:animate-none",
            "cursor-pointer transition-all duration-350 ease-out",
            "hover:-translate-y-1 hover:border-ufo-400/45 hover:bg-ink-900 hover:shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_24px_48px_-28px_rgba(47,149,220,0.42)]",
            "active:translate-y-0 active:scale-[0.99] active:transition-none",
            active
              ? "border-ufo-400/60 shadow-glow ring-1 ring-ufo-400/20"
              : "border-white/[0.08]",
          )}
        >
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-ufo-400/60 to-transparent transition-opacity duration-300",
              active ? "opacity-100" : "opacity-0 group-hover:opacity-100",
            )}
          />
          {/* Hover glow sweep */}
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 translate-x-[-100%] opacity-0 transition-all duration-500 ease-out group-hover:translate-x-[100%] group-hover:opacity-100",
              "bg-[linear-gradient(105deg,transparent_13%,rgba(47,149,220,0.12)_48%,transparent_82%)]",
            )}
          />
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                aria-hidden
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-lg",
                  "transition-all duration-350 ease-spring group-hover:scale-110 group-hover:border-ufo-400/35 group-hover:bg-ufo-500/10 group-hover:shadow-[0_0_20px_-4px_rgba(47,149,220,0.45)]",
                )}
              >
                {sist.icon}
              </div>
              <div>
                <div className="font-display text-[15px] font-medium text-ink-50 transition-colors duration-250 group-hover:text-ink-50">
                  {sist.name}
                </div>
                <div className="mt-0.5 text-xs leading-relaxed text-ink-300 transition-colors duration-250 group-hover:text-ink-200">
                  {sist.tagline}
                </div>
              </div>
            </div>
            <Pill tone={statusTone[sist.status]}>{sist.status}</Pill>
          </div>
          <div className="relative mt-4 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-3 text-[11px] uppercase tracking-[0.16em] text-ink-400">
            <span className="font-mono">{sist.path}</span>
            <span className="inline-flex items-center gap-1 text-ufo-200 transition-colors duration-250 group-hover:text-ufo-100">
              Open <span aria-hidden>↗</span>
            </span>
          </div>
        </button>
      );
    })}
  </nav>
);
