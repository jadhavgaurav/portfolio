"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PLAYER, type PlayerState } from "./Player";
import { CharacterRig, type CharacterMotion } from "./characters/CharacterRig";
import { hairFor } from "./characters/appearance";

/**
 * The avatar.
 *
 * There was no character before — the visitor was a floating camera, which
 * is why nothing about the old build read as a game. The first answer was a
 * box figure with a procedural walk cycle, which was the right thing to
 * build at the time: a crude figure that moves correctly reads as alive.
 *
 * This is the second answer. The gait is motion capture on a real skeleton
 * now, so the swing, the lean and the bob that used to be written out by
 * hand here are gone — they were an approximation of the thing the clips
 * actually contain. What stays is everything the clips do not know about:
 * where the character is, which way it faces, and how hard it just landed.
 */

/** Seed for this one person's appearance. The player is not anonymous the
 *  way the crowd is, so this is a name rather than a hash source. */
const PLAYER_SEED = "gaurav";

export function Avatar({ state }: { state: React.MutableRefObject<PlayerState> }) {
  const root = useRef<THREE.Group>(null);
  const motion = useRef<CharacterMotion>({ speed: 0 });

  /** Landing squash-and-stretch. `groundedPrev` catches the edge the same
   *  way Player.tsx's own landing sound does; `maxFall` tracks the hardest
   *  downward speed seen since the last time the ground was underfoot, so
   *  the squash on impact is scaled to how far the fall actually was —
   *  stepping off a curb barely registers, missing the plinth's edge does.
   *  Self-contained rather than reading anything Player.tsx computes: the
   *  two components only share a read-only PlayerState, and duplicating one
   *  small edge-detector here is simpler than growing that shared shape for
   *  a value only the avatar's own animation needs. */
  const groundedPrev = useRef(true);
  const maxFall = useRef(0);
  const squashT = useRef(1);
  const squashMag = useRef(0);

  useFrame((_, rawDelta) => {
    const dt = Math.min(0.05, rawDelta);
    const s = state.current;
    if (!root.current) return;

    root.current.position.set(s.position.x, s.position.y, s.position.z);
    root.current.rotation.y = s.yaw;

    // Real ground speed, not the 0-1 `speed01` the walk cycle used to
    // run on: the rig paces its clips in world units per second.
    motion.current.speed = Math.hypot(s.velocity.x, s.velocity.z);

    if (!s.grounded) {
      maxFall.current = Math.max(maxFall.current, -s.velocity.y);
    } else if (!groundedPrev.current) {
      squashMag.current = Math.min(1, maxFall.current / 13);
      squashT.current = 0;
      maxFall.current = 0;
    }
    groundedPrev.current = s.grounded;

    // Hardest right on impact, one small rebound past neutral, settled by
    // ~240ms — the ordinary shape of a squash-and-stretch bounce.
    squashT.current = Math.min(1, squashT.current + dt / 0.24);
    const st = squashT.current;
    const squash = squashMag.current * (1 - st) * Math.cos(st * Math.PI * 1.3);
    root.current.scale.set(1 + squash * 0.16, 1 - squash * 0.26, 1 + squash * 0.16);
  });

  return (
    <group ref={root}>
      <CharacterRig
        body="male"
        height={PLAYER.height}
        hair={hairFor(PLAYER_SEED)}
        motion={motion}
      />

      {/* A soft blob directly underfoot, on top of whatever the real shadow
          map is doing. On the low-quality tier there is no shadow map at
          all, and a figure with nothing under it floats no matter how well
          it walks; on the high tier the real shadow can go faint or vanish
          at a low sun angle, and the blob is what keeps the character
          looking planted regardless of where the light happens to be. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.5, 20]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.34} depthWrite={false} />
      </mesh>
    </group>
  );
}
