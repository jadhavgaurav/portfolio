import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { WORLD, entities, type Entity } from "./telemetry";
import { lineage } from "@/data/lineage";
import { barrel, conduit, crate, fissure, gem, limb, puff, ring, roof, slab, type Part } from "./shapes";

/**
 * World geometry.
 *
 * Shape is chosen by what a work IS — Bible §07, identifiable by silhouette
 * before detail resolves — and now answered with objects a person recognises
 * on sight instead of abstract sculpture:
 *
 *   ORIGIN     a small stepped shrine, capped with a gem — the beginning
 *   RELIC      a grand tower with a glowing gem crown — singular, not merely large
 *   MONOLITH   a banded tower with a banner — endurance, built to last
 *   LANDMARK   a hut with a peaked roof — the ordinary, common case
 *   ORGANIC    a trunk with clustered foliage — a tree, for things that grew
 *   DORMANT    a leaning, cracked hut — something that stopped
 *   FRAGMENT   a small pile of crates — an experiment, abandoned early
 *
 * Everything merges per language into one draw call, same as before — only
 * the vocabulary changed, not the reason it exists.
 */

function shade(g: THREE.BufferGeometry, floor: number, ceiling: number, tint = 1) {
  const pos = g.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const k = Math.min(1, Math.max(0, (y - floor) / Math.max(0.001, ceiling - floor)));
    const v = (0.72 + Math.pow(k, 0.7) * 0.34) * tint;
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

/** ORIGIN: a small stepped shrine, everything else traces back to it. */
function originShape(e: Entity, n: (i: number) => number): Part[] {
  const out: Part[] = [];
  const steps = 3;
  let y = 0;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const r = e.mass * (1.25 - t * 0.55);
    const h = (e.height / steps) * 0.42;
    out.push(barrel(r, r * 0.88, h, n(i) * e.mass * 0.12, y + h / 2, n(i + 6) * e.mass * 0.12, 8, e.rot));
    y += h;
  }
  out.push(gem(e.mass * 0.5, 0, y + e.mass * 0.4, 0, e.rot * 1.7));
  out.push(ring(e.mass * 1.9, 0.32, 0, 0.25, 0, Math.PI * 2, Math.PI / 2, e.rot));
  return out;
}

/** RELIC: the single most significant work — a grand tower, gem-crowned. */
function relicShape(e: Entity, n: (i: number) => number): Part[] {
  const out: Part[] = [];
  const baseR = e.mass * 0.66;
  const topR = baseR * 0.68;
  const bodyH = e.height * 0.76;
  out.push(barrel(baseR, topR, bodyH, 0, bodyH / 2, 0, 10, e.rot));
  const bands = Math.max(2, Math.min(5, e.phases));
  for (let i = 1; i < bands; i++) {
    const t = i / bands;
    const r = baseR + (topR - baseR) * t + 0.18;
    out.push(ring(r, 0.14, 0, bodyH * t, 0, Math.PI * 2, Math.PI / 2, e.rot));
  }
  const roofH = e.height * 0.16;
  out.push(roof(topR * 1.3, roofH, 0, bodyH + roofH / 2, 0, 10, e.rot));
  out.push(gem(e.mass * 0.46, n(0) * e.mass * 0.06, bodyH + roofH + e.mass * 0.32, n(1) * e.mass * 0.06, e.rot * 1.4));
  return out;
}

/** MONOLITH: long-lived and heavily committed — a banded tower, a banner. */
function monolithShape(e: Entity, n: (i: number) => number): Part[] {
  const out: Part[] = [];
  const baseR = e.mass * 0.52;
  const topR = baseR * 0.74;
  const bodyH = e.height * 0.78;
  out.push(barrel(baseR, topR, bodyH, 0, bodyH / 2, 0, 8, e.rot));
  const bands = Math.max(2, Math.min(6, e.phases));
  for (let i = 1; i < bands; i++) {
    const t = i / bands;
    const r = baseR + (topR - baseR) * t + 0.14;
    out.push(ring(r, 0.1, 0, bodyH * t, 0, Math.PI * 2, Math.PI / 2, e.rot));
  }
  const roofH = e.height * 0.14;
  out.push(roof(topR * 1.2, roofH, 0, bodyH + roofH / 2, 0, 8, e.rot));
  // A banner, angled off the apex so it is not radially symmetric.
  const bannerH = Math.max(2, e.height * 0.13);
  out.push(
    slab(
      topR * 0.55,
      bannerH,
      0.14,
      Math.sign(n(1) || 1) * topR * 0.5,
      bodyH + roofH + bannerH / 2,
      0,
      e.rot,
    ),
  );
  return out;
}

