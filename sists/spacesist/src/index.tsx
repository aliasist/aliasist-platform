import type { SistManifest } from "@aliasist/ui";
import { manifestMeta } from "./manifest-meta";
import { SpaceSistRoutes } from "./routes";

export const manifest: SistManifest = {
  ...manifestMeta,
  element: SpaceSistRoutes,
};

export { SpaceSistRoutes } from "./routes";
