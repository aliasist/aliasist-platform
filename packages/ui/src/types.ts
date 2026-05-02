import type { ComponentType, LazyExoticComponent, ReactNode } from "react";

/** Route root mounted by the portal (`React.lazy` or a synchronous component). */
export type SistRouteElement =
  | ComponentType<object>
  | LazyExoticComponent<ComponentType<object>>;

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
  /** Route tree for this sist; the portal usually wraps this in `React.lazy`. */
  element: SistRouteElement;
  /** Accent color token from the Aliasist palette. */
  accent: "ufo" | "signal" | "ink";
  /** Short glyph (emoji or svg node). */
  icon: ReactNode;
  /** Lifecycle state — shown as a badge in the switcher. */
  status: "live" | "beta" | "alpha" | "coming-soon";
}

/** Manifest fields shared everywhere except the route component (safe to import eagerly). */
export type SistManifestMeta = Omit<SistManifest, "element">;