/** LANDMARK: the ordinary case — a hut with a peaked roof. */
function landmarkShape(e: Entity, n: (i: number) => number): Part[] {
  const out: Part[] = [];
  const bodyW = e.mass * 1.3;
  const bodyD = e.mass * 1.1;
  const bodyH = e.height * 0.6;
  out.push(slab(bodyW, bodyH, bodyD, 0, bodyH / 2, 0, e.rot));
  const roofH = e.height * 0.4;
  out.push(roof(bodyW * 0.76, roofH, 0, bodyH + roofH / 2, 0, 4, e.rot, bodyD * 0.76));
  // A chimney or dormer, only on the more built-up ones — reads as character
  // rather than noise on the many small huts. Sat near the eave, where the
  // roof is still close to full width, rather than partway up the slope
  // where a four-sided cone has already tapered to a sliver too narrow to
  // hold a box this wide — the previous height clipped it through the roof
  // face instead of sitting on top of it.
  if (e.phases > 2) {
    const chimW = bodyW * 0.16;
    const chimH = roofH * 0.5;
    out.push(
      slab(
        chimW,
        chimH,
        chimW,
        Math.sign(n(2) || 1) * bodyW * 0.22,
        bodyH + roofH * 0.24,
        bodyD * 0.12,
        e.rot,
      ),
    );
  }
  return out;
}

/** ORGANIC: grown slowly rather than built — a tree, trunk and foliage. */
function organicShape(e: Entity, n: (i: number) => number): Part[] {
  const out: Part[] = [];
  const trunkH = e.height * 0.5;
  out.push(limb(e.mass * 0.24, e.mass * 0.16, trunkH, 0, 0, 0, e.rot, 0));
  const clusters = 3 + (e.mass > 6 ? 1 : 0);
  for (let i = 0; i < clusters; i++) {
    const a = (i / clusters) * Math.PI * 2 + e.rot;
    const r = e.mass * 0.3;
    out.push(
      puff(
        e.mass * (0.5 - i * 0.04),
        Math.cos(a) * r * 0.55,
        trunkH + e.mass * 0.22 + n(i) * e.mass * 0.14,
        Math.sin(a) * r * 0.55,
        e.rot + i,
      ),
    );
  }
  out.push(puff(e.mass * 0.6, 0, trunkH + e.mass * 0.42, 0, e.rot));
  return out;
}

/** DORMANT: stopped — a hut leaning off true, roof askew. */
function dormantShape(e: Entity, n: (i: number) => number): Part[] {
  const out: Part[] = [];
  const lean = 0.1 + Math.abs(n(3)) * 0.16;
  const bodyW = e.mass * 1.18;
  const bodyD = e.mass * 0.98;
  const bodyH = e.height * 0.52;
  out.push(slab(bodyW, bodyH, bodyD, 0, bodyH / 2, 0, e.rot, lean * Math.sign(n(4) || 1)));
  // The 0.5 rad offset from the body's own rotation is deliberate — the roof
  // sits askew on the walls below it, per the shape's name — but it is a
  // twist applied on top of a roof that otherwise properly fits bodyW by
  // bodyD, not a substitute for fitting it.
  out.push(
    roof(bodyW * 0.72, e.height * 0.3, 0, bodyH + e.height * 0.15, 0, 4, e.rot + 0.5, bodyD * 0.72),
  );
  // A fallen support, leant against the wall.
  out.push(limb(bodyW * 0.09, bodyW * 0.09, e.height * 0.46, bodyW * 0.56, 0, n(5) * bodyD * 0.2, e.rot, 0.55));
  return out;
}

