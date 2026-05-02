import { useEffect, useState, type ReactNode } from "react";
import {
  AliasistApiError,
  type SpaceTargetEphemeris,
  type SpaceAskResponse,
  type SpaceObservationItem,
  type SpaceTargetLookupItem,
} from "@aliasist/api-client";
import {
  ApodSection,
  IssCrewColumn,
  IssIntelligenceColumn,
  SpaceWeatherSection,
  SpaceApiStatusPanel,
  SpacexNextLaunchSection,
} from "../components/space/SpaceSistSpacePanels";
import { TargetDetailDrawer } from "../components/space/TargetDetailDrawer";
import { ObservationDetailDrawer } from "../components/space/ObservationDetailDrawer";
import { ObservationVisualDrawer } from "../components/space/ObservationVisualDrawer";
import { StatCard, SCard, SectionTitle } from "../components/space/SpaceSistChrome";
import {
  MOCK_APOD,
  MOCK_ISS,
  MOCK_PEOPLE_IN_SPACE,
  MOCK_SPACE_WEATHER_EVENTS,
  MOCK_SPACE_WEATHER_SUMMARY,
  MOCK_SPACEX_NEXT,
  type IssSnapshot,
  type SpacePerson,
  type SpaceWeatherEventView,
  type SpaceWeatherSummaryView,
  type SpacexLaunchPreview,
} from "../data/spaceMock";
import { api } from "../lib/api";

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

const visualLayers = [
  { label: "Orbital telemetry", value: "ISS ground track" },
  { label: "Mission activity", value: "SpaceX windows" },
  { label: "Astronomy context", value: "NASA image metadata" },
] as const;

type ApodView = {
  title: string;
  date: string;
  explanation: string;
  imageUrl: string;
  copyright?: string;
};
type RefreshState = "idle" | "loading" | "error";
type FeedMode = "live" | "fallback";

const providerLabel = (source: SpaceAskResponse["source"]) => {
  switch (source) {
    case "ollama":
      return "Ollama";
    case "workers-ai":
      return "Workers AI";
    case "gemini":
      return "Gemini";
    case "local-rag":
      return "Local retrieval";
    default:
      return source;
  }
};

const providerSummary = (answer: SpaceAskResponse) => {
  if (answer.source === "local-rag") {
    return "No model provider was available, so SpaceSist returned a retrieval-only answer from the local corpus.";
  }
  return `Answer generated via ${providerLabel(answer.source)} after retrieving local SpaceSist context.`;
};

const formatAskError = (error: unknown): string => {
  if (error instanceof AliasistApiError) {
    const body = error.body as
      | { error?: string; retryAfterSec?: number; maxBytes?: number }
      | undefined;

    if (body?.error === "rate_limited") {
      return body.retryAfterSec
        ? `Query rate limit reached. Retry in about ${body.retryAfterSec} seconds.`
        : "Query rate limit reached. Retry shortly.";
    }
    if (body?.error === "payload_too_large") {
      return body.maxBytes
        ? `Question payload exceeded the ${body.maxBytes}-byte request limit.`
        : "Question payload exceeded the request limit.";
    }
    if (body?.error === "invalid_body" || body?.error === "invalid_json") {
      return "SpaceSist could not parse that request. Shorten or simplify the question and try again.";
    }
    if (body?.error === "not_found") {
      return "No ephemeris data was returned for that target window.";
    }
    if (error.status >= 500) {
      return "SpaceSist could not complete the query because the backend failed upstream. Try again in a moment.";
    }
    return `SpaceSist query failed with API ${error.status}.`;
  }

  if (error instanceof Error) return error.message;
  return "SpaceSist query failed.";
};

const formatTopic = (value: unknown) => {
  if (typeof value !== "string" || !value) return null;
  return value
    .split(/[-_]/g)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
};

const toIssSnapshot = (live: Awaited<ReturnType<ReturnType<typeof api>["spaceIss"]>>): IssSnapshot => ({
  latitude: live.latitude,
  longitude: live.longitude,
  altitudeKm: live.altitudeKm ?? MOCK_ISS.altitudeKm,
  velocityKmh: live.velocityKmh ?? MOCK_ISS.velocityKmh,
  dayNight: live.dayNight,
});

