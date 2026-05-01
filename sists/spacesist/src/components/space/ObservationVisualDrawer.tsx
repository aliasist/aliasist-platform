import { useEffect } from "react";
import type { SpaceObservationItem } from "@aliasist/api-client";
import { ToneBadge } from "./SpaceSistChrome";

interface ObservationVisualDrawerProps {
  observation: SpaceObservationItem | null;
  relatedObservations: SpaceObservationItem[];
  onSelectObservation: (item: SpaceObservationItem) => void;
  onClose: () => void;
}

export const ObservationVisualDrawer = ({
  observation,
  relatedObservations,
  onSelectObservation,
  onClose,
}: ObservationVisualDrawerProps) => {
  useEffect(() => {
    if (!observation) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [observation, onClose]);

  if (!observation) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-ink-950/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="fixed inset-4 z-[60] flex overflow-hidden rounded-2xl border border-white/[0.1] bg-ink-900 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label={`${observation.obsTitle} visual window`}
      >
        <div className="flex flex-1 flex-col lg:flex-row">
          <section className="min-h-0 flex-1 border-b border-white/[0.08] lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] p-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-ufo-300/90">
                  Telescope visual
                </div>
                <h2 className="mt-1 font-display text-2xl font-semibold text-ink-50">
                  {observation.obsTitle}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-md border border-white/[0.08] px-2 py-1 text-xs text-ink-300 transition hover:border-ink-500 hover:text-ink-100"
                aria-label="Close visual window"
              >
                Close ✕
              </button>
            </div>

            <div className="flex h-full flex-col p-4">
              <div className="flex flex-wrap items-center gap-2">
                <ToneBadge tone={observation.isVisual ? "green" : "purple"}>
                  {observation.isVisual ? "Preview ready" : "Metadata only"}
                </ToneBadge>
                <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-ink-300">
                  {observation.collection} · {observation.instrument}
                </span>
              </div>
              <div className="mt-4 flex-1 overflow-hidden rounded-xl border border-white/[0.08] bg-ink-950/60">
                {observation.previewUrl ? (
                  <img
                    src={observation.previewUrl}
                    alt={observation.obsTitle}
                    className="h-full w-full object-contain bg-black"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center text-sm leading-7 text-ink-300">
                    No visual preview is available for this observation yet.
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="w-full max-w-md border-l border-white/[0.08] p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-ink-400">
              Visual context
            </div>
            <div className="mt-3 grid gap-3">
              {relatedObservations.length === 0 ? (
                <p className="text-sm leading-7 text-ink-300">
                  No related visual results are loaded.
                </p>
              ) : (
                relatedObservations.slice(0, 4).map((item) => (
                  <button
                    key={item.obsId}
                    type="button"
                    onClick={() => onSelectObservation(item)}
                    className="overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.035] text-left transition hover:border-ufo-300/20 hover:bg-white/[0.055]"
                  >
                    <div className="flex gap-3 p-3">
                      <div className="h-16 w-20 shrink-0 overflow-hidden rounded-md border border-white/[0.08] bg-ink-950">
                        {item.previewUrl ? (
                          <img src={item.previewUrl} alt={item.obsTitle} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-ink-100">
                          {item.obsTitle}
                        </div>
                        <div className="mt-1 text-xs text-ink-400">
                          {item.collection} · {item.instrument}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>
        </div>
      </aside>
    </>
  );
};