/** FRAGMENT: abandoned early — a small loose pile of crates. */
function fragmentShape(e: Entity, n: (i: number) => number): Part[] {
  const out: Part[] = [];
  const count = 3;
  let y = 0;
  for (let i = 0; i < count; i++) {
    const s = e.mass * (0.62 - i * 0.11);
    const x = n(i) * e.mass * 0.5;
    const z = n(i + 5) * e.mass * 0.5;
    out.push(crate(s, x, y + s / 2, z, e.rot + i * 0.6));
    y += s * 0.78;
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
  shade(g, -e.depth * 0.4, e.height, 1 - e.erosion * 0.28);
  g.translate(e.x, e.y, e.z);
  return g;
}

/**
 * Merge, having first agreed on whether the set is indexed.
 *
 * three's polyhedra — the crystals and the shards — come back non-indexed,
 * while boxes, lathes, tori, cylinders and tubes come back indexed, and
 * mergeGeometries refuses a mixed set: it logs and returns null. The null was
 * then filtered out, so two whole material families were being dropped from
 * the world without anything failing. Flattening to non-indexed costs a few
 * thousand vertices at this polygon count and makes the merge total.
 */
function merge(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const flat = parts.map((g) => (g.index ? g.toNonIndexed() : g));
  const out = mergeGeometries(flat, false);
  if (!out) throw new Error("mergeGeometries returned null after normalising to non-indexed");
  return out;
}

export interface WorldGeometry {
  /* Merged by language rather than by material family. The family still
     chooses the shape language and the surface qualities; the language
     chooses the colour, and colour is what has to be one draw call per
     district rather than one for the whole world. */
  families: { family: string; geometry: THREE.BufferGeometry }[];
  seams: THREE.BufferGeometry | null;
  route: THREE.BufferGeometry;
  /** Trajectory breaks, at the boundaries between eras. */
  rifts: THREE.BufferGeometry;
  /** Relationships between works. Drawn only under the COLLABORATION lens. */
  conduits: THREE.BufferGeometry;
}

export function buildWorld(): WorldGeometry {
  const byFamily = new Map<string, Part[]>();
  const seams: Part[] = [];

  for (const e of entities) {
    const n = noiser(e.id);
    // ORGANIC is chosen by material rather than type: it is a statement about
    // how a work grew, not about how significant it became.
    const shaper = e.material === "ORGANIC" ? organicShape : SHAPE_BY_TYPE[e.type];
    const parts = shaper(e, n).map((g) => place(g, e));
    const list = byFamily.get(e.language) ?? [];
    list.push(...parts);
    byFamily.set(e.language, list);

    // A running system has a glow at its base. One ring, not one per phase —
    // the phase count now drives roof dormers and tower bands instead.
    if (e.material === "ACTIVE") {
      seams.push(place(ring(e.mass * 1.05, 0.09, 0, 0.12, 0, Math.PI * 2, Math.PI / 2, e.rot), e));
    }
  }

  const families = Array.from(byFamily.entries())
    .map(([family, parts]) => ({ family, geometry: merge(parts) }));

  const len = WORLD.depth + 200;
  const strip = (x: number) => {
    const g = new THREE.PlaneGeometry(0.22, len);
    g.rotateX(-Math.PI / 2);
    g.translate(x, 0.03, -len / 2 + 70);
    return g;
  };
  const route = merge([strip(-3.1), strip(3.1)]);

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
  const rifts = merge(riftParts.map((g) => shade(g, -3, 4)));

  /* Conduits: the eight attempts at one assistant, drawn as one line through
     the world. This is the relationship the record most clearly supports. */
  const byId = new Map(entities.map((e) => [e.id, e]));
  // `lineage` is already the real order these eight attempts happened in —
  // the z-sort this used to have was inherited from the old corridor world,
  // where time ran down -z and re-sorting by it was harmless because it
  // matched chronology anyway. In the district ring z means nothing (a
  // district is a place, not a date), so that sort was quietly replacing
  // "attempt 1 → 2 → ... → 8" with an arbitrary geometric ordering.
  const chain = lineage
    .map((a) => byId.get(a.name.split(" · ")[0]))
    .filter((e): e is Entity => Boolean(e));
  const conduitParts: Part[] = [];
  if (chain.length > 1) {
    const pts = chain.map((e) => new THREE.Vector3(e.x, e.height * 0.55 + 2, e.z));
    // Thinner than the old 0.24: in the corridor world this line ran close
    // beside the path you were already walking, so its thickness barely
    // registered. Eight districts apart, the same tube arcs high across
    // open sky between them — the emissive intensity below has to come down
    // to match, or a real relationship the record supports reads as a
    // rendering glitch instead of a line worth noticing.
    conduitParts.push(conduit(pts, 0.13));
  }
  const conduits = conduitParts.length ? merge(conduitParts) : new THREE.BufferGeometry();

  return { families, seams: seams.length ? merge(seams) : null, route, rifts, conduits };
}
