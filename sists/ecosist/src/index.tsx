import type { SistManifest } from "@aliasist/ui";
import { EcoSistRoutes } from "./routes";

export const manifest: SistManifest = {
  id: "eco",
  name: "EcoSist",
  tagline: "Severe weather lab — radar, alerts, storm reports, AI storm tutor.",
  path: "/eco",
  element: EcoSistRoutes,
  accent: "signal",
  icon: "⌁",
  status: "alpha",
};

export { EcoSistRoutes } from "./routes";
