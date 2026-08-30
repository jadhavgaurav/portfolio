import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { WORLD, entities, type Entity, type MaterialFamily } from "./telemetry";
import { lineage } from "@/data/lineage";
import { branch, conduit, crystal, fissure, limb, obelisk, ring, shard, slab, type Part } from "./shapes";

/**
 * World geometry.
 *
 * Shape is chosen by what a work IS — Bible §07, identifiable by silhouette
 * before detail resolves. Material is chosen by role and state, and only
 * affects the surface. The two are deliberately separate: a dormant crystal
 * and a dormant obelisk are both weathered, and still tell you apart at
 * distance.
 *
 *   ORIGIN     stepped plinth inside a broken ring — age, and a beginning
 *   RELIC      faceted crystal — singular, not merely large
 *   MONOLITH   turned obelisk with construction courses — endurance
 *   LANDMARK   cantilevered slabs — engineered, deliberate
 *   ORGANIC    recursive branching — relationships and ecosystems
 *   DORMANT    half-buried arc and a leaning mass — something that stopped
 *   FRAGMENT   angular shards — an experiment, abandoned early
 *
 * Everything merges per material family, so the world stays a handful of
 * draw calls no matter how much vocabulary it uses.
 */

function shade(g: THREE.BufferGeometry, floor: number, ceiling: number, tint = 1) {
  const pos = g.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const k = Math.min(1, Math.max(0, (y - floor) / Math.max(0.001, ceiling - floor)));
    const v = (0.66 + Math.pow(k, 0.7) * 0.34) * tint;
    colors[i * 3] = v;
    colors[i * 3 + 1] = v;
    colors[i * 3 + 2] = v;
  }
  g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return g;
}

/** Deterministic per-entity noise. Same repository, same shape, always. */
function noiser(seed: string) {
  return (i: number) => {
    let h = 2166136261 ^ i;
    for (let k = 0; k < seed.length; k++) {
      h ^= seed.charCodeAt(k);
      h = Math.imul(h, 16777619);
    }
    return ((h >>> 0) / 4294967295) * 2 - 1;
  };
}

/* ── shape languages, by what the work is ────────────────────────────────── */

function originShape(e: Entity, n: (i: number) => number): Part[] {
  const out: Part[] = [];
  const steps = 4;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const w = e.mass * (2.6 - t * 1.6);
    const h = e.height / steps;
    out.push(slab(w, h, w * 0.82, n(i) * e.mass * 0.4, h * i + h / 2, n(i + 40) * e.mass * 0.3, e.rot + t * 0.16));
  }
  // A ring around it, broken and partly buried: everything traces back here.
  out.push(ring(e.mass * 2.4, 0.5, 0, 0.4, 0, Math.PI * 1.45, Math.PI / 2, e.rot));
  return out;
}

function relicShape(e: Entity, n: (i: number) => number): Part[] {
  const out: Part[] = [];
  const cells = 7;
  for (let i = 0; i < cells; i++) {
    const t = i / cells;
    const r = e.mass * (1.15 - t * 0.72);
    out.push(
      crystal(
        r,
        n(i) * e.mass * 0.3,
        e.height * t + r * 0.7,
        n(i + 9) * e.mass * 0.3,
        e.rot + t * 2.1,
        t * 0.5,
      ),
    );
  }
  // A shallow plinth so the crystal is set into the ground, not resting on it.
  out.push(slab(e.mass * 2.5, 1.6, e.mass * 2.5, 0, 0.8, 0, e.rot));
  return out;
}

function monolithShape(e: Entity, n: (i: number) => number): Part[] {
  const g = obelisk(e.mass * 0.92, e.mass * 0.3, e.height, Math.max(4, e.phases));
  g.rotateY(e.rot);
  const out: Part[] = [g];
  // One buttress, so it is not radially symmetric from every approach.
  out.push(
    slab(e.mass * 0.5, e.height * 0.42, e.mass * 1.5, e.mass * 0.8 * Math.sign(n(1) || 1), e.height * 0.21, 0, e.rot),
  );
  return out;
}

function landmarkShape(e: Entity, n: (i: number) => number): Part[] {
  const out: Part[] = [];
  const ph = e.phases;
  const unit = e.height / ph;
  for (let i = 0; i < ph; i++) {
    const t = i / ph;
    const w = e.mass * (1.2 - t * 0.4);
    // Alternating cantilever: each course overhangs the one below.
    const off = n(i) * e.mass * 0.5;
    out.push(slab(w, unit * 0.84, w * 0.7, off, unit * i + unit * 0.42, 0, e.rot + t * 0.1));
    if (i < ph - 1) out.push(slab(w * 0.78, unit * 0.12, w * 0.55, off, unit * (i + 1), 0, e.rot));
  }
  return out;
}

function organicShape(e: Entity, n: (i: number) => number): Part[] {
  const out: Part[] = [];
  const trunks = 3;
  for (let i = 0; i < trunks; i++) {
    const a = (i / trunks) * Math.PI * 2 + e.rot;
    const r = e.mass * 0.42;
    branch(
      out,
      Math.cos(a) * r,
      0,
      Math.sin(a) * r,
      { ry: a, rz: n(i) * 0.12 },
      e.height * 0.42,
      e.mass * 0.2,
      4,
      n,
    );
  }
  out.push(ring(e.mass * 1.1, 0.4, 0, 0.35, 0, Math.PI * 2, Math.PI / 2, 0));
  return out;
}

