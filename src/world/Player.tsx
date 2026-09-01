"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { entities, CORE_PLINTH, core, type Entity, type EntityType } from "./telemetry";
import { nearestDistrictLanguage } from "./mapdata";
import { driveFootsteps, jump as jumpSfx, land as landSfx, tickAmbient } from "@/audio/engine";

/**
 * The player.
 *
 * This replaces the scroll rail. The previous world moved the camera along a
 * fixed spine at a fixed rate and called the result exploration; nothing the
 * visitor did changed where they could go. Here they hold the character and
 * the character holds the camera, which is the difference between a cutscene
 * and a game.
 *
 * Movement is camera-relative — forward is where you are looking, not where
 * the world's -Z happens to point — because anything else is unlearnable.
 */

export const PLAYER = {
  /** Eye height is the camera's business; this is the character's. */
  height: 1.75,
  radius: 0.42,
  walk: 7.4,
  run: 13.2,
  /** Reached in a fifth of a second. Sharper than realistic on purpose:
   *  input latency is the single thing that makes a browser game feel dead. */
  accel: 46,
  /* Was 11, which left a tail of about two seconds after the key came up —
     long enough to read as the character not stopping. */
  friction: 30,
  gravity: 26,
  jump: 8.4,
  /** Third-person rig. An orbit around a point above the character: yaw
   *  swings it around, pitch swings it up and over or down and under. */
  camDistance: 6.0,
  camHeight: 2.5,
  camLag: 9,
  turnRate: 9,
  /* Loose enough to look near-overhead or near level with the ground, tight
   *  enough that the camera can never orbit under the terrain. */
  pitchMin: -0.5,
  pitchMax: 1.15,
} as const;

/** What the player can walk into. Cylinders from the telemetry rather than
 *  raycasts against merged geometry: every structure already knows its own
 *  footprint, and forty cylinder tests per frame costs nothing. */
export interface Obstacle {
  x: number;
  z: number;
  r: number;
  id: string;
}

/**
 * How far a structure's own silhouette actually reaches, per shape family —
 * as a multiple of `mass`, the same variable geometry.ts's shape functions
 * build from.
 *
 * This used to be one flat 0.92 for every entity regardless of shape.
 * Reported directly, and confirmed by re-deriving each shape function's own
 * widest point by hand: the origin's stepped shrine — a single, unique
 * structure, and the first thing "twitter-blockchain-web3" ever built —
 * tapers from a base a full 1.25x mass wide, a third again past what the
 * flat coefficient assumed, so the player's own collision circle sat well
 * inside the shrine's real stone and let them walk straight into it. An
 * ordinary landmark hut's roof reaches just under 0.99x mass at its
 * corners — safe at low mass, clipping by a growing margin as a hut's own
 * commit count (and so its mass) climbs toward the highest in the record.
 * Every other shape family was already inside 0.92 with real margin to
 * spare — RELIC and MONOLITH taper inward as they rise, ORGANIC's widest
 * puff tops out at 0.6, DORMANT's roof at 0.85 — so this only widens what
 * was actually too narrow rather than loosening collision everywhere.
 */
const SHAPE_RADIUS_MULT: Record<EntityType, number> = {
  ORIGIN: 1.3,
  RELIC: 0.7,
  MONOLITH: 0.55,
  LANDMARK: 1.0,
  DORMANT: 0.88,
  FRAGMENT: 1.0,
  CORE: 1.0, // never actually assigned by buildEntities(); landmarkShape's own footprint, for safety.
};
/** ORGANIC is chosen by material rather than type (see geometry.ts's own
 *  `shaper` selection) — a slowly-grown work reads as a tree regardless of
 *  what type it would otherwise have been classified as. */
const ORGANIC_RADIUS_MULT = 0.62;

function radiusMultFor(e: Entity): number {
  return e.material === "ORGANIC" ? ORGANIC_RADIUS_MULT : SHAPE_RADIUS_MULT[e.type];
}

export const OBSTACLES: Obstacle[] = entities.map((e) => ({
  x: e.x,
  z: e.z,
  // Footprint plus the character's own radius, so the test is a point test.
  r: e.mass * radiusMultFor(e) + PLAYER.radius,
  id: e.id,
}));

