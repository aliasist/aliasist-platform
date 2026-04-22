import type { EcoSpaceWeather } from "@aliasist/api-client";
import { Panel } from "@aliasist/ui";
import { kpBand, nf, relTime } from "../lib/format";

interface SpaceWeatherPanelProps {
  data: EcoSpaceWeather | null;
  loading: boolean;
}

export const SpaceWeatherPanel = ({ data, loading }: SpaceWeatherPanelProps) => {
  const latest = data?.latest ?? null;
  const kp = latest?.kpIndex ?? null;
  const band = kpBand(kp);
  const history = data?.history ?? [];
  const max = history.reduce(
    (m, r) => Math.max(m, r.kpIndex ?? 0),
    0,
  );

  return (
    <Panel eyebrow="NOAA SWPC" title="Space weather">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <div className="font-mono text-3xl text-ink-50" style={{ color: band.color }}>
            Kp {loading ? "…" : nf(kp, 1)}
          </div>
          <div className="mt-0.5 text-[11px] uppercase tracking-[0.16em]" style={{ color: band.color }}>
            {band.label}
          </div>
        </div>
        <div className="text-right text-[11px] text-ink-400">
          <div>Updated {relTime(latest?.time)}</div>
          <div className="mt-0.5 font-mono">
            A-run {nf(latest?.aRunning, 0)} · {nf(latest?.stationCount, 0)} stations
          </div>
        </div>
      </div>

      {history.length ? (
        <div className="mt-4 flex h-16 items-end gap-0.5" role="img" aria-label="Kp history">
          {history.map((r, i) => {
            const v = r.kpIndex ?? 0;
            const h = max > 0 ? Math.max(4, Math.round((v / Math.max(max, 5)) * 100)) : 4;
            const { color } = kpBand(r.kpIndex);
            return (
              <span
                key={i}
                className="flex-1 rounded-sm"
                style={{ height: `${h}%`, backgroundColor: color, opacity: 0.7 }}
                title={`${r.time ?? ""} — Kp ${v}`}
              />
            );
          })}
        </div>
      ) : null}

      <p className="mt-3 text-[11px] text-ink-400">
        Planetary K-index: 0 quiet · 5+ geomagnetic storm · 7+ severe. Source:{" "}
        <a
          href="https://www.swpc.noaa.gov/products/planetary-k-index"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-ufo-300"
        >
          swpc.noaa.gov
        </a>
      </p>
    </Panel>
  );
};
