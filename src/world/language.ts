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
  /* Arrived with the digibranders merge — the org's own product work brought
     two ecosystems the personal record never touched. (A third, EJS, showed
     up too, but its one qualifying repo turned out to have zero commits from
     Gaurav himself — see repo-facts.ts — so it never became a district: a
     colour with no building under it is worse than no colour at all.) */
  HTML: { ui: "#E34C26", surface: "#EA6E4D", emissive: "#F5977C", label: "HTML" },
  Go: { ui: "#00ADD8", surface: "#2CC0E6", emissive: "#6FDAF5", label: "Go" },
};

export const styleFor = (language: string): LanguageStyle =>
  LANGUAGE_STYLE[language] ?? LANGUAGE_STYLE.Other;

/**
 * The districts.
 *
 * Order is deliberate rather than alphabetical: it is the order the subject
 * arrived at each ecosystem, so walking the ring outward from the hub is
 * still walking the history, and the two readings do not contradict. The
 * three digibranders-only ecosystems (HTML, Go, EJS) are appended after the
 * personal record's eight, since the org merge is what brought them in.
 *
 * `angle` is where the district sits on the ring, `radius` how far out. The
 * busiest get the most room; the single-repository ones sit closer in so
 * the walk between them is short.
 *
 * TypeScript's spread nearly doubled when the digibranders merge landed 26
 * more repositories in it (9 → 35) — the district reads as visibly denser
 * than the rest now, which is honest: it really is where most of the
 * agency's product work happened, not an artifact of the layout.
 */
export interface District {
  language: string;
  angle: number;
  radius: number;
  /** Footprint radius. Structures are scattered inside this. */
  spread: number;
}

const TAU = Math.PI * 2;

/* Evenly spaced round the ring — a tenth of a turn each, now that the
   digibranders merge brought the district count from eight to ten. */
export const DISTRICTS: District[] = [
  { language: "Python", angle: TAU * (0 / 10), radius: 205, spread: 66 },
  { language: "Jupyter Notebook", angle: TAU * (1 / 10), radius: 228, spread: 54 },
  { language: "TypeScript", angle: TAU * (2 / 10), radius: 279, spread: 100 },
  { language: "JavaScript", angle: TAU * (3 / 10), radius: 138, spread: 30 },
  { language: "Java", angle: TAU * (4 / 10), radius: 142, spread: 32 },
  { language: "Other", angle: TAU * (5 / 10), radius: 132, spread: 28 },
  { language: "PHP", angle: TAU * (6 / 10), radius: 118, spread: 20 },
  { language: "Dart", angle: TAU * (7 / 10), radius: 116, spread: 20 },
  { language: "HTML", angle: TAU * (8 / 10), radius: 124, spread: 26 },
  { language: "Go", angle: TAU * (9 / 10), radius: 118, spread: 20 },
];

export const districtFor = (language: string): District =>
  DISTRICTS.find((d) => d.language === language) ??
  DISTRICTS.find((d) => d.language === "Other")!;

/** Where a district's centre lands on the ground. */
export function districtCentre(d: District): [number, number] {
  return [Math.sin(d.angle) * d.radius, -Math.cos(d.angle) * d.radius];
}
