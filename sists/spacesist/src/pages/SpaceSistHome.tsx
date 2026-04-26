import { useState, type ReactNode } from "react";
import {
  ApodSection,
  IssCrewColumn,
  IssIntelligenceColumn,
  SpaceApiStatusPanel,
  SpacexNextLaunchSection,
  useMockIssSync,
} from "../components/space/SpaceSistSpacePanels";
import { StatCard, SCard, SectionTitle } from "../components/space/SpaceSistChrome";
import {
  MOCK_APOD,
  MOCK_ISS,
  MOCK_PEOPLE_IN_SPACE,
  MOCK_SPACEX_NEXT,
} from "../data/spaceMock";

const telemetryStats = [
  { label: "ISS altitude (mock)", value: "421 km", tone: "green" as const },
  { label: "Crew in orbit", value: String(MOCK_PEOPLE_IN_SPACE.length), tone: "purple" as const },
  { label: "Next launch (mock)", value: "Go", tone: "orange" as const },
  { label: "Open feeds (future)", value: "7", tone: "green" as const },
];

const orbitNodes = [
  { label: "ISS", x: "68%", y: "28%", tone: "green" as const },
  { label: "KSC", x: "24%", y: "62%", tone: "orange" as const },
  { label: "JWST", x: "78%", y: "72%", tone: "purple" as const },
] as const;

const deepSpace = [
  { title: "Carina Nebula", catalog: "JWST NIRCam", placeholderClass: "from-violet-950/80 via-memory-purpledeep/40 to-memory-void" },
  { title: "Pillars of Creation", catalog: "Eagle Nebula", placeholderClass: "from-amber-950/50 via-memory-orange/25 to-memory-void" },
  { title: "Cartwheel Galaxy", catalog: "Webb + Chandra", placeholderClass: "from-cyan-950/40 via-memory-green/20 to-memory-void" },
  { title: "Orion Bar", catalog: "Hubble / Webb", placeholderClass: "from-fuchsia-950/50 via-memory-purple/30 to-memory-void" },
] as const;

const missionLogs = [
  {
    time: "14:32 UTC",
    type: "ISS",
    title: "Ground track crossing over South Pacific",
    detail: "Mock orbital pass; visible-window prediction is out of scope for this static MVP.",
  },
  {
    time: "13:10 UTC",
    type: "NASA",
    title: "Astronomy highlight staged",
    detail: "APOD surface ready for feed wiring via NASA `planetary/apod`.",
  },
  {
    time: "11:48 UTC",
    type: "Launch",
    title: "SpaceX weather constraint flagged",
    detail: "Orange status means activity watch, not live countdown data.",
  },
  {
    time: "09:05 UTC",
    type: "Deep space",
    title: "Galaxy grid cache refreshed",
    detail: "Static image set for MVP; no image API request is made.",
  },
] as const;

const sourceChunks = [
  {
    source: "nasa/apod-feed.json",
    score: "0.88",
    text: "Astronomy image metadata, explanation text, and attribution will be bundled for Ask SpaceSist.",
  },
  {
    source: "iss/orbit-state.tle",
    score: "0.82",
    text: "ISS latitude, longitude, altitude, velocity, and orbital phase can ground station-tracking answers.",
  },
  {
    source: "spacex/launch-manifest.json",
    score: "0.76",
    text: "Upcoming launch windows, vehicle names, pad assignments, and activity flags are staged as mock context.",
  },
] as const;

const visualLayers = [
  { label: "Orbital telemetry", value: "ISS ground track" },
  { label: "Mission activity", value: "SpaceX windows" },
  { label: "Astronomy context", value: "NASA image metadata" },
] as const;

