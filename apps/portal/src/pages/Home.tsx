import { AppSwitcher, Panel, Pill, cn, type SistManifest } from "@aliasist/ui";

interface HomeProps {
  sists: SistManifest[];
  onNavigate: (path: string) => void;
}

export const Home = ({ sists, onNavigate }: HomeProps) => (
  <div className="space-y-14 lg:space-y-20">
    <section className="grid gap-10 py-4 lg:grid-cols-[1.18fr_0.82fr] lg:items-center">
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-6 -top-10 h-40 w-40 rounded-full bg-ufo-500/12 blur-3xl motion-safe:animate-pulse-soft"
        />
        <Pill
          tone="live"
          className="mb-5 motion-safe:animate-fade-up motion-safe:opacity-0 motion-reduce:opacity-100 motion-reduce:animate-none"
          style={{ animationDelay: "40ms" }}
        >
          Aliasist Platform
        </Pill>
        <h1
          className="max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl motion-safe:animate-fade-up motion-safe:opacity-0 motion-reduce:opacity-100 motion-reduce:animate-none"
          style={{ animationDelay: "110ms" }}
        >
          <span
            className={cn(
              "block bg-gradient-to-br from-ink-50 via-ufo-200 to-ink-200/90 bg-clip-text text-transparent",
              "[background-size:180%_180%] motion-safe:animate-gradient-shift motion-reduce:animate-none",
            )}
          >
            A unified intelligence workspace for real-world systems.
          </span>
        </h1>
        <p
          className="mt-5 max-w-2xl text-base leading-8 text-ink-300 sm:text-lg motion-safe:animate-fade-up motion-safe:opacity-0 motion-reduce:opacity-100 motion-reduce:animate-none"
          style={{ animationDelay: "180ms" }}
        >
          Data centers, environmental signals, markets, space activity, and
          social intelligence in one coherent product surface. Built as a
          modular platform with a shared edge API and consistent design system.
        </p>
        <div
          className="mt-6 flex flex-wrap gap-3 motion-safe:animate-fade-up motion-safe:opacity-0 motion-reduce:opacity-100 motion-reduce:animate-none"
          style={{ animationDelay: "250ms" }}
        >
          <a
            href="#apps"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-md bg-ufo-500 px-4 py-2 text-sm font-medium text-white shadow-glow transition-all duration-350 ease-out hover:bg-ufo-400 hover:shadow-[0_0_0_1px_rgba(47,149,220,0.35),0_20px_50px_-24px_rgba(47,149,220,0.55)] active:scale-[0.98]"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)] transition-transform duration-700 ease-out group-hover:translate-x-full"
            />
            <span className="relative">Explore products</span>
          </a>
          <a
            href="https://github.com/aliasist"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-white/[0.12] bg-white/[0.03] px-4 py-2 text-sm text-ink-100 transition-all duration-250 hover:border-ufo-400/70 hover:bg-white/[0.06] hover:text-ufo-200 hover:shadow-[0_0_24px_-12px_rgba(47,149,220,0.35)] active:scale-[0.98]"
          >
            View source
          </a>
        </div>
      </div>
      <Panel
        lab
        eyebrow="System overview"
        title="api.aliasist.tech"
        className={cn(
          "self-start motion-safe:animate-fade-up motion-safe:opacity-0 motion-reduce:opacity-100 motion-reduce:animate-none",
        )}
        style={{ animationDelay: "200ms" }}
      >
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Stat label="Runtime" value="Cloudflare Workers" />
          <Stat label="Data layer" value="D1 + R2" />
          <Stat label="AI routing" value="Ollama + Groq" />
          <Stat label="Frontend" value="React + Vite" />
          <Stat label="Workspace" value="pnpm + Turbo" />
          <Stat label="Status" value="Integration build" />
        </dl>
      </Panel>
    </section>

    <section className="grid gap-4 lg:grid-cols-[1.06fr_0.94fr]">
      <Panel
        eyebrow="Platform cadence"
        title="One hub, four lenses."
        className="motion-safe:animate-fade-up motion-safe:opacity-0 motion-reduce:opacity-100 motion-reduce:animate-none"
        style={{ animationDelay: "280ms" }}
      >
        <div className="space-y-4">
          <p className="max-w-2xl text-sm leading-7 text-ink-300">
            Aliasist is tuned for live systems that move quickly. Each sist keeps
            its own domain focus, but the shell, interactions, and explanation
            patterns stay consistent so the product feels unified.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniStat
              label="Live now"
              value={sists.filter((s) => s.status === "live").length.toString()}
              caption="Operational surfaces"
            />
            <MiniStat
              label="In progress"
              value={sists.filter((s) => s.status === "beta" || s.status === "alpha").length.toString()}
              caption="Shipped in phases"
            />
            <MiniStat
              label="Planned"
              value={sists.filter((s) => s.status === "coming-soon").length.toString()}
              caption="Still staged"
            />
          </div>
        </div>
      </Panel>
      <Panel
        eyebrow="Current focus"
        title="Explore the flagship surfaces."
        className="motion-safe:animate-fade-up motion-safe:opacity-0 motion-reduce:opacity-100 motion-reduce:animate-none"
        style={{ animationDelay: "330ms" }}
      >
        <div className="space-y-3">
          {sists.map((sist) => (
            <div
              key={sist.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 transition-colors duration-250 hover:border-ufo-400/25 hover:bg-white/[0.05]"
            >
              <div>
                <div className="text-sm font-medium text-ink-50">{sist.name}</div>
                <div className="mt-0.5 text-xs text-ink-300">{sist.tagline}</div>
              </div>
              <Pill tone={sist.status === "live" ? "live" : sist.status === "beta" ? "beta" : sist.status === "alpha" ? "alpha" : "soon"}>
                {sist.status}
              </Pill>
            </div>
          ))}
        </div>
      </Panel>
    </section>

    <section
      id="apps"
      className="scroll-mt-24 space-y-5 motion-safe:animate-fade-up motion-safe:opacity-0 motion-reduce:opacity-100 motion-reduce:animate-none"
      style={{ animationDelay: "320ms" }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-xl font-medium text-ink-50">
          Products
        </h2>
        <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-xs uppercase tracking-[0.16em] text-ink-400">
          {sists.filter((s) => s.status !== "coming-soon").length} active /{" "}
          {sists.filter((s) => s.status === "coming-soon").length} planned
        </span>
      </div>
      <AppSwitcher sists={sists} onNavigate={onNavigate} />
    </section>
  </div>
);

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-3 transition-colors duration-250 hover:border-ufo-400/25 hover:bg-white/[0.05]">
    <dt className="text-xs font-medium text-ink-400">{label}</dt>
    <dd className="mt-1 text-sm font-medium text-ink-100">{value}</dd>
  </div>
);

const MiniStat = ({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption: string;
}) => (
  <div className="rounded-lg border border-white/[0.08] bg-ink-900/55 p-3">
    <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-400">
      {label}
    </div>
    <div className="mt-1 text-2xl font-display font-semibold text-ink-50">
      {value}
    </div>
    <div className="mt-1 text-xs leading-5 text-ink-300">{caption}</div>
  </div>
);
