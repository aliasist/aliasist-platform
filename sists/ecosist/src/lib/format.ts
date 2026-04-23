import type { EcoAlert, EcoQuake } from "@aliasist/api-client";

export const ALERT_SEVERITY_COLOR: Record<string, string> = {
  Extreme: "#ef4444",
  Severe: "#f97316",
  Moderate: "#f59e0b",
  Minor: "#22c55e",
  Unknown: "#64748b",
};

const FALLBACK = "#64748b";

export const alertColor = (sev: string | null): string =>
  ALERT_SEVERITY_COLOR[sev ?? "Unknown"] ?? FALLBACK;

export const QUAKE_ALERT_COLOR: Record<string, string> = {
  red: "#ef4444",
  orange: "#f97316",
  yellow: "#eab308",
  green: "#22c55e",
};

export const quakeColor = (alert: string | null, mag: number): string => {
  if (alert && QUAKE_ALERT_COLOR[alert]) return QUAKE_ALERT_COLOR[alert];
  if (mag >= 6) return "#ef4444";
  if (mag >= 5) return "#f97316";
  if (mag >= 4) return "#eab308";
  return "#22c55e";
};

/** Circle radius scaled from magnitude (logarithmic). */
export const quakeRadius = (mag: number): number =>
  Math.max(4, Math.min(28, Math.round(Math.pow(Math.max(mag, 0.1), 1.6))));

export const EVENT_CATEGORY_COLOR: Record<string, string> = {
  Wildfires: "#f97316",
  Volcanoes: "#ef4444",
  "Severe Storms": "#8b5cf6",
  "Sea and Lake Ice": "#38bdf8",
  Earthquakes: "#eab308",
  Floods: "#3b82f6",
  Landslides: "#a3a3a3",
  Drought: "#f59e0b",
  Dust: "#d97706",
  "Manmade Events": "#d946ef",
  "Snow": "#e2e8f0",
  "Temperature Extremes": "#f43f5e",
  "Water Color": "#06b6d4",
};

export const eventColor = (category: string | null): string =>
  EVENT_CATEGORY_COLOR[category ?? ""] ?? "#14b8a6";

export const nf = (n: number | null | undefined, digits = 1) =>
  n == null ? "—" : n.toLocaleString(undefined, { maximumFractionDigits: digits });

/** Descriptive band for NOAA planetary K index (0–9). */
export const kpBand = (kp: number | null): { label: string; color: string } => {
  if (kp == null) return { label: "—", color: "#64748b" };
  if (kp >= 7) return { label: "Severe storm", color: "#ef4444" };
  if (kp >= 5) return { label: "Geomagnetic storm", color: "#f59e0b" };
  if (kp >= 4) return { label: "Unsettled", color: "#eab308" };
  return { label: "Quiet", color: "#22c55e" };
};

export const relTime = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  const diff = Date.now() - t;
  const abs = Math.abs(diff);
  const future = diff < 0;
  if (abs < 60_000) return "just now";
  const n =
    abs < 3_600_000
      ? `${Math.floor(abs / 60_000)}m`
      : abs < 86_400_000
        ? `${Math.floor(abs / 3_600_000)}h`
        : `${Math.floor(abs / 86_400_000)}d`;
  return future ? `in ${n}` : `${n} ago`;
};

export const relEpoch = (ms: number | null | undefined): string => {
  if (ms == null) return "—";
  return relTime(new Date(ms).toISOString());
};

export type Signal =
  | { kind: "alert"; id: string; data: EcoAlert }
  | { kind: "quake"; id: string; data: EcoQuake }
  | { kind: "event"; id: string; data: import("@aliasist/api-client").EcoEvent };

export const alertTimestamp = (a: EcoAlert): number => {
  const t = a.effective ?? a.sent;
  return t ? Date.parse(t) : 0;
};
