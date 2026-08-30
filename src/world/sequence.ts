import { WORLD, core, entities, origin } from "./telemetry";

/**
 * The opening sequence and the camera contract.
 *
 * Structure is NULL's own: VOID → SIGNAL → EMERGENCE → ARRIVAL, then player
 * authority. Durations are compressed from the twenty seconds the design doc
 * specifies to ten, because this runs in a browser tab rather than a game
 * launcher — the beats and their order are unchanged, and any input after
 * SIGNAL hands control straight back, per control rule C2.
 */

export type Phase = "VOID" | "SIGNAL" | "EMERGENCE" | "ARRIVAL" | "PLAYER";

export const BEATS: { phase: Phase; duration: number }[] = [
  { phase: "VOID", duration: 1.6 },
  { phase: "SIGNAL", duration: 2.6 },
  { phase: "EMERGENCE", duration: 4.2 },
  { phase: "ARRIVAL", duration: 1.6 },
];

export const OPENING_SECONDS = BEATS.reduce((n, b) => n + b.duration, 0);

/** Where the camera stands when authority transfers. Derived, not authored:
 *  ORIGIN must sit 20–40 units out and 10–25° off centre, so the visitor has
 *  to turn toward it. Centred reads as a menu. */
export const ARRIVAL_POSE = (() => {
  const offsetAngle = (17 * Math.PI) / 180;
  const distance = 30;
  const dirX = Math.sign(origin.x) || 1;
  return {
    position: [
      origin.x - dirX * Math.sin(offsetAngle) * distance,
      WORLD.eyeHeight,
      origin.z + Math.cos(offsetAngle) * distance,
    ] as [number, number, number],
    lookAt: [origin.x, origin.height * 0.42, origin.z] as [number, number, number],
  };
})();

/** Camera pose for a point in the opening. Slow: under 6 units/second. */
export function openingPose(phase: Phase, t: number) {
  const a = ARRIVAL_POSE.position;
  switch (phase) {
    case "VOID":
      // Far above and behind. Nothing is visible; the fog is opaque.
      return {
        position: [a[0] * 0.3, 96, a[2] + 150] as [number, number, number],
        lookAt: [origin.x, 30, origin.z] as [number, number, number],
        fov: 55,
      };
    case "SIGNAL": {
      // Hold high. The only thing that exists is the earliest trace.
      const k = ease(t);
      return {
        position: [a[0] * 0.3, 96 - k * 14, a[2] + 150 - k * 18] as [number, number, number],
        lookAt: [origin.x, 18 - k * 6, origin.z] as [number, number, number],
        fov: 55,
      };
    }
    case "EMERGENCE": {
      // Descend. The world resolves around the signal as the medium clears.
      const k = ease(t);
      return {
        position: [
          a[0] * (0.3 + 0.7 * k),
          82 - k * (82 - WORLD.eyeHeight - 6),
          a[2] + 132 - k * 132,
        ] as [number, number, number],
        lookAt: [origin.x, 12 - k * 9, origin.z] as [number, number, number],
        fov: 55 + k * 6,
      };
    }
    default: {
      // ARRIVAL: settle to eye height. No announcement of any kind.
      const k = ease(t);
      return {
        position: [a[0], WORLD.eyeHeight + (1 - k) * 4.3, a[2] - k * 0] as [number, number, number],
        lookAt: ARRIVAL_POSE.lookAt,
        fov: 61 + k * 4,
      };
    }
  }
}

function ease(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Player traversal: scroll walks the spine, first commit to CORE. */
export function traversalPose(scroll: number) {
  const startZ = ARRIVAL_POSE.position[2];
  const endZ = core.z + 34;
  const z = startZ + (endZ - startZ) * scroll;

  // Rise gently over the traverse so the CORE is met from above, and the
  // final pull-back shows the whole world at once.
  const lift = scroll > 0.86 ? (scroll - 0.86) / 0.14 : 0;
  const y = WORLD.eyeHeight + Math.sin(scroll * Math.PI) * 2.4 + lift * lift * 30;

  // Yaw toward the nearest significant structure ahead. Approach and pass —
  // never orbit.
  const near = nearest(z);
  // The weave has to stay inside the corridor the layout reserves.
  const lateral = near ? near.x * 0.1 : 0;
  const x = lateral * (1 - lift);

  const lookZ = z - 46;
  const lookX = near ? near.x * 0.34 * (1 - lift) : 0;
  const lookY = WORLD.eyeHeight + (near ? Math.min(near.height * 0.3, 26) : 0) + lift * 22;

  // Long lens at range, wider close in.
  const d = near ? Math.hypot(near.x - x, near.z - z) : 200;
  const fov = THREE_clamp(70 - (d / 90) * 15, 55, 70);

  return {
    position: [x, y, z] as [number, number, number],
    lookAt: [lookX, lookY, lookZ] as [number, number, number],
    fov,
  };
}

function THREE_clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

const SIGNIFICANT = entities
  .filter((e) => e.type !== "FRAGMENT")
  .sort((a, b) => b.z - a.z);

/** The structure the visitor is currently passing. */
export function nearest(z: number) {
  let best: (typeof SIGNIFICANT)[number] | null = null;
  let bestD = Infinity;
  for (const e of SIGNIFICANT) {
    const d = Math.abs(e.z - (z - NEAREST_LEAD));
    if (d < bestD) {
      bestD = d;
      best = e;
    }
  }
  return bestD < 90 ? best : null;
}

/**
 * Inverse of the traverse: the scroll value at which the camera stands a
 * given distance before an entity. Passages are positioned with this rather
 * than by hand, so the text always describes the structure actually in front
 * of the visitor.
 */
export const NEAREST_LEAD = 30;

export function scrollAtEntity(id: string, lead = NEAREST_LEAD): number {
  const e = entities.find((x) => x.id === id);
  if (!e) return 0;
  const startZ = ARRIVAL_POSE.position[2];
  const endZ = core.z + 34;
  const targetZ = e.z + lead;
  return Math.min(0.94, Math.max(0, (targetZ - startZ) / (endZ - startZ)));
}

/** Which beat a given elapsed time falls in. */
export function beatAt(elapsed: number): { phase: Phase; t: number } {
  let acc = 0;
  for (const b of BEATS) {
    if (elapsed < acc + b.duration) {
      return { phase: b.phase, t: (elapsed - acc) / b.duration };
    }
    acc += b.duration;
  }
  return { phase: "PLAYER", t: 1 };
}
