import type { SistManifest } from "@aliasist/ui";
import { DataSistRoutes } from "./routes";

export const manifest: SistManifest = {
  id: "data",
  name: "DataSist",
  tagline: "AI data center intelligence — live map, curated entries, community notes.",
  path: "/data",
  element: DataSistRoutes,
  accent: "ufo",
  icon: "◎",
  status: "live",
};

export { DataSistRoutes } from "./routes";
