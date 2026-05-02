import type { SistManifest } from "@aliasist/ui";
import { manifestMeta } from "./manifest-meta";
import { DataSistRoutes } from "./routes";

export const manifest: SistManifest = {
  ...manifestMeta,
  element: DataSistRoutes,
};

export { DataSistRoutes } from "./routes";
