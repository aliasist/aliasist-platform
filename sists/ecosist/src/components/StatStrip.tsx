import type { EcoSignals } from "@aliasist/api-client";
import { kpBand, nf } from "../lib/format";

interface StatStripProps {
  signals: EcoSignals | null;
  loading: boolean;
}

export const StatStrip = ({ signals, loading }: StatStripProps) => {
  const alertCount = signals?.alerts.length ?? 0;
  const severe =
    signals?.alerts.filter(
      (a) => a.severity === "Extreme" || a.severity === "Severe",
    ).length ?? 0;
  const quakeCount = signals?.earthquakes.length ?? 0;
  const maxMag = signals?.earthquakes.reduce(
    (m, q) => Math.max(m, q.magnitude),
    0,
  );
  const eventCount = signals?.events.length ?? 0;
  const kp = signals?.spaceWeather?.kpIndex ?? null;
  const band = kpBand(kp);

  const stats = [
    {
      label: "Active alerts",
      value: loading ? "…" : String(alertCount),
      accent: severe > 0 ? "#f97316" : "#22c55e",
      sub: `${severe} severe+`,
    },
    {
      label: "Quakes (7d)",
      value: loading ? "…" : String(quakeCount),
      accent: (maxMag ?? 0) >= 5 ? "#f97316" : "#22c55e",
      sub: maxMag ? `max M${maxMag.toFixed(1)}` : "—",
    },
    {
      label: "Natural events",
      value: loading ? "…" : String(eventCount),
      accent: "#14b8a6",
      sub: "EONET open",
    },
    {
      label: "Kp index",
      value: loading ? "…" : nf(kp, 1),
      accent: band.color,
      sub: band.label,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-ink-700 bg-ink-900 p-4"
        >
          <div className="text-[10px] uppercase tracking-[0.16em] text-ink-400">
            {s.label}
          </div>
          <div
            className="mt-1 font-display text-2xl font-semibold"
            style={{ color: s.accent }}
          >
            {s.value}
          </div>
          <div className="mt-0.5 text-[11px] text-ink-400">{s.sub}</div>
        </div>
      ))}
    </div>
  );
};
