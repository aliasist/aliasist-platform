import type { DataCenterStats } from "@aliasist/api-client";
import { nf } from "../lib/format";

interface StatsStripProps {
  stats: DataCenterStats | null;
  loading: boolean;
}

export const StatsStrip = ({ stats, loading }: StatsStripProps) => (
  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
    <Stat
      label="Tracked facilities"
      value={stats ? nf(stats.totalFacilities) : loading ? "…" : "—"}
      sub={
        stats
          ? `${stats.operational} operational · ${stats.underConstruction} building`
          : ""
      }
    />
    <Stat
      label="Total capacity"
      value={stats ? `${nf(stats.totalCapacityMW)} MW` : loading ? "…" : "—"}
      sub="announced + operational"
      accent
    />
    <Stat
      label="Annual electricity"
      value={
        stats ? `${nf(stats.totalEstimatedGWh)} GWh` : loading ? "…" : "—"
      }
      sub="estimated, grounded in company disclosures"
    />
    <Stat
      label="Water use"
      value={
        stats
          ? `${nf(stats.totalWaterMillionGallons)} M gal`
          : loading
            ? "…"
            : "—"
      }
      sub="annual, site-level disclosures"
    />
  </div>
);

interface StatProps {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}

const Stat = ({ label, value, sub, accent }: StatProps) => (
  <div className="relative overflow-hidden rounded-xl border border-ink-700 bg-ink-900/60 p-4">
    {accent ? (
      <div
        className="pointer-events-none absolute inset-x-0 -top-px h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, #0bcf72, transparent)",
        }}
        aria-hidden
      />
    ) : null}
    <div className="text-[10px] uppercase tracking-[0.14em] text-ink-400">
      {label}
    </div>
    <div
      className={`mt-1.5 font-display text-2xl font-semibold ${
        accent ? "text-ufo-400" : "text-ink-50"
      }`}
    >
      {value}
    </div>
    <div className="mt-1 text-[11px] text-ink-400">{sub}</div>
  </div>
);
