import * as THREE from "three";

/**
 * Primitive vocabulary.
 *
 * The first pass built every structure out of stacked boxes, which collapsed
 * five material families into one silhouette and broke Bible §07: important
 * locations must be identifiable by shape before any detail resolves. These
 * are the forms that replace it — crystal, obelisk, branch, ring, shard,
 * arc, fissure — each with a different profile against the horizon.
 */

export type Part = THREE.BufferGeometry;

const place = (
  g: THREE.BufferGeometry,
  x: number,
  y: number,
  z: number,
  ry = 0,
  rz = 0,
  rx = 0,
) => {
  const e = new THREE.Euler(rx, ry, rz);
  const m = new THREE.Matrix4().makeRotationFromEuler(e);
  m.setPosition(x, y, z);
  g.applyMatrix4(m);
  return g;
};

export const slab = (
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  ry = 0,
  rz = 0,
) => place(new THREE.BoxGeometry(w, h, d), x, y, z, ry, rz);

/** Faceted crystal. Used where a work is singular rather than merely large. */
export const crystal = (r: number, x: number, y: number, z: number, ry = 0, rz = 0) =>
  place(new THREE.IcosahedronGeometry(r, 0), x, y, z, ry, rz);

/** Angular splinter. Fragments and rubble read as shards, never small boxes. */
export const shard = (r: number, x: number, y: number, z: number, ry = 0, rz = 0) =>
  place(new THREE.TetrahedronGeometry(r, 0), x, y, z, ry, rz);

/** A tapered obelisk turned from a profile — no stacking, one continuous mass. */
export function obelisk(baseR: number, topR: number, h: number, bands = 5): Part {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= bands; i++) {
    const t = i / bands;
    const r = baseR + (topR - baseR) * Math.pow(t, 0.72);
    // A slight step at each band reads as a construction course.
    pts.push(new THREE.Vector2(r, t * h));
    if (i < bands) pts.push(new THREE.Vector2(r * 0.94, (t + 1 / bands) * h * 0.999));
  }
  return new THREE.LatheGeometry(pts, 6);
}

/** Half-buried ring. Age, and something that was once whole. */
export const ring = (
  R: number,
  tube: number,
  x: number,
  y: number,
  z: number,
  arc = Math.PI * 2,
  rx = 0,
  ry = 0,
) => place(new THREE.TorusGeometry(R, tube, 5, 18, arc), x, y, z, ry, 0, rx);

/** A limb. Branching growth is built from these, recursively. */
export const limb = (
  r0: number,
  r1: number,
  len: number,
  x: number,
  y: number,
  z: number,
  ry: number,
  rz: number,
) => {
  const g = new THREE.CylinderGeometry(r1, r0, len, 5, 1, true);
  g.translate(0, len / 2, 0);
  return place(g, x, y, z, ry, rz);
};

/**
 * Recursive branching. Organic computational growth — Bible §05 — is the one
 * family that must not be rectilinear, because it stands for relationships
 * and ecosystems rather than construction.
 */
export function branch(
  out: Part[],
  x: number,
  y: number,
  z: number,
  dir: { ry: number; rz: number },
  len: number,
  r: number,
  depth: number,
  seed: (n: number) => number,
) {
  if (depth <= 0 || len < 0.9) return;
  const r1 = r * 0.68;
  out.push(limb(r, r1, len, x, y, z, dir.ry, dir.rz));

  // Advance to the tip of the limb we just placed.
  const tip = new THREE.Vector3(0, len, 0)
    .applyEuler(new THREE.Euler(0, dir.ry, dir.rz))
    .add(new THREE.Vector3(x, y, z));

  const forks = depth > 2 ? 3 : 2;
  for (let i = 0; i < forks; i++) {
    const s = seed(depth * 10 + i);
    branch(
      out,
      tip.x,
      tip.y,
      tip.z,
      {
        ry: dir.ry + s * 1.5 + (i - (forks - 1) / 2) * 0.8,
        rz: dir.rz + (0.24 + Math.abs(s) * 0.42) * (i % 2 ? 1 : -1),
      },
      len * (0.66 + Math.abs(s) * 0.12),
      r1,
      depth - 1,
      seed,
    );
  }
}

/** A tube following a path. Relationships are drawn, not implied. */
export function conduit(points: THREE.Vector3[], radius: number): Part {
  const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.4);
  return new THREE.TubeGeometry(curve, Math.max(24, points.length * 12), radius, 5, false);
}

/**
 * A fissure across the ground. A RIFT is a change in engineering trajectory,
 * and Bible §13 requires it to be a real environmental phenomenon rather than
 * a marker: the ground breaks, and the two sides no longer line up.
 */
export function fissure(z: number, width: number, seedAt: (n: number) => number): Part[] {
  const out: Part[] = [];
  const steps = 11;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1) - 0.5;
    const x = t * width;
    const s = seedAt(i);
    // The ground subsides and the two sides stop lining up. Kept below eye
    // height throughout: a rift the visitor cannot see over is a wall, and a
    // wall is not what a break in trajectory looks like.
    const drop = 0.7 + Math.abs(t) * 0.4;
    out.push(
      slab(width / steps + 1.4, 1.5, 10 + s * 3, x, -drop + s * 0.35, z - 4.5, s * 0.1, s * 0.05),
    );
    out.push(
      slab(width / steps + 1.4, 1.5, 10 - s * 3, x, -drop - s * 0.4, z + 4.5, -s * 0.1, -s * 0.04),
    );
  }
  return out;
}
