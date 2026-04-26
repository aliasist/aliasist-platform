import type { MockSpace } from "../../data/mockMemory";
import { cn } from "@aliasist/ui";
import { SectionLabel } from "./SectionChrome";

export interface ProjectSpaceCardsProps {
  spaces: MockSpace[];
  activeId: string;
  onSelect: (id: string) => void;
}

export const ProjectSpaceCards = ({ spaces, activeId, onSelect }: ProjectSpaceCardsProps) => (
  <section aria-label="Project spaces" className="space-y-4">
    <SectionLabel
      eyebrow="Workspace"
      title="Project spaces"
      right={
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-zinc-500">
          Mock data
        </span>
      }
    />
    <p className="text-sm text-zinc-500">
      Select a project space. Notes, bundles, source chunks, and ask copy all filter to the active space (mock
      data).
    </p>
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {spaces.map((s) => {
        const on = s.id === activeId;
        return (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onSelect(s.id)}
              className={cn(
                "group w-full rounded-3xl border p-4 text-left transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-memory-purple/50 focus-visible:ring-offset-2 focus-visible:ring-offset-memory-void",
                on
                  ? "border-memory-purple/50 bg-memory-surface/95 shadow-memory-purple ring-1 ring-memory-purple/20"
                  : "border-white/[0.07] bg-memory-mist/70 hover:border-memory-purple/25 hover:bg-memory-surface/85 hover:shadow-[0_0_32px_-20px_rgba(109,40,217,0.45)]",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-zinc-100">{s.name}</span>
                {on ? (
                  <span className="shrink-0 rounded-full border border-memory-green/30 bg-memory-green/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-memory-green">
                    Active
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-xs leading-snug text-zinc-500">{s.description}</p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {s.highlights.map((h) => (
                  <li
                    key={h}
                    className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] text-zinc-400"
                  >
                    {h}
                  </li>
                ))}
              </ul>
            </button>
          </li>
        );
      })}
    </ul>
  </section>
);
