import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";
import type { DataCenter } from "@aliasist/api-client";
import { GRID_RISK_COLOR, markerRadius } from "../lib/format";

interface WorldMapProps {
  centers: DataCenter[];
  selectedSlug: string | null;
  onSelect: (dc: DataCenter) => void;
}

const DEFAULT_COLOR = "#0bcf72";
const SELECTED_COLOR = "#ffffff";

export const WorldMap = ({ centers, selectedSlug, onSelect }: WorldMapProps) => (
  <div className="relative h-[520px] w-full overflow-hidden rounded-xl border border-ink-700 bg-ink-900">
    <MapContainer
      center={[37.8, -96]}
      zoom={4}
      minZoom={2}
      worldCopyJump
      scrollWheelZoom
      className="h-full w-full [&_.leaflet-container]:!bg-ink-900"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {centers.map((dc) => {
        const isSelected = dc.slug === selectedSlug;
        const color = isSelected
          ? SELECTED_COLOR
          : dc.gridRisk
            ? GRID_RISK_COLOR[dc.gridRisk]
            : DEFAULT_COLOR;
        return (
          <CircleMarker
            key={dc.slug}
            center={[dc.lat, dc.lng]}
            radius={markerRadius(dc.capacityMW)}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: isSelected ? 0.85 : 0.55,
              weight: isSelected ? 3 : 1.5,
            }}
            eventHandlers={{ click: () => onSelect(dc) }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
              <div className="text-xs">
                <div className="font-semibold">{dc.name}</div>
                <div className="text-ink-400">
                  {dc.city}, {dc.state} · {dc.capacityMW ?? "—"} MW
                </div>
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
    <div className="pointer-events-none absolute left-3 bottom-3 rounded-md border border-ink-700 bg-ink-950/80 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-ink-300 backdrop-blur">
      <div className="flex items-center gap-3">
        <Legend color={GRID_RISK_COLOR.low} label="Low grid risk" />
        <Legend color={GRID_RISK_COLOR.medium} label="Medium" />
        <Legend color={GRID_RISK_COLOR.high} label="High" />
      </div>
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
