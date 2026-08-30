import { EPOCH, SPAN_DAYS, lanes } from "@/data/ledger";
import { factByName } from "@/data/repo-facts";
import { districtCentre, districtFor } from "./language";

/**
 * Telemetry → WorldBlueprint.
 *
 * A pure, deterministic expansion of the commit record into world entities,
 * following the mapping rules NULL already specifies:
 *
 *   M1  Every mapping is monotonic in its source. More commits can never
 *       produce a smaller structure.
 *   M2  No mapping uses raw counts linearly. Everything goes through log1p
 *       and per-subject normalisation, or the world is one skyscraper and
 *       thirty-nine pebbles.
 *
 * Percentiles are computed within this subject's own history. Nothing here
 * ranks him against anyone.
 *
 * Same input, same output, always — no Math.random anywhere in this file.
 */

export type EntityType =
  | "RELIC"
  | "MONOLITH"
  | "LANDMARK"
  | "FRAGMENT"
  | "DORMANT"
  | "ORIGIN"
  | "CORE";

/** Material families, selected by role and state. Language is carried
 *  separately and drives colour, because the two say different things: what a
 *  work is made of, and which ecosystem it belongs to. */
export type MaterialFamily =
  | "FOUNDATION"
  | "CONSTRUCTED"
  | "ACTIVE"
  | "ORGANIC"
  | "RUINED";

export interface Entity {
  id: string;
  name: string;
  /** From the GitHub API. Drives the district a structure stands in and the
   *  colour it is built out of. */
  language: string;
  type: EntityType;
  material: MaterialFamily;
  /** World position. Z is time: 0 is the first commit, -SPAN is the last. */
  x: number;
  y: number;
  z: number;
  /** Footprint, from log1p(commits). */
  mass: number;
  /** Height band, from significance. */
  height: number;
  /** How far the foundation sinks, from lifespan. */
  depth: number;
  /** 0 → live, 1 → three years dormant. Drives weathering and light. */
  erosion: number;
  /** 0..1 within this subject's own history. */
  significance: number;
  commits: number;
  firstDay: number;
  lastDay: number;
  /** Rotation, deterministic per entity. */
  rot: number;
  /** Number of stacked construction phases — reads as layered history. */
  phases: number;
}

/* ── deterministic hash, so layout never shifts between renders ─────────── */

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  const i = (sorted.length - 1) * p;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
}

/* ── world constants. Every threshold is a tuning constant, not inlined. ── */

export const WORLD = {
  /** Length of the time axis in world units. Walking -Z is walking forward. */
  depth: 520,
  /** Lateral spread either side of the spine. */
  spread: 26,
  /** Nearest an entity may sit to the spine, so the corridor stays walkable. */
  /** Clear space either side of the route, measured to a structure's edge. */
  corridor: 9,
  eyeHeight: 1.7,
  /** Erosion saturates three years after the last commit. */
  erosionCapDays: 1095,
} as const;

const HEIGHT_BAND: Record<EntityType, [number, number]> = {
  RELIC: [86, 132],
  MONOLITH: [62, 104],
  ORIGIN: [26, 40],
  LANDMARK: [26, 62],
  DORMANT: [13, 34],
  FRAGMENT: [6, 15],
  CORE: [70, 70],
};

/* ── the expansion ───────────────────────────────────────────────────────── */

