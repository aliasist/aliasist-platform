import { lazy, type ComponentType } from "react";
import type { SistManifest } from "@aliasist/ui";
import { manifestMeta as dataMeta } from "@aliasist/sist-data/manifest-meta";
import { manifestMeta as ecoMeta } from "@aliasist/sist-eco/manifest-meta";
import { manifestMeta as spaceMeta } from "@aliasist/sist-space/manifest-meta";

const lazyData = lazy(() =>
  import("@aliasist/sist-data").then((m) => ({ default: m.DataSistRoutes })),
);
const lazyEco = lazy(() =>
  import("@aliasist/sist-eco").then((m) => ({ default: m.EcoSistRoutes })),
);
const lazySpace = lazy(() =>
  import("@aliasist/sist-space").then((m) => ({ default: m.SpaceSistRoutes })),
);

/** Unused for `coming-soon` routes; satisfies `SistManifest.element`. */
const noopSistRoot: ComponentType<object> = () => null;

/**
 * Active sists: metadata is eager (manifest-meta); route trees load on demand.
 * Pulse remains an inline placeholder until the package lands.
 */
export const sists: SistManifest[] = [
  { ...dataMeta, element: lazyData },
  { ...ecoMeta, element: lazyEco },
  { ...spaceMeta, element: lazySpace },
  {
    id: "pulse",
    name: "PulseSist",
    tagline: "Markets pedagogy — tickers, flows, and teach-me-what-moved.",
    path: "/pulse",
    element: noopSistRoot,
    accent: "ufo",
    icon: "▲",
    status: "coming-soon",
  },
];