export const SpaceSistHome = () => {
  const [question, setQuestion] = useState(
    "How did Gemini help Apollo reach the Moon?",
  );
  const [answer, setAnswer] = useState<SpaceAskResponse | null>(null);
  const [askError, setAskError] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const [apod, setApod] = useState<ApodView>(MOCK_APOD);
  const [people, setPeople] = useState<SpacePerson[]>(MOCK_PEOPLE_IN_SPACE);
  const [launch, setLaunch] = useState<SpacexLaunchPreview>(MOCK_SPACEX_NEXT);
  const [weatherSummary, setWeatherSummary] = useState<SpaceWeatherSummaryView>(MOCK_SPACE_WEATHER_SUMMARY);
  const [weatherEvents, setWeatherEvents] = useState<SpaceWeatherEventView[]>(MOCK_SPACE_WEATHER_EVENTS);
  const [selectedWeatherEvent, setSelectedWeatherEvent] = useState<SpaceWeatherEventView | null>(MOCK_SPACE_WEATHER_EVENTS[0] ?? null);
  const [weatherEventLoadingId, setWeatherEventLoadingId] = useState<string | null>(null);
  const [targetQuery, setTargetQuery] = useState("Apophis");
  const [targetGroup, setTargetGroup] = useState<"" | "ast" | "com" | "pln" | "sat" | "sct">("ast");
  const [targetResults, setTargetResults] = useState<SpaceTargetLookupItem[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<SpaceTargetLookupItem | null>(null);
  const [targetDrawerTarget, setTargetDrawerTarget] = useState<SpaceTargetLookupItem | null>(null);
  const [targetEphemeris, setTargetEphemeris] = useState<SpaceTargetEphemeris | null>(null);
  const [targetEphemerisLoading, setTargetEphemerisLoading] = useState(false);
  const [targetEphemerisError, setTargetEphemerisError] = useState<string | null>(null);
  const [targetSearchError, setTargetSearchError] = useState<string | null>(null);
  const [isSearchingTargets, setIsSearchingTargets] = useState(false);
  const [observationQuery, setObservationQuery] = useState("M101");
  const [observationResults, setObservationResults] = useState<SpaceObservationItem[]>([]);
  const [selectedObservation, setSelectedObservation] = useState<SpaceObservationItem | null>(null);
  const [selectedObservationVisual, setSelectedObservationVisual] = useState<SpaceObservationItem | null>(null);
  const [observationSearchError, setObservationSearchError] = useState<string | null>(null);
  const [isSearchingObservations, setIsSearchingObservations] = useState(false);
  const [iss, setIss] = useState<IssSnapshot>(MOCK_ISS);
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const [refresh, setRefresh] = useState<RefreshState>("idle");
  const [overviewMode, setOverviewMode] = useState<FeedMode>("fallback");
  const [liveFeedCount, setLiveFeedCount] = useState(0);
  const [apodMode, setApodMode] = useState<FeedMode>("fallback");
  const [launchMode, setLaunchMode] = useState<FeedMode>("fallback");
  const [weatherMode, setWeatherMode] = useState<FeedMode>("fallback");
  const spacexStatusUi =
    launch.status === "go"
      ? launchMode === "live" ? "Go for launch" : "Go for launch (fallback)"
      : launch.status === "hold"
        ? launchMode === "live" ? "Hold" : "Hold (fallback)"
        : launch.status === "scrubbed"
          ? launchMode === "live" ? "Scrubbed" : "Scrubbed (fallback)"
          : launchMode === "live" ? "TBD" : "TBD (fallback)";

  const telemetryStats = [
    { label: "ISS altitude", value: `${iss.altitudeKm} km`, tone: "green" as const },
    { label: "Crew in orbit", value: String(people.length), tone: "purple" as const },
    { label: "Next launch", value: launch.status === "go" ? "Go" : launch.status, tone: "orange" as const },
    { label: "Tracked feeds", value: liveFeedCount > 0 ? `${liveFeedCount} live` : "5 staged", tone: "green" as const },
  ];

  const refreshIss = async () => {
    setRefresh("loading");
    try {
      const live = await api().spaceIss();
      setIss(toIssSnapshot(live));
      setLastUpdated(new Date(live.timestamp));
      setRefresh("idle");
    } catch {
      setRefresh("error");
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadFeeds = async () => {
      setRefresh("loading");
      const [
        apodResult,
        peopleResult,
        launchResult,
        issResult,
        weatherSummaryResult,
        weatherEventsResult,
      ] = await Promise.allSettled([
        api().spaceApod(),
        api().spacePeople(),
        api().spaceNextLaunch(),
        api().spaceIss(),
        api().spaceWeatherSummary(),
        api().spaceWeatherEvents(),
      ]);
      if (cancelled) return;

      let liveCount = 0;
      let nextApodMode: FeedMode = "fallback";
      let nextLaunchMode: FeedMode = "fallback";
      let nextWeatherMode: FeedMode = "fallback";

      if (apodResult.status === "fulfilled") {
        liveCount += 1;
        nextApodMode = "live";
        setApod({
          title: apodResult.value.title,
          date: apodResult.value.date,
          explanation: apodResult.value.explanation,
          imageUrl: apodResult.value.imageUrl || MOCK_APOD.imageUrl,
          copyright: apodResult.value.copyright ?? undefined,
        });
      }

      if (peopleResult.status === "fulfilled" && peopleResult.value.people.length > 0) {
        liveCount += 1;
        setPeople(peopleResult.value.people);
      }

      if (launchResult.status === "fulfilled") {
        liveCount += 1;
        nextLaunchMode = "live";
        setLaunch({
          mission: launchResult.value.mission,
          rocket: launchResult.value.rocket,
          launchIso: launchResult.value.launchIso,
          site: launchResult.value.site,
          status: launchResult.value.status,
          webcastLabel: launchResult.value.webcastLabel,
          webcastUrl: launchResult.value.webcastUrl,
          windowSummary: launchResult.value.windowSummary,
        });
      }

      if (issResult.status === "fulfilled") {
        liveCount += 1;
        setIss(toIssSnapshot(issResult.value));
        setLastUpdated(new Date(issResult.value.timestamp));
        setRefresh("idle");
      } else {
        setRefresh("error");
      }

      if (weatherSummaryResult?.status === "fulfilled") {
        liveCount += 1;
        nextWeatherMode = "live";
        setWeatherSummary(weatherSummaryResult.value);
      }

      if (weatherEventsResult?.status === "fulfilled" && weatherEventsResult.value.items.length > 0) {
        if (nextWeatherMode !== "live") {
          liveCount += 1;
          nextWeatherMode = "live";
        }
        const mappedEvents = weatherEventsResult.value.items.map((event) => ({
          id: event.id,
          kind: event.kind,
          title: event.title,
          startTime: event.startTime,
          severity: event.severity,
          location: event.location,
          note: event.note,
          linkedEventIds: event.linkedEventIds,
        }));
        setWeatherEvents(mappedEvents);
        setSelectedWeatherEvent(mappedEvents[0] ?? null);
      }

      setLiveFeedCount(liveCount);
      setApodMode(nextApodMode);
      setLaunchMode(nextLaunchMode);
      setWeatherMode(nextWeatherMode);
      setOverviewMode(liveCount > 0 ? "live" : "fallback");
    };

    void loadFeeds();

    return () => {
      cancelled = true;
    };
  }, []);

  const askSpaceSist = async () => {
    const trimmed = question.trim();
    if (!trimmed || isAsking) return;
    setIsAsking(true);
    setAskError(null);
    setAnswer(null);
    try {
      const result = await api().spaceAsk({ question: trimmed, topK: 5 });
      setAnswer(result);
    } catch (err) {
      setAskError(formatAskError(err));
    } finally {
      setIsAsking(false);
    }
  };

  const selectWeatherEvent = async (id: string) => {
    const local = weatherEvents.find((event) => event.id === id) ?? null;
    if (!local) return;
    setSelectedWeatherEvent(local);
    if (weatherMode !== "live") return;

    setWeatherEventLoadingId(id);
    try {
      const detail = await api().spaceWeatherEvent(id);
      setSelectedWeatherEvent({
        id: detail.item.id,
        kind: detail.item.kind,
        title: detail.item.title,
        startTime: detail.item.startTime,
        severity: detail.item.severity,
        location: detail.item.location,
        note: detail.item.note,
        linkedEventIds: detail.item.linkedEventIds,
      });
    } catch {
      setSelectedWeatherEvent(local);
    } finally {
      setWeatherEventLoadingId(null);
    }
  };

  const openTargetDrawer = (item: SpaceTargetLookupItem) => {
    setSelectedTarget(item);
    setTargetDrawerTarget(item);
  };

  const searchTargets = async () => {
    const trimmed = targetQuery.trim();
    if (!trimmed || isSearchingTargets) return;
    setIsSearchingTargets(true);
    setTargetSearchError(null);
    try {
      const result = await api().spaceTargetLookup(trimmed, targetGroup || undefined);
      setTargetResults(result.items);
      setSelectedTarget(result.items[0] ?? null);
    } catch (err) {
      setTargetSearchError(formatAskError(err));
      setTargetResults([]);
      setSelectedTarget(null);
    } finally {
      setIsSearchingTargets(false);
    }
  };

  const searchObservations = async (query = observationQuery) => {
    const trimmed = query.trim();
    if (!trimmed || isSearchingObservations) return;
    setObservationQuery(trimmed);
    setIsSearchingObservations(true);
    setObservationSearchError(null);
    try {
      const result = await api().spaceObservationSearch(trimmed, { radius: 0.2, limit: 4 });
      setObservationResults(result.items);
    } catch (err) {
      setObservationSearchError(formatAskError(err));
      setObservationResults([]);
    } finally {
      setIsSearchingObservations(false);
    }
  };

  const openObservationDrawer = (item: SpaceObservationItem) => {
    setSelectedObservation(item);
  };

  const openObservationVisual = (item: SpaceObservationItem) => {
    setSelectedObservationVisual(item);
  };

  const exploreRelatedObservations = (targetName: string) => {
    setSelectedObservation(null);
    void searchObservations(targetName);
  };

  const relatedObservations = observationResults.filter(
    (item) => item.obsId !== selectedObservation?.obsId,
  );

  useEffect(() => {
    let cancelled = false;
    if (!targetDrawerTarget) {
      setTargetEphemeris(null);
      setTargetEphemerisError(null);
      setTargetEphemerisLoading(false);
      return;
    }

    setTargetEphemeris(null);
    setTargetEphemerisError(null);
    setTargetEphemerisLoading(true);

    void api()
      .spaceTargetEphemeris(targetDrawerTarget.id, { days: 3, stepHours: 6 })
      .then((result) => {
        if (!cancelled) setTargetEphemeris(result);
      })
      .catch((error) => {
        if (!cancelled) setTargetEphemerisError(formatAskError(error));
      })
      .finally(() => {
        if (!cancelled) setTargetEphemerisLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [targetDrawerTarget]);

  return (
    <div className="relative overflow-hidden rounded-lg border border-white/[0.08] bg-ink-900/62 shadow-[0_28px_80px_-54px_rgba(0,0,0,0.9)] ring-1 ring-white/[0.035]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(47,149,220,0.16),transparent_34%),radial-gradient(circle_at_82%_10%,rgba(148,163,184,0.1),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent_38%)]"
        aria-hidden
      />

      <div className="relative space-y-8 p-4 sm:p-6 lg:p-8">
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] xl:items-stretch">
          <Card className="relative min-h-[24rem] overflow-hidden p-6 sm:p-8">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_74%_42%,rgba(47,149,220,0.18),transparent_26%),radial-gradient(circle_at_78%_48%,rgba(148,163,184,0.12),transparent_34%),linear-gradient(135deg,rgba(14,20,32,0.18),rgba(14,20,32,0.92))]"
              aria-hidden
            />
            <div className="pointer-events-none absolute right-[-7rem] top-1/2 h-80 w-80 -translate-y-1/2 rounded-full border border-ufo-300/20 shadow-[0_0_90px_-34px_rgba(47,149,220,0.62)]" />
            <div className="pointer-events-none absolute right-[-4rem] top-1/2 h-52 w-52 -translate-y-1/2 rounded-full border border-white/[0.08]" />

            <div className="relative max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="green">Space intelligence</Badge>
                <Badge tone="orange">{overviewMode === "live" ? "Worker-backed feeds" : "Curated fallback"}</Badge>
              </div>
              <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-ink-50 sm:text-5xl lg:text-6xl">
                Space activity overview
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-ink-300 sm:text-base">
                SpaceSist consolidates orbital telemetry, crew status, NASA
                imagery, launch activity, and source-grounded context into a
                focused dashboard. Live worker feeds and curated visual explainers
                are labeled separately so the product stays honest about what is
                measured versus illustrated.
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
              onRefresh={refreshIss}
              lastUpdated={lastUpdated}
              refresh={refresh}
            />
          </SCard>
        </section>

        <SCard className="p-5 sm:p-6">
          <IssCrewColumn
            people={people}
            countOrbiters={String(people.length)}
          />
        </SCard>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-stretch">
          <Card className="relative min-h-[22rem] overflow-hidden p-5 sm:p-6">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_35%_35%,rgba(47,149,220,0.12),transparent_24%),radial-gradient(circle_at_70%_60%,rgba(148,163,184,0.14),transparent_32%)]"
              aria-hidden
            />
            <div className="relative flex h-full min-h-[19rem] flex-col">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <SectionTitle eyebrow="Visual explainer" title="SpaceSist signal map" />
                <Badge tone="orange">Illustrative</Badge>
              </div>
              <div className="relative mt-6 flex-1 overflow-hidden rounded-lg border border-white/[0.08] bg-ink-950/72">
                <div
                  className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(47,149,220,0.13),transparent_33%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent)]"
                  aria-hidden
                />
                <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ufo-300/20 shadow-[0_0_90px_-34px_rgba(47,149,220,0.72)]" />
                <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.08]" />
                <svg
                  className="absolute inset-0 h-full w-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <path
                    d="M 24 62 Q 50 32 78 72"
                    fill="none"
                    stroke="rgba(136,207,253,0.35)"
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
                          ? "block size-2 rounded-full bg-ufo-300 shadow-[0_0_18px_rgba(136,207,253,0.8)]"
                        : node.tone === "orange"
                            ? "block size-2 rounded-full bg-signal-400 shadow-[0_0_18px_rgba(255,179,71,0.65)]"
                            : "block size-2 rounded-full bg-sky-300 shadow-[0_0_18px_rgba(125,211,252,0.65)]"
                      }
                    />
                    <span className="mt-1 block rounded border border-white/[0.08] bg-ink-950/70 px-1.5 py-0.5 text-[11px] font-medium text-ink-200">
                      {node.label}
                    </span>
                  </div>
                ))}
                <div className="absolute bottom-3 left-3 right-3 grid gap-2 sm:grid-cols-3">
                  {visualLayers.map((layer) => (
                    <div
                      key={layer.label}
                      className="rounded-md border border-white/[0.08] bg-ink-950/58 px-3 py-2 backdrop-blur"
                    >
                      <div className="text-xs font-medium text-ink-400">
                        {layer.label}
                      </div>
                      <div className="mt-1 truncate text-xs font-semibold text-ufo-200">
                        {layer.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionTitle eyebrow="Coverage" title="What this product monitors" />
            <p className="mt-4 text-sm leading-7 text-ink-300">
              SpaceSist combines routed space feeds with explanatory panels that
              make the activity legible. The flagship surface should be explicit
              about which blocks are live data, which are curated snapshots, and
              which are visual context.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Stat label="Data mode" value={overviewMode === "live" ? "mixed live feeds" : "curated fixtures"} />
              <Stat label="Answer layer" value="grounded RAG" />
              <Stat label="Visual assets" value="curated context" />
              <Stat label="Display mode" value="mixed live + explainer" />
            </div>
          </Card>
        </section>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-ufo-300">
              NASA science
            </p>
            <h2 className="mt-1 font-display text-lg font-semibold text-ink-50">
              Astronomy Picture of the Day
            </h2>
          </div>
          <ApodSection
            title={apod.title}
            date={apod.date}
            explanation={apod.explanation}
            imageUrl={apod.imageUrl}
            copyright={apod.copyright}
            mode={apodMode}
          />
        </div>

        <SpacexNextLaunchSection launch={launch} mode={launchMode} />

        <SpaceWeatherSection
          summary={weatherSummary}
          events={weatherEvents}
          selectedEventId={selectedWeatherEvent?.id ?? null}
          onSelectEvent={selectWeatherEvent}
          loadingEventId={weatherEventLoadingId}
          mode={weatherMode}
        />

        {selectedWeatherEvent ? (
          <Card className="p-5">
            <SectionTitle eyebrow="Weather detail" title={selectedWeatherEvent.title} />
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Stat label="Type" value={selectedWeatherEvent.kind} />
              <Stat label="Severity" value={selectedWeatherEvent.severity ?? "Unknown"} />
              <Stat label="Start" value={new Date(selectedWeatherEvent.startTime).toLocaleDateString()} />
              <Stat label="Links" value={String(selectedWeatherEvent.linkedEventIds.length)} />
            </div>
            <div className="mt-4 rounded-lg border border-white/[0.07] bg-white/[0.035] p-4">
              <p className="text-xs font-medium text-ufo-200">Operational context</p>
              <p className="mt-2 text-sm leading-7 text-ink-200">
                {selectedWeatherEvent.note ?? "No additional event note is available for this weather item."}
              </p>
              {selectedWeatherEvent.location ? (
                <p className="mt-2 text-xs text-ink-500">Location: {selectedWeatherEvent.location}</p>
              ) : null}
            </div>
          </Card>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
          <Card className="p-5">
            <SectionTitle eyebrow="Object search" title="Targets and horizons lookup" />
            <p className="mt-3 text-sm leading-7 text-ink-300">
              Search JPL Horizons-recognized objects by name, designation, or SPK ID. This is the first target-foundation step before ephemerides and pop-out detail views.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem_auto]">
              <input
                value={targetQuery}
                onChange={(event) => setTargetQuery(event.target.value)}
                placeholder="Apophis, Europa, Juno, Halley..."
                className="rounded-lg border border-white/[0.08] bg-ink-950/70 px-3.5 py-3 text-sm text-ink-100 placeholder:text-ink-500 focus:border-ufo-300/45 focus:outline-none focus:ring-1 focus:ring-ufo-300/25"
              />
              <select
                value={targetGroup}
                onChange={(event) => setTargetGroup(event.target.value as typeof targetGroup)}
                className="rounded-lg border border-white/[0.08] bg-ink-950/70 px-3.5 py-3 text-sm text-ink-100 focus:border-ufo-300/45 focus:outline-none focus:ring-1 focus:ring-ufo-300/25"
              >
                <option value="">All groups</option>
                <option value="ast">Asteroids</option>
                <option value="com">Comets</option>
                <option value="pln">Planets</option>
                <option value="sat">Satellites</option>
                <option value="sct">Spacecraft</option>
              </select>
              <button
                type="button"
                onClick={searchTargets}
                disabled={isSearchingTargets || !targetQuery.trim()}
                className="rounded-md border border-ufo-300/30 bg-ufo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-ufo-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSearchingTargets ? "Searching..." : "Lookup"}
              </button>
            </div>
            {targetSearchError ? (
              <p className="mt-3 text-sm text-red-200">{targetSearchError}</p>
            ) : null}
            <div className="mt-4 space-y-3">
              {targetResults.length === 0 ? (
                <div className="rounded-lg border border-white/[0.07] bg-white/[0.035] p-3.5">
                  <p className="text-xs leading-relaxed text-ink-400">
                    Search for a target to build a stable identity card before adding ephemeris and observation views.
                  </p>
                </div>
              ) : null}
              {targetResults.map((item) => (
                <div
                  key={item.id}
                  className={`w-full rounded-lg border px-3.5 py-3 text-left ${
                    selectedTarget?.id === item.id
                      ? "border-ufo-300/30 bg-ufo-400/[0.07]"
                      : "border-white/[0.07] bg-white/[0.035]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedTarget(item)}
                    className="w-full text-left"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium text-ink-100">{item.name}</span>
                      <span className="rounded-full border border-white/[0.08] bg-ink-950/60 px-2 py-0.5 text-[11px] font-medium text-ink-300">
                        {item.objectType}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-ink-500">
                      SPK {item.spkId}
                      {item.primaryDesignation ? ` · ${item.primaryDesignation}` : ""}
                    </div>
                  </button>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/[0.08] bg-ink-950/60 px-2 py-0.5 text-[10px] font-medium text-ink-300">
                      Click to select
                    </span>
                    <button
                      type="button"
                      onClick={() => openTargetDrawer(item)}
                      className="rounded-full border border-ufo-300/30 bg-ufo-400/[0.08] px-2.5 py-0.5 text-[10px] font-medium text-ufo-200"
                    >
                      Open detail window
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <SectionTitle eyebrow="Target detail" title={selectedTarget?.name ?? "No target selected"} />
            {selectedTarget ? (
              <>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Stat label="Type" value={selectedTarget.objectType} />
                  <Stat label="SPK ID" value={selectedTarget.spkId} />
                  <Stat label="Designation" value={selectedTarget.primaryDesignation ?? "—"} />
                  <Stat label="Aliases" value={String(selectedTarget.aliases.length)} />
                </div>
                <div className="mt-4 rounded-lg border border-white/[0.07] bg-white/[0.035] p-4">
                  <p className="text-xs font-medium text-ufo-200">Known aliases</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(selectedTarget.aliases.length > 0 ? selectedTarget.aliases : ["No aliases exposed in this lookup result."]).map((alias) => (
                      <span
                        key={alias}
                        className="rounded-full border border-white/[0.08] bg-ink-950/60 px-2 py-0.5 text-[11px] font-medium text-ink-300"
                      >
                        {alias}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-ink-500">
                  Next step: add ephemeris and observation panels, or open this target into a dedicated detail window/pop-out route when we want a deeper exploration surface.
                </p>
                <button
                  type="button"
                  onClick={() => selectedTarget && openTargetDrawer(selectedTarget)}
                  className="mt-4 rounded-md border border-ufo-300/30 bg-ufo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-ufo-400"
                >
                  Open detail window
                </button>
              </>
            ) : (
              <div className="mt-4 rounded-lg border border-white/[0.07] bg-white/[0.035] p-3.5">
                <p className="text-xs leading-relaxed text-ink-400">
                  A selected target will appear here with identity metadata. This card is the natural place to attach a future pop-out detail view.
                </p>
              </div>
            )}
          </Card>
        </section>

        <Card className="p-5">
          <SectionTitle eyebrow="Curated gallery" title="Galaxy and nebula references" />
          <p className="mt-3 text-sm leading-7 text-ink-300">
            These tiles are visual context only. They are intentionally staged
            references, not a live astronomy feed.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {deepSpace.map((item) => (
              <figure
                key={item.title}
                className="group overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.035]"
              >
                <div
                  className={`h-36 bg-gradient-to-br sm:h-44 ${item.placeholderClass} transition duration-300 group-hover:opacity-95`}
                  role="presentation"
                />
                <figcaption className="border-t border-white/[0.07] px-3 py-2">
                  <div className="text-sm font-medium text-ink-100">{item.title}</div>
                  <div className="mt-0.5 text-xs text-ufo-300">{item.catalog}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </Card>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <Card className="p-5">
            <SectionTitle eyebrow="Illustrative timeline" title="Example mission notes" />
            <p className="mt-3 text-sm leading-7 text-ink-300">
              This rail is a staged product pattern for future normalized events.
              It is not yet backed by a live event stream.
            </p>
            <ol className="mt-5 space-y-3">
              {missionLogs.map((log) => (
                <li key={`${log.time}-${log.title}`} className="flex gap-3">
                  <div className="pt-1">
                    <span className="block size-2 rounded-full bg-signal-400 shadow-[0_0_14px_rgba(255,179,71,0.45)]" />
                  </div>
                  <div className="flex-1 rounded-lg border border-white/[0.07] bg-white/[0.035] px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-ink-500">
                      <span className="text-signal-400">{log.time}</span>
                      <span>{log.type}</span>
                    </div>
                    <h3 className="mt-1.5 text-sm font-medium text-ink-100">{log.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-ink-400">{log.detail}</p>
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
            peopleCount={people.length}
            apodDate={apod.date}
            spacexMission={launch.mission}
            spacexStatusLabel={spacexStatusUi}
            weatherHeadline={weatherSummary.latestHeadline}
            weatherStatusLabel={weatherSummary.status}
            mode={overviewMode}
          />
        </section>

        <TargetDetailDrawer
          target={targetDrawerTarget}
          ephemeris={targetEphemeris}
          ephemerisLoading={targetEphemerisLoading}
          ephemerisError={targetEphemerisError}
          onClose={() => setTargetDrawerTarget(null)}
        />

        <Card className="p-5">
          <SectionTitle eyebrow="Archive explorer" title="Telescope observations and preview visuals" />
          <p className="mt-3 text-sm leading-7 text-ink-300">
            Search MAST observations for a target and preview what the archive has around that object. Preview tiles appear when the archive exposes a visual product; otherwise the card links out to the source.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <input
              value={observationQuery}
              onChange={(event) => setObservationQuery(event.target.value)}
              placeholder="M101, NGC 1300, M51, JWST target..."
              className="rounded-lg border border-white/[0.08] bg-ink-950/70 px-3.5 py-3 text-sm text-ink-100 placeholder:text-ink-500 focus:border-ufo-300/45 focus:outline-none focus:ring-1 focus:ring-ufo-300/25"
            />
            <button
              type="button"
              onClick={() => void searchObservations()}
              disabled={isSearchingObservations || !observationQuery.trim()}
              className="rounded-md border border-ufo-300/30 bg-ufo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-ufo-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSearchingObservations ? "Searching..." : "Search archive"}
            </button>
          </div>
          {observationSearchError ? (
            <p className="mt-3 text-sm text-red-200">{observationSearchError}</p>
          ) : null}
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {observationResults.length === 0 ? (
              <div className="rounded-lg border border-white/[0.07] bg-white/[0.035] p-3.5 md:col-span-2 xl:col-span-4">
                <p className="text-xs leading-relaxed text-ink-400">
                  Search for a target to load preview-ready archive cards. Good starting points are `M101`, `M51`, `NGC 1300`, or `JWST`.
                </p>
              </div>
            ) : null}
            {observationResults.map((item) => (
              <article
                key={item.obsId}
                className="overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.035]"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-ink-950 via-ufo-500/20 to-sky-900/25">
                  {item.previewUrl ? (
                    <img
                      src={item.previewUrl}
                      alt={item.obsTitle}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-end p-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-ufo-200">
                          Archive visual
                        </div>
                        <div className="mt-1 text-sm font-medium text-ink-100">
                          {item.isVisual ? "Preview path available" : "Metadata only"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2 border-t border-white/[0.07] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-medium text-ink-100">{item.obsTitle}</div>
                    <span className="rounded-full border border-white/[0.08] bg-ink-950/60 px-2 py-0.5 text-[10px] font-medium text-ink-300">
                      {item.collection}
                    </span>
                  </div>
                  <div className="text-xs text-ink-400">
                    {item.instrument} · {item.dataProductType}
                  </div>
                  <div className="text-xs text-ink-500">
                    {item.targetName}
                    {item.observationTime ? ` · ${item.observationTime}` : ""}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {item.accessUrl ? (
                      <a
                        href={item.accessUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-ufo-300/30 bg-ufo-400/[0.08] px-2.5 py-1 text-[10px] font-medium text-ufo-200"
                      >
                        Open source
                      </a>
                    ) : null}
                    {item.previewUrl ? (
                      <span className="rounded-full border border-white/[0.08] bg-white/[0.05] px-2.5 py-1 text-[10px] font-medium text-ink-300">
                        Preview tile
                      </span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => openObservationDrawer(item)}
                      className="rounded-full border border-ufo-300/30 bg-ufo-400/[0.08] px-2.5 py-1 text-[10px] font-medium text-ufo-200"
                    >
                      Open detail window
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Card>

        <ObservationDetailDrawer
          observation={selectedObservation}
          relatedObservations={relatedObservations}
          onSelectObservation={openObservationDrawer}
          onOpenVisual={openObservationVisual}
          onExploreTarget={exploreRelatedObservations}
          onClose={() => setSelectedObservation(null)}
        />

        <ObservationVisualDrawer
          observation={selectedObservationVisual}
          relatedObservations={relatedObservations}
          onSelectObservation={openObservationVisual}
          onClose={() => setSelectedObservationVisual(null)}
        />

        <section className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <Card className="p-5">
            <SectionTitle eyebrow="Grounded Q&A" title="Ask SpaceSist" />
            <label className="mt-4 block">
              <span className="text-xs font-medium text-ink-400">
                Mission question
              </span>
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                rows={4}
                className="mt-2 w-full resize-y rounded-lg border border-white/[0.08] bg-ink-950/70 px-3.5 py-3 text-sm leading-relaxed text-ink-100 placeholder:text-ink-500 focus:border-ufo-300/45 focus:outline-none focus:ring-1 focus:ring-ufo-300/25"
              />
            </label>
            <div className="mt-4 rounded-lg border border-dashed border-ufo-300/25 bg-ufo-400/[0.06] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-medium text-ufo-200">
                  Grounded answer
                </p>
                {answer ? (
                  <span className="rounded-full border border-white/[0.08] bg-ink-950/60 px-2 py-1 text-[11px] font-medium text-ink-300">
                    {providerLabel(answer.source)} · {answer.model} · {answer.latencyMs}ms
                  </span>
                ) : null}
              </div>
              {isAsking ? (
                <p className="mt-2 text-sm leading-7 text-ink-300">
                  Retrieving source context and preparing a grounded answer...
                </p>
              ) : null}
              {askError ? (
                <p className="mt-2 text-sm leading-7 text-red-200">{askError}</p>
              ) : answer ? (
                <>
                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-ink-200">
                    {answer.answer}
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-ink-400">
                    {providerSummary(answer)}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm leading-7 text-ink-300">
                  Ask about NASA, Apollo, Artemis, the ISS, Mars missions,
                  space telescopes, commercial crew, or spaceflight history.
                  SpaceSist retrieves local program context before generating
                  an answer, and falls back to retrieval-only output when no
                  model provider is available.
                </p>
              )}
            </div>
            <button
              type="button"
              disabled={isAsking || !question.trim()}
              onClick={askSpaceSist}
              className="mt-4 rounded-md border border-ufo-300/30 bg-ufo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-ufo-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAsking ? "Running query..." : "Run space query"}
            </button>
          </Card>

          <Card className="p-5">
            <SectionTitle eyebrow="Retrieved context" title="Source chunks" />
            <div className="mt-4 space-y-3">
              {(answer?.chunks ?? []).length === 0 ? (
                <div className="rounded-lg border border-white/[0.07] bg-white/[0.035] p-3.5">
                  <p className="text-xs leading-relaxed text-ink-400">
                    {isAsking
                      ? "Retrieval is in progress. Matching corpus chunks will appear here first."
                      : "Run a question to see which NASA and space-program context chunks SpaceSist retrieved."}
                  </p>
                </div>
              ) : null}
              {(answer?.chunks ?? []).map((chunk) => (
                <div
                  key={chunk.id}
                  className="rounded-lg border border-white/[0.07] bg-white/[0.035] p-3.5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <code className="text-xs text-ufo-200">{chunk.source}</code>
                    <span className="text-xs text-signal-400">
                      relevance {chunk.score.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formatTopic(chunk.metadata.topic) ? (
                      <span className="rounded-full border border-ufo-300/20 bg-ufo-400/[0.08] px-2 py-0.5 text-[10px] font-medium text-ufo-200">
                        {formatTopic(chunk.metadata.topic)}
                      </span>
                    ) : null}
                    {formatTopic(chunk.metadata.kind) ? (
                      <span className="rounded-full border border-white/[0.08] bg-ink-950/60 px-2 py-0.5 text-[10px] font-medium text-ink-300">
                        {formatTopic(chunk.metadata.kind)}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-ink-400">{chunk.text}</p>
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
    className={`rounded-lg border border-white/[0.08] bg-white/[0.045] shadow-[0_18px_45px_-34px_rgba(0,0,0,0.85)] ring-1 ring-white/[0.035] backdrop-blur-xl ${className}`}
  >
    {children}
  </div>
);

const Badge = ({ children, tone }: { children: ReactNode; tone: "green" | "orange" }) => (
  <span
    className={
      tone === "green"
        ? "rounded-full border border-ufo-300/25 bg-ufo-400/[0.08] px-2.5 py-1 text-xs font-medium text-ufo-200"
        : "rounded-full border border-signal-400/25 bg-signal-400/[0.08] px-2.5 py-1 text-xs font-medium text-signal-400"
    }
  >
    {children}
  </span>
);

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-white/[0.07] bg-white/[0.035] p-3">
    <div className="text-xs font-medium text-ink-400">{label}</div>
    <div className="mt-1 break-words text-sm font-semibold text-ink-100">{value}</div>
  </div>
);