function buildEntities(): Entity[] {
  const works = lanes.map((l) => ({
    name: l.r,
    commits: l.d.length,
    firstDay: l.d[0],
    lastDay: l.d[l.d.length - 1],
    lifespan: Math.max(1, l.d[l.d.length - 1] - l.d[0]),
  }));

  const commitsSorted = [...works.map((w) => w.commits)].sort((a, b) => a - b);
  const lifeSorted = [...works.map((w) => w.lifespan)].sort((a, b) => a - b);
  const maxLogCommits = Math.log1p(Math.max(...commitsSorted));
  const p25c = percentile(commitsSorted, 0.25);
  const p60c = percentile(commitsSorted, 0.6);
  const p80l = percentile(lifeSorted, 0.8);

  // The record ends at the most recent commit anywhere.
  const latest = Math.max(...works.map((w) => w.lastDay));
  // ORIGIN is the earliest trace — everything else traces back to it.
  const earliestFirst = Math.min(...works.map((w) => w.firstDay));

  const scored = works.map((w) => {
    // Significance blends volume, endurance and recency. Monotonic in each.
    const volume = Math.log1p(w.commits) / maxLogCommits;
    const endurance = Math.min(1, w.lifespan / SPAN_DAYS);
    const recency = 1 - Math.min(1, (latest - w.lastDay) / WORLD.erosionCapDays);
    return { ...w, significance: volume * 0.62 + endurance * 0.24 + recency * 0.14 };
  });

  const topSignificance = Math.max(...scored.map((s) => s.significance));

  /* Rank inside each district, by first commit, so the spiral knows both
     where a work sits in its district and how large that district is. */
  const withinDistrict = new Map<string, number>();
  const districtCount = new Map<string, number>();
  {
    const byLang = new Map<string, typeof scored>();
    for (const w of scored) {
      const lang = factByName.get(w.name)?.language ?? "Other";
      const list = byLang.get(lang) ?? [];
      list.push(w);
      byLang.set(lang, list);
    }
    for (const [lang, list] of byLang) {
      list.sort((a, b) => a.firstDay - b.firstDay);
      districtCount.set(lang, list.length);
      list.forEach((w, i) => withinDistrict.set(w.name, i));
    }
  }

  return scored.map((w): Entity => {
    const idleDays = latest - w.lastDay;
    const erosion = Math.min(1, idleDays / WORLD.erosionCapDays);
    const isDormant = idleDays > 420;

    // Entity type, by the mapping table's precedence.
    let type: EntityType;
    if (w.firstDay === earliestFirst) {
      type = "ORIGIN";
    } else if (w.significance === topSignificance) {
      type = "RELIC";
    } else if (w.lifespan >= p80l && w.commits >= p60c) {
      type = "MONOLITH"; // dormancy never overrides a monolith
    } else if (isDormant) {
      type = "DORMANT";
    } else if (w.commits >= p60c) {
      type = "LANDMARK";
    } else if (w.lifespan < 45 && w.commits < p25c) {
      type = "FRAGMENT";
    } else {
      type = "LANDMARK";
    }

    /*
     * Material follows role and state, in a fixed precedence.
     *
     * ORGANIC is tested before the constructed families rather than after
     * them. Placed last it was unreachable — every long-lived work had
     * already been claimed as a monolith or a relic — so the branching
     * geometry it selects never rendered at all. It means something specific:
     * a work that accumulated slowly over a long period rather than being
     * built in a burst, which is growth rather than construction.
     */
    const daysPerCommit = w.lifespan / Math.max(1, w.commits);
    const grewSlowly = daysPerCommit > 22 && w.lifespan > 90;

    const material: MaterialFamily =
      type === "ORIGIN"
        ? "FOUNDATION"
        : type === "DORMANT" || erosion > 0.72
          ? "RUINED"
          : grewSlowly
            ? "ORGANIC"
            : erosion < 0.12
              ? "ACTIVE"
              : "CONSTRUCTED";

    const [hLo, hHi] = HEIGHT_BAND[type];
    const sNorm = w.significance / topSignificance;
    const height = hLo + (hHi - hLo) * sNorm;

    const h1 = hash(w.name);
    const h2 = hash(w.name + "§");
    const mass = 2.4 + (Math.log1p(w.commits) / maxLogCommits) * 9.6;

    /* Position.
     *
     * The old layout was a single corridor with time running down -Z. That
     * is the right shape for something you are pulled along and the wrong one
     * for somewhere you walk: every structure was equidistant from the route
     * and there was nowhere to go but forward.
     *
     * The world is districts now, one per language, arranged on a ring around
     * a hub. Inside a district the structures are placed on a golden-angle
     * spiral ordered by first commit, so the oldest work sits at the centre
     * and the district grows outward in time — the history is still readable,
     * it is just readable in two dimensions instead of one.
     */
    const language = factByName.get(w.name)?.language ?? "Other";
    const d = districtFor(language);
    const [dcx, dcz] = districtCentre(d);
    const withinRank = withinDistrict.get(w.name) ?? 0;
    const withinCount = districtCount.get(language) ?? 1;
    // Golden angle: the classic even-scatter with no two neighbours aligned.
    const a = withinRank * 2.399963;
    const rr = Math.sqrt((withinRank + 0.55) / withinCount) * d.spread;
    const jitter = (h2 - 0.5) * d.spread * 0.14;

    return {
      id: w.name,
      name: w.name,
      language,
      type,
      material,
      z: dcz + Math.cos(a) * rr + jitter,
      x: dcx + Math.sin(a) * rr - jitter,
      y: 0,
      mass,
      height,
      depth: 1.5 + (w.lifespan / SPAN_DAYS) * 8,
      erosion,
      significance: sNorm,
      commits: w.commits,
      firstDay: w.firstDay,
      lastDay: w.lastDay,
      rot: (h1 - 0.5) * 0.5,
      phases: Math.max(1, Math.min(6, Math.round(1 + Math.log1p(w.commits) * 1.15))),
    };
  });
}

export const entities: Entity[] = buildEntities();

const ENTITY_INDEX = new Map(entities.map((e) => [e.id, e]));
export const entityById = (id: string) => ENTITY_INDEX.get(id) ?? null;

export const origin = entities.find((e) => e.type === "ORIGIN")!;
export const relic = entities.find((e) => e.type === "RELIC")!;

/** The CORE: the synthesis, placed beyond the last work. A consequence of the world. */
/* The core sits at the hub the districts ring, not past the end of a
   corridor. Every district is now the same short walk from it, which is what
   makes it a landmark rather than a finish line. */
export const core = {
  x: 0,
  y: 16,
  z: 0,
} as const;

/**
 * Position → date.
 *
 * The spine is not linear in time — quiet stretches are compressed — so the
 * readout cannot invert it arithmetically. Interpolating between the works
 * themselves gives the honest answer: the date is read off the structures the
 * visitor is standing among.
 */
const BY_Z = [...entities].sort((a, b) => b.z - a.z);

export function dayAtZ(z: number): number {
  if (!BY_Z.length) return 0;
  if (z >= BY_Z[0].z) return BY_Z[0].firstDay;
  const last = BY_Z[BY_Z.length - 1];
  if (z <= last.z) return last.firstDay;
  for (let i = 0; i < BY_Z.length - 1; i++) {
    const a = BY_Z[i];
    const b = BY_Z[i + 1];
    if (z <= a.z && z >= b.z) {
      const span = a.z - b.z;
      const k = span === 0 ? 0 : (a.z - z) / span;
      return Math.round(a.firstDay + (b.firstDay - a.firstDay) * k);
    }
  }
  return last.firstDay;
}

/** Day offset → calendar label, for the readout. */
export function dayToLabel(day: number): string {
  const d = new Date(Date.parse(EPOCH) + day * 86_400_000);
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

/** Where along the spine a given scroll progress sits. */
export const zAt = (t: number) => -t * (WORLD.depth + 60);
