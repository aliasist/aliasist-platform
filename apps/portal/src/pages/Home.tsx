import { AppSwitcher, Panel, Pill, cn, type SistManifest, type ThemeId } from "@aliasist/ui";

interface HomeProps {
  sists: SistManifest[];
  onNavigate: (path: string) => void;
  theme: ThemeId;
}

export const Home = ({ sists, onNavigate, theme }: HomeProps) => (
  <div className="space-y-12 lg:space-y-18">
    {theme === "ember" ? (
      <EmberIntro />
    ) : (
      <LabIntro sists={sists} />
    )}

    <HubLaunch sists={sists} onNavigate={onNavigate} />

    <section
      id="apps"
      className="scroll-mt-24 space-y-5 motion-safe:animate-fade-up motion-safe:opacity-0 motion-reduce:opacity-100 motion-reduce:animate-none"
      style={{ animationDelay: "290ms" }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-xl font-medium text-ink-50">
          App deck
        </h2>
        <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-xs uppercase tracking-[0.16em] text-ink-400">
          {sists.filter((s) => s.status !== "coming-soon").length} active ·{" "}
          {sists.filter((s) => s.status === "coming-soon").length} planned
        </span>
      </div>
      <AppSwitcher sists={sists} onNavigate={onNavigate} />
    </section>
  </div>
);

const hubAccent = (accent: SistManifest["accent"]) => {
  if (accent === "signal") {
    return {
      line: "var(--aliasist-warning)",
      chip: "color-mix(in srgb, var(--aliasist-warning) 16%, transparent)",
    };
  }
  if (accent === "ink") {
    return {
      line: "var(--aliasist-text-muted)",
      chip: "color-mix(in srgb, var(--aliasist-text-muted) 10%, transparent)",
    };
  }
  return {
    line: "var(--aliasist-accent)",
    chip: "color-mix(in srgb, var(--aliasist-accent) 16%, transparent)",
  };
};

const HubLaunch = ({ sists, onNavigate }: { sists: SistManifest[]; onNavigate: (path: string) => void }) => (
  <section className="space-y-4 motion-safe:animate-fade-up motion-safe:opacity-0 motion-reduce:opacity-100 motion-reduce:animate-none">
    <div className="flex flex-wrap items-baseline justify-between gap-3">
      <div>
        <h2 className="font-display text-xl font-medium text-ink-50">
          Quick launch
        </h2>
        <p className="mt-1 text-sm text-ink-300">
          One click into each app. The hub stays clean; the apps keep their own character.
        </p>
      </div>
      <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-xs uppercase tracking-[0.16em] text-ink-400">
        Hub access
      </span>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {sists.map((sist, index) => {
        const accent = hubAccent(sist.accent);
        return (
          <button
            key={sist.id}
            type="button"
            onClick={() => onNavigate(sist.path)}
            style={{ animationDelay: `${index * 45}ms` }}
            className="group relative min-h-[136px] overflow-hidden rounded-panel aliasist-nav-card p-4 text-left transition-all duration-350 ease-out hover:-translate-y-1"
          >
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px"
              style={{
                background: `linear-gradient(90deg, transparent, ${accent.line}, transparent)`,
              }}
            />
            <div
              aria-hidden
              className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background: `radial-gradient(circle at 50% 0%, ${accent.chip}, transparent 60%)`,
              }}
            />
            <div className="relative flex h-full flex-col justify-between gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    aria-hidden
                    className="grid h-10 w-10 place-items-center rounded-lg border text-lg transition-transform duration-300 group-hover:scale-110"
                    style={{
                      borderColor: accent.line,
                      background: accent.chip,
                    }}
                  >
                    {sist.icon}
                  </div>
                  <div>
                    <div className="font-display text-base font-medium text-ink-50">
                      {sist.name}
                    </div>
                    <div className="mt-0.5 text-xs leading-relaxed text-ink-300 line-clamp-2">
                      {sist.tagline}
                    </div>
                  </div>
                </div>
                <Pill tone={sist.status === "live" ? "live" : sist.status === "beta" ? "beta" : sist.status === "alpha" ? "alpha" : "soon"}>
                  {sist.status}
                </Pill>
              </div>
              <div
                className="flex items-center justify-between gap-3 rounded-md border px-2.5 py-2 text-[11px] uppercase tracking-[0.16em]"
                style={{
                  borderColor: "var(--aliasist-border)",
                  background: "var(--aliasist-surface-soft)",
                  color: "var(--aliasist-text-muted)",
                }}
              >
                <span className="font-mono">{sist.path}</span>
                <span style={{ color: accent.line }}>Open ↗</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  </section>
);

const LabIntro = ({ sists }: { sists: SistManifest[] }) => (
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
);

const EmberIntro = () => {
  return (
    <section className="space-y-4 py-4">
      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <Panel
          lab
          className="relative min-h-[520px] overflow-hidden motion-safe:animate-fade-up motion-safe:opacity-0 motion-reduce:opacity-100 motion-reduce:animate-none"
          style={{ animationDelay: "20ms" }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 45% at 56% 18%, rgba(255, 122, 24, 0.28), transparent 48%), radial-gradient(ellipse 38% 34% at 78% 28%, rgba(255, 155, 51, 0.16), transparent 60%), radial-gradient(ellipse 30% 24% at 50% 62%, rgba(255, 122, 24, 0.14), transparent 68%)",
            }}
          />
          <div className="relative z-10 flex h-full flex-col justify-between gap-8 p-6 sm:p-8 lg:p-10">
            <div className="max-w-2xl space-y-5">
              <Pill tone="warn" className="w-fit">
                AI THAT REMEMBERS OUR WORK
              </Pill>
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-ink-400">
                  Aliasist
                </div>
                <h1 className="mt-2 max-w-xl font-display text-4xl font-semibold leading-tight text-ink-50 sm:text-5xl lg:text-6xl">
                  <span className="block">The command center for</span>
                  <span className="block bg-gradient-to-r from-[color:var(--aliasist-accent-strong)] via-white to-[color:var(--aliasist-text-soft)] bg-clip-text text-transparent">
                    AI-powered development.
                  </span>
                </h1>
                <p className="mt-4 max-w-lg text-sm leading-7 text-ink-300 sm:text-base">
                  Project memory, context, retrieval, and operator-grade systems
                  intelligence in one cinematic shell. Keep the current Lab
                  theme available, but make this a selectable alternate skin.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#apps"
                  className="group inline-flex items-center gap-2 rounded-md bg-[color:var(--aliasist-accent)] px-4 py-2 text-sm font-medium text-[color:var(--aliasist-accent-contrast)] shadow-[0_0_0_1px_rgba(255,122,24,0.16),0_20px_50px_-24px_rgba(255,122,24,0.5)] transition-transform duration-250 hover:translate-y-[-1px] active:scale-[0.98]"
                >
                  Open the Hub
                </a>
                <a
                  href="https://github.com/aliasist"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-[color:var(--aliasist-border-strong)] bg-white/[0.02] px-4 py-2 text-sm text-ink-100 transition hover:bg-white/[0.05] hover:text-white"
                >
                  View on GitHub
                </a>
              </div>
              <div className="grid gap-3 pt-2 sm:grid-cols-3">
                <EmberChip label="RAG powered" />
                <EmberChip label="Local or cloud" />
                <EmberChip label="Privacy first" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <EmberStat label="Active projects" value="24" />
              <EmberStat label="Indexed chunks" value="128.4K" />
              <EmberStat label="RAG queries" value="2,341" />
            </div>
          </div>
        </Panel>

        <div className="grid gap-4">
          <Panel
            lab
            eyebrow="aliasist.tech"
            title="Your command center"
            className="motion-safe:animate-fade-up motion-safe:opacity-0 motion-reduce:opacity-100 motion-reduce:animate-none"
            style={{ animationDelay: "80ms" }}
          >
            <p className="max-w-md text-sm leading-7 text-ink-300">
              One surface for the platform, projects, and retrieval systems.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] uppercase tracking-[0.16em] text-ink-400">
              <EmberMicro label="Project memory" />
              <EmberMicro label="RAG indexes" />
              <EmberMicro label="AI providers" />
            </div>
            <a
              href="#apps"
              className="mt-4 inline-flex items-center rounded-md bg-[color:var(--aliasist-accent)] px-4 py-2 text-sm font-medium text-[color:var(--aliasist-accent-contrast)]"
            >
              Open the Hub
            </a>
          </Panel>

          <Panel
            lab
            eyebrow="SpaceSist"
            title="Project memory layer"
            className="motion-safe:animate-fade-up motion-safe:opacity-0 motion-reduce:opacity-100 motion-reduce:animate-none"
            style={{ animationDelay: "130ms" }}
          >
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="text-sm leading-7 text-ink-300">
                  Spaces, notes, logs, context bundles, RAG indexes, and the
                  answers you need.
                </p>
                <a
                  href="/space"
                  className="mt-3 inline-flex items-center rounded-md border border-[color:var(--aliasist-border-strong)] bg-white/[0.02] px-3 py-1.5 text-sm text-ink-100"
                >
                  Open SpaceSist
                </a>
              </div>
              <div
                aria-hidden
                className="mx-auto hidden h-24 w-24 rounded-full border border-[color:var(--aliasist-border-strong)] bg-[radial-gradient(circle_at_50%_50%,rgba(255,122,24,0.28),rgba(255,122,24,0.04)_55%,transparent_70%)] sm:block"
              />
            </div>
          </Panel>

          <div className="grid gap-4 md:grid-cols-2">
            <Panel
              lab
              eyebrow="RAG / memory network"
              title="Connected retrieval"
              className="motion-safe:animate-fade-up motion-safe:opacity-0 motion-reduce:opacity-100 motion-reduce:animate-none"
              style={{ animationDelay: "180ms" }}
            >
              <div className="h-28 rounded-lg border border-[color:var(--aliasist-border)] bg-[radial-gradient(circle_at_50%_50%,rgba(255,122,24,0.12),transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]" />
            </Panel>
            <Panel
              lab
              eyebrow="Color palette"
              title="Warm sci-fi"
              className="motion-safe:animate-fade-up motion-safe:opacity-0 motion-reduce:opacity-100 motion-reduce:animate-none"
              style={{ animationDelay: "220ms" }}
            >
              <div className="grid grid-cols-6 gap-2">
                {["#080808", "#1a1a1f", "#ff7a18", "#ffb347", "#0bcf72", "#f5f5f5"].map((color) => (
                  <div key={color} className="space-y-1">
                    <div className="h-8 rounded-md border border-white/10" style={{ background: color }} />
                    <div className="text-[10px] uppercase tracking-[0.12em] text-ink-500">{color}</div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel
          lab
          eyebrow="Visual language"
          title="Cinematic, dark, warm-accented"
          className="motion-safe:animate-fade-up motion-safe:opacity-0 motion-reduce:opacity-100 motion-reduce:animate-none"
          style={{ animationDelay: "260ms" }}
        >
          <p className="text-sm leading-7 text-ink-300">
            This concept leans into the orange-black sci-fi treatment from your
            board: deeper blacks, orange energy, glowing cards, and stronger
            visual hierarchy.
          </p>
        </Panel>
        <Panel
          lab
          eyebrow="Mapping"
          title="Keep the Lab theme intact"
          className="motion-safe:animate-fade-up motion-safe:opacity-0 motion-reduce:opacity-100 motion-reduce:animate-none"
          style={{ animationDelay: "300ms" }}
        >
          <p className="text-sm leading-7 text-ink-300">
            `lab` remains the default, preserved baseline. This theme is an
            opt-in preset you can switch away from at any time.
          </p>
        </Panel>
      </section>
    </section>
  );
};

const EmberChip = ({ label }: { label: string }) => (
  <div className="rounded-full border border-[color:var(--aliasist-border)] bg-[color:var(--aliasist-surface-soft)] px-3 py-2 text-center text-xs tracking-[0.14em] text-ink-200">
    {label}
  </div>
);

const EmberStat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-[color:var(--aliasist-border)] bg-[color:var(--aliasist-surface-soft)] p-3">
    <div className="text-[10px] uppercase tracking-[0.16em] text-ink-400">{label}</div>
    <div className="mt-1 font-display text-2xl text-white">{value}</div>
  </div>
);

const EmberMicro = ({ label }: { label: string }) => (
  <div className="rounded-md border border-[color:var(--aliasist-border)] bg-[color:var(--aliasist-surface-soft)] px-2 py-2 text-center">
    {label}
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