function dormantShape(e: Entity, n: (i: number) => number): Part[] {
  const out: Part[] = [];
  const sink = e.height * (0.24 + e.erosion * 0.3);
  const main = e.height - sink;
  // A leaning mass, cut off where the work stopped.
  out.push(
    limb(e.mass * 0.78, e.mass * 0.5, main, 0, -sink * 0.2, 0, e.rot, n(3) * 0.14),
  );
  // The arc of something that was once complete, now partly in the ground.
  out.push(ring(e.mass * 1.6, 0.45, 0, 0.3, 0, Math.PI * (0.7 + Math.abs(n(5)) * 0.5), Math.PI / 2, e.rot + 0.4));
  out.push(shard(e.mass * 0.55, n(7) * e.mass, main * 0.3, n(9) * e.mass, e.rot, n(11) * 0.6));
  return out;
}

function fragmentShape(e: Entity, n: (i: number) => number): Part[] {
  const out: Part[] = [];
  const count = 3;
  for (let i = 0; i < count; i++) {
    out.push(
      shard(
        e.mass * (0.5 - i * 0.1),
        n(i) * e.mass * 1.1,
        e.height * (0.3 + i * 0.24),
        n(i + 5) * e.mass * 1.1,
        e.rot + i,
        n(i + 12) * 0.9,
      ),
    );
  }
  return out;
}

const SHAPE_BY_TYPE = {
  ORIGIN: originShape,
  RELIC: relicShape,
  MONOLITH: monolithShape,
  LANDMARK: landmarkShape,
  DORMANT: dormantShape,
  FRAGMENT: fragmentShape,
  CORE: landmarkShape,
} as const;

/* ── assembly ────────────────────────────────────────────────────────────── */

function place(g: THREE.BufferGeometry, e: Entity) {
  shade(g, -e.depth * 0.4, e.height, 1 - e.erosion * 0.34);
  g.translate(e.x, e.y, e.z);
  return g;
}

export interface WorldGeometry {
  families: { family: MaterialFamily; geometry: THREE.BufferGeometry }[];
  seams: THREE.BufferGeometry | null;
  route: THREE.BufferGeometry;
  /** Trajectory breaks, at the boundaries between eras. */
  rifts: THREE.BufferGeometry;
  /** Relationships between works. Drawn only under the COLLABORATION lens. */
  conduits: THREE.BufferGeometry;
}

export function buildWorld(): WorldGeometry {
  const byFamily = new Map<MaterialFamily, Part[]>();
  const seams: Part[] = [];

  for (const e of entities) {
    const n = noiser(e.id);
    // ORGANIC is chosen by material rather than type: it is a statement about
    // how a work grew, not about how significant it became.
    const shaper = e.material === "ORGANIC" ? organicShape : SHAPE_BY_TYPE[e.type];
    const parts = shaper(e, n).map((g) => place(g, e));
    const list = byFamily.get(e.material) ?? [];
    list.push(...parts);
    byFamily.set(e.material, list);

    if (e.material === "ACTIVE") {
      const unit = e.height / e.phases;
      for (let i = 1; i < e.phases; i++) {
        const w = e.mass * (1.2 - (i / e.phases) * 0.4);
        seams.push(place(slab(w * 0.9, unit * 0.06, w * 0.66, n(i) * e.mass * 0.5, unit * i, 0, e.rot), e));
      }
    }
  }

  const families = Array.from(byFamily.entries())
    .map(([family, parts]) => ({ family, geometry: mergeGeometries(parts, false)! }))
    .filter((f) => f.geometry);

  const len = WORLD.depth + 200;
  const strip = (x: number) => {
    const g = new THREE.PlaneGeometry(0.22, len);
    g.rotateX(-Math.PI / 2);
    g.translate(x, 0.03, -len / 2 + 70);
    return g;
  };
  const route = mergeGeometries([strip(-3.1), strip(3.1)], false)!;

  /* Rifts: placed where the record actually breaks, between the clusters of
     works, not on a work. */
  const sorted = [...entities].sort((a, b) => b.z - a.z);
  const riftParts: Part[] = [];
  const gaps: { z: number; size: number }[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    gaps.push({ z: (sorted[i].z + sorted[i + 1].z) / 2, size: sorted[i].z - sorted[i + 1].z });
  }
  gaps
    .sort((a, b) => b.size - a.size)
    .slice(0, 3)
    .forEach((g, i) => {
      riftParts.push(...fissure(g.z, WORLD.spread * 2.6, noiser(`rift${i}`)));
    });
  const rifts = mergeGeometries(riftParts.map((g) => shade(g, -3, 4)), false)!;

  /* Conduits: the eight attempts at one assistant, drawn as one line through
     the world. This is the relationship the record most clearly supports. */
  const byId = new Map(entities.map((e) => [e.id, e]));
  const chain = lineage
    .map((a) => byId.get(a.name.split(" · ")[0]))
    .filter((e): e is Entity => Boolean(e))
    .sort((a, b) => b.z - a.z);
  const conduitParts: Part[] = [];
  if (chain.length > 1) {
    const pts = chain.map((e) => new THREE.Vector3(e.x, e.height * 0.55 + 2, e.z));
    conduitParts.push(conduit(pts, 0.42));
  }
  const conduits = conduitParts.length
    ? mergeGeometries(conduitParts, false)!
    : new THREE.BufferGeometry();

  return { families, seams: seams.length ? mergeGeometries(seams, false) : null, route, rifts, conduits };
}
