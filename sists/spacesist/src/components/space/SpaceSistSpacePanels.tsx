import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type IssSnapshot,
  type SpaceWeatherEventView,
  type SpaceWeatherSummaryView,
  type SpacePerson,
  type SpacexLaunchPreview,
  ISS_SOURCES,
  MOCK_GROUND_TRACK,
  SPACE_FEED_SOURCES,
} from "../../data/spaceMock";
import {
  SCard,
  SectionTitle,
  SourcePill,
  Telemetry,
  ToneBadge,
} from "./SpaceSistChrome";

// --------------------------------------------------------------------------- ISS

function toMapXY(lat: number, lon: number): { x: number; y: number } {
  // Equirectangular, viewBox 360×180, lon -180..180, lat -90..90
  return { x: lon + 180, y: 90 - lat };
}

function buildTrailPath(pts: { lat: number; lon: number }[], iss: IssSnapshot): string {
  const all = [...pts, { lat: iss.latitude, lon: iss.longitude }];
  const d: string[] = [];
  for (let i = 0; i < all.length; i += 1) {
    const { x, y } = toMapXY(all[i]!.lat, all[i]!.lon);
    d.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
  }
  return d.join(" ");
}

const fmtLat = (n: number) => {
  const hemi = n >= 0 ? "N" : "S";
  return `${Math.abs(n).toFixed(4)}° ${hemi}`;
};

const fmtLon = (n: number) => {
  const hemi = n >= 0 ? "E" : "W";
  return `${Math.abs(n).toFixed(4)}° ${hemi}`;
};

