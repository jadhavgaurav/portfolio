"use client";

import {
  Bloom,
  EffectComposer,
  N8AO,
  SMAA,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

/**
 * The grade.
 *
 * A toon-shaded world reads by flat colour and a hard rim line, which is the
 * opposite instinct from the previous grade: heavy ambient occlusion and a
 * dark vignette were doing real work pulling a moody, near-monochrome scene
 * together, and on bright saturated colour they just muddy it back down.
 * Both are now light-touch — AO for a little contact grounding, vignette for
 * a soft frame — and bloom is tuned to catch the rim lines and the reward
 * gems rather than to be a mood device.
 */
export function Post({ quality }: { quality: "high" | "low" }) {
  if (quality === "low") {
    // Mobile: a light bloom only. The expensive passes are dropped.
    return (
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.78} luminanceSmoothing={0.25} mipmapBlur />
        <Vignette offset={0.55} darkness={0.16} eskil={false} />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer multisampling={0} enableNormalPass>
      <N8AO
        aoRadius={4}
        intensity={0.4}
        distanceFalloff={1.0}
        quality="low"
        halfRes
        color="#2a3324"
      />
      <Bloom
        intensity={0.65}
        luminanceThreshold={0.76}
        luminanceSmoothing={0.28}
        mipmapBlur
        radius={0.6}
      />
      <Vignette offset={0.58} darkness={0.14} blendFunction={BlendFunction.NORMAL} />
      <SMAA />
    </EffectComposer>
  );
}
