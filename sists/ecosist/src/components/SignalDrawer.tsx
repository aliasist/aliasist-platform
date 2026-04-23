import { useEffect, useState } from "react";
import { Pill } from "@aliasist/ui";
import { api } from "../lib/api";
import {
  alertColor,
  eventColor,
  quakeColor,
  relEpoch,
  relTime,
  type Signal,
} from "../lib/format";

interface SignalDrawerProps {
  signal: Signal | null;
  onClose: () => void;
}

export const SignalDrawer = ({ signal, onClose }: SignalDrawerProps) => {
  useEffect(() => {
    if (!signal) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [signal, onClose]);

  if (!signal) return null;

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
        aria-label="Signal detail"
      >
        <header className="border-b border-ink-700 p-5">
          <div className="flex items-start justify-between gap-3">
            {signal.kind === "alert" ? (
              <AlertHeader signal={signal} />
            ) : signal.kind === "quake" ? (
              <QuakeHeader signal={signal} />
            ) : (
              <EventHeader signal={signal} />
            )}
            <button
              onClick={onClose}
              className="rounded-md border border-ink-700 px-2 py-1 text-xs text-ink-300 transition hover:border-ink-500 hover:text-ink-100"
              aria-label="Close detail"
            >
              Close ✕
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {signal.kind === "alert" ? <AlertBody signal={signal} /> : null}
          {signal.kind === "quake" ? <QuakeBody signal={signal} /> : null}
          {signal.kind === "event" ? <EventBody signal={signal} /> : null}
          <AiExplainer key={signal.id} signal={signal} />
        </div>
      </aside>
    </>
  );
};

const AlertHeader = ({ signal }: { signal: Extract<Signal, { kind: "alert" }> }) => {
  const a = signal.data;
  const color = alertColor(a.severity);
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-[0.2em] text-ufo-400/80">
        NWS Alert · {a.senderName ?? "—"}
      </div>
      <h2 className="mt-1 font-display text-2xl font-semibold text-ink-50">
        {a.event}
      </h2>
      <div className="mt-1 truncate text-sm text-ink-300">{a.areaDesc ?? "—"}</div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className="rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em]"
          style={{ borderColor: color, color }}
        >
          {a.severity ?? "Unknown"}
        </span>
        {a.urgency ? <Pill tone="warn">{a.urgency}</Pill> : null}
        {a.certainty ? <Pill tone="default">{a.certainty}</Pill> : null}
      </div>
    </div>
  );
};

const AlertBody = ({ signal }: { signal: Extract<Signal, { kind: "alert" }> }) => {
  const a = signal.data;
  return (
    <>
      <Grid>
        <Stat label="Effective" value={relTime(a.effective)} />
        <Stat label="Expires" value={relTime(a.expires)} />
        <Stat label="Sent" value={relTime(a.sent)} />
      </Grid>
      {a.headline ? <Section title="Headline">{a.headline}</Section> : null}
      {a.description ? (
        <Section title="Description">{a.description}</Section>
      ) : null}
      {a.instruction ? (
        <Section title="Instruction">{a.instruction}</Section>
      ) : null}
    </>
  );
};

const QuakeHeader = ({ signal }: { signal: Extract<Signal, { kind: "quake" }> }) => {
  const q = signal.data;
  const color = quakeColor(q.alert, q.magnitude);
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-[0.2em] text-ufo-400/80">
        USGS Earthquake
      </div>
      <h2 className="mt-1 font-display text-2xl font-semibold text-ink-50">
        M{q.magnitude.toFixed(1)}
      </h2>
      <div className="mt-1 truncate text-sm text-ink-300">{q.place ?? "—"}</div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className="rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em]"
          style={{ borderColor: color, color }}
        >
          {q.alert ? `PAGER ${q.alert}` : `M${q.magnitude.toFixed(1)}`}
        </span>
        {q.tsunami ? <Pill tone="warn">Tsunami flag</Pill> : null}
        {q.status ? <Pill tone="default">{q.status}</Pill> : null}
      </div>
    </div>
  );
};

