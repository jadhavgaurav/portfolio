import * as THREE from "three";

/**
 * Primitive vocabulary.
 *
 * The previous pass built every structure out of abstract forms — crystals,
 * obelisks, branching limbs — chosen so five material families would never
 * collapse into one silhouette. That succeeded on its own terms and still
 * read as a sculpture garden rather than a place: nothing here had a roof, a
 * door, a trunk, or anything else a person recognises on sight as a building
 * or a tree. These are the forms that replace it — a hut, a tower, a shrine,
 * a tree built from a trunk and foliage, a crate — chosen so every structure
 * is nameable before any label is read, the way Bible §07 always asked for,
 * just answered with legible objects instead of abstract ones.
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

/** A peaked or hipped roof — a low-sided cone/pyramid sat on a body. Four
 *  sides reads as a hip roof, more as a cone.
 *
 *  A four-sided cone is a square pyramid: one radius, so its eave sits the
 *  same distance out on every side. Sat over a rectangular hut body (width
 *  and depth never equal — `landmarkShape`, `dormantShape`) that overhangs
 *  evenly along the short axis and cuts back into the wall along the long
 *  one, reading as a roof that doesn't fit. Passing `depthR` turns the same
 *  pyramid into a rectangular hip roof instead: it is built with corners on
 *  the axes as usual, given the 45° turn that puts its flat faces there —
 *  parallel to a box's walls — and only then stretched along that turned
 *  frame's depth axis, so the eave clears both wall pairs by the same
 *  margin. Leave it out for the round cones (RELIC, MONOLITH) sat on a
 *  circular tower, where one radius already fits on every side. */
export const roof = (
  r: number,
  h: number,
  x: number,
  y: number,
  z: number,
  sides = 4,
  ry = 0,
  depthR?: number,
) => {
  const g = new THREE.ConeGeometry(r, h, sides);
  if (depthR != null) {
    g.rotateY(Math.PI / 4);
    g.scale(1, 1, depthR / r);
  }
  return place(g, x, y, z, ry);
};

/** A tapered cylindrical body — a tower or a silo. */
export const barrel = (
  baseR: number,
  topR: number,
  h: number,
  x: number,
  y: number,
  z: number,
  sides = 8,
  ry = 0,
) => place(new THREE.CylinderGeometry(topR, baseR, h, sides), x, y, z, ry);

/** A gem. Used sparingly — the thing that says "this is the one that matters". */
export const gem = (r: number, x: number, y: number, z: number, ry = 0, rz = 0) =>
  place(new THREE.IcosahedronGeometry(r, 0), x, y, z, ry, rz);

/** Foliage — a squashed, jittered puff. Trees are built from several of these
 *  clustered around a trunk. */
export const puff = (r: number, x: number, y: number, z: number, ry = 0) => {
  const g = new THREE.IcosahedronGeometry(r, 1);
  g.scale(1, 0.78, 1);
  return place(g, x, y, z, ry);
};

/** A ring or halo. Kept for shrine bases and the core's crown. */
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

/** A trunk, or any tapered branch/post. */
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
  const g = new THREE.CylinderGeometry(r1, r0, len, 6, 1);
  g.translate(0, len / 2, 0);
  return place(g, x, y, z, ry, rz);
};

/** A crate. Small, stackable, reads as unfinished or abandoned in a pile. */
export const crate = (s: number, x: number, y: number, z: number, ry = 0) =>
  place(new THREE.BoxGeometry(s, s, s), x, y, z, ry);

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
