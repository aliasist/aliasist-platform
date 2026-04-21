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
    {sists.map((sist) => {
      const active = currentPath?.startsWith(sist.path);
      return (
        <button
          key={sist.id}
          type="button"
          onClick={() => onNavigate(sist.path)}
          className={cn(
            "group relative rounded-panel border bg-ink-900/70 p-4 text-left transition",
            "hover:border-ufo-500/50 hover:bg-ink-900",
            active ? "border-ufo-500/60 shadow-glow" : "border-ink-700",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                aria-hidden
                className="grid h-10 w-10 place-items-center rounded-lg border border-ink-700 bg-ink-950 text-lg"
              >
                {sist.icon}
              </div>
              <div>
                <div className="font-display text-[15px] font-medium text-ink-50">
                  {sist.name}
                </div>
                <div className="text-xs text-ink-300">{sist.tagline}</div>
              </div>
            </div>
            <Pill tone={statusTone[sist.status]}>{sist.status}</Pill>
          </div>
        </button>
      );
    })}
  </nav>
);
