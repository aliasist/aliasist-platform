import type { ComponentType, ReactNode } from "react";

/**
 * A "sist" is a first-class feature module inside the Aliasist Intelligence Suite.
 * Each sist declares a manifest that the portal consumes to build navigation,
 * the app switcher, and per-app theming.
 */
export interface SistManifest {
  /** Unique id used in URLs (e.g. "data", "eco"). */
  id: string;
  /** Human-readable product name (e.g. "DataSist"). */
  name: string;
  /** One-line tagline shown in the app switcher. */
  tagline: string;
  /** Route base (e.g. "/data"). */
  path: string;
  /** Lazy-loaded routes element. */
  element: ComponentType;
  /** Accent color token from the Aliasist palette. */
  accent: "ufo" | "signal" | "ink";
  /** Short glyph (emoji or svg node). */
  icon: ReactNode;
  /** Lifecycle state — shown as a badge in the switcher. */
  status: "live" | "beta" | "alpha" | "coming-soon";
}
