"use client";

import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, AdaptiveEvents, PerformanceMonitor, Preload } from "@react-three/drei";
import { useState } from "react";
import { Avatar } from "./Avatar";
import { Markers } from "./Markers";
import { PlayerRig, makeInput, type Input, type PlayerState } from "./Player";
import { Post } from "./Post";
import { Scene } from "./Scene";
import { LENS_ORDER } from "./discovery";
import { ARRIVAL_POSE } from "./sequence";

/**
 * The game canvas.
 *
 * Everything the world knew how to draw is reused; what changes is who is
 * driving. The camera is no longer a function of scroll position — it is
 * attached to a character the player moves.
 */
export default function GameCanvas({
  input,
  state,
  quality,
  enabled,
  activeId,
  visited,
}: {
  input: React.MutableRefObject<Input>;
  state: React.MutableRefObject<PlayerState>;
  quality: "high" | "low";
  enabled: boolean;
  /** The interactable currently in reach. */
  activeId: string | null;
  visited: string[];
}) {
  const [tier, setTier] = useState<"high" | "low">(quality);

  return (
    <Canvas
      dpr={tier === "high" ? [1, 1.6] : [0.6, 1]}
      shadows={tier === "high"}
      gl={{
        antialias: false,
        powerPreference: "high-performance",
        alpha: false,
        stencil: false,
        depth: true,
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        // A near-neutral exposure, so every colour in the world is authored
        // at the value it is meant to appear as. The old 3.3 forced every
        // material to be stored "two and a half stops under" its real
        // colour, which is exactly the kind of implicit coupling that goes
        // silently wrong the moment any one material forgets the convention.
        gl.toneMappingExposure = 1.0;
      }}
      camera={{ fov: 62, near: 0.3, far: 1400 }}
      frameloop="always"
    >
      <PerformanceMonitor
        bounds={() => [45, 58]}
        onDecline={() => setTier("low")}
        onIncline={() => quality === "high" && setTier("high")}
      />
      {/* Every lens is on. They were unlock rewards for a dwell mechanic that
          no longer exists — as world states they are simply the richer world,
          so the player gets it from the first frame. */}
      <Scene phase="PLAYER" t={1} scroll={0} quality={tier} lenses={LENS_ORDER} noticing={null} />
      <PlayerRig input={input} state={state} enabled={enabled} />
      <Avatar state={state} />
      <Markers activeId={activeId} visited={visited} />
      <Post quality={tier} />
      <AdaptiveDpr pixelated={false} />
      <AdaptiveEvents />
      <Preload all />
    </Canvas>
  );
}

/** Where the player starts: at the first commit, facing into the world. */
export function initialPlayerState(): PlayerState {
  return {
    position: new THREE.Vector3(ARRIVAL_POSE.position[0], 0, ARRIVAL_POSE.position[2]),
    velocity: new THREE.Vector3(),
    yaw: Math.PI,
    speed01: 0,
    grounded: true,
    camYaw: 0,
    camPitch: 0,
  };
}

export { makeInput };
