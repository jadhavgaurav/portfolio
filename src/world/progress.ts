import { entities } from "./telemetry";
import { INTERACTABLES } from "./interactables";
import { DISTRICTS } from "./language";

/**
 * Progress.
 *
 * The map already counted what had been found, in a corner, in grey text.
 * That is bookkeeping, not a reason to go anywhere — there was no way to see
 * the shape of what is left, and nothing ever told you that you had finished
 * a category. This is that: four categories the world's own content already
 * divides into, a percentage, and a moment when each one closes out.
 */

export interface Category {
  key: "districts" | "projects" | "certs" | "repos";
  label: string;
  ids: string[];
}

const projectIds = INTERACTABLES.filter((i) => i.kind === "PROJECT" || i.kind === "WORK").map(
  (i) => i.id,
);
const certIds = INTERACTABLES.filter((i) => i.kind === "CERT").map((i) => i.id);
/** Every structure counts, including the ones promoted to a case study —
 *  the record does not stop being a repository for having a write-up. */
const repoIds = entities.map((e) => `repo:${e.id}`);

export const CATEGORIES: Category[] = [
  { key: "districts", label: "Districts entered", ids: DISTRICTS.map((d) => `district:${d.language}`) },
  { key: "projects", label: "Case studies opened", ids: projectIds },
  { key: "certs", label: "Certifications collected", ids: certIds },
  { key: "repos", label: "Repositories discovered", ids: repoIds },
];

export const TOTAL_ITEMS = CATEGORIES.reduce((n, c) => n + c.ids.length, 0);

export interface CategoryProgress {
  key: Category["key"];
  label: string;
  found: number;
  total: number;
  complete: boolean;
}

export interface Progress {
  categories: CategoryProgress[];
  found: number;
  total: number;
  complete: boolean;
}

/** `found` is the union of the interaction `visited` list and the district
 *  `enteredDistricts` list — the two things the game actually tracks — so a
 *  repository counts once whether it was opened as a plain structure or
 *  promoted to a case study, since a case study's id replaces its repo id
 *  in the interactable list rather than sitting alongside it. */
export function computeProgress(visited: string[], enteredDistricts: string[]): Progress {
  const found = new Set([...visited, ...enteredDistricts.map((l) => `district:${l}`)]);
  const categories = CATEGORIES.map((c): CategoryProgress => {
    const n = c.ids.filter((id) => found.has(id)).length;
    return { key: c.key, label: c.label, found: n, total: c.ids.length, complete: n >= c.ids.length };
  });
  const total = categories.reduce((n, c) => n + c.total, 0);
  const foundCount = categories.reduce((n, c) => n + c.found, 0);
  return { categories, found: foundCount, total, complete: foundCount >= total };
}
