import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";
import type { EcoAlert, EcoEvent, EcoQuake } from "@aliasist/api-client";
import {
  alertColor,
  eventColor,
  quakeColor,
  quakeRadius,
  relEpoch,
} from "../lib/format";
import type { Signal } from "../lib/format";

interface EarthMapProps {
  alerts: EcoAlert[];
  quakes: EcoQuake[];
  events: EcoEvent[];
  layers: { alerts: boolean; quakes: boolean; events: boolean };
  selectedId: string | null;
  onSelect: (s: Signal) => void;
}

/** Centroid of a NWS alert polygon/multipolygon. Best-effort. */
const alertCentroid = (a: EcoAlert): [number, number] | null => {
  const g = a.geometry as {
    type?: string;
    coordinates?: unknown;
  } | null;
  if (!g?.coordinates) return null;
  const flat: number[][] = [];
  const walk = (v: unknown) => {
    if (Array.isArray(v)) {
      if (typeof v[0] === "number" && typeof v[1] === "number") {
        flat.push(v as number[]);
      } else {
        for (const item of v) walk(item);
      }
    }
  };
  walk(g.coordinates);
  if (!flat.length) return null;
  const lng = flat.reduce((s, c) => s + (c[0] ?? 0), 0) / flat.length;
  const lat = flat.reduce((s, c) => s + (c[1] ?? 0), 0) / flat.length;
  return [lat, lng];
};

export const EarthMap = ({
  alerts,
  quakes,
  events,
  layers,
  selectedId,
  onSelect,
}: EarthMapProps) => (
  <div className="relative h-[560px] w-full overflow-hidden rounded-xl border border-ink-700 bg-ink-900">
    <MapContainer
      center={[37.8, -96]}
      zoom={3}
      minZoom={2}
      worldCopyJump
      scrollWheelZoom
      className="h-full w-full [&_.leaflet-container]:!bg-ink-900"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {layers.alerts
        ? alerts.map((a) => {
            const centroid = alertCentroid(a);
            if (!centroid) return null;
            const color = alertColor(a.severity);
            const isSelected = a.id === selectedId;
            return (
              <CircleMarker
                key={a.id}
                center={centroid}
                radius={isSelected ? 11 : 8}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: isSelected ? 0.85 : 0.55,
                  weight: isSelected ? 3 : 1.5,
                }}
                eventHandlers={{
                  click: () => onSelect({ kind: "alert", id: a.id, data: a }),
                }}
              >
                <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
                  <div className="text-xs">
                    <div className="font-semibold">{a.event}</div>
                    <div className="text-ink-400">
                      {a.severity ?? "—"} · {a.areaDesc ?? "—"}
                    </div>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })
        : null}

      {layers.quakes
        ? quakes.map((q) => {
            const color = quakeColor(q.alert, q.magnitude);
            const isSelected = q.id === selectedId;
            return (
              <CircleMarker
                key={q.id}
                center={[q.lat, q.lng]}
                radius={quakeRadius(q.magnitude)}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: isSelected ? 0.85 : 0.5,
                  weight: isSelected ? 3 : 1.5,
                }}
                eventHandlers={{
                  click: () => onSelect({ kind: "quake", id: q.id, data: q }),
                }}
              >
                <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
                  <div className="text-xs">
                    <div className="font-semibold">M{q.magnitude.toFixed(1)}</div>
                    <div className="text-ink-400">
                      {q.place ?? "—"} · {relEpoch(q.time)}
                    </div>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })
        : null}

      {layers.events
        ? events.map((e) => {
            if (e.lat == null || e.lng == null) return null;
            const color = eventColor(e.category);
            const isSelected = e.id === selectedId;
            return (
              <CircleMarker
                key={e.id}
                center={[e.lat, e.lng]}
                radius={isSelected ? 10 : 7}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: isSelected ? 0.85 : 0.6,
                  weight: isSelected ? 3 : 1.5,
                }}
                eventHandlers={{
                  click: () => onSelect({ kind: "event", id: e.id, data: e }),
                }}
              >
                <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
                  <div className="text-xs">
                    <div className="font-semibold">{e.title}</div>
                    <div className="text-ink-400">{e.category ?? "—"}</div>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })
        : null}
    </MapContainer>

    <div className="pointer-events-none absolute left-3 bottom-3 flex flex-wrap gap-3 rounded-md border border-ink-700 bg-ink-950/80 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-ink-300 backdrop-blur">
      <Legend color="#ef4444" label="Severe / M6+" />
      <Legend color="#f97316" label="High" />
      <Legend color="#eab308" label="Moderate" />
      <Legend color="#22c55e" label="Minor" />
    </div>
  </div>
);

const Legend = ({ color, label }: { color: string; label: string }) => (
  <span className="flex items-center gap-1.5">
    <span
      className="h-2 w-2 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden
    />
    {label}
  </span>
);