export interface PlayerState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  /** Facing, radians. Drives the avatar; the camera has its own. */
  yaw: number;
  /** 0 → still, 1 → full run. Drives the walk cycle and the footstep rate. */
  speed01: number;
  grounded: boolean;
  /** Camera yaw, which the player steers independently of facing. */
  camYaw: number;
  /** Camera elevation. Positive looks down at the character from above;
   *  negative looks up at them from low behind. */
  camPitch: number;
}

/** Live input, written by listeners and read once per frame. */
export interface Input {
  forward: number;
  strafe: number;
  run: boolean;
  jump: boolean;
  /** Look delta accumulated since the last frame, in radians. */
  lookX: number;
  lookY: number;
}

export function makeInput(): Input {
  return { forward: 0, strafe: 0, run: false, jump: false, lookX: 0, lookY: 0 };
}

/**
 * Resolve a horizontal move against the obstacle field.
 *
 * Pushes out of any cylinder it ends up inside rather than blocking the move,
 * so sliding along a wall works and the player never sticks on a corner.
 */
export function resolve(x: number, z: number): [number, number] {
  let px = x;
  let pz = z;
  for (let pass = 0; pass < 2; pass++) {
    let hit = false;
    for (const o of OBSTACLES) {
      const dx = px - o.x;
      const dz = pz - o.z;
      const d2 = dx * dx + dz * dz;
      if (d2 >= o.r * o.r) continue;
      const d = Math.sqrt(d2) || 0.0001;
      const push = (o.r - d) / d;
      px += dx * push;
      pz += dz * push;
      hit = true;
    }
    if (!hit) break;
  }
  return [px, pz];
}

/**
 * The ground's own height at a point.
 *
 * Everywhere in this world the ground is flat at y=0 — except the core's
 * plinth, which Scene.tsx renders as a real two-unit-tall stone frustum
 * (CORE_PLINTH) with a floor to stand on at the top. The ground here used to
 * be flat everywhere, full stop, so the plinth was hollow underneath its own
 * visible floor: reach the top and there was nothing there to stand on, and
 * you fell straight through back to y=0. Jumping onto it from the ground
 * couldn't help either — with PLAYER.jump and PLAYER.gravity as tuned the
 * highest a jump gets is v²/2g ≈ 1.36 units, well under the plinth's 2-unit
 * wall.
 *
 * This follows the frustum's own slope exactly rather than inventing a
 * separate ramp: at the mesh's outer radius the ground is 0, at its inner
 * (top) radius the ground is CORE_PLINTH.height, and between the two it
 * rises linearly, which is the same taper the stone itself has. Walking
 * toward the core from any direction climbs it like a shallow hill instead
 * of hitting a wall.
 */
export function groundHeightAt(x: number, z: number): number {
  const { topRadius, bottomRadius, height } = CORE_PLINTH;
  const r = Math.hypot(x - core.x, z - core.z);
  if (r <= topRadius) return height;
  if (r >= bottomRadius) return 0;
  return (height * (bottomRadius - r)) / (bottomRadius - topRadius);
}

/**
 * Keep the player inside the world rather than letting them walk to nowhere.
 *
 * This was a box: X clamped to ±88 and Z to a long strip, which is the shape
 * of the corridor the world used to be. The world is a ring of districts
 * reaching about 240 units out in every direction, so five of the eight sat
 * outside the box — walking toward them stopped dead at an invisible wall,
 * and fast travel to Python put the player down at exactly the clamp. The
 * bound is a circle now, sized to the furthest district plus its spread.
 */
const BOUND_R = 320;

/** How long a jump still fires after walking off a ledge with no jump
 *  pressed yet, and how long a jump press is remembered before landing —
 *  120-150ms is the standard range this kind of forgiveness sits in across
 *  platformers; a strict "must be exactly grounded on the exact frame"
 *  reads as an unresponsive control rather than as bad timing, especially
 *  now that the core's plinth gives the world its one real edge to walk
 *  off. Both are pure forgiveness: neither can turn a jump that used to
 *  fail into anything but success, so there is no case this makes worse. */
