import { useEffect } from "react";
import type { SpaceTargetEphemeris, SpaceTargetLookupItem } from "@aliasist/api-client";
import { ToneBadge } from "./SpaceSistChrome";

interface TargetDetailDrawerProps {
  target: SpaceTargetLookupItem | null;
  ephemeris: SpaceTargetEphemeris | null;
  ephemerisLoading: boolean;
  ephemerisError: string | null;
  onClose: () => void;
}

const formatType = (value: string) =>
  value
    .replace(/\(.*?\)/g, "")
    .replace(/\s+/g, " ")
    .trim();

const formatMaybeNumber = (value: number | null, digits: number) =>
  value === null ? "—" : value.toFixed(digits);

const deriveVisibility = (rowCount: number, brightestMagnitude: number | null) => {
  if (rowCount === 0) {
    return { label: "Unavailable", note: "No ephemeris rows returned for this window." };
  }
  if (brightestMagnitude === null) {
    return { label: "Unscored", note: "Use the quick view rows to judge whether the target is practical." };
  }
  if (brightestMagnitude <= 10) {
    return { label: "Strong", note: "Good candidate for a deeper observation or a dedicated planner view." };
  }
  if (brightestMagnitude <= 15) {
    return { label: "Moderate", note: "Worth opening in the full drawer before observing or archiving." };
  }
  return { label: "Faint", note: "Likely better as a reference target than a quick visual observation." };
};

