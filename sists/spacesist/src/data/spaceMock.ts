/**
 * Mock SpaceSist data. Fields that do not exist in upstream responses are
 * local UI enrichment so future clients can keep the dashboard shape stable.
 */

export type SpacePerson = {
  name: string;
  craft: string;
  /** Local UI enrichment; Open Notify returns name + craft only. */
  agency: string;
  /** Local UI enrichment; two-letter country hint for UI. */
  countryCode: string;
};

export type IssSnapshot = {
  latitude: number;
  longitude: number;
  /** km */
  altitudeKm: number;
  /** km/h */
  velocityKmh: number;
  dayNight: "day" | "night" | "terminator";
};

/** Orbit / ground track points for map overlay (equirectangular 0..360, -90..90) */
export const MOCK_GROUND_TRACK: { lon: number; lat: number }[] = [
  { lon: -160, lat: 12 },
  { lon: -120, lat: 22 },
  { lon: -80, lat: 35 },
  { lon: -40, lat: 42 },
  { lon: 0, lat: 38 },
  { lon: 40, lat: 28 },
  { lon: 100, lat: 8 },
  { lon: 140, lat: -12 },
  { lon: 175, lat: -28 },
  { lon: -175, lat: -40 },
  { lon: -140, lat: -25 },
  { lon: -100, lat: 5 },
  { lon: -60, lat: 18 },
];

export const MOCK_ISS: IssSnapshot = {
  latitude: 27.6421,
  longitude: -141.3284,
  altitudeKm: 421,
  velocityKmh: 27600,
  dayNight: "day",
};

export const MOCK_PEOPLE_IN_SPACE: SpacePerson[] = [
  { name: "Jasmin Moghbeli", craft: "ISS", agency: "NASA", countryCode: "US" },
  { name: "Satoshi Furukawa", craft: "ISS", agency: "JAXA", countryCode: "JP" },
  { name: "Andreas Mogensen", craft: "ISS", agency: "ESA", countryCode: "DK" },
  { name: "Konstantin Borisov", craft: "ISS", agency: "Roscosmos", countryCode: "RU" },
  { name: "Oleg Kononenko", craft: "ISS", agency: "Roscosmos", countryCode: "RU" },
  { name: "Nikolai Chub", craft: "ISS", agency: "Roscosmos", countryCode: "RU" },
];

/**
 * Public-domain APOD still — swap for `apod.url` from api.nasa.gov when wired.
 * NASA APOD page allows this image to illustrate the Astronomy Picture of the Day.
 */
export const MOCK_APOD = {
  title: "Spiral galaxy NGC 4414",
  date: "2024-10-19",
  explanation:
    "The magnificent spiral NGC 4414 is 60 million light-years from Earth, toward the northern constellation Coma Berenices. A brilliant ring of hot young stars, captured in the blue outer spiral arms, is revealed by the Hubble view. A dense yellow nucleus of old stars anchors a spectrum of color from the galactic center.",
  imageUrl: "https://images-assets.nasa.gov/image/PIA12348/PIA12348~medium.jpg",
  copyright: "NASA, ESA, and The Hubble Key Project Team (mock — use APOD API `url` in production)",
} as const;

export type SpacexLaunchStatus =
  | "go"
  | "hold"
  | "tbd"
  | "success"
  | "scrubbed";

export type SpacexLaunchPreview = {
  mission: string;
  rocket: string;
  launchIso: string;
  site: string;
  status: SpacexLaunchStatus;
  webcastLabel: string;
  webcastUrl: string;
  /** Human headline for the window */
  windowSummary: string;
};

export const MOCK_SPACEX_NEXT: SpacexLaunchPreview = {
  mission: "Starlink 12-16",
  rocket: "Falcon 9 Block 5",
  launchIso: "2026-04-28T22:15:00.000Z",
  site: "SLC-40, Cape Canaveral SFS",
  status: "go",
  webcastLabel: "SpaceX / YouTube (mock)",
  webcastUrl: "https://www.youtube.com/c/SpaceX",
  windowSummary: "T–02d 19h 04m (mock clock)",
};

export const ISS_SOURCES = {
  position: { id: "wheretheiss", label: "Where The ISS" },
  crew: { id: "open-notify", label: "Open Notify" },
} as const;

/** Source ids for the dashboard “Space API status” table — all mock until worker routes exist. */
export const SPACE_FEED_SOURCES = {
  iss: { id: "wheretheiss", short: "Where The ISS" },
  people: { id: "open-notify", short: "Open Notify" },
  apod: { id: "nasa-apod", short: "api.nasa.gov" },
  spacex: { id: "spacex-api", short: "api.spacexdata.com" },
} as const;
