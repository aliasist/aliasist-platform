import type { SistManifest } from "@aliasist/ui";
import { EcoSistRoutes } from "./routes";

export const manifest: SistManifest = {
  id: "eco",
  name: "EcoSist",
  tagline:
    "Earth signals — alerts, quakes, wildfires, volcanoes, and space weather on one map.",
  path: "/eco",
  element: EcoSistRoutes,
  accent: "signal",
  icon: "◈",
  status: "live",
};

export { EcoSistRoutes } from "./routes";
