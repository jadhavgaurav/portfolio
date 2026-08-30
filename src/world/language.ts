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
 *   surface   the same hue two and a half stops down, because the renderer
 *             runs at an exposure of 3.3 and a face-value colour blows out
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
  Python: { ui: "#4B8BBE", surface: "#1b3448", emissive: "#2f6f9e", label: "Python" },
  "Jupyter Notebook": { ui: "#DA5B0B", surface: "#4a2207", emissive: "#a8460c", label: "Notebooks" },
  TypeScript: { ui: "#3178C6", surface: "#152c49", emissive: "#2a63a3", label: "TypeScript" },
  JavaScript: { ui: "#F1E05A", surface: "#4a441a", emissive: "#b5a637", label: "JavaScript" },
  Java: { ui: "#B07219", surface: "#3b2709", emissive: "#8a5813", label: "Java" },
  PHP: { ui: "#7A86B8", surface: "#252a44", emissive: "#4f5a8c", label: "PHP" },
  Dart: { ui: "#00B4AB", surface: "#053b38", emissive: "#00817a", label: "Dart" },
  Other: { ui: "#8b979c", surface: "#2a3033", emissive: "#5a666b", label: "Other" },
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

export const DISTRICTS: District[] = [
  { language: "Java", angle: 0.0, radius: 132, spread: 34 },
  { language: "PHP", angle: TAU * 0.13, radius: 108, spread: 22 },
  { language: "Python", angle: TAU * 0.27, radius: 178, spread: 62 },
  { language: "Jupyter Notebook", angle: TAU * 0.45, radius: 168, spread: 54 },
  { language: "TypeScript", angle: TAU * 0.62, radius: 176, spread: 58 },
  { language: "JavaScript", angle: TAU * 0.77, radius: 124, spread: 30 },
  { language: "Dart", angle: TAU * 0.87, radius: 104, spread: 20 },
  { language: "Other", angle: TAU * 0.95, radius: 138, spread: 36 },
];

export const districtFor = (language: string): District =>
  DISTRICTS.find((d) => d.language === language) ?? DISTRICTS[DISTRICTS.length - 1];

/** Where a district's centre lands on the ground. */
export function districtCentre(d: District): [number, number] {
  return [Math.sin(d.angle) * d.radius, -Math.cos(d.angle) * d.radius];
}
