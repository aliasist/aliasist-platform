import { useId } from "react";
import type {
  DC_COMPANY_TYPES,
  DC_GRID_RISKS,
  DC_STATUSES,
  ListDataCentersFilters,
} from "@aliasist/api-client";

type FilterValue<K extends keyof ListDataCentersFilters> =
  ListDataCentersFilters[K];

interface FilterRailProps {
  filters: ListDataCentersFilters;
  onChange: (next: ListDataCentersFilters) => void;
  countries: string[];
  resultCount: number;
  totalCount: number;
}

const statusOptions: { value: (typeof DC_STATUSES)[number]; label: string }[] = [
  { value: "operational", label: "Operational" },
  { value: "under_construction", label: "Under construction" },
  { value: "planned", label: "Planned" },
  { value: "canceled", label: "Canceled" },
];

const companyTypeOptions: {
  value: (typeof DC_COMPANY_TYPES)[number];
  label: string;
}[] = [
  { value: "hyperscale", label: "Hyperscale" },
  { value: "colocation", label: "Colocation" },
  { value: "neocloud", label: "Neocloud" },
];

const gridRiskOptions: {
  value: (typeof DC_GRID_RISKS)[number];
  label: string;
}[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const FilterRail = ({
  filters,
  onChange,
  countries,
  resultCount,
  totalCount,
}: FilterRailProps) => {
  const searchId = useId();
  const countryId = useId();
  const update = <K extends keyof ListDataCentersFilters>(
    key: K,
    value: FilterValue<K>,
  ) => onChange({ ...filters, [key]: value || undefined });

  const hasFilters = Object.entries(filters).some(
    ([k, v]) => k !== "limit" && k !== "offset" && v,
  );

  return (
    <div className="space-y-5 rounded-xl border border-ink-700 bg-ink-900/60 p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-sm uppercase tracking-[0.2em] text-ink-300">
          Filter
        </h3>
        <span className="text-[10px] uppercase tracking-[0.14em] text-ink-400">
          {resultCount} / {totalCount}
        </span>
      </div>

      <label htmlFor={searchId} className="block">
        <span className="text-[10px] uppercase tracking-[0.14em] text-ink-400">
          Search
        </span>
        <input
          id={searchId}
          type="search"
          placeholder="AWS, Columbus, Virginia…"
          value={filters.q ?? ""}
          onChange={(e) => update("q", e.target.value)}
          className="mt-1 w-full rounded-md border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500 focus:border-ufo-500 focus:outline-none focus:ring-1 focus:ring-ufo-500/40"
        />
      </label>

      <label htmlFor={countryId} className="block">
        <span className="text-[10px] uppercase tracking-[0.14em] text-ink-400">
          Country
        </span>
        <select
          id={countryId}
          value={filters.country ?? ""}
          onChange={(e) => update("country", e.target.value || undefined)}
          className="mt-1 w-full rounded-md border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-ink-100 focus:border-ufo-500 focus:outline-none focus:ring-1 focus:ring-ufo-500/40"
        >
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <Group
        label="Status"
        value={filters.status}
        options={statusOptions}
        onChange={(v) => update("status", v ?? undefined)}
      />
      <Group
        label="Company type"
        value={filters.companyType}
        options={companyTypeOptions}
        onChange={(v) => update("companyType", v ?? undefined)}
      />
      <Group
        label="Grid risk"
        value={filters.gridRisk}
        options={gridRiskOptions}
        onChange={(v) => update("gridRisk", v ?? undefined)}
      />

      {hasFilters ? (
        <button
          onClick={() => onChange({})}
          className="text-xs uppercase tracking-[0.14em] text-ufo-400 transition hover:text-ufo-300"
        >
          ← Clear all filters
        </button>
      ) : null}
    </div>
  );
};

interface GroupProps<V extends string> {
  label: string;
  value: V | undefined;
  options: { value: V; label: string }[];
  onChange: (v: V | null) => void;
}

function Group<V extends string>({ label, value, options, onChange }: GroupProps<V>) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.14em] text-ink-400">
        {label}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              onClick={() => onChange(active ? null : o.value)}
              className={`rounded-full border px-2.5 py-1 text-xs transition ${
                active
                  ? "border-ufo-500 bg-ufo-500/10 text-ufo-300"
                  : "border-ink-700 text-ink-300 hover:border-ink-500 hover:text-ink-100"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
