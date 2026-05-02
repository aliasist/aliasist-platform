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

const accentTone: Record<SistManifest["accent"], { line: string; glow: string; chip: string; label: string }> = {
  ufo: {
    line: "var(--aliasist-accent)",
    glow: "color-mix(in srgb, var(--aliasist-accent) 18%, transparent)",
    chip: "color-mix(in srgb, var(--aliasist-accent) 16%, transparent)",
    label: "Core",
  },
  signal: {
    line: "var(--aliasist-warning)",
    glow: "color-mix(in srgb, var(--aliasist-warning) 20%, transparent)",
    chip: "color-mix(in srgb, var(--aliasist-warning) 14%, transparent)",
    label: "Signal",
  },
  ink: {
    line: "var(--aliasist-text-muted)",
    glow: "color-mix(in srgb, var(--aliasist-text-muted) 16%, transparent)",
    chip: "color-mix(in srgb, var(--aliasist-text-muted) 10%, transparent)",
    label: "Neutral",
  },
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
      const accent = accentTone[sist.accent];
      return (
        <button
          key={sist.id}
          type="button"
          onClick={() => onNavigate(sist.path)}
          aria-current={active ? "page" : undefined}
          title={`Open ${sist.name}`}
          style={{ animationDelay: `${index * 65}ms` }}
          className={cn(
            "group relative overflow-hidden rounded-panel aliasist-nav-card min-h-[168px] p-4 text-left",
            "motion-safe:animate-fade-up motion-safe:opacity-0 motion-reduce:opacity-100 motion-reduce:animate-none",
            "cursor-pointer transition-all duration-350 ease-out",
            "hover:-translate-y-1 hover:shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_24px_48px_-28px_rgba(47,149,220,0.28)]",
            "active:translate-y-0 active:scale-[0.99] active:transition-none",
            active ? "aliasist-nav-card-active ring-1 ring-[color:var(--aliasist-accent-soft)]" : "",
          )}
        >
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-x-0 top-0 h-px transition-opacity duration-300",
              active ? "opacity-100" : "opacity-0 group-hover:opacity-100",
            )}
            style={{ background: `linear-gradient(90deg, transparent, ${accent.line}, transparent)` }}
          />
          {/* Hover glow sweep */}
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 translate-x-[-100%] opacity-0 transition-all duration-500 ease-out group-hover:translate-x-[100%] group-hover:opacity-100",
            )}
            style={{
              background: `linear-gradient(105deg, transparent 13%, ${accent.glow} 48%, transparent 82%)`,
            }}
          />
          <div className="relative flex h-full flex-col justify-between gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  aria-hidden
                  className={cn(
                    "grid h-10 w-10 place-items-center rounded-lg border text-lg",
                    "transition-all duration-350 ease-spring group-hover:scale-110",
                  )}
                  style={{
                    borderColor: accent.line,
                    background: accent.chip,
                    boxShadow: `0 0 0 1px ${accent.line}22`,
                  }}
                >
                  {sist.icon}
                </div>
                <div>
                  <div
                    className="font-display text-[15px] font-medium transition-colors duration-250"
                    style={{ color: "var(--aliasist-text)" }}
                  >
                    {sist.name}
                  </div>
                  <div
                    className="mt-0.5 text-xs leading-relaxed transition-colors duration-250"
                    style={{ color: "var(--aliasist-text-muted)" }}
                  >
                    {sist.tagline}
                  </div>
                </div>
              </div>
              <div
                className="rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.16em]"
                style={{
                  borderColor: accent.line,
                  color: accent.line,
                  background: accent.chip,
                }}
              >
                {accent.label}
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <Pill tone={statusTone[sist.status]}>{sist.status}</Pill>
              <div
                className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.16em]"
                style={{ color: accent.line }}
              >
                Open <span aria-hidden>↗</span>
              </div>
            </div>
            <div
              className="relative mt-1 rounded-md border px-2.5 py-2 text-[11px] uppercase tracking-[0.16em]"
              style={{
                borderColor: "var(--aliasist-border)",
                color: "var(--aliasist-text-muted)",
                background: "var(--aliasist-surface-soft)",
              }}
            >
              <span className="font-mono">{sist.path}</span>
            </div>
          </div>
        </button>
      );
    })}
  </nav>
);
