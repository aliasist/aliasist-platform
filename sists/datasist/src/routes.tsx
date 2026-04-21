import { Panel, Pill } from "@aliasist/ui";

export const DataSistRoutes = () => (
  <div className="space-y-6">
    <header className="flex items-baseline justify-between">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-ufo-400/80">
          DataSist
        </div>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink-50">
          Data center intelligence
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-300">
          A living map of AI-relevant data centers: capacity, power mix,
          community signal, and what's being built where. Curated entries +
          syndicated sources, with every inferred field labeled.
        </p>
      </div>
      <Pill tone="alpha">Phase 3a — rebuild in progress</Pill>
    </header>

    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Panel eyebrow="Scaffold" title="Map + facility panel">
        <p className="text-sm text-ink-300">
          World map with pulse markers sized by announced MW. Click to open the
          facility panel with power source, grid risk, community signal, and
          AI-generated source-trail.
        </p>
      </Panel>
      <Panel eyebrow="Scaffold" title="Admin / curation">
        <p className="text-sm text-ink-300">
          Bearer-gated admin panel for curated entries and notes. Re-uses the
          token flow already shipped on the legacy DataSist deployment.
        </p>
      </Panel>
      <Panel eyebrow="Scaffold" title="Explain with AI">
        <p className="text-sm text-ink-300">
          Per-facility AI explainer. Answers are grounded in the current row's
          fields and cite every inferred column with a confidence note.
        </p>
      </Panel>
    </div>
  </div>
);
