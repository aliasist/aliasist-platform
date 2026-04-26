import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type IssSnapshot,
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
      className={`relative overflow-hidden rounded-lg border border-memory-green/20 bg-gradient-to-b from-[#0a1628] to-memory-void ${className}`}
    >
      {loading ? (
        <div
          className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center bg-black/25 backdrop-blur-[1px]"
          aria-hidden
        >
          <span className="rounded-md border border-memory-green/20 bg-black/50 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-memory-green">
            Refreshing fix…
          </span>
        </div>
      ) : null}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(52,211,153,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(167,139,250,0.04)_1px,transparent_1px)] bg-[length:18px_18px] opacity-60"
        aria-hidden
      />
      <div className="absolute left-2 top-2 z-10 max-w-[85%]">
        <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-memory-green/90">
          Global pass · equirectangular (mock)
        </p>
        <p className="mt-0.5 text-[9px] text-zinc-500">Recent ground track + ISS fix (static demo)</p>
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
          stroke="rgba(52,211,153,0.45)"
          strokeWidth="1.2"
          strokeDasharray="5 4"
          strokeLinecap="round"
        />
        <circle
          cx={pIss.x}
          cy={pIss.y}
          r="4.5"
          fill="#34d399"
          className="drop-shadow-[0_0_10px_rgba(52,211,153,0.9)]"
        />
        <circle cx={pIss.x} cy={pIss.y} r="9" fill="none" stroke="rgba(52,211,153,0.5)" strokeWidth="0.6" />
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
              className="font-mono text-[10px] text-zinc-500"
              dateTime={lastUpdated.toISOString()}
            >
              Last updated {fmtUtc(lastUpdated)} UTC
            </time>
            <button
              type="button"
              onClick={onRefresh}
              disabled={refresh === "loading"}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-memory-green/30 bg-memory-green/[0.08] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-memory-green transition hover:border-memory-green/50 hover:bg-memory-green/15 disabled:cursor-wait disabled:opacity-60"
            >
              {refresh === "loading" ? (
                <>
                  <span className="inline-block size-2 animate-pulse rounded-full bg-memory-green shadow-[0_0_8px_#34d399]" />
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
        <p className="text-xs text-memory-orange" role="status">
          Mock refresh failed — retry in production when API routes are live.
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
          label="Inertial speed (mock)"
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
            className={`h-full rounded-full bg-gradient-to-r from-memory-green via-memory-purple to-memory-orange shadow-[0_0_12px_rgba(52,211,153,0.45)] ${
              refresh === "loading" ? "animate-pulse" : ""
            }`}
            style={{ width: `${Math.min(100, trackPct)}%` }}
          />
        </div>
        <p className="text-[10px] leading-relaxed text-zinc-500">
          Orbit progress bar is decorative for this build; production should bind to real epoch / TLE
          data from NASA or a trusted orbital propagator.
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
        className="group flex items-stretch gap-3 rounded-xl border border-white/[0.08] bg-gradient-to-r from-white/[0.04] to-transparent p-3 transition hover:border-memory-purple/20"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-memory-purple/20 bg-gradient-to-br from-memory-purple/25 to-memory-green/10 font-mono text-sm font-semibold text-zinc-100 shadow-[0_0_24px_-8px_rgba(167,139,250,0.5)]">
          {initialsFor(person.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium leading-tight text-zinc-100">{person.name}</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
            <span className="font-mono text-zinc-400">{person.agency}</span>
            <span className="text-zinc-600">·</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
              {person.countryCode}
            </span>
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end justify-center text-right">
          <span className="rounded-md border border-memory-green/30 bg-memory-green/[0.1] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-memory-green">
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
      <ToneBadge tone="green">{countOrbiters} human orbiters (mock)</ToneBadge>
    </div>
    <p className="mt-2 text-xs text-zinc-500">
      Cards use Open Notify&rsquo;s <code className="text-memory-green/90">/astros.json</code>{" "}
      name and craft fields, plus local agency and country display hints.
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
}) => (
  <SCard className="overflow-hidden p-0">
    <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-stretch">
      <div className="space-y-4 p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <ToneBadge tone="purple">Astronomy Picture of the Day</ToneBadge>
          <SourcePill id="nasa-apod" label="NASA APOD (future: api.nasa.gov)" />
        </div>
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">{props.date}</p>
          <h3 className="mt-1 font-display text-2xl font-semibold leading-tight tracking-tight text-zinc-50 sm:text-3xl">
            {props.title}
          </h3>
        </div>
        <p className="line-clamp-4 text-sm leading-relaxed text-zinc-400">{props.explanation}</p>
        {props.copyright ? (
          <p className="text-[11px] text-zinc-600">
            <span className="text-zinc-500">Copyright:</span> {props.copyright}
          </p>
        ) : null}
        <p className="text-[10px] text-zinc-600">
          Wire-up: read NASA APOD through a cached SpaceSist worker route; render{" "}
          <code className="text-memory-green/80">url</code> or <code className="text-memory-green/80">hdurl</code>{" "}
          from the response without exposing keys in the browser.
        </p>
      </div>
      <a
        href={props.imageUrl}
        className="relative block min-h-[14rem] w-full border-l border-white/[0.08] bg-memory-void"
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
        <span className="absolute bottom-3 left-3 rounded border border-white/10 bg-black/50 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-300">
          NASA imagery (mock → APOD url)
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

export const SpacexNextLaunchSection = ({ launch }: { launch: SpacexLaunchPreview }) => (
  <SCard className="p-5 sm:p-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <SectionTitle eyebrow="SpaceX" title="Next launch" />
        <p className="mt-1 text-xs text-zinc-500">Latest scheduled Falcon / Starship class mission (static preview).</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <SourcePill id="spacex-api" label="r/SpaceX API (future)" />
        <a
          href={launch.webcastUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-md border border-memory-orange/30 bg-memory-orange/10 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-memory-orange transition hover:border-memory-orange/50"
        >
          {launch.webcastLabel} ↗
        </a>
      </div>
    </div>
    <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_minmax(0,16rem)] sm:items-end">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">Mission</p>
        <h3 className="font-display text-2xl font-semibold text-zinc-50">{launch.mission}</h3>
        <p className="mt-1 font-mono text-sm text-zinc-400">{launch.rocket}</p>
        <p className="mt-2 text-sm text-zinc-500">
          <span className="text-zinc-600">Window:</span> {launch.windowSummary}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Telemetry label="Local time (mock ISO)" value={fmtWhen(launch.launchIso)} state="ok" />
        <Telemetry label="Pad" value={launch.site} state="ok" />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">Status</span>
          <ToneBadge tone={statusTone(launch.status)}>{statusLabel(launch.status)}</ToneBadge>
        </div>
      </div>
    </div>
    <p className="mt-4 border-t border-white/[0.06] pt-4 text-[10px] leading-relaxed text-zinc-600">
      Replace mock with <code className="text-memory-green/80">/v5/launches/next</code> from the
      community r/SpaceX API, or a cached worker proxy for CORS and rate limits.
    </p>
  </SCard>
);

// --------------------------------------------------------------------------- Space API status (dashboard)

const statusAccent = (kind: "iss" | "people" | "apod" | "spacex") => {
  switch (kind) {
    case "iss":
      return "border-l-memory-green";
    case "people":
      return "border-l-memory-purple";
    case "apod":
      return "border-l-memory-purple/70";
    case "spacex":
      return "border-l-memory-orange";
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
}) => {
  const issDetail =
    props.issRefresh === "loading"
      ? "Syncing mock fix…"
      : `${fmtLat(props.issLat)} · ${fmtLon(props.issLon)} · mock`;

  return (
    <SCard className="overflow-hidden p-0">
      <div className="border-b border-white/[0.08] bg-black/25 px-4 py-3 sm:px-5">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">Integrations</p>
        <h3 className="mt-0.5 font-display text-sm font-semibold text-zinc-100">Space API status</h3>
        <p className="mt-1 text-[10px] leading-relaxed text-zinc-500">
          Four feeds the dashboard will use in production. All are{" "}
          <span className="text-memory-orange">mock</span> until API routes or client proxies are enabled — no keys in
          the browser.
        </p>
      </div>
      <ul className="divide-y divide-white/[0.06]">
        <li
          className={`flex flex-col gap-2 border-l-2 ${statusAccent("iss")} bg-white/[0.02] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5`}
        >
          <div className="min-w-0">
            <div className="text-sm font-medium text-zinc-100">ISS location</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              <SourcePill id={SPACE_FEED_SOURCES.iss.id} label={SPACE_FEED_SOURCES.iss.short} />
              <span className="text-[9px] uppercase tracking-[0.12em] text-zinc-600">mode · mock</span>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[11px] text-memory-green">
              {props.issRefresh === "loading" ? "loading" : "tracking"}
            </div>
            <div className="mt-0.5 font-mono text-[9px] text-zinc-500">
              {props.issRefresh === "loading" ? "—" : `last ${fmtUtc(props.issLastUpdated)} UTC`}
            </div>
            <div className="mt-1 line-clamp-1 font-mono text-[9px] text-zinc-400">{issDetail}</div>
          </div>
        </li>
        <li
          className={`flex flex-col gap-2 border-l-2 ${statusAccent("people")} px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5`}
        >
          <div>
            <div className="text-sm font-medium text-zinc-100">People in space</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              <SourcePill id={SPACE_FEED_SOURCES.people.id} label={SPACE_FEED_SOURCES.people.short} />
              <span className="text-[9px] uppercase tracking-[0.12em] text-zinc-600">mode · mock</span>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[11px] text-memory-green">ready</div>
            <div className="mt-0.5 font-mono text-[9px] text-zinc-500">
              {props.peopleCount} assigned (static manifest)
            </div>
          </div>
        </li>
        <li
          className={`flex flex-col gap-2 border-l-2 ${statusAccent("apod")} px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5`}
        >
          <div>
            <div className="text-sm font-medium text-zinc-100">NASA APOD</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              <SourcePill id={SPACE_FEED_SOURCES.apod.id} label={SPACE_FEED_SOURCES.apod.short} />
              <span className="text-[9px] uppercase tracking-[0.12em] text-zinc-600">mode · mock</span>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[11px] text-memory-green">ready</div>
            <div className="mt-0.5 font-mono text-[9px] text-zinc-500">dated {props.apodDate}</div>
          </div>
        </li>
        <li
          className={`flex flex-col gap-2 border-l-2 ${statusAccent("spacex")} bg-white/[0.02] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5`}
        >
          <div>
            <div className="text-sm font-medium text-zinc-100">SpaceX launches</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              <SourcePill id={SPACE_FEED_SOURCES.spacex.id} label={SPACE_FEED_SOURCES.spacex.short} />
              <span className="text-[9px] uppercase tracking-[0.12em] text-zinc-600">mode · mock</span>
            </div>
          </div>
          <div className="min-w-0 text-right sm:max-w-[14rem]">
            <div className="font-mono text-[11px] text-memory-orange">watch</div>
            <div className="mt-0.5 truncate font-mono text-[9px] text-zinc-400" title={props.spacexMission}>
              next · {props.spacexMission}
            </div>
            <div className="mt-0.5 font-mono text-[9px] text-zinc-500">{props.spacexStatusLabel}</div>
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
