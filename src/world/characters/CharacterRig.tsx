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

/**
 * A mark worn on the chest.
 *
 * Painted into the clothing atlas would be the obvious place, and it is
 * the wrong one: Mixamo's atlases are auto-unwrapped, so the hoodie's
 * chest is an island somewhere in a jumble of sleeves and trouser legs
 * and there is no way to find it short of a UV editor. A quad parented
 * to the chest bone instead. It rides with the spine through every clip,
 * and where it sits is read off the rig's own bind matrices rather than
 * guessed, so it lands on the chest of any body this is asked to mark.
 */
export interface ChestMark {
  text: string;
  color: string;
}

/** Mixamo's upper-chest bone, present on every humanoid it exports. The
 *  colon is optional because it is not there at runtime: three's loader
 *  strips it, as it strips every character that would be ambiguous in an
 *  animation track path, so the bone is `mixamorigSpine2` in the scene
 *  even though it is `mixamorig:Spine2` in the file. An exact match on
 *  the file's spelling silently finds nothing. */
const CHEST_BONE = /^mixamorig:?Spine2$/;

/** Mixamo's neck bone, the other end of the span the print is placed
 *  along. Colon-optional for the same reason as the chest bone. */
const NECK_BONE = /^mixamorig:?Neck$/;

/** How far up from the chest bone towards the neck the print sits, as a
 *  fraction of the span. Spine2 on its own is level with the top of the
 *  stomach, which is where the mark used to sit and read as being on the
 *  belly; a garment print is centred well above that, below the collar. */
const MARK_RISE = 0.45;

/** How far the print stands off the fabric. Only enough to clear
 *  z-fighting: what it stands off is measured now, so this no longer has
 *  to make up for a front face that was really the character's nose. */
const MARK_LIFT = 0.006;

/** The print, in world units, at the texture's own two-to-one. Narrower
 *  than the chest rather than the whole width of it, so the flat quad
 *  stays close to a torso that curves away by about a centimetre and a
 *  half across the span the old one covered. */
const MARK_W = 0.2;
const MARK_H = 0.1;

/**
 * The front of the torso at a given height, measured off the meshes.
 *
 * This used to be one clothing mesh's bounding box, read at its far +Z
 * face. That is only the chest if the chest is the frontmost point on the
 * whole body, and it never is: the box is bounded by the nose here and by
 * the toe of a shoe on the body before it, so the mark hung seven
 * centimetres clear of the character like a card held up in front of it.
 *
 * Every skinned mesh is sampled rather than one matched by name, so
 * whatever is actually worn is what gets measured, and the height window
 * is what excludes the face and the feet rather than a guess about which
 * mesh is a garment.
 */
function frontOfTorso(
  meshes: THREE.SkinnedMesh[],
  y: number,
  halfW: number,
  halfH: number,
): number | null {
  let front = -Infinity;
  for (const mesh of meshes) {
    const pos = mesh.geometry.getAttribute("position");
    if (!pos) continue;
    for (let i = 0; i < pos.count; i++) {
      if (Math.abs(pos.getY(i) - y) > halfH) continue;
      if (Math.abs(pos.getX(i)) > halfW) continue;
      front = Math.max(front, pos.getZ(i));
    }
  }
  return Number.isFinite(front) ? front : null;
}

/** The glyph, drawn to a canvas. Exported so the thrown copy in the world
 *  is the same texture as the one worn on the chest, rather than a second
 *  drawing of it that could drift out of step. */
export function markTexture(text: string, color: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.font = "700 190px ui-monospace, 'SFMono-Regular', Menlo, monospace";
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, c.width / 2, c.height / 2 + 8);
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 4;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * Attach the mark to the chest bone. Returns a disposer.
 *
 * Everything is worked out in bind space, which is what the skeleton's
 * `boneInverses` describe and what the geometry is authored in, so the
 * current pose is irrelevant: the point in front of the chest is found on
 * the unposed hoodie, moved into the bone's own frame with that bone's
 * inverse bind matrix, and from then on the bone carries it.
 */
function attachChestMark(scene: THREE.Object3D, mark: ChestMark): () => void {
  const skinned: THREE.SkinnedMesh[] = [];
  scene.traverse((o) => {
    const m = o as THREE.SkinnedMesh;
    if (m.isSkinnedMesh) skinned.push(m);
  });
  if (!skinned.length) return () => {};
  const skel = skinned[0].skeleton;
  const idx = skel.bones.findIndex((b) => CHEST_BONE.test(b.name));
  if (idx < 0) return () => {};
  const bone = skel.bones[idx];
  const inverseBind = skel.boneInverses[idx];

  const bindPos = (i: number) =>
    new THREE.Vector3().setFromMatrixPosition(skel.boneInverses[i].clone().invert());

  // Height first, from the bind pose: up from the chest bone towards the
  // neck, because the chest bone itself is level with the stomach.
  const chest = bindPos(idx);
  const neck = skel.bones.findIndex((b) => NECK_BONE.test(b.name));
  const y = neck >= 0 ? THREE.MathUtils.lerp(chest.y, bindPos(neck).y, MARK_RISE) : chest.y;

  // Then depth, from the fabric that is actually at that height.
  const front = frontOfTorso(skinned, y, MARK_W / 2, MARK_H / 2);
  const point = new THREE.Vector3(0, y, (front ?? chest.z + 0.12) + MARK_LIFT);

  const texture = markTexture(mark.text, mark.color);
  // Lit, and tone mapped with everything else. Unlit it stayed the same
  // flat teal whichever way the character turned, which is what made it
  // read as a decal hovering over the hoodie rather than something printed
  // on it; taking the light means it darkens into the folds and the shade.
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    roughness: 0.9,
    metalness: 0,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(MARK_W, MARK_H), material);
  quad.renderOrder = 2;
  quad.frustumCulled = false;

  // Into the bone's frame: position via the inverse bind matrix, and a
  // rotation that undoes the bone's own so the quad keeps facing +Z.
  quad.position.copy(point).applyMatrix4(inverseBind);
  quad.quaternion.setFromRotationMatrix(inverseBind);
  bone.add(quad);

  // A bone can carry a scale (Mixamo rigs often do). Undo it so the quad
  // is the size it was drawn at in world units.
  scene.updateMatrixWorld(true);
  const ws = new THREE.Vector3();
  bone.getWorldScale(ws);
  quad.scale.set(1 / ws.x, 1 / ws.y, 1 / ws.z);

  return () => {
    bone.remove(quad);
    quad.geometry.dispose();
    material.dispose();
    texture.dispose();
  };
}

export function CharacterRig({
  body,
  height,
  hair,
  motion,
  castShadow = true,
  chestMark,
}: {
  body: BodyType;
  /** Wanted height in world units; the mesh is scaled to hit it. */
  height: number;
  /** Hair tint, multiplied over the texture. */
  hair: string;
  motion: React.MutableRefObject<CharacterMotion>;
  castShadow?: boolean;
  /** Something worn on the chest. Only the player has one. */
  chestMark?: ChestMark;
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
    const detachMark = chestMark ? attachChestMark(scene, chestMark) : null;
    return () => {
      owned.forEach((m) => m.dispose());
      detachMark?.();
    };
  }, [scene, hair, castShadow, chestMark]);

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

  const scale = height / MODEL_HEIGHT[body];

  return (
    <group ref={group} scale={scale}>
      <primitive object={scene} />
    </group>
  );
}
