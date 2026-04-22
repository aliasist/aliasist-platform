import { AppSwitcher, Panel, Pill, type SistManifest } from "@aliasist/ui";

interface HomeProps {
  sists: SistManifest[];
  onNavigate: (path: string) => void;
}

export const Home = ({ sists, onNavigate }: HomeProps) => (
  <div className="space-y-10">
    <section className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
      <div>
        <Pill tone="live" className="mb-5">
          Aliasist Intelligence Suite
        </Pill>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink-50 sm:text-5xl lg:text-6xl">
          Intelligence labs for the systems that shape the world.
        </h1>
        <p className="mt-5 max-w-xl text-base text-ink-300 sm:text-lg">
          Data centers, storms, markets, space, social signal — five labs, one
          shared substrate. Open-source, education-first, built from a single
          Cloudflare-edge spine.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="#apps"
            className="inline-flex items-center gap-2 rounded-md bg-ufo-500 px-4 py-2 text-sm font-medium text-ink-950 shadow-glow transition hover:bg-ufo-400"
          >
            Explore the labs
          </a>
          <a
            href="https://github.com/aliasist"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-ink-600 px-4 py-2 text-sm text-ink-100 transition hover:border-ufo-500 hover:text-ufo-400"
          >
            Source on GitHub →
          </a>
        </div>
      </div>
      <Panel
        lab
        eyebrow="Platform status"
        title="api.aliasist.tech"
        className="self-start"
      >
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <Stat label="Edge runtime" value="Cloudflare Workers" />
          <Stat label="Data" value="D1 + R2" />
          <Stat label="AI primary" value="Ollama (Azure)" />
          <Stat label="AI fallback" value="Groq" />
          <Stat label="Frontend" value="React 18 + Vite" />
          <Stat label="Monorepo" value="pnpm + Turbo" />
        </dl>
      </Panel>
    </section>

    <section id="apps" className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-xl font-medium text-ink-50">
          The sists
        </h2>
        <span className="text-xs uppercase tracking-[0.16em] text-ink-400">
          {sists.filter((s) => s.status !== "coming-soon").length} active ·{" "}
          {sists.filter((s) => s.status === "coming-soon").length} migrating
        </span>
      </div>
      <AppSwitcher sists={sists} onNavigate={onNavigate} />
    </section>
  </div>
);

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-[10px] uppercase tracking-[0.16em] text-ink-400">
      {label}
    </dt>
    <dd className="mt-0.5 font-mono text-sm text-ink-100">{value}</dd>
  </div>
);
