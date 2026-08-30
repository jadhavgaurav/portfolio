"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { openingPose, traversalPose, type Phase } from "./sequence";

/**
 * CameraDirector.
 *
 * Exactly one authority owns the camera at a time; transitions are explicit
 * state, never a side effect of an animation finishing (invariant C1). Poses
 * are blended with a critically damped spring, so the camera never snaps and
 * never overshoots.
 *
 * Rules held here: no roll, ever. No orbit. Horizon stays in the middle third
 * outside a deliberate scale reveal.
 */
export function CameraRig({
  phase,
  t,
  scroll,
  reduced,
}: {
  phase: Phase;
  t: number;
  scroll: number;
  reduced: boolean;
}) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(0, 2, -40));
  const pos = useRef(new THREE.Vector3(0, 96, 200));
  const started = useRef(false);

  useFrame((_, delta) => {
    const target = phase === "PLAYER" ? traversalPose(scroll) : openingPose(phase, t);

    // Critically damped: frame-rate independent, no overshoot.
    const lambda = reduced ? 40 : phase === "PLAYER" ? 4.2 : 2.6;
    const k = 1 - Math.exp(-lambda * Math.min(delta, 0.05));

    if (!started.current) {
      pos.current.set(...target.position);
      look.current.set(...target.lookAt);
      started.current = true;
    }

    pos.current.lerp(new THREE.Vector3(...target.position), k);
    look.current.lerp(new THREE.Vector3(...target.lookAt), k);

    camera.position.copy(pos.current);
    camera.lookAt(look.current);
    camera.up.set(0, 1, 0); // no roll, ever

    const cam = camera as THREE.PerspectiveCamera;
    if (Math.abs(cam.fov - target.fov) > 0.01) {
      cam.fov += (target.fov - cam.fov) * k;
      cam.updateProjectionMatrix();
    }
  });

  return null;
}