export const TargetDetailDrawer = ({ target, ephemeris, ephemerisLoading, ephemerisError, onClose }: TargetDetailDrawerProps) => {
  useEffect(() => {
    if (!target) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [target, onClose]);

  if (!target) return null;
  const bestRow =
    ephemeris?.rows.reduce((best, row) => {
      if (best === null) return row;
      const bestMag = best.apparentMagnitude ?? Number.POSITIVE_INFINITY;
      const rowMag = row.apparentMagnitude ?? Number.POSITIVE_INFINITY;
      if (rowMag < bestMag) return row;
      const bestDelta = best.distanceAu ?? Number.POSITIVE_INFINITY;
      const rowDelta = row.distanceAu ?? Number.POSITIVE_INFINITY;
      if (rowDelta < bestDelta) return row;
      return best;
    }, null as (typeof ephemeris)["rows"][number] | null) ?? null;
  const visibility = deriveVisibility(ephemeris?.rowCount ?? 0, ephemeris?.summary.brightestMagnitude ?? null);

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
        aria-label={target.name}
      >
        <header className="border-b border-white/[0.08] p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.2em] text-ufo-300/90">
                JPL target window
              </div>
              <h2 className="mt-1 font-display text-2xl font-semibold text-ink-50">
                {target.name}
              </h2>
              <div className="mt-1 text-sm text-ink-300">
                {formatType(target.objectType)}
                {target.primaryDesignation ? ` · ${target.primaryDesignation}` : ""}
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
            <ToneBadge tone="green">SPK {target.spkId}</ToneBadge>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-ink-300">
              {target.aliases.length} aliases
            </span>
          </div>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <section className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-ink-400">
              Identity
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Name" value={target.name} />
              <Field label="Type" value={formatType(target.objectType)} />
              <Field label="Primary designation" value={target.primaryDesignation ?? "—"} />
              <Field label="SPK ID" value={target.spkId} />
            </div>
          </section>

          <section className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-ink-400">
              Aliases
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(target.aliases.length > 0 ? target.aliases : ["No aliases returned in lookup."]).map((alias) => (
                <span
                  key={alias}
                  className="rounded-full border border-white/[0.08] bg-ink-950/60 px-2.5 py-1 text-[11px] font-medium text-ink-300"
                >
                  {alias}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-white/[0.08] bg-ufo-400/[0.06] p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-ufo-200">
              Next detail layer
            </div>
            <p className="mt-2 text-sm leading-7 text-ink-200">
              This window is the staging point for ephemeris, visibility, and archive views. The next phase will add observer-aware data so users can move from identity to position to observation in one flow.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-ink-500">
              Planned follow-up: `SpaceSist` ephemeris route, visibility planner, and a true pop-out/undocked detail experience.
            </p>
          </section>

          <section className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-ink-400">
              Observer ephemeris
            </div>
            {ephemerisLoading ? (
              <p className="mt-3 text-sm leading-7 text-ink-300">
                Loading a short observer window for this target...
              </p>
            ) : ephemerisError ? (
              <p className="mt-3 text-sm leading-7 text-red-200">{ephemerisError}</p>
            ) : ephemeris ? (
              <div className="mt-3 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Window" value={`${ephemeris.startTime} → ${ephemeris.stopTime}`} />
                  <Field label="Step" value={ephemeris.stepSize} />
                  <Field label="Center" value={`${ephemeris.center.bodyName} · ${ephemeris.center.siteName}`} />
                  <Field label="Rows" value={String(ephemeris.rowCount)} />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Brightest" value={formatMaybeNumber(ephemeris.summary.brightestMagnitude, 2)} />
                  <Field label="Closest" value={formatMaybeNumber(ephemeris.summary.closestDistanceAu, 4)} />
                  <Field label="Range rate" value={formatMaybeNumber(ephemeris.summary.fastestRangeRateKms, 2)} />
                </div>
                <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-ink-400">
                      Visibility snapshot
                    </div>
                    <ToneBadge tone={visibility.label === "Strong" ? "green" : visibility.label === "Moderate" ? "orange" : "purple"}>
                      {visibility.label}
                    </ToneBadge>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-ink-300">
                    {visibility.note}
                  </p>
                </div>
                {bestRow ? (
                  <div className="rounded-lg border border-ufo-300/15 bg-ufo-400/[0.05] px-3 py-2">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-ufo-200">
                      Best quick view
                    </div>
                    <div className="mt-2 text-xs leading-relaxed text-ink-200">
                      {bestRow.time} with
                      {bestRow.apparentMagnitude !== null ? ` Vmag ${bestRow.apparentMagnitude.toFixed(2)}` : " no magnitude"}
                      {bestRow.distanceAu !== null ? ` and ${bestRow.distanceAu.toFixed(4)} au range` : ""}
                      {bestRow.deltaDotKms !== null ? `, range rate ${bestRow.deltaDotKms.toFixed(2)} km/s` : ""}.
                    </div>
                  </div>
                ) : null}
                <div className="space-y-2">
                  {ephemeris.rows.slice(0, 4).map((row) => (
                    <div key={row.raw} className="rounded-md border border-white/[0.08] bg-ink-950/45 px-3 py-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-ink-400">
                        <span>{row.time}</span>
                        <span>{row.apparentMagnitude !== null ? `Vmag ${row.apparentMagnitude.toFixed(2)}` : "Vmag n/a"}</span>
                      </div>
                      <div className="mt-1 text-xs text-ink-300">
                        RA {row.ra} · Dec {row.dec}
                      </div>
                      <div className="mt-1 text-[11px] text-ink-500">
                        Δ {row.distanceAu !== null ? `${row.distanceAu.toFixed(4)} au` : "n/a"}
                        {row.deltaDotKms !== null ? ` · range rate ${row.deltaDotKms.toFixed(2)} km/s` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-7 text-ink-300">
                Open a target to load an observer window and preview its motion.
              </p>
            )}
          </section>

          {ephemeris ? (
            <section className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-4">
              <div className="text-[10px] uppercase tracking-[0.2em] text-ink-400">
                Observation cue
              </div>
              <p className="mt-2 text-sm leading-7 text-ink-200">
                Use the best quick view as the starting point for a future visibility planner or undocked observation window. That keeps the detail drawer useful without pretending it is a full telescope scheduler yet.
              </p>
            </section>
          ) : null}
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
