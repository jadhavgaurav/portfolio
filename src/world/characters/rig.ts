"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";

/**
 * Rigged character assets.
 *
 * The world used to be walked by box figures with a hand-written swing:
 * legs and arms counter-rotating about a shoulder, a torso bobbing on a
 * phase counter. That reads as alive at a glance and never reads as a
 * person, because the thing a person actually does when they walk is
 * shift weight, and no amount of rotating two boxes expresses weight.
 *
 * These are real skinned meshes on a real skeleton, driven by motion
 * capture. Two bodies, loaded once each and shared by everyone who walks
 * here, and one small file of clips that binds to both.
 *
 * The source is Mixamo, which exports FBX, so these were converted and
 * had their textures resized and re-encoded before they landed in
 * `public/`. Adobe's General Terms §3.6 permits shipping the files inside
 * a deployed application, which is what this is; it does not permit
 * offering them as downloadable assets on their own, which this does not.
 */

/**
 * `player` is its own body, not a third pick from the crowd's two. Eleven
 * NPCs share the male mesh, so making the player a repaint of that file
 * would have made the whole crowd the player. It is Mixamo's Adam — the
 * closest base in the catalogue to the person it stands for: a full dark
 * beard, hair swept up, already in a hoodie — with the garments tinted
 * per mesh (charcoal hoodie, indigo trousers) and the skin left as
 * authored, which already matches. The likeness is in the colouring and
 * the silhouette, which is all that survives at gameplay distance.
 */
export type BodyType = "male" | "female" | "player";

const BODY_URL: Record<BodyType, string> = {
  male: "/characters/male.glb",
  female: "/characters/female.glb",
  player: "/characters/player.glb",
};

export type ClipName = "Idle" | "Walk" | "Run" | "Wave";

/**
 * One file per clip.
 *
 * These were briefly merged into a single `animations.glb`, which is the
 * obvious thing to do and is wrong. Each Mixamo export carries its own
 * copy of the skeleton, so merging four of them produces four skeletons;
 * keeping one scene and dropping the rest orphans the nodes that three of
 * the four clips are addressed to, and a track whose target cannot be
 * resolved is silently skipped. The result is a character that idles
 * correctly and then snaps to its bind pose the moment it walks, because
 * an unbound skeleton has nothing posing it.
 *
 * Four fetches of about fifty kilobytes each is a bad trade for nothing.
 * The clips are cached by drei, so this is four requests for the whole
 * world, not four per person.
 */
const CLIP_URL: Record<ClipName, string> = {
  Idle: "/characters/clip-idle.glb",
  Walk: "/characters/clip-walk.glb",
  Run: "/characters/clip-run.glb",
  Wave: "/characters/clip-wave.glb",
};

/**
 * How tall the exported mesh stands, in world units, measured from the
 * glTF's own position bounds rather than assumed. Everything that places
 * a character scales by `wantedHeight / MODEL_HEIGHT`, so the one number
 * that would silently desynchronise the avatar from its collision radius
 * and its name tag lives here instead of in three call sites.
 */
export const MODEL_HEIGHT = 1.782;

/**
 * An independent copy of a body.
 *
 * `SkeletonUtils.clone`, not `Object3D.clone`: a SkinnedMesh keeps a
 * reference to its skeleton, and a plain clone shares it. Every NPC would
 * then be posed by whichever mixer ran last, so twelve people would walk
 * in perfect lockstep and the player would twitch between their own gait
 * and someone else's.
 */
export function useBody(body: BodyType): THREE.Group {
  const { scene } = useGLTF(BODY_URL[body]);
  return useMemo(() => cloneSkinned(scene) as THREE.Group, [scene]);
}

/**
 * The shared clips, keyed by what they are rather than by the name inside
 * the file — every Mixamo export calls its one animation `mixamo.com`.
 */
export function useClips(): Partial<Record<ClipName, THREE.AnimationClip>> {
  const idle = useGLTF(CLIP_URL.Idle);
  const walk = useGLTF(CLIP_URL.Walk);
  const run = useGLTF(CLIP_URL.Run);
  const wave = useGLTF(CLIP_URL.Wave);
  return useMemo(
    () => ({
      Idle: idle.animations[0],
      Walk: walk.animations[0],
      Run: run.animations[0],
      Wave: wave.animations[0],
    }),
    [idle, walk, run, wave],
  );
}

useGLTF.preload(BODY_URL.male);
useGLTF.preload(BODY_URL.female);
useGLTF.preload(BODY_URL.player);
for (const url of Object.values(CLIP_URL)) useGLTF.preload(url);
