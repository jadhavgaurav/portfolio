import { entities, type Entity } from "./telemetry";
import { factByName } from "@/data/repo-facts";
import { projects, type Project } from "@/data/projects";
import { certifications, type Certification } from "@/data/certifications";
import { contributors, aiTools, homeDistrictFor, type Contributor, type AITool } from "@/data/contributors";
import { DISTRICTS, districtCentre } from "./language";

/**
 * Things you can walk up to.
 *
 * The world was navigable and empty: forty-plus structures, none of which did
 * anything, while the record's actual content — eleven case studies, seven
 * certifications, the employment — sat in data files nothing rendered. This
 * is the layer that puts the content where the player is.
 *
 * Four kinds, because they are genuinely four different things:
 *
 *   REPO     every structure. Language, commits, dates, and a live link
 *            where one exists.
 *   PROJECT  the eleven written case studies, laid over the structure they
 *            describe. A repository with one of these is worth walking to.
 *   WORK     employment. Alsonotify and Fynix have no repository at all, so
 *            they are placed rather than derived — near the core, because
 *            that is what they are close to.
 *   CERT     the seven certifications, standing in the district of the
 *            ecosystem they certify.
 *   NPC      a real person or AI tool who actually committed to a repository
 *            here, walking their home district rather than standing on it.
 *            Unlike the other four kinds, an NPC's x/z are live: NPC.tsx
 *            mutates this exact object every frame as it wanders, so the
 *            proximity check below always reads where it currently is.
 */

export type InteractKind = "REPO" | "PROJECT" | "WORK" | "CERT" | "CORE" | "NPC";

export interface Interactable {
  id: string;
  kind: InteractKind;
  /** Where the prompt is offered from. Live, not fixed, for kind NPC. */
  x: number;
  z: number;
  /** How high the marker floats. */
  y: number;
  /** How close you have to be. Scaled to the thing's own footprint. */
  reach: number;
  title: string;
  /** One line, shown on the prompt itself. */
  kicker: string;
  entity?: Entity;
  project?: Project;
  cert?: Certification;
  contributor?: Contributor;
  aiTool?: AITool;
}

/** Case study title → the repository it describes. */
const PROJECT_ENTITY: Record<string, string> = {
  "PROJECT VICTUS": "PROJECT-VICTUS",
  "VISION-X": "Vision-X",
  "KIDNEY DISEASE CLASSIFICATION": "Kidney_disease_classification_cnn",
  "PHISHING DETECTION": "CodeB_Internship_Project",
  "MULTIMODAL SEARCH PLATFORM": "multimodal-search-platform",
  "SMART EMAIL ASSISTANT": "smart-email-assistant-newel",
  "E-VOTING BLOCKCHAIN": "E-Voting-using-Blockchain-and-Face-Recognition",
  "FINANCE DASHBOARD": "finance-dashboard",
};

/** Employment, which has no repository to stand on. */
const WORK_TITLES = ["ALSONOTIFY", "FYNIX DIGITAL"];

/** Which district each certification belongs in. */
const CERT_DISTRICT: Record<string, string> = {
  "ibm-dl-tf": "Python",
  "ibm-ml-python": "Python",
  "ibm-python-ds": "Jupyter Notebook",
  "databricks-genai": "Python",
  "forage-ba-ds": "Jupyter Notebook",
};

const byId = new Map(entities.map((e) => [e.id, e]));

