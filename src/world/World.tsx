"use client";

import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, AdaptiveEvents, PerformanceMonitor, Preload } from "@react-three/drei";
import { useState } from "react";
import { CameraRig } from "./CameraRig";
import { Post } from "./Post";
import { Scene } from "./Scene";
import type { Phase } from "./sequence";
import type { Lens } from "./discovery";

/**
 * The canvas. Quality adapts to the device rather than assuming a desktop
 * GPU: drei's AdaptiveDpr drops resolution under load and restores it when
 * the frame budget recovers, which is what keeps this usable on a mid-range
 * phone without a separate mobile build.
 */
export default function World({
  phase,
  t,
  scroll,
  reduced,
  quality,
  lenses,
  noticing,
}: {
  phase: Phase;
  t: number;
  scroll: number;
  reduced: boolean;
  quality: "high" | "low";
  /** Lenses granted so far. Each one changes how the world renders. */
  lenses: Lens[];
  /** The entity currently resolving under sustained attention, if any. */
  noticing: { id: string; progress: number } | null;
}) {
  /* The declared tier is a starting guess from the device. The measured tier
     is what the machine can actually sustain: if frames start slipping the
     expensive passes are dropped rather than letting the world stutter. A
     phone that turns out to be fast is promoted back. */
  const [tier, setTier] = useState<"high" | "low">(quality);

  /* The frameloop is always on, including under reduced motion. A demand loop
     was tried there and is wrong: the camera, the fog and the lens are all
     critically damped, so with no running loop they never converge and the
     frame the visitor is left holding is a half-finished blend. Reduced motion
     asks for no vestibular motion, which the damping constant already gives —
     it does not ask for a stalled renderer. */
  return (
    <Canvas
      dpr={tier === "high" ? [1, 1.6] : [0.6, 1]}
      gl={{
        antialias: false, // SMAA handles this in the composer when affordable
        powerPreference: "high-performance",
        alpha: false,
        stencil: false,
        depth: true,
      }}
      onCreated={({ gl }) => {
        // One exposure knob for the whole grade.
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 3.3;
      }}
      camera={{ fov: 55, near: 0.4, far: 1400, position: [0, 96, 200] }}
      frameloop="always"
    >
      <PerformanceMonitor
        bounds={() => [45, 58]}
        onDecline={() => setTier("low")}
        onIncline={() => quality === "high" && setTier("high")}
      />
      <CameraRig phase={phase} t={t} scroll={scroll} reduced={reduced} />
      <Scene
        phase={phase}
        t={t}
        scroll={scroll}
        quality={tier}
        lenses={lenses}
        noticing={noticing}
      />
      <Post quality={tier} />
      <AdaptiveDpr pixelated={false} />
      <AdaptiveEvents />
      <Preload all />
    </Canvas>
  );
}