const fmtUtc = (d: Date) =>
  d.toLocaleString("en-GB", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

export const IssOrbitMap = ({
  iss,
  trail,
  loading = false,
  className = "",
}: {
  iss: IssSnapshot;
  trail: { lat: number; lon: number }[];
  loading?: boolean;
  className?: string;
}) => {
  const pIss = toMapXY(iss.latitude, iss.longitude);
  const pathD = useMemo(() => buildTrailPath(trail, iss), [trail, iss]);

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-white/[0.08] bg-gradient-to-b from-ink-900 to-ink-950 ${className}`}
    >
      {loading ? (
        <div
          className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center bg-ink-950/35 backdrop-blur-[1px]"
          aria-hidden
        >
          <span className="rounded-full border border-ufo-300/20 bg-ink-950/65 px-3 py-1 text-xs font-medium text-ufo-200">
            Refreshing
          </span>
        </div>
      ) : null}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(47,149,220,0.12),transparent_35%)]"
        aria-hidden
      />
      <div className="absolute left-2 top-2 z-10 max-w-[85%]">
        <p className="text-xs font-medium text-ufo-200">
          Global orbital view
        </p>
        <p className="mt-0.5 text-xs text-ink-400">Recent ground track and ISS position</p>
      </div>
      <svg
        viewBox="0 0 360 180"
        className="h-full w-full min-h-[11rem] block"
        role="img"
        aria-label="Mock world map with ISS and ground track"
      >
        <title>Mock ISS world map with orbit trail</title>
        <rect width="360" height="180" fill="url(#oc)" />
        <defs>
          <linearGradient id="oc" x1="0" y1="0" x2="360" y2="180" gradientUnits="userSpaceOnUse">
            <stop stopColor="rgba(8,20,40,0.95)" />
            <stop offset="0.5" stopColor="rgba(5,8,20,0.9)" />
            <stop offset="1" stopColor="rgba(10,5,30,0.85)" />
          </linearGradient>
        </defs>
        {/* Simplified “continents” as soft blobs (decorative) */}
        <ellipse cx="92" cy="88" rx="28" ry="20" fill="rgba(30,50,40,0.25)" />
        <ellipse cx="248" cy="70" rx="36" ry="24" fill="rgba(30,50,40,0.2)" />
        <ellipse cx="200" cy="120" rx="20" ry="32" fill="rgba(30,50,40,0.15)" />
        <path
          d={pathD}
          fill="none"
          stroke="rgba(136,207,253,0.45)"
          strokeWidth="1.2"
          strokeDasharray="5 4"
          strokeLinecap="round"
        />
        <circle
          cx={pIss.x}
          cy={pIss.y}
          r="4.5"
          fill="#88cffd"
          className="drop-shadow-[0_0_10px_rgba(136,207,253,0.85)]"
        />
        <circle cx={pIss.x} cy={pIss.y} r="9" fill="none" stroke="rgba(136,207,253,0.45)" strokeWidth="0.6" />
      </svg>
    </div>
  );
};

type RefreshState = "idle" | "loading" | "error";

export const IssIntelligenceColumn = ({
  iss,
  onRefresh,
  lastUpdated,
  refresh,
}: {
  iss: IssSnapshot;
  onRefresh: () => void;
  lastUpdated: Date;
  refresh: RefreshState;
}) => {
  const trackPct = 68;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <SectionTitle eyebrow="Live orbit" title="ISS tracking" />
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <div className="flex flex-wrap justify-end gap-1.5">
            <SourcePill id={ISS_SOURCES.position.id} label={ISS_SOURCES.position.label} />
            <SourcePill id={ISS_SOURCES.crew.id} label={ISS_SOURCES.crew.label} />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <time
              className="text-xs text-ink-500"
              dateTime={lastUpdated.toISOString()}
            >
              Last updated {fmtUtc(lastUpdated)} UTC
            </time>
            <button
              type="button"
              onClick={onRefresh}
              disabled={refresh === "loading"}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-ufo-300/30 bg-ufo-400/[0.08] px-2.5 py-1 text-xs font-medium text-ufo-200 transition hover:border-ufo-300/50 hover:bg-ufo-400/15 disabled:cursor-wait disabled:opacity-60"
            >
              {refresh === "loading" ? (
                <>
                  <span className="inline-block size-2 animate-pulse rounded-full bg-ufo-300 shadow-[0_0_8px_rgba(136,207,253,0.8)]" />
                  Syncing
                </>
              ) : (
                "Refresh"
              )}
            </button>
          </div>
        </div>
      </div>

      {refresh === "error" ? (
        <p className="text-xs text-signal-400" role="status">
          Refresh failed. Retry once the API route is available.
        </p>
      ) : null}

      <div className={refresh === "loading" ? "opacity-90 transition" : ""}>
        <IssOrbitMap
          iss={iss}
          trail={MOCK_GROUND_TRACK}
          loading={refresh === "loading"}
          className="min-h-[12rem] w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <Telemetry
          label="Subsatellite latitude (φ)"
          value={fmtLat(iss.latitude)}
          sub="WGS-84, geodetic"
          state="live"
        />
        <Telemetry
          label="Subsatellite longitude (λ)"
          value={fmtLon(iss.longitude)}
          sub="WGS-84, geodetic"
          state="live"
        />
        <Telemetry
          label="Altitude (mean circular)"
          value={`${iss.altitudeKm} km`}
          sub="ISS nominal ~400–430 km"
          state="ok"
        />
        <Telemetry
          label="Inertial speed"
          value={`${iss.velocityKmh.toLocaleString()} km/h`}
          sub="~7.66 km/s ground speed scale"
          state="ok"
        />
        <Telemetry
          label="Illumination (β proxy)"
          value={iss.dayNight === "day" ? "Day side" : iss.dayNight === "night" ? "Night" : "Terminator"}
          sub="simplified day/night flag"
          state="ok"
        />
        <Telemetry
          label="Orbital period (nominal)"
          value="~90 min / rev"
          sub="i ≈ 51.6° (not live TLE here)"
          state="ok"
        />
      </div>

      <div className="space-y-2">
        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
          <div
            className={`h-full rounded-full bg-gradient-to-r from-ufo-300 via-sky-300 to-signal-400 shadow-[0_0_12px_rgba(47,149,220,0.28)] ${
              refresh === "loading" ? "animate-pulse" : ""
            }`}
            style={{ width: `${Math.min(100, trackPct)}%` }}
          />
        </div>
        <p className="text-xs leading-relaxed text-ink-500">
          Orbit progress is currently illustrative; production should bind to
          epoch and TLE data from a trusted orbital source.
        </p>
      </div>
    </div>
  );
};

function initialsFor(name: string) {
  const p = name.split(/\s+/).filter(Boolean);
  if (p.length >= 2) return `${p[0]![0]!}${p[1]![0]!}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export const PeopleInSpaceList = ({ people }: { people: SpacePerson[] }) => (
  <ul className="mt-4 grid gap-2.5 sm:grid-cols-1">
    {people.map((person) => (
      <li
        key={person.name}
        className="group flex items-stretch gap-3 rounded-xl border border-white/[0.08] bg-white/[0.035] p-3 transition hover:border-ufo-300/20"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.055] text-sm font-semibold text-ink-100">
          {initialsFor(person.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium leading-tight text-ink-100">{person.name}</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-ink-500">
            <span className="text-ink-400">{person.agency}</span>
            <span className="text-ink-600">·</span>
            <span className="text-ink-500">
              {person.countryCode}
            </span>
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end justify-center text-right">
          <span className="rounded-full border border-ufo-300/30 bg-ufo-400/[0.08] px-2.5 py-1 text-xs font-medium text-ufo-200">
            {person.craft}
          </span>
        </div>
      </li>
    ))}
  </ul>
);

export const IssCrewColumn = ({ people, countOrbiters }: { people: SpacePerson[]; countOrbiters: string }) => (
  <div>
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <SectionTitle eyebrow="Crew & visitors" title="People in space" />
      <ToneBadge tone="green">{countOrbiters} people in orbit</ToneBadge>
    </div>
    <p className="mt-2 text-xs text-ink-500">
      Crew cards combine craft assignment with local agency and country display hints.
    </p>
    <PeopleInSpaceList people={people} />
  </div>
);

// --------------------------------------------------------------------------- APOD

export const ApodSection = (props: {
  title: string;
  date: string;
  explanation: string;
  imageUrl: string;
  copyright?: string;
  mode?: "live" | "fallback";
}) => (
  <SCard className="overflow-hidden p-0">
    <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-stretch">
      <div className="space-y-4 p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <ToneBadge tone="purple">Astronomy Picture of the Day</ToneBadge>
          <SourcePill
            id="nasa-apod"
            label={props.mode === "live" ? "NASA APOD via worker" : "Curated APOD fallback"}
          />
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">{props.date}</p>
          <h3 className="mt-1 font-display text-2xl font-semibold leading-tight tracking-tight text-ink-50 sm:text-3xl">
            {props.title}
          </h3>
        </div>
        <p className="line-clamp-4 text-sm leading-relaxed text-ink-300">{props.explanation}</p>
        {props.copyright ? (
          <p className="text-xs text-ink-500">
            <span className="text-ink-400">Copyright:</span> {props.copyright}
          </p>
        ) : null}
        <p className="text-xs text-ink-500">
          {props.mode === "live"
            ? "Live mode: NASA APOD is being read through the SpaceSist worker route."
            : "Fallback mode: showing a curated APOD record because the worker feed did not load."}
        </p>
      </div>
      <a
        href={props.imageUrl}
        className="relative block min-h-[14rem] w-full border-l border-white/[0.08] bg-ink-950"
        target="_blank"
        rel="noreferrer"
      >
        <img
          src={props.imageUrl}
          alt={props.title}
          className="h-full w-full min-h-[14rem] object-cover lg:min-h-full"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
        <span className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-ink-950/60 px-2.5 py-1 text-xs font-medium text-ink-200 backdrop-blur">
          NASA imagery
        </span>
      </a>
    </div>
  </SCard>
);

// --------------------------------------------------------------------------- SpaceX

const statusLabel = (s: SpacexLaunchPreview["status"]) => {
  switch (s) {
    case "go":
      return "Go for launch (mock)";
    case "hold":
      return "Hold / recycle";
    case "tbd":
      return "TBD";
    case "success":
      return "Success";
    case "scrubbed":
      return "Scrubbed";
    default:
      return s;
  }
};

const statusTone = (s: SpacexLaunchPreview["status"]): "green" | "orange" | "purple" => {
  if (s === "go") return "green";
  if (s === "hold" || s === "scrubbed") return "orange";
  return "purple";
};

const fmtWhen = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short", hour12: true });
};

export const SpacexNextLaunchSection = ({
  launch,
  mode = "fallback",
}: {
  launch: SpacexLaunchPreview;
  mode?: "live" | "fallback";
}) => (
  <SCard className="p-5 sm:p-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <SectionTitle eyebrow="SpaceX" title="Next launch" />
        <p className="mt-1 text-xs text-ink-500">Latest scheduled Falcon / Starship class mission.</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <SourcePill
          id="spacex-api"
          label={mode === "live" ? "SpaceX via worker" : "Curated launch fallback"}
        />
        <a
          href={launch.webcastUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-md border border-signal-400/30 bg-signal-400/10 px-2.5 py-1 text-xs font-medium text-signal-400 transition hover:border-signal-400/50"
        >
          {launch.webcastLabel} ↗
        </a>
      </div>
    </div>
    <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_minmax(0,16rem)] sm:items-end">
      <div>
        <p className="text-xs font-medium text-ink-500">Mission</p>
        <h3 className="font-display text-2xl font-semibold text-ink-50">{launch.mission}</h3>
        <p className="mt-1 text-sm text-ink-400">{launch.rocket}</p>
        <p className="mt-2 text-sm text-ink-500">
          <span className="text-ink-500">Window:</span> {launch.windowSummary}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Telemetry
          label={mode === "live" ? "Launch time (normalized ISO)" : "Launch time (curated ISO)"}
          value={fmtWhen(launch.launchIso)}
          state="ok"
        />
        <Telemetry label="Pad" value={launch.site} state="ok" />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-medium text-ink-500">Status</span>
          <ToneBadge tone={statusTone(launch.status)}>{statusLabel(launch.status)}</ToneBadge>
        </div>
      </div>
    </div>
    <p className="mt-4 border-t border-white/[0.06] pt-4 text-xs leading-relaxed text-ink-500">
      {mode === "live"
        ? "Live mode: launch data is normalized through the SpaceSist worker route."
        : "Fallback mode: showing a curated launch snapshot because the worker feed did not load."}
    </p>
  </SCard>
);

// --------------------------------------------------------------------------- Space weather

const weatherTone = (status: SpaceWeatherSummaryView["status"]): "green" | "orange" | "purple" => {
  if (status === "active") return "orange";
  if (status === "watch") return "purple";
  return "green";
};

const weatherStatusLabel = (status: SpaceWeatherSummaryView["status"]) => {
  switch (status) {
    case "active":
      return "Active conditions";
    case "watch":
      return "Watch conditions";
    default:
      return "Quiet conditions";
  }
};

const weatherImpact = (kind: SpaceWeatherEventView["kind"]) => {
  switch (kind) {
    case "flare":
      return "Can affect radio communications, spacecraft operations, and solar-observing timelines.";
    case "cme":
      return "May drive later geomagnetic activity if Earth-directed; useful for satellite and aurora watch context.";
    case "geomagnetic-storm":
      return "Most relevant for aurora visibility, high-latitude comms, power-grid awareness, and some satellite operations.";
    default:
      return "";
  }
};

export const SpaceWeatherSection = ({
  summary,
  events,
  selectedEventId,
  onSelectEvent,
  loadingEventId,
  mode = "fallback",
}: {
  summary: SpaceWeatherSummaryView;
  events: SpaceWeatherEventView[];
  selectedEventId: string | null;
  onSelectEvent: (id: string) => void;
  loadingEventId?: string | null;
  mode?: "live" | "fallback";
}) => (
  <section className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
    <SCard className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <SectionTitle eyebrow="Solar activity" title="Space weather now" />
          <p className="mt-1 text-xs text-ink-500">
            Solar flares, coronal mass ejections, and geomagnetic storm activity normalized for SpaceSist.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SourcePill
            id={SPACE_FEED_SOURCES.weather.id}
            label={mode === "live" ? "NASA DONKI via worker" : "Curated DONKI fallback"}
          />
          <ToneBadge tone={weatherTone(summary.status)}>{weatherStatusLabel(summary.status)}</ToneBadge>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Telemetry
          label="Strongest flare"
          value={summary.strongestFlareClass ?? "None"}
          sub="Most intense flare in the current summary window"
          state="ok"
        />
        <Telemetry
          label="Max geomagnetic Kp"
          value={summary.maxKpIndex !== null ? summary.maxKpIndex.toFixed(2) : "None"}
          sub="Highest DONKI storm index observed in-window"
          state="ok"
        />
        <Telemetry
          label="Latest CME speed"
          value={summary.latestCmeSpeedKms !== null ? `${Math.round(summary.latestCmeSpeedKms)} km/s` : "Unknown"}
          sub="Most recent CME analysis speed estimate"
          state="ok"
        />
        <Telemetry
          label="Tracked events"
          value={`${summary.eventCounts.flares + summary.eventCounts.geomagneticStorms + summary.eventCounts.cmes}`}
          sub={`${summary.eventCounts.flares} flares · ${summary.eventCounts.cmes} CMEs · ${summary.eventCounts.geomagneticStorms} storms`}
          state="ok"
        />
      </div>
      <div className="mt-5 rounded-lg border border-white/[0.08] bg-white/[0.035] p-4">
        <p className="text-xs font-medium text-ufo-200">Latest headline</p>
        <p className="mt-2 text-sm leading-7 text-ink-200">
          {summary.latestHeadline ?? "No recent DONKI headline is available."}
        </p>
        <p className="mt-2 text-xs text-ink-500">
          {mode === "live"
            ? "Live mode: DONKI events are being read through the SpaceSist worker route."
            : "Fallback mode: showing curated space-weather context because the live DONKI feed did not load."}
        </p>
      </div>
    </SCard>

    <SCard className="p-5 sm:p-6">
      <SectionTitle eyebrow="Event timeline" title="Recent solar and geomagnetic events" />
      <div className="mt-4 space-y-3">
        {events.slice(0, 4).map((event) => (
          <div
            key={event.id}
            className={`rounded-lg border px-4 py-3 ${
              selectedEventId === event.id
                ? "border-ufo-300/30 bg-ufo-400/[0.07]"
                : "border-white/[0.07] bg-white/[0.035]"
            }`}
          >
            <button
              type="button"
              onClick={() => onSelectEvent(event.id)}
              className="w-full text-left"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-ink-100">{event.title}</span>
                <span className="rounded-full border border-white/[0.08] bg-ink-950/60 px-2 py-0.5 text-[11px] font-medium text-ink-300">
                  {loadingEventId === event.id ? "loading" : event.kind}
                </span>
              </div>
            </button>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-500">
              <span>{fmtUtc(new Date(event.startTime))} UTC</span>
              {event.severity ? <span>· {event.severity}</span> : null}
              {event.location ? <span>· {event.location}</span> : null}
            </div>
            {event.note ? (
              <p className="mt-2 text-xs leading-relaxed text-ink-400">{event.note}</p>
            ) : null}
            <p className="mt-2 text-xs leading-relaxed text-ink-500">
              {weatherImpact(event.kind)}
            </p>
            {event.linkedEventIds.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {event.linkedEventIds.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onSelectEvent(id)}
                    className="rounded-full border border-white/[0.08] bg-ink-950/60 px-2 py-0.5 text-[10px] font-medium text-ink-300"
                  >
                    linked · {id}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </SCard>
  </section>
);

// --------------------------------------------------------------------------- Space API status (dashboard)

const statusAccent = (kind: "iss" | "people" | "apod" | "spacex") => {
  switch (kind) {
    case "iss":
      return "border-l-ufo-300";
    case "people":
      return "border-l-sky-300";
    case "apod":
      return "border-l-sky-300/70";
    case "spacex":
      return "border-l-signal-400";
    default:
      return "border-l-zinc-600";
  }
};

export const SpaceApiStatusPanel = (props: {
  issLastUpdated: Date;
  issRefresh: RefreshState;
  issLat: number;
  issLon: number;
  peopleCount: number;
  apodDate: string;
  spacexMission: string;
  spacexStatusLabel: string;
  weatherHeadline: string | null;
  weatherStatusLabel: string;
  mode?: "live" | "fallback";
}) => {
  const issDetail =
    props.issRefresh === "loading"
      ? "Syncing position"
      : `${fmtLat(props.issLat)} · ${fmtLon(props.issLon)}`;
  const feedLabel = props.mode === "live" ? "worker feed" : "curated fallback";

  return (
    <SCard className="overflow-hidden p-0">
      <div className="border-b border-white/[0.08] bg-white/[0.025] px-4 py-3 sm:px-5">
        <p className="text-xs font-medium text-ufo-300">Integrations</p>
        <h3 className="mt-0.5 font-display text-sm font-semibold text-ink-100">Space API status</h3>
        <p className="mt-1 text-xs leading-relaxed text-ink-500">
          Feed provenance for the routed SpaceSist panels below.
        </p>
      </div>
      <ul className="divide-y divide-white/[0.06]">
        <li
          className={`flex flex-col gap-2 border-l-2 ${statusAccent("iss")} bg-white/[0.02] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5`}
        >
          <div className="min-w-0">
            <div className="text-sm font-medium text-ink-100">ISS location</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              <SourcePill id={SPACE_FEED_SOURCES.iss.id} label={SPACE_FEED_SOURCES.iss.short} />
              <span className="text-xs text-ink-500">{feedLabel}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold text-ufo-200">
              {props.issRefresh === "loading" ? "loading" : "tracking"}
            </div>
            <div className="mt-0.5 text-xs text-ink-500">
              {props.issRefresh === "loading" ? "—" : `last ${fmtUtc(props.issLastUpdated)} UTC`}
            </div>
            <div className="mt-1 line-clamp-1 text-xs text-ink-400">{issDetail}</div>
          </div>
        </li>
        <li
          className={`flex flex-col gap-2 border-l-2 ${statusAccent("people")} px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5`}
        >
          <div>
            <div className="text-sm font-medium text-ink-100">People in space</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              <SourcePill id={SPACE_FEED_SOURCES.people.id} label={SPACE_FEED_SOURCES.people.short} />
              <span className="text-xs text-ink-500">{feedLabel}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold text-ufo-200">ready</div>
            <div className="mt-0.5 text-xs text-ink-500">
              {props.peopleCount} crew records loaded
            </div>
          </div>
        </li>
        <li
          className={`flex flex-col gap-2 border-l-2 ${statusAccent("apod")} px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5`}
        >
          <div>
            <div className="text-sm font-medium text-ink-100">Space weather</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              <SourcePill id={SPACE_FEED_SOURCES.weather.id} label={SPACE_FEED_SOURCES.weather.short} />
              <span className="text-xs text-ink-500">{feedLabel}</span>
            </div>
          </div>
          <div className="min-w-0 text-right sm:max-w-[14rem]">
            <div className="text-xs font-semibold text-signal-400">{props.weatherStatusLabel}</div>
            <div className="mt-0.5 line-clamp-2 text-xs text-ink-400">
              {props.weatherHeadline ?? "No recent headline"}
            </div>
          </div>
        </li>
        <li
          className={`flex flex-col gap-2 border-l-2 ${statusAccent("apod")} px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5`}
        >
          <div>
            <div className="text-sm font-medium text-ink-100">NASA APOD</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              <SourcePill id={SPACE_FEED_SOURCES.apod.id} label={SPACE_FEED_SOURCES.apod.short} />
              <span className="text-xs text-ink-500">{feedLabel}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold text-ufo-200">ready</div>
            <div className="mt-0.5 text-xs text-ink-500">dated {props.apodDate}</div>
          </div>
        </li>
        <li
          className={`flex flex-col gap-2 border-l-2 ${statusAccent("spacex")} bg-white/[0.02] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5`}
        >
          <div>
            <div className="text-sm font-medium text-ink-100">SpaceX launches</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              <SourcePill id={SPACE_FEED_SOURCES.spacex.id} label={SPACE_FEED_SOURCES.spacex.short} />
              <span className="text-xs text-ink-500">{feedLabel}</span>
            </div>
          </div>
          <div className="min-w-0 text-right sm:max-w-[14rem]">
            <div className="text-xs font-semibold text-signal-400">watch</div>
            <div className="mt-0.5 truncate text-xs text-ink-400" title={props.spacexMission}>
              next · {props.spacexMission}
            </div>
            <div className="mt-0.5 text-xs text-ink-500">{props.spacexStatusLabel}</div>
          </div>
        </li>
      </ul>
    </SCard>
  );
};

// --------------------------------------------------------------------------- hook for ISS refresh

export function useMockIssSync(initial: IssSnapshot) {
  const [iss, setIss] = useState<IssSnapshot>(initial);
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const [refresh, setRefresh] = useState<RefreshState>("idle");

  const nudge = useCallback(() => {
    setIss((prev) => {
      const dLat = (Math.random() - 0.5) * 0.12;
      const dLon = (Math.random() - 0.5) * 0.18;
      return {
        ...prev,
        latitude: Math.max(-60, Math.min(60, prev.latitude + dLat)),
        longitude: ((prev.longitude + dLon + 540) % 360) - 180,
        altitudeKm: Math.round(418 + Math.random() * 8),
        velocityKmh: Math.round(27500 + Math.random() * 300),
        dayNight: Math.random() > 0.45 ? "day" : "night",
      };
    });
    setLastUpdated(new Date());
  }, []);

  const onRefresh = useCallback(() => {
    if (refresh === "loading") return;
    setRefresh("loading");
    window.setTimeout(() => {
      nudge();
      setRefresh("idle");
    }, 700);
  }, [nudge, refresh]);

  useEffect(() => {
    const t = window.setInterval(() => {
      nudge();
    }, 10_000);
    return () => window.clearInterval(t);
  }, [nudge]);

  return { iss, lastUpdated, refresh, onRefresh };
}
