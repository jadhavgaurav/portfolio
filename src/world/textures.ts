import * as THREE from "three";

/**
 * Surface detail.
 *
 * Every structure was a flat primitive with a single colour: correct for the
 * shape language, but nothing about the surface itself carried any detail —
 * no grain, no seams, no wear. This generates it.
 *
 * Not fetched. A texture pulled from an image-generation service was tried
 * first and abandoned: the session's egress policy denies the asset host
 * outright, correctly, since it is not on the allowed list, and the policy
 * itself says not to route around a denial like that. Drawing the detail
 * with a seeded generator is not a fallback for that — it is the more
 * consistent choice anyway. Every material fact in this world already comes
 * from a deterministic function of the commit record; a texture pulled from
 * a third-party host would have been the one surface in the whole piece that
 * did not.
 */

let structureDetail: THREE.CanvasTexture | null = null;
let groundDetail: THREE.CanvasTexture | null = null;

/** Same small hash the rest of the world seeds its determinism from. */
function hash(x: number, y: number, seed: number): number {
  let h = 2166136261 ^ seed;
  h = Math.imul(h ^ x, 16777619);
  h = Math.imul(h ^ y, 16777619);
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995);
  h ^= h >>> 15;
  return ((h >>> 0) / 4294967295) * 2 - 1;
}

/** Value noise: bilinear-interpolated lattice noise, octaved. Nothing fancier
 *  is worth it at the resolution this gets viewed from — the geometry is
 *  low-poly and the texture is a multiplicative grain on top of it, not the
 *  thing carrying the shape. */
function valueNoise(x: number, y: number, seed: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const a = hash(x0, y0, seed);
  const b = hash(x0 + 1, y0, seed);
  const c = hash(x0, y0 + 1, seed);
  const d = hash(x0 + 1, y0 + 1, seed);
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbm(x: number, y: number, seed: number, octaves: number): number {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    sum += valueNoise(x * freq, y * freq, seed + i * 101) * amp;
    amp *= 0.52;
    freq *= 2.06;
  }
  return sum;
}

/** Structure surfaces: fine grain plus faint rectangular seams, the way a
 *  precast panel or a machined face reads at a distance. Neutral grey so it
 *  multiplies cleanly into whatever colour the language tint and the baked
 *  AO have already decided the surface is. */
export function getStructureDetailTexture(): THREE.CanvasTexture {
  if (structureDetail) return structureDetail;
  const size = 512;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  const scale = 10;
  const seamEvery = size / 6;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let v = 0.5 + fbm((x / size) * scale, (y / size) * scale, 7, 4) * 0.5;

      // Panel seams: thin darker lines on a loose grid, offset per-cell so
      // they read as jointed construction rather than as a perfect graph.
      const jx = x % seamEvery;
      const jy = y % seamEvery;
      const seamWidth = 1.6;
      if (jx < seamWidth || jy < seamWidth) v -= 0.24;

      // A little per-panel tonal variation, the way real precast reads.
      const panelId = Math.floor(x / seamEvery) * 131 + Math.floor(y / seamEvery) * 977;
      v += hash(panelId, 0, 11) * 0.06;

      v = Math.max(0, Math.min(1, v));
      const g = Math.round(v * 255);
      const i = (y * size + x) * 4;
      img.data[i] = g;
      img.data[i + 1] = g;
      img.data[i + 2] = g;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.NoColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  structureDetail = tex;
  return tex;
}

/** Ground: coarser, darker, with hairline cracks rather than seams — a
 *  surface that has been walked on rather than assembled. */
export function getGroundDetailTexture(): THREE.CanvasTexture {
  if (groundDetail) return groundDetail;
  const size = 512;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  const scale = 5;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let v = 0.44 + fbm((x / size) * scale, (y / size) * scale, 31, 5) * 0.4;

      // Hairline cracks: a ridge where a second, sharper noise field crosses
      // zero, thresholded thin.
      const crack = fbm((x / size) * scale * 2.3, (y / size) * scale * 2.3, 59, 2);
      if (Math.abs(crack) < 0.012) v -= 0.22;

      v = Math.max(0, Math.min(1, v));
      const g = Math.round(v * 255);
      const i = (y * size + x) * 4;
      img.data[i] = g;
      img.data[i + 1] = g;
      img.data[i + 2] = g;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.NoColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  groundDetail = tex;
  return tex;
}

let toonRamp: THREE.DataTexture | null = null;

/** A four-step lighting ramp for MeshToonMaterial. Discrete bands are what
 *  make a cel-shaded surface read as cel-shaded rather than as a standard
 *  material with a cheap gradient — the eye is very good at noticing a smooth
 *  falloff and very bad at questioning a clean step. */
export function getToonRamp(): THREE.DataTexture {
  if (toonRamp) return toonRamp;
  const steps = new Uint8Array([
    70, 70, 70, 255,
    130, 130, 130, 255,
    195, 195, 195, 255,
    255, 255, 255, 255,
  ]);
  const tex = new THREE.DataTexture(steps, 4, 1, THREE.RGBAFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  toonRamp = tex;
  return tex;
}
