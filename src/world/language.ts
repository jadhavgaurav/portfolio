/**
 * Colour, and where it comes from.
 *
 * The old world was one grey. That was a defensible restraint on a document
 * and indefensible on a place: the record contains eight distinct ecosystems
 * and rendered every one of them in the same stone.
 *
 * The hues are GitHub's own language colours. They are not invented — anyone
 * who has looked at a repository page has already learned them, so a blue
 * district reads as TypeScript before any label says so, and a bar chart of
 * this data anywhere else will agree with the world.
 *
 * Three values per language, because a renderer needs three different things:
 *
 *   ui        the true hue, for interface, minimap and labels
 *   surface   the same hue, held for large-area fill — a light source hits
 *             it and it visibly is that colour, not a hint of it
 *   emissive  what the seams, signage and district lights are lit with
 */

export interface LanguageStyle {
  ui: string;
  surface: string;
  emissive: string;
  /** Shown on signage and in the index. */
  label: string;
}

export const LANGUAGE_STYLE: Record<string, LanguageStyle> = {
  Python: { ui: "#4B8BBE", surface: "#5B9BD3", emissive: "#7FC1F5", label: "Python" },
  "Jupyter Notebook": { ui: "#DA5B0B", surface: "#F07C2E", emissive: "#FFA855", label: "Notebooks" },
  TypeScript: { ui: "#3178C6", surface: "#4A8FDB", emissive: "#7BB3F0", label: "TypeScript" },
  JavaScript: { ui: "#F1E05A", surface: "#F5DE6E", emissive: "#FFF0A0", label: "JavaScript" },
  Java: { ui: "#B07219", surface: "#D69434", emissive: "#F5B559", label: "Java" },
  PHP: { ui: "#7A86B8", surface: "#8F9BD1", emissive: "#B4BEEA", label: "PHP" },
  Dart: { ui: "#00B4AB", surface: "#2CD1C6", emissive: "#6FEAE1", label: "Dart" },
  Other: { ui: "#8b979c", surface: "#A3AFB4", emissive: "#C6D0D3", label: "Other" },
};

export const styleFor = (language: string): LanguageStyle =>
  LANGUAGE_STYLE[language] ?? LANGUAGE_STYLE.Other;

/**
 * The districts.
 *
 * Order is deliberate rather than alphabetical: it is the order the subject
 * arrived at each ecosystem, so walking the ring outward from the hub is
 * still walking the history, and the two readings do not contradict.
 *
 * `angle` is where the district sits on the ring, `radius` how far out. The
 * two busiest get the most room; the single-repository ones sit closer in so
 * the walk between them is short.
 */
export interface District {
  language: string;
  angle: number;
  radius: number;
  /** Footprint radius. Structures are scattered inside this. */
  spread: number;
}

const TAU = Math.PI * 2;

/* Evenly spaced round the ring. Hand-picked angles bunched Other against
   Java and Dart against JavaScript closely enough that their labels collided
   on the map and their pads nearly touched in the world. An eighth of a turn
   each guarantees the separation; the variety comes from radius and spread,
   which are sized by how many repositories each district actually holds. */
export const DISTRICTS: District[] = [
  { language: "Python", angle: TAU * 0.0, radius: 186, spread: 62 },
  { language: "Jupyter Notebook", angle: TAU * 0.125, radius: 176, spread: 54 },
  { language: "TypeScript", angle: TAU * 0.25, radius: 182, spread: 58 },
  { language: "JavaScript", angle: TAU * 0.375, radius: 138, spread: 30 },
  { language: "Java", angle: TAU * 0.5, radius: 142, spread: 32 },
  { language: "Other", angle: TAU * 0.625, radius: 132, spread: 28 },
  { language: "PHP", angle: TAU * 0.75, radius: 118, spread: 20 },
  { language: "Dart", angle: TAU * 0.875, radius: 116, spread: 20 },
];

export const districtFor = (language: string): District =>
  DISTRICTS.find((d) => d.language === language) ?? DISTRICTS[DISTRICTS.length - 1];

/** Where a district's centre lands on the ground. */
export function districtCentre(d: District): [number, number] {
  return [Math.sin(d.angle) * d.radius, -Math.cos(d.angle) * d.radius];
}
