"use client";

import {
  Bloom,
  EffectComposer,
  N8AO,
  SMAA,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import type { Phase } from "./sequence";

/**
 * The grade.
 *
 * Post is doing real work here rather than dressing: ambient occlusion gives
 * the structures contact and mass that a single raking key cannot, and bloom
 * is what makes a motivated emissive read as a light source rather than a
 * bright grey face.
 *
 * Depth of field was tried and cut. Aerial perspective already places the
 * visitor in the space, and the blur cost more legibility than it bought.
 * Tone mapping lives on the renderer so exposure is a single knob.
 *
 * Everything is thresholded so only the seams and the core actually bloom —
 * the surfaces never do, which is what keeps this out of glow-for-its-own-sake.
 */
export function Post({ quality }: { phase: Phase; scroll: number; quality: "high" | "low" }) {
  if (quality === "low") {
    // Mobile: a light bloom only. The expensive passes are dropped.
    return (
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom intensity={0.9} luminanceThreshold={0.62} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette offset={0.28} darkness={0.62} eskil={false} />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer multisampling={0} enableNormalPass>
      <N8AO
        aoRadius={5.5}
        intensity={1.05}
        distanceFalloff={1.0}
        quality="low"
        halfRes
        color="#070a0d"
      />
      <Bloom
        intensity={1.35}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.32}
        mipmapBlur
        radius={0.72}
      />
      <Vignette offset={0.4} darkness={0.32} blendFunction={BlendFunction.NORMAL} />
      <SMAA />
    </EffectComposer>
  );
}
