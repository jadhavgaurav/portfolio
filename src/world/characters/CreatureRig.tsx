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

/**
 * World-space height of everything drawable under `root`.
 *
 * Built by hand instead of using `Box3.setFromObject`, which returns an
 * empty box for these meshes: it defers to a SkinnedMesh's own
 * `boundingBox`, and that is null until something computes it. Walking the
 * geometry's bind-pose bounds through each mesh's world matrix is a little
 * more work and actually answers the question.
 */
function measureHeight(root: THREE.Object3D): number {
  root.updateMatrixWorld(true);
  let lo = Infinity;
  let hi = -Infinity;
  const v = new THREE.Vector3();
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
    const b = mesh.geometry.boundingBox;
    if (!b) return;
    for (const x of [b.min.x, b.max.x]) {
      for (const y of [b.min.y, b.max.y]) {
        for (const z of [b.min.z, b.max.z]) {
          v.set(x, y, z).applyMatrix4(mesh.matrixWorld);
          lo = Math.min(lo, v.y);
          hi = Math.max(hi, v.y);
        }
      }
    }
  });
  return hi > lo ? hi - lo : 0;
}

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

  const outer = useRef<THREE.Group>(null);

  /* Fitted on the first frame, not in an effect.
   *
   * Two earlier attempts got this wrong in different ways. Measuring the
   * cloned scene before mounting reports a fraction of the truth, because
   * a skinned mesh's size lives in the bone transforms above it and a
   * fresh clone has no world matrices. Measuring in a layout effect
   * reports nothing at all, because the effect runs before `primitive`
   * has attached its object, so the box is empty and the guard skips.
   *
   * By the first frame the object is genuinely in the scene with real
   * matrices, so the reading means something. This model, for the record,
   * carries an internal scale of 100 and lands 1.5 units tall untouched. */
  const fitted = useRef(false);

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

    if (!fitted.current && outer.current) {
      const g = outer.current;
      g.scale.setScalar(1);
      const h = measureHeight(g);
      if (h > 1e-4) {
        g.scale.setScalar(height / h);
        fitted.current = true;
      }
    }
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
    <group ref={outer}>
      <primitive object={scene} />
    </group>
  );
}

export function preloadCreature(url: string) {
  useGLTF.preload(url);
}