const QuakeBody = ({ signal }: { signal: Extract<Signal, { kind: "quake" }> }) => {
  const q = signal.data;
  return (
    <>
      <Grid>
        <Stat label="Magnitude" value={`M${q.magnitude.toFixed(1)}`} />
        <Stat label="Depth" value={q.depth != null ? `${q.depth.toFixed(1)} km` : "—"} />
        <Stat label="When" value={relEpoch(q.time)} />
        <Stat label="Lat / Lng" value={`${q.lat.toFixed(2)}, ${q.lng.toFixed(2)}`} />
      </Grid>
      {q.url ? (
        <a
          href={q.url}
          target="_blank"
          rel="noreferrer"
          className="inline-block text-xs text-ufo-300 underline hover:text-ufo-200"
        >
          USGS event page ↗
        </a>
      ) : null}
    </>
  );
};

const EventHeader = ({ signal }: { signal: Extract<Signal, { kind: "event" }> }) => {
  const e = signal.data;
  const color = eventColor(e.category);
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-[0.2em] text-ufo-400/80">
        NASA EONET · {e.source ?? "—"}
      </div>
      <h2 className="mt-1 font-display text-2xl font-semibold text-ink-50">
        {e.title}
      </h2>
      {e.category ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className="rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em]"
            style={{ borderColor: color, color }}
          >
            {e.category}
          </span>
        </div>
      ) : null}
    </div>
  );
};

const EventBody = ({ signal }: { signal: Extract<Signal, { kind: "event" }> }) => {
  const e = signal.data;
  return (
    <>
      <Grid>
        <Stat label="Updated" value={relTime(e.date)} />
        {e.lat != null && e.lng != null ? (
          <Stat label="Lat / Lng" value={`${e.lat.toFixed(2)}, ${e.lng.toFixed(2)}`} />
        ) : null}
      </Grid>
      {e.description ? (
        <Section title="Description">{e.description}</Section>
      ) : null}
      {e.link ? (
        <a
          href={e.link}
          target="_blank"
          rel="noreferrer"
          className="inline-block text-xs text-ufo-300 underline hover:text-ufo-200"
        >
          Event source ↗
        </a>
      ) : null}
    </>
  );
};

const Grid = ({ children }: { children: React.ReactNode }) => (
  <dl className="grid grid-cols-2 gap-3">{children}</dl>
);

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md border border-ink-700 bg-ink-950/40 p-3">
    <dt className="text-[10px] uppercase tracking-[0.16em] text-ink-400">{label}</dt>
    <dd className="mt-1 font-mono text-sm text-ink-100">{value}</dd>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section>
    <div className="text-[10px] uppercase tracking-[0.16em] text-ink-400">{title}</div>
    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink-200">
      {children}
    </p>
  </section>
);

interface ExplainState {
  status: "idle" | "loading" | "ok" | "error" | "unavailable";
  text?: string;
  source?: string;
  latencyMs?: number;
  message?: string;
}

const buildExplainRequest = (signal: Signal) => {
  if (signal.kind === "alert") {
    const a = signal.data;
    return {
      question:
        "In 3–4 sentences, explain what this NWS alert means for people in the affected area and what action they should consider. Ground your answer in the fields provided only.",
      context: {
        event: a.event,
        severity: a.severity,
        urgency: a.urgency,
        certainty: a.certainty,
        areaDesc: a.areaDesc,
        headline: a.headline,
        description: a.description?.slice(0, 1500),
        instruction: a.instruction?.slice(0, 800),
        effective: a.effective,
        expires: a.expires,
      },
    };
  }
  if (signal.kind === "quake") {
    const q = signal.data;
    return {
      question:
        "In 3–4 sentences, explain the likely felt impact and context of this earthquake. Mention magnitude, depth, location, and tsunami risk only if relevant. Ground your answer in the fields provided.",
      context: {
        magnitude: q.magnitude,
        place: q.place,
        depth: q.depth,
        tsunami: q.tsunami,
        alert: q.alert,
        time: q.time ? new Date(q.time).toISOString() : null,
        lat: q.lat,
        lng: q.lng,
      },
    };
  }
  const e = signal.data;
  return {
    question:
      "In 3–4 sentences, explain what this natural event is and why it matters. Ground your answer in the fields provided only.",
    context: {
      title: e.title,
      category: e.category,
      source: e.source,
      description: e.description?.slice(0, 1500),
      date: e.date,
      lat: e.lat,
      lng: e.lng,
    },
  };
};

const AiExplainer = ({ signal }: { signal: Signal }) => {
  const [state, setState] = useState<ExplainState>({ status: "idle" });

  const run = async () => {
    setState({ status: "loading" });
    try {
      const { question, context } = buildExplainRequest(signal);
      const res = await api().aiExplain({ sist: "eco", question, context });
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
