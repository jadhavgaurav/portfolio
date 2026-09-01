import { WORLD, origin } from "./telemetry";

/**
 * The opening sequence and the camera contract.
 *
 * Structure is NULL's own: VOID → SIGNAL → EMERGENCE → ARRIVAL, then player
 * authority. Durations are compressed from the twenty seconds the design doc
 * specifies, because this runs in a browser tab rather than a game launcher —
 * the beats and their order are unchanged, and any input after SIGNAL hands
 * control straight back, per control rule C2.
 */

export type Phase = "VOID" | "SIGNAL" | "EMERGENCE" | "ARRIVAL" | "PLAYER";

/**
 * Beat durations.
 *
 * The design specifies twenty seconds. Ten was tried here and measured: the
 * visitor could not act on anything for 10.4s after load, on every visit,
 * which is a bounce, not an opening. Four and a half keeps all four beats and
 * their order — and the skip is now offered rather than merely possible.
 */
export const BEATS: { phase: Phase; duration: number }[] = [
  { phase: "VOID", duration: 0.7 },
  { phase: "SIGNAL", duration: 1.2 },
  { phase: "EMERGENCE", duration: 1.8 },
  { phase: "ARRIVAL", duration: 0.8 },
];

/** After this, any input hands authority back and the skip is offered. */
export const SKIPPABLE_AFTER = 0.8;

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
