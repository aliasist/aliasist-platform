import { useEffect, useState } from "react";
import type { DataCenter } from "@aliasist/api-client";
import { Pill } from "@aliasist/ui";
import { api } from "../lib/api";
import {
  companyTypeLabel,
  formatAcres,
  formatBillion,
  formatGWh,
  formatMW,
  formatWater,
  STATUS_LABEL,
  STATUS_TONE,
} from "../lib/format";

interface DetailDrawerProps {
  dc: DataCenter | null;
  onClose: () => void;
}

export const DetailDrawer = ({ dc, onClose }: DetailDrawerProps) => {
  useEffect(() => {
    if (!dc) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dc, onClose]);

  if (!dc) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-ink-950/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col overflow-hidden border-l border-ink-700 bg-ink-900 shadow-2xl"
        role="dialog"
        aria-label={dc.name}
      >
        <header className="border-b border-ink-700 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-ufo-400/80">
                {dc.company} · {companyTypeLabel[dc.companyType]}
              </div>
              <h2 className="mt-1 font-display text-2xl font-semibold text-ink-50">
                {dc.name}
              </h2>
              <div className="mt-1 text-sm text-ink-300">
                {dc.city}, {dc.state}
                {dc.country !== "USA" ? `, ${dc.country}` : ""}
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-md border border-ink-700 px-2 py-1 text-xs text-ink-300 transition hover:border-ink-500 hover:text-ink-100"
              aria-label="Close detail"
            >
              Close ✕
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Pill tone={STATUS_TONE[dc.status]}>{STATUS_LABEL[dc.status]}</Pill>
            {dc.gridRisk ? (
              <span className="rounded-full border border-ink-700 bg-ink-950/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-ink-300">
                Grid risk: {dc.gridRisk}
              </span>
            ) : null}
            {dc.renewablePercent != null ? (
              <span className="rounded-full border border-ufo-700/50 bg-ufo-900/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-ufo-300">
                {dc.renewablePercent}% renewable
              </span>
            ) : null}
            {dc.communityResistance ? (
              <span className="rounded-full border border-amber-700/60 bg-amber-900/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-amber-300">
                Community resistance reported
              </span>
            ) : null}
          </div>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Field label="Capacity" value={formatMW(dc.capacityMW)} />
            <Field label="Annual electricity" value={formatGWh(dc.estimatedAnnualGWh)} />
            <Field label="Water use" value={formatWater(dc.waterUsageMillionGallons)} />
            <Field label="Investment" value={formatBillion(dc.investmentBillions)} />
            <Field label="Acreage" value={formatAcres(dc.acreage)} />
            <Field
              label={dc.yearOpened ? "Opened" : "Planned"}
              value={String(dc.yearOpened ?? dc.yearPlanned ?? "—")}
            />
          </dl>

          {dc.primaryModels.length ? (
            <section>
              <SectionTitle>Primary AI workloads</SectionTitle>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {dc.primaryModels.map((m) => (
                  <span
                    key={m}
                    className="rounded-md border border-ink-700 bg-ink-950/60 px-2 py-1 font-mono text-xs text-ink-200"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {dc.communityImpact ? (
            <section>
              <SectionTitle>Community impact</SectionTitle>
              <p className="mt-2 text-sm leading-relaxed text-ink-300">
                {dc.communityImpact}
              </p>
            </section>
          ) : null}

          {dc.notes ? (
            <section>
              <SectionTitle>Curator notes</SectionTitle>
              <p className="mt-2 text-sm leading-relaxed text-ink-300">
                {dc.notes}
              </p>
            </section>
          ) : null}

          <AiExplainer dc={dc} />
        </div>
      </aside>
    </>
  );
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-[10px] uppercase tracking-[0.2em] text-ink-400">
    {children}
  </h3>
);

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md border border-ink-800 bg-ink-950/40 px-3 py-2">
    <dt className="text-[10px] uppercase tracking-[0.14em] text-ink-400">
      {label}
    </dt>
    <dd className="mt-1 font-mono text-sm text-ink-100">{value}</dd>
  </div>
);

interface ExplainState {
  status: "idle" | "loading" | "ok" | "error" | "unavailable";
  text?: string;
  source?: string;
  latencyMs?: number;
  message?: string;
}

const AiExplainer = ({ dc }: { dc: DataCenter }) => {
  const [state, setState] = useState<ExplainState>({ status: "idle" });

  const run = async () => {
    setState({ status: "loading" });
    try {
      const res = await api().aiExplain({
        sist: "data",
        question: `In 3-4 sentences, explain why this AI data center matters — reference its capacity, community impact, and grid exposure. Keep it grounded in the provided context only.`,
        context: {
          name: dc.name,
          company: dc.company,
          location: `${dc.city}, ${dc.state}, ${dc.country}`,
          capacityMW: dc.capacityMW,
          estimatedAnnualGWh: dc.estimatedAnnualGWh,
          status: dc.status,
          gridRisk: dc.gridRisk,
          renewablePercent: dc.renewablePercent,
          communityImpact: dc.communityImpact,
          primaryModels: dc.primaryModels,
        },
      });
      if (res.source === "fallback") {
        setState({ status: "unavailable", text: res.answer });
      } else {
        setState({
          status: "ok",
          text: res.answer,
          source: res.source,
          latencyMs: res.latencyMs,
        });
      }
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "AI request failed",
      });
    }
  };

  return (
    <section className="rounded-lg border border-ufo-700/40 bg-ufo-900/10 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-ufo-400">
            Explain with AI
          </div>
          <p className="mt-1 text-xs text-ink-300">
            Grounded in the fields above only. Uses Ollama when available,
            Groq as fallback.
          </p>
        </div>
        <button
          onClick={run}
          disabled={state.status === "loading"}
          className="rounded-md bg-ufo-500 px-3 py-1.5 text-xs font-medium text-ink-950 transition hover:bg-ufo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.status === "loading" ? "Explaining…" : "Explain"}
        </button>
      </div>
      {state.status === "ok" && state.text ? (
        <div className="mt-3">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-100">
            {state.text}
          </p>
          <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500">
            {state.source} · {state.latencyMs}ms
          </div>
        </div>
      ) : null}
      {state.status === "unavailable" ? (
        <p className="mt-3 text-xs text-ink-400">
          AI is offline right now. {state.text ? `(“${state.text}”)` : ""}
        </p>
      ) : null}
      {state.status === "error" ? (
        <p className="mt-3 text-xs text-red-300">Error: {state.message}</p>
      ) : null}
    </section>
  );
};
