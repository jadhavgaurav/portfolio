import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { WORLD, entities, type Entity, type MaterialFamily } from "./telemetry";

/**
 * World geometry.
 *
 * Each material family gets its own shape language — Bible §07 is explicit
 * that every structure must not be a variation of the same sci-fi building.
 * All of a family's entities are merged into one BufferGeometry, so the whole
 * world costs five draw calls and nothing is rebuilt per frame.
 *
 * Every box placed here is a function of the entity's telemetry. No random
 * decoration: mass, height, phase count and erosion all come from commits,
 * lifespan and idle time.
 */

/**
 * Bake a vertical darkening into vertex colours. Real-time shadows across a
 * 620-unit world cost more than they return here; a gradient that darkens
 * geometry toward the ground gives the contact and the mass reading for free,
 * and it costs nothing per frame.
 */
function shade(g: THREE.BufferGeometry, floor: number, ceiling: number, tint = 1) {
  const pos = g.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const k = Math.min(1, Math.max(0, (y - floor) / Math.max(0.001, ceiling - floor)));
    // Dark at the base, full value at the top.
    const v = (0.66 + Math.pow(k, 0.7) * 0.34) * tint;
    colors[i * 3] = v;
    colors[i * 3 + 1] = v;
    colors[i * 3 + 2] = v;
  }
  g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return g;
}

const box = (
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  ry = 0,
  rz = 0,
): THREE.BufferGeometry => {
  const g = new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Matrix4()
    .makeRotationY(ry)
    .multiply(new THREE.Matrix4().makeRotationZ(rz));
  m.setPosition(x, y, z);
  g.applyMatrix4(m);
  return g;
};

/** Deterministic per-entity jitter. Same name, same shape, always. */
function noise(seed: string, i: number): number {
  let h = 2166136261 ^ i;
  for (let k = 0; k < seed.length; k++) {
    h ^= seed.charCodeAt(k);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) / 4294967295) * 2 - 1;
}

/* ── shape languages ─────────────────────────────────────────────────────── */

/** ORIGIN. Low, wide, stepped stone. Asymmetric accretion reads as chronology. */
function foundation(e: Entity): THREE.BufferGeometry[] {
  const out: THREE.BufferGeometry[] = [];
  const steps = 4;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const w = e.mass * (2.5 - t * 1.5);
    const h = e.height / steps;
    // Each course shifts, so the mass leans the way it grew.
    const ox = noise(e.id, i) * e.mass * 0.42;
    const oz = noise(e.id, i + 40) * e.mass * 0.34;
    out.push(box(w, h, w * 0.82, ox, h * i + h / 2 - e.depth * 0.4, oz, e.rot + t * 0.16));
  }
  return out;
}

/** CONSTRUCTED. Machined slabs, stacked in phases, joints recessed. */
function constructed(e: Entity): THREE.BufferGeometry[] {
  const out: THREE.BufferGeometry[] = [];
  const ph = e.phases;
  const unit = e.height / ph;
  for (let i = 0; i < ph; i++) {
    const t = i / ph;
    const w = e.mass * (1.15 - t * 0.42);
    out.push(
      box(w, unit * 0.86, w * 0.74, 0, unit * i + unit * 0.43 - e.depth * 0.3, 0, e.rot),
    );
    // Recessed joint between phases — the construction-phase separation.
    if (i < ph - 1) {
      out.push(
        box(w * 0.82, unit * 0.14, w * 0.6, 0, unit * (i + 1) - e.depth * 0.3, 0, e.rot),
      );
    }
  }
  return out;
}

/** ORGANIC. Branching verticals — relationships and long ecosystems. */
function organic(e: Entity): THREE.BufferGeometry[] {
  const out: THREE.BufferGeometry[] = [];
  const stems = 5 + Math.round(e.significance * 4);
  for (let i = 0; i < stems; i++) {
    const a = (i / stems) * Math.PI * 2 + e.rot;
    const r = e.mass * (0.3 + Math.abs(noise(e.id, i)) * 0.55);
    const h = e.height * (0.45 + Math.abs(noise(e.id, i + 11)) * 0.75);
    const lean = noise(e.id, i + 23) * 0.13;
    out.push(
      box(
        e.mass * 0.19,
        h,
        e.mass * 0.19,
        Math.cos(a) * r,
        h / 2 - e.depth * 0.25,
        Math.sin(a) * r,
        a,
        lean,
      ),
    );
  }
  // A shared base binds the cluster into one entity rather than a thicket.
  out.push(box(e.mass * 1.5, e.height * 0.1, e.mass * 1.5, 0, e.height * 0.05, 0, e.rot));
  return out;
}

