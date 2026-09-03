"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { markTexture } from "./characters/CharacterRig";

/**
 * The mark, thrown.
 *
 * Opening a case study used to be instant: the marker was flagged visited
 * and the panel arrived in the same tick, which meant the flash and the
 * shower of shards played perfectly, behind a full-screen panel, where
 * nobody ever saw them. This is the beat that was missing — the thing you
 * wear leaves your chest, crosses the gap, and the marker comes apart when
 * it lands.
 *
 * No weapon and no new asset. It is the same glyph and the same texture as
 * the one on the hoodie: the identity mark is the instrument, which reads
 * as invoking the project rather than attacking it.
 */

/** How long the glyph is in the air. Short enough that opening a project
 *  never feels like waiting for a cutscene. Exported because the caller
 *  schedules the burst and the panel against it. */
export const FLIGHT_MS = 340;

export interface Throw {
  /** Distinct per press, so a second throw at the same marker restarts. */
  id: number;
  from: [number, number, number];
  to: [number, number, number];
  text: string;
  color: string;
}

export function MarkThrow({ shot }: { shot: Throw | null }) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const born = useRef(0);

  const texture = useMemo(
    () => (shot ? markTexture(shot.text, shot.color) : null),
    [shot],
  );
  useEffect(() => () => texture?.dispose(), [texture]);

  // A new id is a new throw, even at the same marker.
  useEffect(() => {
    born.current = performance.now();
  }, [shot?.id]);

  useFrame(({ camera }) => {
    const g = group.current;
    if (!g || !shot) return;
    const t = Math.min(1, (performance.now() - born.current) / FLIGHT_MS);

    // Eased so it leaves fast and arrives faster, with a shallow arc: a
    // straight line at constant speed reads as a UI tween rather than a
    // thing that was thrown.
    const e = t * t;
    g.position.set(
      THREE.MathUtils.lerp(shot.from[0], shot.to[0], e),
      THREE.MathUtils.lerp(shot.from[1], shot.to[1], e) + Math.sin(t * Math.PI) * 0.55,
      THREE.MathUtils.lerp(shot.from[2], shot.to[2], e),
    );

    // Always legible: it faces the camera rather than the direction of
    // travel, so the glyph never turns edge-on and vanishes mid-flight.
    g.quaternion.copy(camera.quaternion);
    // A tilt, not a tumble. Anything past about a third of a turn smears
    // the glyph into a scribble at this size, and the point of throwing
    // this particular object is that you can tell what it is. The arc and
    // the speed already say "thrown" without help from the spin.
    g.rotateZ(t * Math.PI * 0.18);

    // Grows a little as it goes, and fades out over the last third so the
    // shards it triggers are what the eye lands on, not the glyph itself.
    const s = 1 + t * 0.5;
    g.scale.setScalar(s);
    const mat = mesh.current?.material as THREE.MeshBasicMaterial | undefined;
    if (mat) mat.opacity = t < 0.65 ? 1 : 1 - (t - 0.65) / 0.35;
  });

  if (!shot || !texture) return null;

  return (
    <group ref={group} position={shot.from}>
      <mesh ref={mesh} renderOrder={20} frustumCulled={false}>
        <planeGeometry args={[0.62, 0.31]} />
        <meshBasicMaterial
          map={texture}
          transparent
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <pointLight color={shot.color} intensity={7} distance={4} decay={2} />
    </group>
  );
}
