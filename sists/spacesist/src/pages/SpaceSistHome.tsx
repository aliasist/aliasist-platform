import { Panel, Pill } from "@aliasist/ui";

export const SpaceSistHome = () => (
  <div className="space-y-6">
    <header className="flex items-baseline justify-between">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-ink-400">
          SpaceSist
        </div>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink-50">
          Space intelligence lab
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-300">
          Missions, imagery, orbital signals, and space data will migrate here
          from the legacy SpaceSist app.
        </p>
      </div>
      <Pill tone="alpha">Migration scaffold</Pill>
    </header>

    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Panel eyebrow="Scaffold" title="NASA data">
        <p className="text-sm text-ink-300">
          APOD, image search, near-Earth objects, and public NASA feeds.
        </p>
      </Panel>
      <Panel eyebrow="Scaffold" title="Orbital tracking">
        <p className="text-sm text-ink-300">
          ISS position, mission timelines, and live status panels.
        </p>
      </Panel>
      <Panel eyebrow="Scaffold" title="Space tutor">
        <p className="text-sm text-ink-300">
          AI explanations grounded in the visible space data on screen.
        </p>
      </Panel>
    </div>
  </div>
);