const COYOTE_TIME = 0.12;
const JUMP_BUFFER = 0.15;

export function PlayerRig({
  input,
  state,
  enabled,
}: {
  input: React.MutableRefObject<Input>;
  state: React.MutableRefObject<PlayerState>;
  enabled: boolean;
}) {
  const { camera } = useThree();
  const camPos = useRef(new THREE.Vector3());
  const camLook = useRef(new THREE.Vector3());
  const started = useRef(false);
  /** Whether the last frame's ground contact was already established —
   *  land() should fire once on the frame contact resumes, not on every
   *  frame the player happens to be standing still. */
  const wasGrounded = useRef(true);
  const fallSpeed = useRef(0);
  /** Seconds since ground was last actually under the player's feet, and
   *  since jump was last actually pressed — coyote time and jump buffering.
   *  Walking off the plinth's edge is the one place in this world an edge
   *  ever needed either: pressing jump a frame after leaving the ground, or
   *  a frame before landing, used to simply fail, which reads as an
   *  unresponsive control rather than as bad timing. */
  const coyoteT = useRef(0);
  const jumpBufferT = useRef(Infinity);
  /** A brief downward kick to the camera on a hard landing, decaying back
   *  to nothing every frame. */
  const camKick = useRef(0);

  const tmp = useMemo(
    () => ({ want: new THREE.Vector3(), fwd: new THREE.Vector3(), right: new THREE.Vector3() }),
    [],
  );

  useFrame((_, rawDelta) => {
    const dt = Math.min(0.05, rawDelta);
    const s = state.current;
    const i = input.current;

    if (enabled) {
      // Look. Yaw is unbounded; pitch is clamped so the horizon stays in the
      // middle third, which is the one camera rule worth keeping from before.
      s.camYaw -= i.lookX;
      s.camPitch = Math.min(
        PLAYER.pitchMax,
        Math.max(PLAYER.pitchMin, s.camPitch + i.lookY),
      );
      i.lookX = 0;
      i.lookY = 0;

      // Camera-relative movement basis, flattened to the ground plane.
      tmp.fwd.set(-Math.sin(s.camYaw), 0, -Math.cos(s.camYaw));
      tmp.right.set(Math.cos(s.camYaw), 0, -Math.sin(s.camYaw));
      tmp.want
        .set(0, 0, 0)
        .addScaledVector(tmp.fwd, i.forward)
        .addScaledVector(tmp.right, i.strafe);

      const moving = tmp.want.lengthSq() > 0.0001;
      if (moving) {
        tmp.want.normalize();
        const top = i.run ? PLAYER.run : PLAYER.walk;
        s.velocity.x += tmp.want.x * PLAYER.accel * dt;
        s.velocity.z += tmp.want.z * PLAYER.accel * dt;
        const flat = Math.hypot(s.velocity.x, s.velocity.z);
        if (flat > top) {
          s.velocity.x = (s.velocity.x / flat) * top;
          s.velocity.z = (s.velocity.z / flat) * top;
        }
        // Face where you are going, turning rather than snapping.
        const want = Math.atan2(tmp.want.x, tmp.want.z);
        let d = want - s.yaw;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        s.yaw += d * Math.min(1, PLAYER.turnRate * dt);
      } else {
        const k = Math.max(0, 1 - PLAYER.friction * dt);
        s.velocity.x *= k;
        s.velocity.z *= k;
        // Exponential decay never reaches zero. Below walking pace a tenth of
        // a unit per second still slides the avatar and still plays the walk
        // cycle, so it is snapped off.
        if (Math.hypot(s.velocity.x, s.velocity.z) < 0.4) {
          s.velocity.x = 0;
          s.velocity.z = 0;
        }
      }

      if (i.jump) jumpBufferT.current = 0;
      i.jump = false;

      if (jumpBufferT.current < JUMP_BUFFER && coyoteT.current < COYOTE_TIME) {
        s.velocity.y = PLAYER.jump;
        s.grounded = false;
        // Both consumed — used up rather than reset to zero, so this exact
        // press can't also fire a second jump the instant it lands again.
        jumpBufferT.current = JUMP_BUFFER;
        coyoteT.current = COYOTE_TIME;
        jumpSfx();
      }
    }

    // Gravity and the ground.
    s.velocity.y -= PLAYER.gravity * dt;
    fallSpeed.current = -s.velocity.y;
    s.position.y += s.velocity.y * dt;
    const groundY = groundHeightAt(s.position.x, s.position.z);
    if (s.position.y <= groundY) {
      s.position.y = groundY;
      s.velocity.y = 0;
      s.grounded = true;
    } else {
      // Walking off the plinth's edge without jumping is the one way to
      // leave the ground without going through the jump branch above, which
      // is the only other place `grounded` used to change. Without this,
      // stepping off stayed "grounded" (stale from the last real landing)
      // all the way down, which would have let a second jump fire in
      // mid-air — never reachable before this fix, since flat ground had no
      // edge to walk off in the first place.
      s.grounded = false;
    }
    let justLanded = false;
    if (s.grounded && !wasGrounded.current && fallSpeed.current > 1) {
      landSfx(fallSpeed.current);
      justLanded = true;
    }
    wasGrounded.current = s.grounded;

    // Coyote time resets the instant the ground is actually back underfoot;
    // otherwise it just keeps counting up, same as the jump buffer always
    // does — a stale buffered press has to age out, not get revived by
    // whatever the ground happens to do later.
    if (s.grounded) coyoteT.current = 0;
    else coyoteT.current += dt;
    jumpBufferT.current += dt;

    // A hard landing gives the camera a small, brief downward kick,
    // proportional to how fast the fall actually was — bigger than the
    // gentlest drop-and-settle, capped well short of disorienting.
    if (justLanded) camKick.current = Math.min(0.32, fallSpeed.current * 0.028);
    camKick.current *= Math.exp(-dt * 16);

    // Horizontal, then pushed out of anything it ended up inside.
    const nx = s.position.x + s.velocity.x * dt;
    const nz = s.position.z + s.velocity.z * dt;
    const [rx, rz] = resolve(nx, nz);
    const outward = Math.hypot(rx, rz);
    if (outward > BOUND_R) {
      s.position.x = (rx / outward) * BOUND_R;
      s.position.z = (rz / outward) * BOUND_R;
    } else {
      s.position.x = rx;
      s.position.z = rz;
    }

    s.speed01 = Math.min(1, Math.hypot(s.velocity.x, s.velocity.z) / PLAYER.run);

    if (enabled) {
      const flatSpeed = Math.hypot(s.velocity.x, s.velocity.z);
      const language = nearestDistrictLanguage(s.position.x, s.position.z);
      driveFootsteps(dt, flatSpeed, s.grounded, language);
      tickAmbient(language);
    }

    /* Third-person camera. It sits behind the camera yaw rather than behind
       the character, so the player steers the view and the character follows
       it — the arrangement every third-person game uses, because the reverse
       makes the camera swing every time you change direction. */
    const cosPitch = Math.cos(s.camPitch);
    const back = new THREE.Vector3(
      Math.sin(s.camYaw) * cosPitch * PLAYER.camDistance,
      PLAYER.camHeight + Math.sin(s.camPitch) * PLAYER.camDistance,
      Math.cos(s.camYaw) * cosPitch * PLAYER.camDistance,
    );
    const want = new THREE.Vector3().copy(s.position).add(back);

    // Do not put the camera inside a structure.
    const [cx, cz] = resolve(want.x, want.z);
    want.x = cx;
    want.z = cz;
    // Nor inside the core's stone. The camera trails camDistance behind the
    // player, which is wider than the plinth's one-unit taper band — so
    // standing near its rim with the camera looking back across it used to
    // let the trailing point land inside the sloped stone at a height still
    // keyed to the player's own y, not the stone actually there.
    want.y = Math.max(want.y, 1.2, groundHeightAt(cx, cz) + 0.6);
    // The landing kick, applied after the anti-clip floors above rather than
    // before them — it only ever needs to be visible on an ordinary landing,
    // not on the rare one that happens right at the plinth's own edge.
    want.y -= camKick.current;

    const look = new THREE.Vector3(
      s.position.x,
      s.position.y + PLAYER.height * 0.82,
      s.position.z,
    );

    if (!started.current) {
      camPos.current.copy(want);
      camLook.current.copy(look);
      started.current = true;
    }
    const k = 1 - Math.exp(-PLAYER.camLag * dt);
    camPos.current.lerp(want, k);
    camLook.current.lerp(look, k);
    camera.position.copy(camPos.current);
    camera.lookAt(camLook.current);
    camera.up.set(0, 1, 0);
  });

  return null;
}

