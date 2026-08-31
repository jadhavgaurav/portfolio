/**
 * The palette.
 *
 * The previous version authored every colour "two and a half stops under" a
 * renderer running at toneMappingExposure 3.3 — a convention that meant a
 * district's true colour (say Python's #4B8BBE) was stored as a near-black
 * navy (#1b3448) and relied on the exposure multiplier to lift it back. That
 * is fragile by construction: get the exposure or the stop count even
 * slightly wrong anywhere in the pipeline and every surface in the world
 * reads as grey mud, which is exactly what happened. The renderer now runs
 * at a normal exposure (GameCanvas.tsx) and every value below is the colour
 * that is meant to appear on screen, full stop.
 */

export const LIGHT = {
  /** Warm daylight key, raking across the world rather than behind the
   *  player, so faces the player walks toward are lit rather than shadowed. */
  key: "#fff3d6",
  keyPos: [-46, 60, -58] as const,
  keyTarget: [6, 8, -150] as const,
  /* ACES filmic tone mapping desaturates toward white as radiance climbs —
     the classic "everything looks washed out" symptom is almost always this,
     not a colour problem. Total incident light (hemisphere + fill + key)
     times exposure has to stay well inside the curve's true-colour range,
     not its highlight rolloff. */
  keyIntensity: 1.3,
  /** Cool sky-bounce fill, so shadow faces read as "in shade" rather than
   *  "unlit". */
  fill: "#bcd7f2",
  sky: "#8fd0f0",
  /** A light, barely-there haze — atmosphere for scale, not a mood device
   *  hiding the world in grey. */
  aerial: "#cfe6f7",
  aerialFar: "#a9d4ef",
} as const;

/** Motivated emissives only — Rule L1. Every glow has a source in the world. */
export const EMISSIVE = {
  baseline: "#ffe9a8",
  interaction: "#ffd35c",
  reward: "#ffb703",
  phaseJoint: "#5cd6c0",
} as const;

export const SURFACE = {
  foundation: "#d8c9a3",
  constructed: "#e7c98f",
  active: "#f2d98a",
  organic: "#7fb96a",
  ruined: "#8a7d63",
  /** Grass. Districts sit on their own coloured pads on top of this. Kept
   *  more saturated than it should need to be: the ground plane's normal
   *  points straight up, so a hemisphere light's *sky* term (near-white
   *  here) dominates its shading almost entirely — the groundColor term
   *  only lights undersides, not the ground itself — and that plus the warm
   *  key light will wash out anything short of a genuinely deep, saturated
   *  green. */
  ground: "#2f9e2a",
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
