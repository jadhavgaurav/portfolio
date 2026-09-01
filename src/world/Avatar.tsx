"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PLAYER, type PlayerState } from "./Player";

/**
 * The avatar.
 *
 * There was no character before — the visitor was a floating camera, which is
 * why nothing about the old build read as a game. This is a low-poly figure
 * with a procedural walk cycle: legs and arms counter-swing at a rate set by
 * how fast you are actually moving, the torso bobs on the same clock, and the
 * whole thing leans into a run.
 *
 * Deliberately stylised rather than realistic. A crude figure that moves
 * correctly reads as alive; a detailed one that slides reads as broken.
 */

const SKIN = "#c98a5e";
const JACKET = "#2fa89a";
const JACKET_DARK = "#1f7d72";
const TROUSER = "#2b3440";
const ACCENT = "#ffb703";

export function Avatar({ state }: { state: React.MutableRefObject<PlayerState> }) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  /** The walk phase advances with distance covered, not with wall time, so
   *  the feet never skate: stop moving and the cycle stops with you. */
  const phase = useRef(0);

  useFrame((_, rawDelta) => {
    const dt = Math.min(0.05, rawDelta);
    const s = state.current;
    if (!root.current) return;

    root.current.position.set(s.position.x, s.position.y, s.position.z);
    root.current.rotation.y = s.yaw;

    const speed = Math.hypot(s.velocity.x, s.velocity.z);
    phase.current += speed * dt * 1.35;

    const swing = Math.sin(phase.current) * (0.35 + s.speed01 * 0.72);
    const lift = Math.abs(Math.sin(phase.current * 2)) * s.speed01;

    if (legL.current) legL.current.rotation.x = swing;
    if (legR.current) legR.current.rotation.x = -swing;
    if (armL.current) armL.current.rotation.x = -swing * 0.82;
    if (armR.current) armR.current.rotation.x = swing * 0.82;

    if (body.current) {
      body.current.position.y = lift * 0.09;
      // Lean into the run, and settle upright when still.
      body.current.rotation.x = s.speed01 * 0.16;
      body.current.rotation.z = Math.sin(phase.current) * 0.045 * s.speed01;
    }
  });

  const h = PLAYER.height;

  return (
    <group ref={root}>
      <group ref={body}>
        {/* Torso */}
        <mesh position={[0, h * 0.62, 0]} castShadow>
          <boxGeometry args={[0.52, h * 0.34, 0.3]} />
          <meshStandardMaterial color={JACKET} roughness={0.72} metalness={0.05} />
        </mesh>
        {/* A collar, so the silhouette is not one slab */}
        <mesh position={[0, h * 0.775, 0]}>
          <boxGeometry args={[0.56, h * 0.05, 0.34]} />
          <meshStandardMaterial color={JACKET_DARK} roughness={0.8} />
        </mesh>
        {/* Head */}
        <mesh position={[0, h * 0.9, 0]} castShadow>
          <boxGeometry args={[0.3, 0.32, 0.29]} />
          <meshStandardMaterial color={SKIN} roughness={0.85} />
        </mesh>
        {/* Hair */}
        <mesh position={[0, h * 0.985, -0.01]}>
          <boxGeometry args={[0.325, 0.15, 0.305]} />
          <meshStandardMaterial color="#17120f" roughness={0.95} />
        </mesh>
        {/* A mark that reads at distance and gives the figure a front */}
        <mesh position={[0, h * 0.64, 0.157]}>
          <boxGeometry args={[0.13, 0.13, 0.02]} />
          <meshStandardMaterial
            color={ACCENT}
            emissive={ACCENT}
            emissiveIntensity={0.35}
            roughness={0.4}
          />
        </mesh>

        {/* Arms. Pivoted at the shoulder so the swing rotates about the joint. */}
        <group ref={armL} position={[-0.33, h * 0.755, 0]}>
          <mesh position={[0, -h * 0.16, 0]} castShadow>
            <boxGeometry args={[0.14, h * 0.32, 0.15]} />
            <meshStandardMaterial color={JACKET_DARK} roughness={0.75} />
          </mesh>
          <mesh position={[0, -h * 0.335, 0]}>
            <boxGeometry args={[0.13, 0.12, 0.14]} />
            <meshStandardMaterial color={SKIN} roughness={0.85} />
          </mesh>
        </group>
        <group ref={armR} position={[0.33, h * 0.755, 0]}>
          <mesh position={[0, -h * 0.16, 0]} castShadow>
            <boxGeometry args={[0.14, h * 0.32, 0.15]} />
            <meshStandardMaterial color={JACKET_DARK} roughness={0.75} />
          </mesh>
          <mesh position={[0, -h * 0.335, 0]}>
            <boxGeometry args={[0.13, 0.12, 0.14]} />
            <meshStandardMaterial color={SKIN} roughness={0.85} />
          </mesh>
        </group>
      </group>

      {/* Legs. Outside the bobbing group: the feet belong to the ground. */}
      <group ref={legL} position={[-0.14, h * 0.45, 0]}>
        <mesh position={[0, -h * 0.22, 0]} castShadow>
          <boxGeometry args={[0.18, h * 0.44, 0.19]} />
          <meshStandardMaterial color={TROUSER} roughness={0.8} />
        </mesh>
        <mesh position={[0, -h * 0.45, 0.035]}>
          <boxGeometry args={[0.19, 0.1, 0.27]} />
          <meshStandardMaterial color="#12171a" roughness={0.7} />
        </mesh>
      </group>
      <group ref={legR} position={[0.14, h * 0.45, 0]}>
        <mesh position={[0, -h * 0.22, 0]} castShadow>
          <boxGeometry args={[0.18, h * 0.44, 0.19]} />
          <meshStandardMaterial color={TROUSER} roughness={0.8} />
        </mesh>
        <mesh position={[0, -h * 0.45, 0.035]}>
          <boxGeometry args={[0.19, 0.1, 0.27]} />
          <meshStandardMaterial color="#12171a" roughness={0.7} />
        </mesh>
      </group>

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
