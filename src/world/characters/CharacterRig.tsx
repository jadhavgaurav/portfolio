"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MODEL_HEIGHT, useBody, useClips, type BodyType, type ClipName } from "./rig";

/**
 * One animated person.
 *
 * The player and every NPC are the same component with a different motion
 * source, because they are the same problem: something knows how fast this
 * body is moving, and the body has to look like it. Who decides the speed —
 * a keyboard, a wander loop — is the caller's business.
 */

export interface CharacterMotion {
  /** Ground speed in world units per second. Chooses the clip and paces
   *  it. Real units rather than a 0-1 fraction, because the player and an
   *  NPC have completely different top speeds and a fraction of "full
   *  speed" would mean two different things in the same component. */
  speed: number;
  /** Stand and wave rather than walk. */
  greeting?: boolean;
}

/** Long enough that a change of gait is a transition and not a cut, short
 *  enough that it never feels like the character is deciding. */
const FADE = 0.2;

/** Standing below this, running above it. The walk band between them
 *  covers both an NPC's 1.1 and the player's own 7.4. */
const IDLE_BELOW = 0.35;
const RUN_ABOVE = 8.6;

/**
 * What ground speed each clip was captured at, in world units per second.
 *
 * These are used to pace playback, but deliberately not to match it. This
 * world moves considerably faster than a person does — the player walks at
 * 7.4 units a second, which at human scale would be a sprint — so playing
 * the walk cycle at the ratio the ground demands windmills the legs. The
 * exponent compresses that ratio and the clamp bounds it: the feet still
 * speed up and slow down with the body, they just decline to pretend the
 * whole difference is real.
 */
const NATIVE_SPEED = { Walk: 1.55, Run: 3.6 } as const;
const PACE_COMPRESSION = 0.45;

/** Past this, the skeleton stops being re-posed. The body still moves and
 *  still turns; it simply holds its last pose. Thirteen skinned meshes each
 *  re-posing 65 bones every frame is the single largest cost this change
 *  adds, and at fifty-odd metres nobody can see a gait anyway. */
const ANIMATE_RADIUS = 45;

export function CharacterRig({
  body,
  height,
  hair,
  motion,
  castShadow = true,
}: {
  body: BodyType;
  /** Wanted height in world units; the mesh is scaled to hit it. */
  height: number;
  /** Hair tint, multiplied over the texture. */
  hair: string;
  motion: React.MutableRefObject<CharacterMotion>;
  castShadow?: boolean;
}) {
  const scene = useBody(body);
  const clips = useClips();
  const mixer = useMemo(() => new THREE.AnimationMixer(scene), [scene]);
  const current = useRef<ClipName>("Idle");

  /* Every clip runs from the first frame, all but one at zero weight.
     Blending is done by hand below rather than with `crossFadeTo`, which
     schedules a fade on each action independently: if the outgoing one
     reaches zero a frame before the incoming one lifts off, the skeleton
     has nothing driving it and snaps to its bind pose. That is a T-pose,
     in the middle of the world, for one frame, every time somebody stops
     walking. Holding the weights here means their sum is never zero. */
  const actions = useMemo(() => {
    const map: Partial<Record<ClipName, THREE.AnimationAction>> = {};
    for (const name of Object.keys(clips) as ClipName[]) {
      const clip = clips[name];
      if (!clip) continue;
      const action = mixer.clipAction(clip);
      action.enabled = true;
      action.setEffectiveWeight(name === "Idle" ? 1 : 0);
      action.play();
      map[name] = action;
    }
    return map;
  }, [mixer, clips]);

  const weights = useRef<Partial<Record<ClipName, number>>>({ Idle: 1 });

  /* The loaded gltf is shared by every instance, and so are its materials.
     Tinting one person's hair in place would tint everyone's, so the hair
     material is cloned per instance. The body material is left alone: skin
     and clothing share one atlas there, so any tint that changed a shirt
     would change the face with it. */
  useEffect(() => {
    const owned: THREE.Material[] = [];
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = castShadow;
      mesh.receiveShadow = false;
      /* A skinned mesh's bounding volume is computed from the bind pose,
         so an arm raised above it culls the whole character mid-wave. */
      mesh.frustumCulled = false;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat && /hair/i.test(mat.name)) {
        const mine = mat.clone();
        mine.color = new THREE.Color(hair);
        mesh.material = mine;
        owned.push(mine);
      }
    });
    return () => owned.forEach((m) => m.dispose());
  }, [scene, hair, castShadow]);

  useEffect(
    () => () => {
      mixer.stopAllAction();
    },
    [mixer],
  );

  const group = useRef<THREE.Group>(null);
  /* Reused rather than allocated per frame: this runs once per character
     per frame, and thirteen new Vector3s a frame is garbage worth not
     making. */
  const worldPos = useRef(new THREE.Vector3());

  useFrame((state, rawDelta) => {
    const dt = Math.min(0.05, rawDelta);
    const m = motion.current;

    /* Far-away characters stop being re-posed. Deliberately measured from
       the parent's world matrix rather than this group's own: the parent
       is what the player controller and the NPC wander loop actually move,
       and reading a matrix the current frame has not written yet reports
       the origin. That is a hundred-odd units from wherever the camera is,
       so every character silently failed this test and never animated at
       all — the whole world slid around in its bind pose. */
    const parent = group.current?.parent;
    if (parent) {
      worldPos.current.setFromMatrixPosition(parent.matrixWorld);
      if (worldPos.current.distanceTo(state.camera.position) > ANIMATE_RADIUS) {
        /* Still advance the mixer occasionally, so a character that walks
           back into range is not frozen mid-stride when it arrives. */
        mixer.update(dt);
        return;
      }
    }

    const want: ClipName = m.greeting
      ? "Wave"
      : m.speed < IDLE_BELOW
        ? "Idle"
        : m.speed < RUN_ABOVE
          ? "Walk"
          : "Run";

    /* Restart a one-shot-looking clip when it becomes current again, so a
       wave always begins at the start of the wave rather than wherever it
       happened to be left. */
    if (want !== current.current) {
      if (want === "Wave") actions.Wave?.reset().play();
      current.current = want;
    }

    for (const name of Object.keys(actions) as ClipName[]) {
      const action = actions[name];
      if (!action) continue;
      const target = name === want ? 1 : 0;
      const now = THREE.MathUtils.damp(weights.current[name] ?? 0, target, 1 / FADE, dt);
      weights.current[name] = now;
      action.setEffectiveWeight(now);
    }

    /* Pace the clip to the ground speed actually being covered. Playing a
       walk cycle at a fixed rate while the body moves at a variable one is
       exactly what foot-skate is, and it is the thing that makes real
       animation look worse than no animation. */
    const active = actions[current.current];
    if (active) {
      const native = NATIVE_SPEED[current.current as "Walk" | "Run"];
      active.timeScale = native
        ? THREE.MathUtils.clamp(
            Math.pow(Math.max(m.speed, 0.01) / native, PACE_COMPRESSION),
            0.8,
            1.75,
          )
        : 1;
    }

    mixer.update(dt);
  });

  const scale = height / MODEL_HEIGHT;

  return (
    <group ref={group} scale={scale}>
      <primitive object={scene} />
    </group>
  );
}
