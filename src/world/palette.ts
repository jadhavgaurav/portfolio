/**
 * The palette, taken verbatim from NULL's approved Study 14 (Colour) and
 * Study 12 (Lighting). Not invented here — these values already passed the
 * pre-production gate with a recorded verdict, including a provenance check
 * showing zero foreign hues.
 */

export const LIGHT = {
  /** Dominant raking key. */
  key: "#d5d0c5",
  keyPos: [-24, 30, 18] as const,
  keyTarget: [8.771, 6.5, -28.689] as const,
  keyIntensity: 11.5,
  fill: "#9aa4a5",
  sky: "#9ca6ae",
  /* Aerial perspective. Distance must fall away into the dark, not bleach
     into the sky colour — the sky value is a light source, not a fog value. */
  aerial: "#171b1e",
  aerialFar: "#0d0f10",
} as const;

/** Motivated emissives only — Rule L1. Every glow has a source in the world. */
export const EMISSIVE = {
  baseline: "#777f7d",
  interaction: "#7a918e",
  reward: "#43665e",
  phaseJoint: "#223530",
} as const;

export const SURFACE = {
  foundation: "#524e45",
  constructed: "#63696a",
  active: "#6d7476",
  organic: "#4a5750",
  ruined: "#2e2d26",
  ground: "#191d1f",
} as const;

/** Interface layer. Reads over the world without becoming a dashboard. */
export const UI = {
  ground: "#0d0f10",
  panel: "#181b1d",
  border: "#2a2f32",
  borderActive: "#525b5e",
  textMuted: "#747e84",
  textSecondary: "#9eaab0",
  textHighlight: "#c8c8c8",
  textPrimary: "#e2e8f0",
} as const;

import type { MaterialFamily } from "./telemetry";

export const FAMILY_SURFACE: Record<MaterialFamily, string> = {
  FOUNDATION: SURFACE.foundation,
  CONSTRUCTED: SURFACE.constructed,
  ACTIVE: SURFACE.active,
  ORGANIC: SURFACE.organic,
  RUINED: SURFACE.ruined,
};

export const FAMILY_ROUGHNESS: Record<MaterialFamily, number> = {
  FOUNDATION: 0.94,
  CONSTRUCTED: 0.62,
  ACTIVE: 0.48,
  ORGANIC: 0.86,
  RUINED: 0.98,
};

export const FAMILY_METALNESS: Record<MaterialFamily, number> = {
  FOUNDATION: 0.02,
  CONSTRUCTED: 0.34,
  ACTIVE: 0.42,
  ORGANIC: 0.08,
  RUINED: 0.05,
};
