import type { SistManifest } from "@aliasist/ui";
import { SpaceSistRoutes } from "./routes";

export const manifest: SistManifest = {
  id: "space",
  name: "SpaceSist",
  tagline: "Space intelligence: ISS tracking, NASA imagery, SpaceX launches, and astronomy context.",
  path: "/space",
  element: SpaceSistRoutes,
  accent: "ink",
  icon: "☄",
  status: "alpha",
};

export { SpaceSistRoutes } from "./routes";
