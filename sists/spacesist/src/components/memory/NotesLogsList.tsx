import type { MockNote } from "../../data/mockMemory";
import { GlassCard } from "./GlassCard";
import { SectionLabel } from "./SectionChrome";

const kindStyles = (kind: MockNote["kind"]) => {
  switch (kind) {
    case "log":
      return "border-memory-amber/25 bg-memory-amber/5 text-memory-amber";
    case "decision":
      return "border-memory-purple/30 bg-memory-purple/10 text-memory-purple";
    default:
      return "border-white/10 bg-white/[0.04] text-zinc-400";
  }
};

const kindLabel = (kind: MockNote["kind"]) => {
  switch (kind) {
    case "log":
      return "Log";
    case "decision":
      return "Decision";
    default:
      return "Note";
  }
};

export interface NotesLogsListProps {
  notes: MockNote[];
  activeSpaceName: string;
  /** When true, rows are for a single space and the space id line is hidden. */
  spaceScoped?: boolean;
}

export const NotesLogsList = ({ notes, activeSpaceName, spaceScoped = false }: NotesLogsListProps) => (
  <section aria-label="Recent notes and logs" className="space-y-4">
    <SectionLabel
      eyebrow="Activity"
      title="Recent notes & logs"
      right={
        <span className="rounded-full border border-memory-amber/20 bg-memory-amber/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-memory-amber">
          {notes.length} {notes.length === 1 ? "entry" : "entries"} · {activeSpaceName}
        </span>
      }
    />
    <p className="text-sm text-zinc-500">Filtered to the active project space (mock data).</p>
    <GlassCard glow="none" className="overflow-hidden p-0">
      <div
        className="h-0.5 w-full bg-gradient-to-r from-memory-amber/50 via-memory-orange/30 to-transparent"
        aria-hidden
      />
      {notes.length === 0 ? (
        <div className="px-5 py-12 text-center sm:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-600">// empty_space</p>
          <p className="mt-2 text-sm text-zinc-400">
            No notes or logs in the mock set for <span className="text-zinc-200">{activeSpaceName}</span>. Switch
            project space or add fixtures in <code className="font-mono text-xs text-memory-green/80">mockMemory.ts</code>.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-white/[0.07]">
          {notes.map((n) => (
            <li
              key={n.id}
              className="px-4 py-3.5 transition hover:bg-white/[0.03] sm:px-5"
            >
              <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                <span className="text-memory-amber/90">{n.at}</span>
                {!spaceScoped ? (
                  <>
                    <span className="text-zinc-700">·</span>
                    <span className="font-mono text-zinc-500">{n.spaceId}</span>
                  </>
                ) : null}
                <span
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-medium normal-case tracking-tight ${kindStyles(n.kind)}`}
                >
                  {kindLabel(n.kind)}
                </span>
              </div>
              <div className="mt-1.5 font-medium text-zinc-100">{n.title}</div>
              <p className="mt-1 text-sm leading-relaxed text-zinc-500">{n.summary}</p>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  </section>
);