function build(): Interactable[] {
  const out: Interactable[] = [];

  /* The core, at the hub. */
  out.push({
    id: "core",
    kind: "CORE",
    x: 0,
    z: 0,
    y: 3,
    reach: 16,
    title: "The core",
    kicker: "Who this is",
  });

  /* Every structure. */
  for (const e of entities) {
    const fact = factByName.get(e.name);
    out.push({
      id: `repo:${e.id}`,
      kind: "REPO",
      x: e.x,
      z: e.z,
      y: Math.min(e.height * 0.5, 14) + 2,
      reach: e.mass + 7,
      title: e.name,
      kicker: fact?.homepage ? "Repository · live site" : "Repository",
      entity: e,
    });
  }

  /* The written case studies, promoted over the plain repository entry. */
  for (const p of projects) {
    const entityName = PROJECT_ENTITY[p.title];
    if (!entityName) continue;
    const e = byId.get(entityName);
    if (!e) continue;
    const i = out.findIndex((x) => x.id === `repo:${e.id}`);
    if (i >= 0) out.splice(i, 1);
    out.push({
      id: `project:${p.slug}`,
      kind: "PROJECT",
      x: e.x,
      z: e.z,
      y: Math.min(e.height * 0.5, 16) + 3,
      reach: e.mass + 10,
      title: p.title,
      kicker: p.subtitle,
      entity: e,
      project: p,
    });
  }

  /* Employment. Placed on the ring between the hub and the TypeScript
     district, which is the ecosystem both were built in. */
  const ts = DISTRICTS.find((d) => d.language === "TypeScript")!;
  const [tx, tz] = districtCentre(ts);
  const len = Math.hypot(tx, tz) || 1;
  WORK_TITLES.forEach((title, n) => {
    const p = projects.find((x) => x.title === title);
    if (!p) return;
    const t = 0.34 + n * 0.16;
    // Offset perpendicular to the path so they flank it rather than block it.
    const px = (-tz / len) * (n === 0 ? 20 : -20);
    const pz = (tx / len) * (n === 0 ? 20 : -20);
    out.push({
      id: `work:${p.slug}`,
      kind: "WORK",
      x: tx * t + px,
      z: tz * t + pz,
      y: 5,
      reach: 13,
      title: p.title,
      kicker: p.subtitle,
      project: p,
    });
  });

  /* Certifications, standing in the district they certify. Arranged on an arc
     at the district's edge so they read as a row of markers rather than as
     more scenery. */
  const perDistrict = new Map<string, number>();
  for (const c of certifications) {
    const lang = CERT_DISTRICT[c.id] ?? "Other";
    const d = DISTRICTS.find((x) => x.language === lang) ?? DISTRICTS[0];
    const [cx, cz] = districtCentre(d);
    const n = perDistrict.get(lang) ?? 0;
    perDistrict.set(lang, n + 1);
    const a = d.angle + Math.PI + (n - 1) * 0.24;
    const r = d.spread + 11;
    out.push({
      id: `cert:${c.id}`,
      kind: "CERT",
      x: cx + Math.sin(a) * r,
      z: cz - Math.cos(a) * r,
      y: 2.6,
      reach: 8,
      title: c.title,
      kicker: `${c.issuer} · ${c.displayDate}`,
      cert: c,
    });
  }

  /* The rest of the team, and the two AI tools, walking their home
     district rather than standing on it. Starting point is a deterministic
     hash-jitter off the district centre — NPC.tsx takes it from here every
     frame, wandering a short loop and writing its live x/z back into this
     same object. */
  for (const c of contributors) {
    const d = homeDistrictFor(c);
    const [cx, cz] = districtCentre(d);
    const h = hash(c.name);
    const a = h * Math.PI * 2;
    const r = d.spread * 0.4;
    out.push({
      id: `npc:${c.login ?? c.name}`,
      kind: "NPC",
      x: cx + Math.sin(a) * r,
      z: cz + Math.cos(a) * r,
      y: 1.5,
      reach: 9,
      title: c.login ? `@${c.login}` : c.name,
      kicker: `${c.totalCommits} commits · ${c.repos.length} repo${c.repos.length === 1 ? "" : "s"}`,
      contributor: c,
    });
  }
  for (const a of aiTools) {
    // Both stand near the core rather than in a single district — Claude and
    // Jules both touched several ecosystems, not just one.
    const angle = a.tool === "Claude" ? 0.9 : -0.9;
    out.push({
      id: `ai:${a.tool}`,
      kind: "NPC",
      x: Math.sin(angle) * 22,
      z: Math.cos(angle) * 22,
      y: 1.2,
      reach: 9,
      title: a.tool,
      kicker: `AI collaborator · ${a.totalCommits} commits · ${a.repos.length} repos`,
      aiTool: a,
    });
  }

  return out;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

export const INTERACTABLES = build();

/**
 * The closest thing in reach, if any.
 *
 * Prefers what the player is looking at when two are equally close, so
 * standing between a certificate and a monolith offers the one you turned
 * toward rather than whichever happens to be a metre nearer.
 */
export function nearestInteractable(
  x: number,
  z: number,
  headingX: number,
  headingZ: number,
): Interactable | null {
  let best: Interactable | null = null;
  let bestScore = -Infinity;
  for (const it of INTERACTABLES) {
    const dx = it.x - x;
    const dz = it.z - z;
    const dist = Math.hypot(dx, dz);
    if (dist > it.reach) continue;
    const len = dist || 1;
    const facing = (dx / len) * headingX + (dz / len) * headingZ;
    // Closeness dominates; facing breaks the tie.
    const score = 1 - dist / it.reach + facing * 0.35;
    if (score > bestScore) {
      bestScore = score;
      best = it;
    }
  }
  return best;
}

export const CERT_COUNT = certifications.length;
export const PROJECT_COUNT = INTERACTABLES.filter(
  (i) => i.kind === "PROJECT" || i.kind === "WORK",
).length;