/** RUINED. Sunk, sheared, unmaintained — never rubble, never collapse. */
function ruined(e: Entity): THREE.BufferGeometry[] {
  const out: THREE.BufferGeometry[] = [];
  // Deeper burial the longer it has been idle.
  const sink = e.height * (0.22 + e.erosion * 0.3);
  const main = e.height - sink;
  out.push(box(e.mass * 1.05, main, e.mass * 0.8, 0, main / 2 - sink * 0.15, 0, e.rot, noise(e.id, 3) * 0.06));
  // One shear plane: the structure stopped mid-course.
  const sh = main * 0.42;
  out.push(
    box(
      e.mass * 0.72,
      sh,
      e.mass * 0.55,
      noise(e.id, 7) * e.mass * 0.5,
      main - sh * 0.2,
      noise(e.id, 9) * e.mass * 0.4,
      e.rot + noise(e.id, 12) * 0.5,
      noise(e.id, 15) * 0.18,
    ),
  );
  return out;
}

/** ACTIVE. Constructed precision, plus running systems. Seams handled separately. */
const active = constructed;

const SHAPE: Record<MaterialFamily, (e: Entity) => THREE.BufferGeometry[]> = {
  FOUNDATION: foundation,
  CONSTRUCTED: constructed,
  ACTIVE: active,
  ORGANIC: organic,
  RUINED: ruined,
};

/* ── assembly ────────────────────────────────────────────────────────────── */

function place(g: THREE.BufferGeometry, e: Entity) {
  // Weathering darkens an unmaintained structure further.
  shade(g, -e.depth * 0.4, e.height, 1 - e.erosion * 0.34);
  g.translate(e.x, e.y, e.z);
  return g;
}

export interface WorldGeometry {
  families: { family: MaterialFamily; geometry: THREE.BufferGeometry }[];
  /** Emissive joints on ACTIVE entities. Motivated light only — Rule L1. */
  seams: THREE.BufferGeometry | null;
  /** The route: the time spine the player walks along. */
  route: THREE.BufferGeometry;
}

export function buildWorld(): WorldGeometry {
  const byFamily = new Map<MaterialFamily, THREE.BufferGeometry[]>();
  const seams: THREE.BufferGeometry[] = [];

  for (const e of entities) {
    const parts = SHAPE[e.material](e).map((g) => place(g, e));
    const list = byFamily.get(e.material) ?? [];
    list.push(...parts);
    byFamily.set(e.material, list);

    if (e.material === "ACTIVE") {
      const unit = e.height / e.phases;
      for (let i = 1; i < e.phases; i++) {
        const w = e.mass * (1.15 - (i / e.phases) * 0.42);
        seams.push(
          place(box(w * 0.86, unit * 0.05, w * 0.63, 0, unit * i - e.depth * 0.3, 0, e.rot), e),
        );
      }
    }
  }

  const families = Array.from(byFamily.entries())
    .map(([family, parts]) => ({ family, geometry: mergeGeometries(parts, false)! }))
    .filter((f) => f.geometry);

  // Route: two thin edge strips, not a carpet. They mark the time axis and
  // give the eye a vanishing point without becoming the subject.
  const len = WORLD.depth + 200;
  const strip = (x: number) => {
    const g = new THREE.PlaneGeometry(0.22, len);
    g.rotateX(-Math.PI / 2);
    g.translate(x, 0.03, -len / 2 + 70);
    return g;
  };
  const route = mergeGeometries([strip(-3.1), strip(3.1)], false)!;

  return {
    families,
    seams: seams.length ? mergeGeometries(seams, false) : null,
    route,
  };
}
