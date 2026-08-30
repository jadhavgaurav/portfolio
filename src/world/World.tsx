"use client";

import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, AdaptiveEvents, Preload } from "@react-three/drei";
import { CameraRig } from "./CameraRig";
import { Post } from "./Post";
import { Scene } from "./Scene";
import type { Phase } from "./sequence";

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
}: {
  phase: Phase;
  t: number;
  scroll: number;
  reduced: boolean;
  quality: "high" | "low";
}) {
  return (
    <Canvas
      dpr={quality === "high" ? [1, 1.75] : [0.75, 1]}
      gl={{
        antialias: quality === "high",
        powerPreference: "high-performance",
        alpha: false,
        stencil: false,
        depth: true,
      }}
      onCreated={({ gl }) => {
        // One exposure knob for the whole grade.
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.75;
      }}
      camera={{ fov: 55, near: 0.4, far: 1400, position: [0, 96, 200] }}
      frameloop={reduced ? "demand" : "always"}
    >
      <CameraRig phase={phase} t={t} scroll={scroll} reduced={reduced} />
      <Scene phase={phase} t={t} scroll={scroll} quality={quality} />
      <Post phase={phase} scroll={scroll} quality={quality} />
      <AdaptiveDpr pixelated={false} />
      <AdaptiveEvents />
      <Preload all />
    </Canvas>
  );
}
