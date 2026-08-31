import { entities, type Entity } from "./telemetry";
import { INTERACTABLES, type Interactable } from "./interactables";
import { DISTRICTS, districtCentre, styleFor } from "./language";

/**
 * The map's own model of the world.
 *
 * Both maps were drawing straight from the entity list, which is why they
 * looked like scatter plots: a repository is not a dot, it is a building with
 * a footprint and a rotation, and a district is not a circle, it is a place
 * with an entrance and a road. This assembles what a map actually needs to
 * draw — footprints, roads with a direction, points of interest typed by what
 * they are — once, so the minimap and the full map agree.
 */

export interface Footprint {
  id: string;
  x: number;
  z: number;
  /** Half-extents, from the structure's mass. */
  w: number;
  h: number;
  rot: number;
  color: string;
  language: string;
  name: string;
  commits: number;
}

export const FOOTPRINTS: Footprint[] = entities.map((e: Entity) => ({
  id: e.id,
  x: e.x,
  z: e.z,
  w: e.mass * 0.92,
  h: e.mass * 0.72,
  rot: e.rot,
  color: styleFor(e.language).ui,
  language: e.language,
  name: e.name,
  commits: e.commits,
}));

export interface Road {
  language: string;
  x1: number;
  z1: number;
  x2: number;
  z2: number;
  color: string;
}

/** The eight radial roads, plus a ring road joining the district gates —
 *  which is what stops the map reading as a bicycle wheel. */
export const ROADS: Road[] = (() => {
  const out: Road[] = [];
  const gates = DISTRICTS.map((d) => {
    const [cx, cz] = districtCentre(d);
    const len = Math.hypot(cx, cz) || 1;
    const inset = d.spread + 15;
    return {
      d,
      gx: cx - (cx / len) * inset,
      gz: cz - (cz / len) * inset,
      cx,
      cz,
    };
  });
  for (const g of gates) {
    out.push({
      language: g.d.language,
      x1: 0,
      z1: 0,
      x2: g.cx,
      z2: g.cz,
      color: styleFor(g.d.language).ui,
    });
  }
  for (let i = 0; i < gates.length; i++) {
    const a = gates[i];
    const b = gates[(i + 1) % gates.length];
    out.push({
      language: "ring",
      x1: a.gx,
      z1: a.gz,
      x2: b.gx,
      z2: b.gz,
      color: "#5d6b73",
    });
  }
  return out;
})();

/** Points of interest, which is the interactable list minus the plain
 *  repositories — those are drawn as buildings instead. */
export const POIS: Interactable[] = INTERACTABLES.filter((i) => i.kind !== "REPO");

export const DISTRICT_GATES = DISTRICTS.map((d) => {
  const [cx, cz] = districtCentre(d);
  const len = Math.hypot(cx, cz) || 1;
  const inset = d.spread + 15;
  return {
    d,
    x: cx - (cx / len) * inset,
    z: cz - (cz / len) * inset,
    cx,
    cz,
    style: styleFor(d.language),
  };
});

/** How far out the world goes, for framing and for the scale bar. */
export const MAP_EXTENT = 300;

export interface Waypoint {
  x: number;
  z: number;
  label: string;
}

/** The language of whichever district's centre is nearest — used for the
 *  ambient audio bed and for the district-entry chime. Never null: outside
 *  every district's radius it still names the closest one, which is what a
 *  smoothly crossfading drone wants rather than a hole in the signal. */
export function nearestDistrictLanguage(x: number, z: number): string {
  let best = DISTRICT_GATES[0];
  let bestDist = Infinity;
  for (const g of DISTRICT_GATES) {
    const d = Math.hypot(x - g.cx, z - g.cz);
    if (d < bestDist) {
      bestDist = d;
      best = g;
    }
  }
  return Math.hypot(x, z) < 30 ? "CORE" : best.d.language;
}
