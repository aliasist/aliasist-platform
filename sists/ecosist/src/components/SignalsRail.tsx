import type { EcoAlert, EcoEvent, EcoQuake } from "@aliasist/api-client";
import {
  alertColor,
  alertTimestamp,
  eventColor,
  quakeColor,
  relEpoch,
  relTime,
  type Signal,
} from "../lib/format";

interface SignalsRailProps {
  alerts: EcoAlert[];
  quakes: EcoQuake[];
  events: EcoEvent[];
  selectedId: string | null;
  onSelect: (s: Signal) => void;
}

export const SignalsRail = ({
  alerts,
  quakes,
  events,
  selectedId,
  onSelect,
}: SignalsRailProps) => {
  const orderedAlerts = [...alerts].sort(
    (a, b) => alertTimestamp(b) - alertTimestamp(a),
  );
  const orderedQuakes = [...quakes].sort(
    (a, b) => (b.time ?? 0) - (a.time ?? 0),
  );

  return (
    <aside className="flex h-[560px] flex-col overflow-hidden rounded-xl border border-ink-700 bg-ink-900">
      <div className="border-b border-ink-700 px-4 py-3">
        <div className="text-[10px] uppercase tracking-[0.2em] text-ufo-400/80">
          Live signals
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-ink-300">
          <span>{alerts.length} alerts</span>
          <span>·</span>
          <span>{quakes.length} quakes</span>
          <span>·</span>
          <span>{events.length} events</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-ink-800">
        {orderedAlerts.length ? (
          <Section title="NWS Alerts">
            {orderedAlerts.slice(0, 20).map((a) => (
              <Row
                key={a.id}
                selected={a.id === selectedId}
                color={alertColor(a.severity)}
                badge={a.severity ?? "—"}
                title={a.event}
                subtitle={a.areaDesc ?? a.headline ?? "—"}
                meta={relTime(a.effective ?? a.sent)}
                onClick={() => onSelect({ kind: "alert", id: a.id, data: a })}
              />
            ))}
          </Section>
        ) : null}

        {orderedQuakes.length ? (
          <Section title="Earthquakes">
            {orderedQuakes.slice(0, 20).map((q) => (
              <Row
                key={q.id}
                selected={q.id === selectedId}
                color={quakeColor(q.alert, q.magnitude)}
                badge={`M${q.magnitude.toFixed(1)}`}
                title={q.place ?? "—"}
                subtitle={
                  q.depth != null
                    ? `Depth ${q.depth.toFixed(1)} km${q.tsunami ? " · Tsunami flag" : ""}`
                    : q.tsunami
                      ? "Tsunami flag"
                      : ""
                }
                meta={relEpoch(q.time)}
                onClick={() => onSelect({ kind: "quake", id: q.id, data: q })}
              />
            ))}
          </Section>
        ) : null}

        {events.length ? (
          <Section title="Natural events">
            {events.slice(0, 20).map((e) => (
              <Row
                key={e.id}
                selected={e.id === selectedId}
                color={eventColor(e.category)}
                badge={e.category ?? "—"}
                title={e.title}
                subtitle={e.source ?? ""}
                meta={relTime(e.date)}
                onClick={() => onSelect({ kind: "event", id: e.id, data: e })}
              />
            ))}
          </Section>
        ) : null}

        {!orderedAlerts.length && !orderedQuakes.length && !events.length ? (
          <div className="px-4 py-8 text-center text-xs text-ink-400">
            No live signals right now.
          </div>
        ) : null}
      </div>
    </aside>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div>
    <div className="sticky top-0 z-10 border-b border-ink-800 bg-ink-900/95 px-4 py-1.5 text-[10px] uppercase tracking-[0.16em] text-ink-400 backdrop-blur">
      {title}
    </div>
    {children}
  </div>
);

interface RowProps {
  color: string;
  badge: string;
  title: string;
  subtitle?: string;
  meta: string;
  selected: boolean;
  onClick: () => void;
}

const Row = ({
  color,
  badge,
  title,
  subtitle,
  meta,
  selected,
  onClick,
}: RowProps) => (
  <button
    onClick={onClick}
    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-ink-800/60 ${
      selected ? "bg-ink-800/80" : ""
    }`}
  >
    <span
      className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden
    />
    <span className="min-w-0 flex-1">
      <span className="flex items-center gap-2">
        <span
          className="rounded-sm border border-ink-700 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em]"
          style={{ color }}
        >
          {badge}
        </span>
        <span className="truncate text-sm text-ink-100">{title}</span>
      </span>
      {subtitle ? (
        <span className="mt-0.5 block truncate text-xs text-ink-400">
          {subtitle}
        </span>
      ) : null}
    </span>
    <span className="shrink-0 font-mono text-[10px] text-ink-500">{meta}</span>
  </button>
);
