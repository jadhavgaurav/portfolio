import { LAYERS, FORMATIONS, VEINS, type Layer, type FormationId, type VeinId } from '@/data/strata';

/**
 * Core geometry.
 *
 * The column is read top-down: the surface is the present, depth is the past.
 * LAYERS arrives oldest-first from the API, so it is reversed here — index 0 is
 * the most recent push and sits at depth zero.
 *
 * Band thickness is log-scaled repository size. Barren intervals are inserted
 * proportional to real elapsed time between pushes, so the eleven-month gap of
 * 2024 is something you physically travel through rather than a styling choice.
 *
 * One world unit = one metre of record. Both the WebGL column and the SVG
 * column consume this, so they can never disagree.
 */

export interface Band {
  layer: Layer;
  /** Depth of the band's top edge, in metres from the surface. */
  top: number;
  thickness: number;
  /** Barren interval immediately above this band, in metres. */
  gapAbove: number;
  pigment: string;
  index: number;
}

const MIN_T = 0.42;
const MAX_T = 1.9;
const SIZE_CEIL = Math.log10(760_000);

const pigmentOf = (f: FormationId) =>
  FORMATIONS.find((x) => x.id === f)?.pigment ?? '#7A6A54';

const days = (a: string, b: string) =>
  Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 86_400_000;

function build(): Band[] {
  // Newest first: the surface is today.
  const ordered = [...LAYERS].sort((a, b) => (a.created < b.created ? 1 : -1));
  const out: Band[] = [];
  let cursor = 0;

  ordered.forEach((layer, index) => {
    const t = Math.log10(layer.sizeKb + 12) / SIZE_CEIL;
    const thickness = Math.min(MAX_T, MIN_T + t * (MAX_T - MIN_T));

    let gapAbove = 0;
    if (index > 0) {
      const elapsed = days(ordered[index - 1].created, layer.created);
      // Nothing under five weeks registers; beyond that, time becomes distance.
      gapAbove = Math.min(6.5, Math.max(0, (elapsed - 34) / 30) * 0.62);
    }

    cursor += gapAbove;
    out.push({ layer, top: cursor, thickness, gapAbove, pigment: pigmentOf(layer.formation), index });
    cursor += thickness;
  });

  return out;
}

export const BANDS: Band[] = build();
export const CORE_DEPTH = BANDS[BANDS.length - 1].top + BANDS[BANDS.length - 1].thickness;

export const centreOf = (b: Band) => b.top + b.thickness / 2;

/** Which band the reading head is inside, or the nearest one if it is in a void. */
export function bandAtDepth(depth: number): Band {
  let best = BANDS[0];
  let bestGap = Infinity;
  for (const b of BANDS) {
    if (depth >= b.top && depth <= b.top + b.thickness) return b;
    const gap = depth < b.top ? b.top - depth : depth - (b.top + b.thickness);
    if (gap < bestGap) { bestGap = gap; best = b; }
  }
  return best;
}

/** True when the head is in a barren interval rather than in rock. */
export function inVoid(depth: number): boolean {
  return !BANDS.some((b) => depth >= b.top && depth <= b.top + b.thickness);
}

/** Formation bands, as contiguous depth ranges, for the gauge. */
export const FORMATION_RANGES = FORMATIONS.map((f) => {
  const inF = BANDS.filter((b) => b.layer.formation === f.id);
  const top = Math.min(...inF.map((b) => b.top));
  const base = Math.max(...inF.map((b) => b.top + b.thickness));
  return { formation: f, top, base, count: inF.length };
}).sort((a, b) => a.top - b.top);

/** Vein extents — first to last layer carrying the idea. */
export const VEIN_RUNS = VEINS.map((v) => {
  const inV = BANDS.filter((b) => b.layer.veins.includes(v.id));
  return {
    vein: v,
    bands: inV,
    top: Math.min(...inV.map((b) => b.top)),
    base: Math.max(...inV.map((b) => b.top + b.thickness)),
    count: inV.length,
  };
}).sort((a, b) => b.count - a.count);

export const bandsInVein = (id: VeinId) => BANDS.filter((b) => b.layer.veins.includes(id));

/* ── readouts ─────────────────────────────────────────────────────── */

export const fmtDepth = (d: number) => `${d.toFixed(2)} m`;

export const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC',
  }).toUpperCase();

export function fmtSize(kb: number) {
  if (kb === 0) return 'EMPTY';
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(kb / 1024 >= 100 ? 0 : 1)} MB`;
}

/** Interpolated date at a given depth — the gauge reads this continuously. */
export function dateAtDepth(depth: number): string {
  const clamped = Math.max(0, Math.min(CORE_DEPTH, depth));
  for (let i = 0; i < BANDS.length; i++) {
    const b = BANDS[i];
    if (clamped <= b.top + b.thickness) {
      const prev = BANDS[i - 1];
      const spanTop = prev ? prev.top + prev.thickness : 0;
      const t = (clamped - spanTop) / Math.max(0.001, b.top + b.thickness - spanTop);
      const from = prev ? new Date(prev.layer.created) : new Date(b.layer.created);
      const to = new Date(b.layer.created);
      const ms = from.getTime() + (to.getTime() - from.getTime()) * Math.min(1, Math.max(0, t));
      return new Date(ms).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).toUpperCase();
    }
  }
  return fmtDate(BANDS[BANDS.length - 1].layer.created);
}
