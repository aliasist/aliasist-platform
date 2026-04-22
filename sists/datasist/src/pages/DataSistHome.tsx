import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type {
  DataCenter,
  DataCenterStats,
  ListDataCentersFilters,
} from "@aliasist/api-client";
import { Panel, Pill } from "@aliasist/ui";
import { api } from "../lib/api";
import { WorldMap } from "../components/WorldMap";
import { FilterRail } from "../components/FilterRail";
import { StatsStrip } from "../components/StatsStrip";
import { DetailDrawer } from "../components/DetailDrawer";
import { AdminTokenPill } from "../components/AdminTokenPill";
import {
  companyTypeLabel,
  formatMW,
  STATUS_LABEL,
  STATUS_TONE,
} from "../lib/format";

interface LoadState {
  loading: boolean;
  error: string | null;
  unbound: boolean;
}

export const DataSistHome = () => {
  const [filters, setFilters] = useState<ListDataCentersFilters>({});
  const [allCenters, setAllCenters] = useState<DataCenter[]>([]);
  const [filteredCenters, setFilteredCenters] = useState<DataCenter[]>([]);
  const [stats, setStats] = useState<DataCenterStats | null>(null);
  const [selected, setSelected] = useState<DataCenter | null>(null);
  const [state, setState] = useState<LoadState>({
    loading: true,
    error: null,
    unbound: false,
  });

  // Initial load: fetch all (we cap to 1000) + stats once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [listRes, statsRes] = await Promise.all([
          api().listDataCenters({ limit: 1000 }),
          api().getDataCenterStats().catch(() => null),
        ]);
        if (cancelled) return;
        setAllCenters(listRes.items);
        setFilteredCenters(listRes.items);
        setStats(statsRes);
        setState({
          loading: false,
          error: null,
          unbound: !!listRes.note && listRes.items.length === 0,
        });
      } catch (err) {
        if (cancelled) return;
        setState({
          loading: false,
          error: err instanceof Error ? err.message : "Failed to load",
          unbound: false,
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Client-side refilter on every filter change (data already loaded).
  useEffect(() => {
    if (!allCenters.length) return;
    const q = filters.q?.toLowerCase().trim();
    const next = allCenters.filter((dc) => {
      if (filters.country && dc.country !== filters.country) return false;
      if (filters.state && dc.state !== filters.state) return false;
      if (filters.status && dc.status !== filters.status) return false;
      if (filters.companyType && dc.companyType !== filters.companyType) return false;
      if (filters.gridRisk && dc.gridRisk !== filters.gridRisk) return false;
      if (q) {
        const hay = `${dc.name} ${dc.company} ${dc.city} ${dc.state}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    setFilteredCenters(next);
  }, [filters, allCenters]);

  const countries = useMemo(() => {
    const set = new Set(allCenters.map((dc) => dc.country));
    return [...set].sort();
  }, [allCenters]);

  return (
    <div className="space-y-6">
      <header className="flex items-baseline justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-ufo-400/80">
            DataSist
          </div>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink-50">
            Data center intelligence
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-300">
            A living map of AI-relevant data centers. Capacity, power mix,
            community signal, and grid exposure — curated from company
            disclosures and public filings, with every inferred field labeled.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone="live">Live · curated dataset</Pill>
          <AdminTokenPill />
          <Link
            to="/data/admin"
            className="rounded-md border border-ink-700 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-ink-300 transition hover:border-ufo-500 hover:text-ufo-300"
          >
            Admin →
          </Link>
        </div>
      </header>

      <StatsStrip stats={stats} loading={state.loading} />

      {state.error ? (
        <Panel eyebrow="Error" title="Couldn't load data centers">
          <p className="text-sm text-red-300">{state.error}</p>
          <p className="mt-2 text-xs text-ink-400">
            Check the worker at <code className="font-mono">/health</code>, or
            ensure the <code className="font-mono">DATA_DB</code> D1 binding is
            configured.
          </p>
        </Panel>
      ) : null}

      {state.unbound ? (
        <Panel eyebrow="Setup needed" title="D1 database not bound yet">
          <p className="text-sm text-ink-300">
            The worker reports <code className="font-mono">DATA_DB</code> is
            unbound. Run the D1 migrations from{" "}
            <code className="font-mono">services/workers-api</code> and redeploy
            the worker. Migrations live in{" "}
            <code className="font-mono">migrations/</code>.
          </p>
        </Panel>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <FilterRail
          filters={filters}
          onChange={setFilters}
          countries={countries}
          resultCount={filteredCenters.length}
          totalCount={allCenters.length}
        />
        <div className="space-y-5">
          <WorldMap
            centers={filteredCenters}
            selectedSlug={selected?.slug ?? null}
            onSelect={setSelected}
          />
          <EntryList
            centers={filteredCenters}
            onSelect={setSelected}
            selectedSlug={selected?.slug ?? null}
          />
        </div>
      </div>

      <DetailDrawer dc={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

interface EntryListProps {
  centers: DataCenter[];
  selectedSlug: string | null;
  onSelect: (dc: DataCenter) => void;
}

const EntryList = ({ centers, selectedSlug, onSelect }: EntryListProps) => {
  if (!centers.length) {
    return (
      <Panel eyebrow="No results" title="Clear filters to see more">
        <p className="text-sm text-ink-300">
          The current filter combination doesn't match any facilities.
        </p>
      </Panel>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-ink-700">
      <ul className="divide-y divide-ink-800">
        {centers.map((dc) => {
          const active = dc.slug === selectedSlug;
          return (
            <li key={dc.slug}>
              <button
                onClick={() => onSelect(dc)}
                className={`flex w-full items-center gap-4 px-4 py-3 text-left transition ${
                  active
                    ? "bg-ink-800"
                    : "hover:bg-ink-800/50"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-ink-50">
                      {dc.name}
                    </span>
                    <Pill tone={STATUS_TONE[dc.status]}>
                      {STATUS_LABEL[dc.status]}
                    </Pill>
                  </div>
                  <div className="mt-0.5 truncate text-xs text-ink-400">
                    {dc.company} · {companyTypeLabel[dc.companyType]} ·{" "}
                    {dc.city}, {dc.state}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-mono text-sm text-ink-100">
                    {formatMW(dc.capacityMW)}
                  </div>
                  {dc.gridRisk ? (
                    <div className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-ink-500">
                      {dc.gridRisk} grid risk
                    </div>
                  ) : null}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