export const SpaceSistHome = () => {
  const [question, setQuestion] = useState(
    "When is the next ISS pass and what space events should I watch?",
  );
  const { iss, lastUpdated, refresh, onRefresh } = useMockIssSync(MOCK_ISS);
  const spacexStatusUi =
    MOCK_SPACEX_NEXT.status === "go"
      ? "Go for launch (mock)"
      : MOCK_SPACEX_NEXT.status === "hold"
        ? "Hold (mock)"
        : MOCK_SPACEX_NEXT.status === "scrubbed"
          ? "Scrubbed (mock)"
          : "TBD (mock)";

  return (
    <div className="relative overflow-hidden rounded-lg border border-memory-purple/25 bg-memory-void shadow-[0_0_120px_-40px_rgba(109,40,217,0.55)] ring-1 ring-white/[0.04]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(167,139,250,0.18),transparent_34%),radial-gradient(circle_at_82%_10%,rgba(52,211,153,0.1),transparent_32%),linear-gradient(180deg,rgba(109,40,217,0.1),transparent_38%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-memory-grid bg-[length:30px_30px] opacity-[0.28]"
        aria-hidden
      />

      <div className="relative space-y-8 p-4 sm:p-6 lg:p-8">
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] xl:items-stretch">
          <Card className="relative min-h-[24rem] overflow-hidden p-6 sm:p-8">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(167,139,250,0.2),transparent_24%),radial-gradient(circle_at_75%_45%,rgba(52,211,153,0.12),transparent_32%),linear-gradient(135deg,rgba(5,5,6,0.1),rgba(5,5,6,0.92))]"
              aria-hidden
            />
            <div className="pointer-events-none absolute right-[-7rem] top-1/2 h-80 w-80 -translate-y-1/2 rounded-full border border-memory-purple/30 shadow-[0_0_90px_-24px_rgba(167,139,250,0.5)]" />
            <div className="pointer-events-none absolute right-[-4rem] top-1/2 h-52 w-52 -translate-y-1/2 rounded-full border border-memory-green/20" />
            <div className="pointer-events-none absolute bottom-9 right-20 h-px w-40 rotate-[-18deg] bg-gradient-to-r from-transparent via-memory-orange/70 to-transparent" />

            <div className="relative max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="green">Static telemetry mock</Badge>
                <Badge tone="orange">NASA / SpaceX / ISS</Badge>
              </div>
              <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl lg:text-6xl">
                Space intelligence lab
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
                SpaceSist is a mission-control surface for orbital tracking,
                NASA imagery, SpaceX launch intelligence, astronomy context,
                and future ask-the-mission answers grounded in those sources
                (static mock only).
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {telemetryStats.map((stat) => (
                  <StatCard key={stat.label} {...stat} />
                ))}
              </div>
            </div>
          </Card>

          <SCard className="p-5 sm:p-6">
            <IssIntelligenceColumn
              iss={iss}
              onRefresh={onRefresh}
              lastUpdated={lastUpdated}
              refresh={refresh}
            />
          </SCard>
        </section>

        <SCard className="p-5 sm:p-6">
          <IssCrewColumn
            people={MOCK_PEOPLE_IN_SPACE}
            countOrbiters={String(MOCK_PEOPLE_IN_SPACE.length)}
          />
        </SCard>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-stretch">
          <Card className="relative min-h-[22rem] overflow-hidden p-5 sm:p-6">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_35%_35%,rgba(52,211,153,0.12),transparent_24%),radial-gradient(circle_at_70%_60%,rgba(167,139,250,0.18),transparent_32%)]"
              aria-hidden
            />
            <div className="relative flex h-full min-h-[19rem] flex-col">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <SectionTitle eyebrow="Visual dashboard" title="SpaceSist concept preview" />
                <Badge tone="green">asset-ready slot</Badge>
              </div>
              <div className="relative mt-6 flex-1 overflow-hidden rounded-lg border border-white/[0.08] bg-memory-void/80">
                <div
                  className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[length:32px_32px] opacity-70"
                  aria-hidden
                />
                <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-memory-purple/25 shadow-[0_0_90px_-28px_rgba(167,139,250,0.7)]" />
                <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-memory-green/20" />
                <div className="absolute left-[18%] top-[68%] h-px w-[70%] -rotate-12 bg-gradient-to-r from-transparent via-memory-orange/80 to-transparent" />
                {/* Placeholder orbit trail between nodes (decorative) */}
                <svg
                  className="absolute inset-0 h-full w-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <path
                    d="M 24 62 Q 50 32 78 72"
                    fill="none"
                    stroke="rgba(52,211,153,0.35)"
                    strokeWidth="0.4"
                    strokeDasharray="2 2"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
                {orbitNodes.map((node) => (
                  <div
                    key={node.label}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: node.x, top: node.y }}
                  >
                    <span
                      className={
                        node.tone === "green"
                          ? "block size-2 rounded-full bg-memory-green shadow-[0_0_18px_rgba(52,211,153,0.9)]"
                          : node.tone === "orange"
                            ? "block size-2 rounded-full bg-memory-orange shadow-[0_0_18px_rgba(251,146,60,0.85)]"
                            : "block size-2 rounded-full bg-memory-purple shadow-[0_0_18px_rgba(167,139,250,0.85)]"
                      }
                    />
                    <span className="mt-1 block rounded border border-white/[0.08] bg-black/50 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300">
                      {node.label}
                    </span>
                  </div>
                ))}
                <div className="absolute bottom-3 left-3 right-3 grid gap-2 sm:grid-cols-3">
                  {visualLayers.map((layer) => (
                    <div
                      key={layer.label}
                      className="rounded-md border border-white/[0.08] bg-black/45 px-3 py-2 backdrop-blur"
                    >
                      <div className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                        {layer.label}
                      </div>
                      <div className="mt-1 truncate font-mono text-[11px] text-memory-green">
                        {layer.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionTitle eyebrow="Static MVP scope" title="What this lab will monitor" />
            <p className="mt-4 text-sm leading-relaxed text-zinc-400">
              This mock keeps SpaceSist focused on space operations: orbital
              telemetry, people in space, NASA imagery, SpaceX launch activity,
              astronomy catalogs, mission logs, and source-grounded context for
              future Ask SpaceSist answers.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Stat label="No real APIs" value="static fixtures only" />
              <Stat label="Answer status" value="future worker route" />
              <Stat label="Visual assets" value="portable via public/ when added" />
              <Stat label="Dashboard mode" value="space intelligence" />
            </div>
          </Card>
        </section>

        <div className="space-y-4">
          <div className="border-l-2 border-memory-purple/50 pl-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-memory-purple">
              NASA science
            </p>
            <h2 className="mt-1 font-display text-lg font-semibold text-zinc-50">
              Astronomy Picture of the Day
            </h2>
          </div>
          <ApodSection
            title={MOCK_APOD.title}
            date={MOCK_APOD.date}
            explanation={MOCK_APOD.explanation}
            imageUrl={MOCK_APOD.imageUrl}
            copyright={MOCK_APOD.copyright}
          />
        </div>

        <SpacexNextLaunchSection launch={MOCK_SPACEX_NEXT} />

        <Card className="p-5">
          <SectionTitle eyebrow="Deep-space catalog" title="Galaxy and nebula grid" />
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {deepSpace.map((item) => (
              <figure
                key={item.title}
                className="group overflow-hidden rounded-lg border border-white/[0.08] bg-memory-void"
              >
                <div
                  className={`h-36 bg-gradient-to-br sm:h-44 ${item.placeholderClass} transition duration-300 group-hover:opacity-95`}
                  role="presentation"
                />
                <figcaption className="border-t border-white/[0.07] px-3 py-2">
                  <div className="text-sm font-medium text-zinc-100">{item.title}</div>
                  <div className="mt-0.5 font-mono text-[10px] text-memory-purple">{item.catalog}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </Card>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <Card className="p-5">
            <SectionTitle eyebrow="Mission timeline" title="Mission logs and space events" />
            <ol className="mt-5 space-y-3">
              {missionLogs.map((log) => (
                <li key={`${log.time}-${log.title}`} className="flex gap-3">
                  <div className="pt-1">
                    <span className="block size-2 rounded-full bg-memory-orange shadow-[0_0_14px_rgba(251,146,60,0.7)]" />
                  </div>
                  <div className="flex-1 rounded-lg border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                      <span className="font-mono text-memory-orange">{log.time}</span>
                      <span>{log.type}</span>
                    </div>
                    <h3 className="mt-1.5 text-sm font-medium text-zinc-100">{log.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-500">{log.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <SpaceApiStatusPanel
            issLastUpdated={lastUpdated}
            issRefresh={refresh}
            issLat={iss.latitude}
            issLon={iss.longitude}
            peopleCount={MOCK_PEOPLE_IN_SPACE.length}
            apodDate={MOCK_APOD.date}
            spacexMission={MOCK_SPACEX_NEXT.mission}
            spacexStatusLabel={spacexStatusUi}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <Card className="p-5">
            <SectionTitle eyebrow="Future worker route" title="Ask SpaceSist" />
            <label className="mt-4 block">
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                Mission question
              </span>
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                rows={4}
                className="mt-2 w-full resize-y rounded-lg border border-white/[0.08] bg-memory-void/85 px-3.5 py-3 text-sm leading-relaxed text-zinc-200 placeholder:text-zinc-600 focus:border-memory-green/35 focus:outline-none focus:ring-1 focus:ring-memory-green/25"
              />
            </label>
            <div className="mt-4 rounded-lg border border-dashed border-memory-purple/25 bg-memory-purple/[0.06] p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-memory-purple">
                // static_answer
              </p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Ask SpaceSist will eventually combine ISS state, NASA imagery,
                launch manifests, and event logs through a SpaceSist API route.
                This MVP does not run retrieval or call APIs.
              </p>
            </div>
            <button
              type="button"
              disabled
              className="mt-4 rounded-md border border-memory-green/30 bg-memory-green/80 px-4 py-2 text-sm font-medium text-memory-void opacity-60"
            >
              Run space query
            </button>
          </Card>

          <Card className="p-5">
            <SectionTitle eyebrow="Static source preview" title="Space feed samples" />
            <div className="mt-4 space-y-3">
              {sourceChunks.map((chunk) => (
                <div
                  key={chunk.source}
                  className="rounded-lg border border-white/[0.07] bg-memory-void/75 p-3.5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <code className="text-xs text-memory-green">{chunk.source}</code>
                    <span className="font-mono text-[10px] text-memory-orange">
                      relevance {chunk.score}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-400">{chunk.text}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div
    className={`rounded-lg border border-white/[0.08] bg-memory-mist/80 shadow-memory-inset ring-1 ring-white/[0.04] backdrop-blur-xl ${className}`}
  >
    {children}
  </div>
);

const Badge = ({ children, tone }: { children: ReactNode; tone: "green" | "orange" }) => (
  <span
    className={
      tone === "green"
        ? "rounded-md border border-memory-green/25 bg-memory-green/[0.08] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-memory-green"
        : "rounded-md border border-memory-orange/25 bg-memory-orange/[0.06] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-memory-orange"
    }
  >
    {children}
  </span>
);

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-white/[0.07] bg-memory-void/60 p-3">
    <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-600">{label}</div>
    <div className="mt-1 break-words font-mono text-sm text-zinc-100">{value}</div>
  </div>
);