/**
 * Input wiring. Keyboard and pointer for a desktop, and a virtual stick for a
 * phone — the stick lives in the interface layer and writes the same struct,
 * so the controller has no idea which one is driving it.
 */
export function useKeyboardAndPointer(
  input: React.MutableRefObject<Input>,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;
    const held = new Set<string>();

    const apply = () => {
      const i = input.current;
      i.forward =
        (held.has("KeyW") || held.has("ArrowUp") ? 1 : 0) -
        (held.has("KeyS") || held.has("ArrowDown") ? 1 : 0);
      i.strafe =
        (held.has("KeyD") || held.has("ArrowRight") ? 1 : 0) -
        (held.has("KeyA") || held.has("ArrowLeft") ? 1 : 0);
      i.run = held.has("ShiftLeft") || held.has("ShiftRight");
    };

    const MOVE = new Set([
      "KeyW", "KeyA", "KeyS", "KeyD",
      "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
      "Space", "ShiftLeft", "ShiftRight",
    ]);

    const down = (e: KeyboardEvent) => {
      if (!MOVE.has(e.code)) return;
      // Arrows and space scroll the page by default, which fights the game.
      e.preventDefault();
      held.add(e.code);
      if (e.code === "Space") input.current.jump = true;
      apply();
    };
    const up = (e: KeyboardEvent) => {
      held.delete(e.code);
      apply();
    };
    /* Everything stops. A keyup that never arrives — alt-tab mid-stride, a
       system shortcut swallowing the release, the tab going to the background
       — used to leave the key in the held set forever, and the character ran
       until the page was reloaded. There is no state here worth preserving
       across a focus loss, so every one of these clears the lot. */
    const stopAll = () => {
      held.clear();
      dragging = false;
      const i = input.current;
      i.forward = 0;
      i.strafe = 0;
      i.run = false;
      i.jump = false;
      i.lookX = 0;
      i.lookY = 0;
      apply();
    };

    let dragging = false;
    const pointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement)?.closest("button, a, [role=dialog], nav")) return;
      dragging = true;
    };
    const pointerUp = () => {
      dragging = false;
    };
    /* A drag released outside the window never reports up, and the camera
       then span with every later mouse move. Any move with no button down
       ends the drag, which is the one signal that is always true. */
    const guard = (e: PointerEvent) => {
      if (dragging && e.buttons === 0) dragging = false;
    };
    const pointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      input.current.lookX += e.movementX * 0.0032;
      input.current.lookY += e.movementY * 0.0032;
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", stopAll);
    window.addEventListener("contextmenu", stopAll);
    document.addEventListener("visibilitychange", stopAll);
    window.addEventListener("pointerdown", pointerDown);
    window.addEventListener("pointerup", pointerUp);
    window.addEventListener("pointercancel", pointerUp);
    window.addEventListener("pointermove", guard);
    window.addEventListener("pointermove", pointerMove);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", stopAll);
      window.removeEventListener("contextmenu", stopAll);
      document.removeEventListener("visibilitychange", stopAll);
      window.removeEventListener("pointerdown", pointerDown);
      window.removeEventListener("pointerup", pointerUp);
      window.removeEventListener("pointercancel", pointerUp);
      window.removeEventListener("pointermove", guard);
      window.removeEventListener("pointermove", pointerMove);
      stopAll();
    };
  }, [input, enabled]);
}
