import type { SistManifest } from "@aliasist/ui";
import { manifest as dataManifest } from "@aliasist/sist-data";
import { manifest as ecoManifest } from "@aliasist/sist-eco";

/**
 * Static registry of active sists. Each sist ships its own manifest so the
 * portal only needs to import and register. New sists = add one line.
 *
 * "Coming-soon" placeholders are defined inline until their packages land.
 */
export const sists: SistManifest[] = [
  dataManifest,
  ecoManifest,
  {
    id: "pulse",
    name: "PulseSist",
    tagline: "Markets pedagogy — tickers, flows, and teach-me-what-moved.",
    path: "/pulse",
    element: () => null,
    accent: "ufo",
    icon: "▲",
    status: "coming-soon",
  },
  {
    id: "space",
    name: "SpaceSist",
    tagline: "NASA-themed missions, imagery, and space data.",
    path: "/space",
    element: () => null,
    accent: "ink",
    icon: "☄",
    status: "coming-soon",
  },
  {
    id: "tika",
    name: "TikaSist",
    tagline: "Social signal monitor — keywords, videos, scan history.",
    path: "/tika",
    element: () => null,
    accent: "signal",
    icon: "◐",
    status: "coming-soon",
  },
];
