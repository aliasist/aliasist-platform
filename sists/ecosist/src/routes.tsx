import { Panel, Pill } from "@aliasist/ui";

export const EcoSistRoutes = () => (
  <div className="space-y-6">
    <header className="flex items-baseline justify-between">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-signal-400">
          EcoSist
        </div>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink-50">
          Severe weather lab
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-300">
          Radar, alerts, and storm reports stitched into a single pane.
          Oklahoma Tornado Alley panel, aviation decoding, and safety-first
          tutorials — grounded in real NWS/SPC feeds.
        </p>
      </div>
      <Pill tone="alpha">Phase 3b — rebuild queued</Pill>
    </header>

    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Panel eyebrow="Scaffold" title="Radar + alerts overlay">
        <p className="text-sm text-ink-300">
          RainViewer tiles with NWS alert polygons and SPC outlook layers.
          Time slider + play/pause + lightning overlay.
        </p>
      </Panel>
      <Panel eyebrow="Scaffold" title="Tornado Alley panel">
        <p className="text-sm text-ink-300">
          Oklahoma-focused dashboard: METARs, storm reports, and chase-safe
          road overlays. Opens into tutorial mode for each ingredient.
        </p>
      </Panel>
      <Panel eyebrow="Scaffold" title="Storm tutor (AI)">
        <p className="text-sm text-ink-300">
          "Teach me what this pattern means" — the AI explainer walks through
          the current setup using only the data on screen, with a safety
          checklist at the end.
        </p>
      </Panel>
    </div>
  </div>
);
