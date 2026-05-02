import type { SistManifest } from "@aliasist/ui";
import { manifestMeta } from "./manifest-meta";
import { EcoSistRoutes } from "./routes";

export const manifest: SistManifest = {
  ...manifestMeta,
  element: EcoSistRoutes,
};

export { EcoSistRoutes } from "./routes";
