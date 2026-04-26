import { useMemo, useState } from "react";
import {
  AskThisSpace,
  ContextBundles,
  MemoryHero,
  NotesLogsList,
  ProjectSpaceCards,
  RagIndexStatus,
  SourceChunksPreview,
} from "../components/memory";
import {
  getAskCopyForSpace,
  mockBundles,
  mockIndexStatus,
  mockNotes,
  mockSourceChunks,
  mockSpaces,
} from "../data/mockMemory";

const memoryStats = [
  { label: "Spaces", value: mockSpaces.length.toString(), tone: "purple" },
  { label: "Notes / logs", value: mockNotes.length.toString(), tone: "orange" },
  { label: "Bundles", value: mockBundles.length.toString(), tone: "green" },
  { label: "Index entries", value: mockIndexStatus.entryCount.toString(), tone: "orange" },
] as const;

export const SpaceSistHome = () => {
  const [activeSpaceId, setActiveSpaceId] = useState("aliasist");
  const activeSpace = mockSpaces.find((s) => s.id === activeSpaceId) ?? mockSpaces[0]!;

  const askCopy = useMemo(() => getAskCopyForSpace(activeSpaceId), [activeSpaceId]);

  const notesForSpace = useMemo(
    () =>
      mockNotes
        .filter((n) => n.spaceId === activeSpaceId)
        .sort((a, b) => (a.at < b.at ? 1 : -1)),
    [activeSpaceId],
  );

  const bundlesForSpace = useMemo(
    () => mockBundles.filter((b) => b.spaceId === activeSpaceId).sort((a, b) => a.name.localeCompare(b.name)),
    [activeSpaceId],
  );

  const chunksForSpace = useMemo(
    () =>
      mockSourceChunks
        .filter((c) => c.spaceId === activeSpaceId)
        .sort((a, b) => parseFloat(b.scoreLabel) - parseFloat(a.scoreLabel)),
    [activeSpaceId],
  );

  const activeNotes = notesForSpace.length;
  const activeBundles = bundlesForSpace.length;
  const activeChunks = chunksForSpace.length;

  return (
    <div className="relative overflow-hidden rounded-lg border border-memory-purple/25 bg-memory-void shadow-[0_0_100px_-36px_rgba(109,40,217,0.42)] ring-1 ring-white/[0.04]">
      {/* Ambient frame - CSS only */}
      <div
        className="pointer-events-none absolute inset-0 rounded-lg opacity-60 bg-[linear-gradient(180deg,rgba(109,40,217,0.14),transparent_40%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-memory-purple/50 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-white/[0.03]"
        aria-hidden
      />

      <div className="relative space-y-8 p-4 sm:p-6 lg:p-8">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-stretch">
          <MemoryHero />

          <aside className="rounded-lg border border-white/[0.08] bg-memory-mist/80 p-4 shadow-memory-inset ring-1 ring-white/[0.04]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-memory-green">
                  Active space
                </p>
                <h2 className="mt-1 font-display text-xl font-semibold text-zinc-50">
                  {activeSpace.name}
                </h2>
              </div>
              <span className="rounded-md border border-memory-orange/25 bg-memory-orange/[0.06] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-memory-orange">
                Alpha
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">{activeSpace.description}</p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-memory-purple/20 bg-memory-purple/[0.07] p-3">
                <div className="font-mono text-lg text-memory-purple">{activeNotes}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-zinc-500">notes</div>
              </div>
              <div className="rounded-lg border border-memory-green/20 bg-memory-green/[0.07] p-3">
                <div className="font-mono text-lg text-memory-green">{activeBundles}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                  bundles
                </div>
              </div>
              <div className="rounded-lg border border-memory-orange/20 bg-memory-orange/[0.07] p-3">
                <div className="font-mono text-lg text-memory-orange">{activeChunks}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-zinc-500">chunks</div>
              </div>
            </div>
            <div className="mt-5 space-y-2">
              {activeSpace.highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="flex items-center gap-2 rounded-md border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-xs text-zinc-400"
                >
                  <span className="size-1.5 rounded-full bg-memory-green shadow-[0_0_8px_rgba(52,211,153,0.55)]" />
                  {highlight}
                </div>
              ))}
            </div>
          </aside>
        </div>

        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">Workspace (all spaces)</p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {memoryStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-white/[0.08] bg-memory-mist/70 p-4 shadow-memory-inset"
              >
                <div
                  className={
                    stat.tone === "green"
                      ? "font-mono text-2xl text-memory-green"
                      : stat.tone === "orange"
                        ? "font-mono text-2xl text-memory-orange"
                        : "font-mono text-2xl text-memory-purple"
                  }
                >
                  {stat.value}
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <ProjectSpaceCards
          spaces={mockSpaces}
          activeId={activeSpaceId}
          onSelect={setActiveSpaceId}
        />

        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <NotesLogsList
            notes={notesForSpace}
            activeSpaceName={activeSpace.name}
            spaceScoped
          />
          <ContextBundles
            bundles={bundlesForSpace}
            activeSpaceName={activeSpace.name}
            spaceScoped
          />
        </div>

        <div
          className="h-px w-full bg-gradient-to-r from-transparent via-memory-green/20 to-transparent"
          aria-hidden
        />

        <RagIndexStatus status={mockIndexStatus} activeSpaceName={activeSpace.name} />

        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <AskThisSpace
            activeSpaceId={activeSpaceId}
            activeSpaceName={activeSpace.name}
            askCopy={askCopy}
          />
          <SourceChunksPreview chunks={chunksForSpace} activeSpaceName={activeSpace.name} />
        </div>
      </div>
    </div>
  );
};
