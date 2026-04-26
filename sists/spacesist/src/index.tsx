import type { SistManifest } from "@aliasist/ui";
import { SpaceSistRoutes } from "./routes";

export const manifest: SistManifest = {
  id: "space",
  name: "SpaceSist",
  tagline: "NASA-themed missions, imagery, and space data.",
  path: "/space",
  element: SpaceSistRoutes,
  accent: "ink",
  icon: "☄",
  status: "alpha",
};

export { SpaceSistRoutes } from "./routes";
