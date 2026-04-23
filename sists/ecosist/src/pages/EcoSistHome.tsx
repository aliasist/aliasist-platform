import { useEffect, useMemo, useState } from "react";
import type {
  EcoAlert,
  EcoEvent,
  EcoQuake,
  EcoSignals,
  EcoSpaceWeather,
} from "@aliasist/api-client";
import { Panel, Pill } from "@aliasist/ui";
import { api } from "../lib/api";
import { EarthMap } from "../components/EarthMap";
import { SignalsRail } from "../components/SignalsRail";
import { SignalDrawer } from "../components/SignalDrawer";
import { SpaceWeatherPanel } from "../components/SpaceWeatherPanel";
import { StatStrip } from "../components/StatStrip";
import { LayerToggle, type Layers } from "../components/LayerToggle";
import type { Signal } from "../lib/format";

interface LoadState {
  loading: boolean;
  error: string | null;
}

const US_STATES = [
  "US",
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

export const EcoSistHome = () => {
  const [area, setArea] = useState("US");
  const [minMag, setMinMag] = useState(2.5);
  const [signals, setSignals] = useState<EcoSignals | null>(null);
  const [quakes, setQuakes] = useState<EcoQuake[]>([]);
  const [space, setSpace] = useState<EcoSpaceWeather | null>(null);
  const [layers, setLayers] = useState<Layers>({
    alerts: true,
    quakes: true,
    events: true,
  });
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Signal | null>(null);
  const [state, setState] = useState<LoadState>({ loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, error: null });
    (async () => {
      try {
        const [sig, eq, sw] = await Promise.all([
          api().ecoSignals(area),
          api().ecoEarthquakes({ minMag, days: 7 }),
          api().ecoSpaceWeather().catch(() => null),
        ]);
        if (cancelled) return;
        setSignals(sig);
        setQuakes(eq.items);
        setSpace(sw);
        setState({ loading: false, error: null });
      } catch (err) {
        if (cancelled) return;
        setState({
          loading: false,
          error: err instanceof Error ? err.message : "Failed to load signals",
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [area, minMag]);

  const alerts: EcoAlert[] = signals?.alerts ?? [];
  const events: EcoEvent[] = signals?.events ?? [];

  const filter = (s: string) => s.toLowerCase().includes(query.toLowerCase());
  const filteredAlerts = useMemo(
    () =>
      query.trim()
        ? alerts.filter((a) =>
            [a.event, a.areaDesc, a.headline]
              .filter((v): v is string => !!v)
              .some(filter),
          )
        : alerts,
    [alerts, query],
  );
  const filteredQuakes = useMemo(
    () =>
      query.trim()
        ? quakes.filter((q) => filter(`${q.place ?? ""} M${q.magnitude}`))
        : quakes,
    [quakes, query],
  );
  const filteredEvents = useMemo(
    () =>
      query.trim()
        ? events.filter((e) =>
            [e.title, e.category, e.source, e.description]
              .filter((v): v is string => !!v)
              .some(filter),
          )
        : events,
    [events, query],
  );

  const selectedId = selected?.id ?? null;

  return (
    <div className="space-y-6">
      <header className="flex items-baseline justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-ufo-400/80">
            EcoSist
          </div>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink-50">
            Earth signals, live
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-300">
            One map for the systems that shape weather, ground, and sky — NWS
            alerts, USGS quakes, NASA natural events, and NOAA space weather.
            All upstreams are public, edge-cached, and normalized at the worker.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone="live">Live · federated feeds</Pill>
        </div>
      </header>

      <StatStrip
        signals={signals}
        quakes={filteredQuakes}
        minMag={minMag}
        loading={state.loading}
      />

      {state.error ? (
        <Panel eyebrow="Error" title="Couldn't load signals">
          <p className="text-sm text-red-300">{state.error}</p>
          <p className="mt-2 text-xs text-ink-400">
            One or more upstream feeds may be down. Retrying in a moment usually
            helps; each upstream is cached independently.
          </p>
        </Panel>
      ) : null}

      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto] md:items-end">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.16em] text-ink-400">
            Search signals
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tornado, California, M5…"
            className="w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500 focus:border-ufo-500 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.16em] text-ink-400">
            Area
          </span>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100 focus:border-ufo-500 focus:outline-none"
          >
            {US_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.16em] text-ink-400">
            Min magnitude
          </span>
          <select
            value={minMag}
            onChange={(e) => setMinMag(Number(e.target.value))}
            className="rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100 focus:border-ufo-500 focus:outline-none"
          >
            {[1.0, 2.5, 4.5].map((m) => (
              <option key={m} value={m}>
                M {m.toFixed(1)}+
              </option>
            ))}
          </select>
        </label>
        <LayerToggle
          layers={layers}
          onChange={setLayers}
          counts={{
            alerts: filteredAlerts.length,
            quakes: filteredQuakes.length,
            events: filteredEvents.length,
          }}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <EarthMap
          alerts={filteredAlerts}
          quakes={filteredQuakes}
          events={filteredEvents}
          layers={layers}
          selectedId={selectedId}
          onSelect={setSelected}
        />
        <SignalsRail
          alerts={layers.alerts ? filteredAlerts : []}
          quakes={layers.quakes ? filteredQuakes : []}
          events={layers.events ? filteredEvents : []}
          selectedId={selectedId}
          onSelect={setSelected}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SpaceWeatherPanel data={space} loading={state.loading} />
        <Panel eyebrow="Sources" title="Where this data comes from">
          <ul className="space-y-1 text-xs text-ink-300">
            <li>
              <b className="text-ink-100">NWS</b> active alerts — api.weather.gov
            </li>
            <li>
              <b className="text-ink-100">USGS</b> 7-day earthquake summary —
              earthquake.usgs.gov
            </li>
            <li>
              <b className="text-ink-100">NASA EONET</b> open natural events —
              eonet.gsfc.nasa.gov
            </li>
            <li>
              <b className="text-ink-100">NOAA SWPC</b> planetary K-index —
              services.swpc.noaa.gov
            </li>
            <li>
              <b className="text-ink-100">Open-Meteo</b> 7-day forecast (point
              queries) — api.open-meteo.com
            </li>
          </ul>
          <p className="mt-3 text-[11px] text-ink-500">
            All feeds are public and free. Worker edge-caches each for 60–300s
            so bursts don't hammer upstream servers.
          </p>
        </Panel>
      </div>

      <SignalDrawer signal={selected} onClose={() => setSelected(null)} />
    </div>
  );
};
