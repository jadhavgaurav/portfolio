"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";

/**
 * A rigged creature that is not a person.
 *
 * Deliberately separate from CharacterRig rather than generalised with it.
 * The people share two bodies and four clips and are paced against a real
 * ground speed; a creature brings its own mesh and its own clip names and
 * only ever needs to know whether it is standing, moving or greeting. One
 * component trying to be both would be a pile of optional props.
 *
 * Scale is measured rather than assumed. Source models arrive at wildly
 * different units — this one is a few hundredths of a unit across before
 * its node transforms are applied — so the mesh is measured once after
 * load and scaled to the height the world actually wants.
 */

export interface CreatureState {
  moving: boolean;
  greeting: boolean;
}

/** Which clip in the file plays for each of the three states. */
export interface CreatureClips {
  idle: string;
  walk: string;
  greet: string;
}

const KEYS = ["idle", "walk", "greet"] as const;
type Key = (typeof KEYS)[number];

export function CreatureRig({
  url,
  clips: names,
  state,
  height,
}: {
  url: string;
  clips: CreatureClips;
  state: React.MutableRefObject<CreatureState>;
  /** Wanted height in world units. */
  height: number;
}) {
  const { scene: source, animations } = useGLTF(url);
  const scene = useMemo(() => cloneSkinned(source) as THREE.Group, [source]);
  const mixer = useMemo(() => new THREE.AnimationMixer(scene), [scene]);

  const actions = useMemo(() => {
    const byName = new Map(animations.map((a) => [a.name, a]));
    const out: Partial<Record<Key, THREE.AnimationAction>> = {};
    for (const key of KEYS) {
      const clip = byName.get(names[key]);
      if (!clip) continue;
      const action = mixer.clipAction(clip);
      action.enabled = true;
      action.setEffectiveWeight(key === "idle" ? 1 : 0);
      action.play();
      out[key] = action;
    }
    return out;
  }, [mixer, animations, names]);

  /* Held by hand for the same reason CharacterRig holds its own: two
     independently scheduled fades can both reach zero on the same frame,
     and a skeleton with no weight on it snaps to its bind pose. */
  const weights = useRef<Partial<Record<Key, number>>>({ idle: 1 });

  const fit = useMemo(() => {
    const size = new THREE.Vector3();
    new THREE.Box3().setFromObject(scene).getSize(size);
    return size.y > 1e-4 ? height / size.y : 1;
  }, [scene, height]);

  useEffect(() => {
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      /* Bind-pose bounds cull a creature mid-animation otherwise. */
      mesh.frustumCulled = false;
    });
  }, [scene]);

  useEffect(
    () => () => {
      mixer.stopAllAction();
    },
    [mixer],
  );

  useFrame((_, rawDelta) => {
    const dt = Math.min(0.05, rawDelta);
    const s = state.current;
    const want: Key = s.greeting ? "greet" : s.moving ? "walk" : "idle";

    for (const key of KEYS) {
      const action = actions[key];
      if (!action) continue;
      const target = key === want ? 1 : 0;
      const now = THREE.MathUtils.damp(weights.current[key] ?? 0, target, 5, dt);
      weights.current[key] = now;
      action.setEffectiveWeight(now);
    }

    mixer.update(dt);
  });

  return (
    <group scale={fit}>
      <primitive object={scene} />
    </group>
  );
}

export function preloadCreature(url: string) {
  useGLTF.preload(url);
}
