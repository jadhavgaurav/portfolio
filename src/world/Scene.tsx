"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildWorld } from "./geometry";
import {
  EMISSIVE,
  FAMILY_METALNESS,
  FAMILY_ROUGHNESS,
  FAMILY_SURFACE,
  LIGHT,
  SURFACE,
} from "./palette";
import { WORLD, core, entities } from "./telemetry";
import { BEATS, type Phase } from "./sequence";
import { Dust, Sky } from "./Atmosphere";

/**
 * The world.
 *
 * Static geometry, five draw calls for the structures plus a seam pass and a
 * ground plane. Nothing in here allocates per frame; the only per-frame work
 * is the fog density and the seam emissive, both driven by the sequence.
 */

/** Atmosphere is the EMERGENCE mechanism: the world is revealed by the
 *  medium clearing, not by anything being built. */
function Atmosphere({ phase, t }: { phase: Phase; t: number }) {
  const { scene } = useThree();
  const fog = useMemo(() => new THREE.FogExp2(LIGHT.aerial, 0.09), []);

  useMemo(() => {
    scene.fog = fog;
    scene.background = new THREE.Color(LIGHT.aerialFar);
  }, [scene, fog]);

  useFrame(() => {
    // VOID and SIGNAL are opaque. EMERGENCE clears to the working density.
    const target =
      phase === "VOID" ? 0.32 : phase === "SIGNAL" ? 0.19 : phase === "EMERGENCE" ? 0.19 - t * 0.1815 : 0.0085;
    fog.density += (target - fog.density) * 0.045;
    // The ground colour lifts a little as the medium clears, never to sky.
    const target2 = new THREE.Color(phase === "VOID" ? "#08090a" : LIGHT.aerialFar);
    (scene.background as THREE.Color).lerp(target2, 0.03);
  });

  return null;
}

export function Scene({
  phase,
  t,
  scroll,
  quality,
}: {
  phase: Phase;
  t: number;
  scroll: number;
  quality: "high" | "low";
}) {
  const world = useMemo(() => buildWorld(), []);
  const seamRef = useRef<THREE.MeshStandardMaterial>(null);
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(...LIGHT.keyTarget);
    return o;
  }, []);

  /** ORIGIN is the SIGNAL. Continuity of that one object across the whole
   *  opening is the spine of the sequence — Bible constraint, §3. */
  const signal = useMemo(() => entities.find((e) => e.type === "ORIGIN")!, []);
  const relicEntity = useMemo(() => entities.find((e) => e.type === "RELIC")!, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (seamRef.current) {
      // Running systems breathe. Amplitude, not colour, carries activity.
      const base = phase === "VOID" ? 0 : 1;
      seamRef.current.emissiveIntensity = base * (1.5 + Math.sin(time * 0.9) * 0.35);
    }
    if (keyRef.current) {
      // The key light arrives with the world.
      const want = phase === "VOID" ? 0 : phase === "SIGNAL" ? 0.5 : LIGHT.keyIntensity;
      keyRef.current.intensity += (want - keyRef.current.intensity) * 0.03;
    }
  });

  return (
    <>
      <Atmosphere phase={phase} t={t} />
      <Sky phase={phase} />
      {quality === "high" && <Dust quality={quality} />}

      {/* Lighting, per the approved Study 12: one dominant raking key,
          a cool hemisphere fill, nothing else. */}
      <hemisphereLight args={["#93a7b1", "#20262a", 1.5]} />
      {/* A low, cool counter-light so silhouettes separate from the aerial
          haze without softening the key. */}
      <directionalLight color={LIGHT.fill} intensity={1.9} position={[40, 12, -60]} />
      <primitive object={target} />
      <directionalLight
        ref={keyRef}
        color={LIGHT.key}
        intensity={0}
        position={LIGHT.keyPos as unknown as [number, number, number]}
        target={target}
      />

      {/* Ground. Dark, matte, so structures read by silhouette first. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -WORLD.depth / 2]}>
        <planeGeometry args={[900, WORLD.depth + 700]} />
        <meshStandardMaterial color={SURFACE.ground} roughness={0.92} metalness={0.05} />
      </mesh>

      {/* The route. It is the time axis, so it earns its light. */}
      <mesh geometry={world.route}>
        <meshStandardMaterial
          color={EMISSIVE.phaseJoint}
          emissive={EMISSIVE.interaction}
          emissiveIntensity={0.85}
          roughness={0.85}
        />
      </mesh>

      {/* Structures: one merged mesh per material family. */}
      {world.families.map(({ family, geometry }) => (
        <mesh key={family} geometry={geometry} castShadow={false} receiveShadow={false}>
          <meshStandardMaterial
            color={FAMILY_SURFACE[family]}
            roughness={FAMILY_ROUGHNESS[family]}
            metalness={FAMILY_METALNESS[family]}
            vertexColors
          />
        </mesh>
      ))}

      {/* Emissive joints on running systems. */}
      {world.seams && (
        <mesh geometry={world.seams}>
          <meshStandardMaterial
            ref={seamRef}
            color={EMISSIVE.phaseJoint}
            emissive={EMISSIVE.interaction}
            emissiveIntensity={1.5}
            roughness={0.4}
          />
        </mesh>
      )}

      {/* SIGNAL: the earliest trace, lit before anything else exists.
          The same object the visitor later stands in front of as ORIGIN. */}
      <pointLight
        position={[signal.x, signal.height + 3, signal.z]}
        color={EMISSIVE.interaction}
        intensity={phase === "VOID" ? 0 : phase === "SIGNAL" ? 90 : 26}
        distance={140}
        decay={2}
      />

      {/* The largest work is lit from within — the only structure that is,
          besides the running systems. Rule L1: every glow has a source. */}
      <pointLight
        position={[relicEntity.x, relicEntity.height * 0.62, relicEntity.z]}
        color={EMISSIVE.reward}
        intensity={phase === "PLAYER" ? 260 : 0}
        distance={150}
        decay={2}
      />

      {/* CORE: the synthesis, beyond the last work. A consequence of the world. */}
      <mesh position={[core.x, core.y, core.z]} rotation={[0, Math.PI / 4, Math.PI / 4]}>
        <octahedronGeometry args={[9, 0]} />
        <meshStandardMaterial
          color={SURFACE.constructed}
          emissive={EMISSIVE.reward}
          emissiveIntensity={scroll > 0.9 ? 1.6 : 0.5}
          roughness={0.3}
          metalness={0.6}
          flatShading
        />
      </mesh>
      <pointLight
        position={[core.x, core.y, core.z]}
        color={EMISSIVE.reward}
        intensity={scroll > 0.85 ? 180 : 40}
        distance={200}
        decay={2}
      />
    </>
  );
}

export { BEATS };
