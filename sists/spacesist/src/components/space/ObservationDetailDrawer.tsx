import { useEffect } from "react";
import type { SpaceObservationItem } from "@aliasist/api-client";
import { ToneBadge } from "./SpaceSistChrome";

interface ObservationDetailDrawerProps {
  observation: SpaceObservationItem | null;
  relatedObservations: SpaceObservationItem[];
  onSelectObservation: (item: SpaceObservationItem) => void;
  onOpenVisual: (item: SpaceObservationItem) => void;
  onExploreTarget: (targetName: string) => void;
  onClose: () => void;
}

export const ObservationDetailDrawer = ({
  observation,
  relatedObservations,
  onSelectObservation,
  onOpenVisual,
  onExploreTarget,
  onClose,
}: ObservationDetailDrawerProps) => {
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
        className="fixed inset-0 z-40 bg-ink-950/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col overflow-hidden border-l border-white/[0.08] bg-ink-900 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label={observation.obsTitle}
      >
        <header className="border-b border-white/[0.08] p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.2em] text-ufo-300/90">
                MAST observation window
              </div>
              <h2 className="mt-1 font-display text-2xl font-semibold text-ink-50">
                {observation.obsTitle}
              </h2>
              <div className="mt-1 text-sm text-ink-300">
                {observation.collection} · {observation.instrument}
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-md border border-white/[0.08] px-2 py-1 text-xs text-ink-300 transition hover:border-ink-500 hover:text-ink-100"
              aria-label="Close detail window"
            >
              Close ✕
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ToneBadge tone={observation.isVisual ? "green" : "purple"}>
              {observation.isVisual ? "Preview ready" : "Metadata only"}
            </ToneBadge>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-ink-300">
              {observation.dataProductType}
            </span>
          </div>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <section className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-ink-400">
              Preview
            </div>
            <div className="mt-3 overflow-hidden rounded-lg border border-white/[0.08] bg-ink-950/55">
              {observation.previewUrl ? (
                <img
                  src={observation.previewUrl}
                  alt={observation.obsTitle}
                  className="h-64 w-full object-cover"
                />
              ) : (
                <div className="flex h-64 items-center justify-center px-4 text-center text-sm leading-7 text-ink-300">
                  No preview tile was returned for this observation. Use the archive link to inspect the source product or metadata.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-ink-400">
              Metadata
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Observation ID" value={observation.obsId} />
              <Field label="Target" value={observation.targetName} />
              <Field label="Collection" value={observation.collection} />
              <Field label="Instrument" value={observation.instrument} />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Product type" value={observation.dataProductType} />
              <Field label="Observation time" value={observation.observationTime ?? "—"} />
            </div>
          </section>

          <section className="rounded-lg border border-white/[0.08] bg-ufo-400/[0.06] p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-ufo-200">
              Archive actions
            </div>
            <p className="mt-2 text-sm leading-7 text-ink-200">
              This drawer is the quick-view step before we build a deeper observation page or footprint overlay. It keeps the archive flow usable without pretending the browser is the archive.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onOpenVisual(observation)}
                className="rounded-md border border-ufo-300/30 bg-ufo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-ufo-400"
              >
                Open visual window
              </button>
              <button
                type="button"
                onClick={() => onExploreTarget(observation.targetName)}
                className="rounded-md border border-ufo-300/30 bg-ufo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-ufo-400"
              >
                Find related observations
              </button>
              {observation.accessUrl ? (
                <a
                  href={observation.accessUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-ufo-300/30 bg-ufo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-ufo-400"
                >
                  Open archive source
                </a>
              ) : null}
            </div>
          </section>

          <section className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-ink-400">
              Related observations
            </div>
            <div className="mt-3 space-y-3">
              {relatedObservations.length === 0 ? (
                <p className="text-sm leading-7 text-ink-300">
                  No nearby archive results are currently loaded.
                </p>
              ) : (
                relatedObservations.slice(0, 3).map((item) => (
                  <button
                    key={item.obsId}
                    type="button"
                    onClick={() => onSelectObservation(item)}
                    className="w-full rounded-lg border border-white/[0.08] bg-ink-950/45 p-3 text-left transition hover:border-ufo-300/20 hover:bg-ink-950/65"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-16 w-20 shrink-0 overflow-hidden rounded-md border border-white/[0.08] bg-ink-900">
                        {item.previewUrl ? (
                          <img src={item.previewUrl} alt={item.obsTitle} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-ink-100">
                          {item.obsTitle}
                        </div>
                        <div className="mt-1 text-xs text-ink-400">
                          {item.collection} · {item.instrument}
                        </div>
                        <div className="mt-1 text-[11px] text-ink-500">
                          {item.targetName}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>
        </div>
      </aside>
    </>
  );
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md border border-white/[0.08] bg-ink-950/45 px-3 py-2">
    <dt className="text-[10px] uppercase tracking-[0.16em] text-ink-400">{label}</dt>
    <dd className="mt-1 font-mono text-sm text-ink-100">{value}</dd>
  </div>
);
