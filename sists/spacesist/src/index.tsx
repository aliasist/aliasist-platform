import type { SistManifest } from "@aliasist/ui";
import { SpaceSistRoutes } from "./routes";

export const manifest: SistManifest = {
  id: "space",
  name: "SpaceSist",
  tagline: "Project memory—spaces, notes, RAG context, and ask-the-workspace (human-facing).",
  path: "/space",
  element: SpaceSistRoutes,
  accent: "ink",
  icon: "☄",
  status: "alpha",
};

export { SpaceSistRoutes } from "./routes";
