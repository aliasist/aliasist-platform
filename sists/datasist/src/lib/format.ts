import type { DataCenter } from "@aliasist/api-client";

export const nf = (n: number | null | undefined, digits = 0) =>
  n == null ? "—" : n.toLocaleString(undefined, { maximumFractionDigits: digits });

export const formatMW = (n: number | null | undefined) =>
  n == null ? "—" : `${nf(n)} MW`;

export const formatGWh = (n: number | null | undefined) =>
  n == null ? "—" : `${nf(n)} GWh/yr`;

export const formatWater = (n: number | null | undefined) =>
  n == null ? "—" : `${nf(n, 1)} M gal/yr`;

export const formatBillion = (n: number | null | undefined) =>
  n == null ? "—" : `$${nf(n, 1)}B`;

export const formatAcres = (n: number | null | undefined) =>
  n == null ? "—" : `${nf(n)} ac`;

export const STATUS_LABEL: Record<DataCenter["status"], string> = {
  operational: "Operational",
  under_construction: "Under construction",
  planned: "Planned",
  canceled: "Canceled",
};

export const STATUS_TONE: Record<
  DataCenter["status"],
  "live" | "beta" | "alpha" | "soon" | "warn" | "default"
> = {
  operational: "live",
  under_construction: "warn",
  planned: "soon",
  canceled: "default",
};

export const GRID_RISK_COLOR: Record<
  NonNullable<DataCenter["gridRisk"]>,
  string
> = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#ef4444",
};

/** Marker radius from MW capacity, clamped so tiny/missing values still show. */
export const markerRadius = (mw: number | null): number => {
  if (!mw || mw < 0) return 6;
  // Log-scaled so 50 MW ≈ 7, 500 MW ≈ 13, 5000 MW ≈ 19
  return Math.max(6, Math.min(22, Math.round(4 + Math.log10(mw + 1) * 4)));
};

export const companyTypeLabel: Record<DataCenter["companyType"], string> = {
  hyperscale: "Hyperscale",
  colocation: "Colocation",
  neocloud: "Neocloud",
};
