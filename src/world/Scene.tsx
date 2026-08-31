"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildWorld } from "./geometry";
import {
  EMISSIVE,
  LIGHT,
  SURFACE,
} from "./palette";
import { WORLD, core, entities } from "./telemetry";
import { BEATS, type Phase } from "./sequence";
import { DISTRICTS, districtCentre, styleFor } from "./language";
import { Dust, Sky } from "./Atmosphere";
import { applyTriplanarDetail } from "./triplanar";
import { getGroundDetailTexture, getStructureDetailTexture } from "./textures";
import { entityById } from "./telemetry";
import type { Lens } from "./discovery";

/**
 * The world.
 *
 * Static geometry, five draw calls for the structures plus a seam pass and a
 * ground plane. Nothing in here allocates per frame; the only per-frame work
 * is the fog density and the seam emissive, both driven by the sequence.
 */

/** Atmosphere is the EMERGENCE mechanism: the world is revealed by the
 *  medium clearing, not by anything being built. */
function Atmosphere({ phase, t }: { phase: Phase; t: number }) {
  const { scene } = useThree();
  const fog = useMemo(() => new THREE.FogExp2(LIGHT.aerial, 0.09), []);

  useMemo(() => {
    scene.fog = fog;
    scene.background = new THREE.Color(LIGHT.aerialFar);
  }, [scene, fog]);

  useFrame(() => {
    // VOID and SIGNAL are opaque. EMERGENCE clears to the working density.
    const target =
      phase === "VOID" ? 0.32 : phase === "SIGNAL" ? 0.19 : phase === "EMERGENCE" ? 0.19 - t * 0.184 : 0.006;
    fog.density += (target - fog.density) * 0.045;
    // The ground colour lifts a little as the medium clears, never to sky.
    const target2 = new THREE.Color(phase === "VOID" ? "#08090a" : LIGHT.aerialFar);
    (scene.background as THREE.Color).lerp(target2, 0.03);
  });

  return null;
}

export function Scene({
  phase,
  t,
  quality,
  lenses,
  noticing,
}: {
  phase: Phase;
  t: number;
  /** Retained for the type the canvas passes; the world is no longer a
   *  function of scroll position. */
  scroll?: number;
  quality: "high" | "low";
  lenses: Lens[];
  noticing: { id: string; progress: number } | null;
}) {
  const has = (l: Lens) => lenses.includes(l);
  const world = useMemo(() => buildWorld(), []);

  /* Detail textures and the materials built from them. Textures are canvas
     generated and so need a document, hence the guard — this component only
     ever renders on the client (the canvas above it is dynamically imported
     with ssr: false), but the guard keeps that assumption from being silent. */
  const structureDetail = useMemo(
    () => (typeof document === "undefined" ? null : getStructureDetailTexture()),
    [],
  );
  const groundDetail = useMemo(
    () => (typeof document === "undefined" ? null : getGroundDetailTexture()),
    [],
  );

  const groundMaterial = useMemo(() => {
    /* Matte, and not negotiable.
       The IMPACT lens used to make the ground glossy as a reward, and every
       lens is granted from the first frame now — so a 900-unit plane sat
       permanently at roughness 0.74 and mirrored the key light into a blown
       specular lobe the size of a district. A ground plane this large cannot
       be shiny. */
    const mat = new THREE.MeshStandardMaterial({
      color: SURFACE.ground,
      roughness: 0.96,
      metalness: 0.02,
    });
    if (groundDetail) applyTriplanarDetail(mat, groundDetail, 0.055, 0.5);
    return mat;
  }, [groundDetail]);

  const padMaterials = useMemo(() => {
    const map = new Map<string, THREE.MeshStandardMaterial>();
    for (const d of DISTRICTS) {
      const style = styleFor(d.language);
      const mat = new THREE.MeshStandardMaterial({
        color: style.surface,
        emissive: style.emissive,
        emissiveIntensity: 0.22,
        roughness: 0.88,
        metalness: 0.05,
      });
      if (groundDetail) applyTriplanarDetail(mat, groundDetail, 0.09, 0.42);
      map.set(d.language, mat);
    }
    return map;
  }, [groundDetail]);

  const familyMaterials = useMemo(() => {
    const map = new Map<string, THREE.MeshStandardMaterial>();
    for (const { family } of world.families) {
      const style = styleFor(family);
      const mat = new THREE.MeshStandardMaterial({
        color: style.surface,
        emissive: style.emissive,
        emissiveIntensity: 0.055,
        roughness: 0.66,
        metalness: 0.18,
        vertexColors: true,
      });
      if (structureDetail) applyTriplanarDetail(mat, structureDetail, 0.34, 0.85);
      map.set(family, mat);
    }
    return map;
  }, [world.families, structureDetail]);
  const seamRef = useRef<THREE.MeshStandardMaterial>(null);
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(...LIGHT.keyTarget);
    return o;
  }, []);

  /** ORIGIN is the SIGNAL. Continuity of that one object across the whole
   *  opening is the spine of the sequence — Bible constraint, §3. */
  const signal = useMemo(() => entities.find((e) => e.type === "ORIGIN")!, []);
  const relicEntity = useMemo(() => entities.find((e) => e.type === "RELIC")!, []);
  const noticed = noticing ? entityById(noticing.id) : null;

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (seamRef.current) {
      // Running systems breathe. Amplitude, not colour, carries activity.
      const base = phase === "VOID" ? 0 : 1;
      seamRef.current.emissiveIntensity = base * (1.5 + Math.sin(time * 0.9) * 0.35);
    }
    if (keyRef.current) {
      // The key light arrives with the world.
      const want = phase === "VOID" ? 0 : phase === "SIGNAL" ? 0.5 : LIGHT.keyIntensity;
      keyRef.current.intensity += (want - keyRef.current.intensity) * 0.03;
    }
  });

  return (
    <>
      <Atmosphere phase={phase} t={t} />
      <Sky phase={phase} />
      {quality === "high" && <Dust quality={quality} />}

      {/* Lighting, per the approved Study 12: one dominant raking key,
          a cool hemisphere fill, nothing else. */}
      <hemisphereLight args={["#93a7b1", "#2b3236", 2.0]} />
      {/* A low, cool counter-light so silhouettes separate from the aerial
          haze without softening the key. */}
      <directionalLight color={LIGHT.fill} intensity={1.1} position={[52, 16, 70]} />
      <primitive object={target} />
      <directionalLight
        ref={keyRef}
        color={LIGHT.key}
        intensity={0}
        position={LIGHT.keyPos as unknown as [number, number, number]}
        target={target}
      />

      {/* Ground. Dark and matte, so structures read by silhouette first.
          IMPACT gives it a sheen, which is how shipped work starts casting
          onto the ground around it. */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, -WORLD.depth / 2]}
        material={groundMaterial}
      >
        <planeGeometry args={[900, WORLD.depth + 700]} />
      </mesh>

      {/* District ground.
          The ground was the largest surface in every frame and carried no
          information at all — a flat plate the player crossed to get between
          things. Each district now stands on a pad in its own language colour
          and a path runs from the hub to it, so from anywhere in the world the
          player can see where the districts are and which is which before
          reading a single label. */}
      {DISTRICTS.map((d) => {
        const [cx, cz] = districtCentre(d);
        const style = styleFor(d.language);
        const len = Math.hypot(cx, cz);
        return (
          <group key={d.language}>
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[cx, 0.05, cz]}
              material={padMaterials.get(d.language)}
            >
              <circleGeometry args={[d.spread + 16, 44]} />
            </mesh>
            {/* The rim, which is what actually reads at distance. */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.09, cz]}>
              <ringGeometry args={[d.spread + 13.4, d.spread + 16, 44]} />
              <meshStandardMaterial
                color={style.surface}
                emissive={style.emissive}
                /* A drawn line, not a light source. At 1.5 the bloom turned
                   the rim into a blown band that lit the player from below. */
                emissiveIntensity={0.42}
                roughness={0.4}
              />
            </mesh>
            {/* A path back to the hub.
                The bearing has to be applied about Y and the flat-to-ground
                flip about X, in that order and in separate frames. Doing both
                on one mesh as [-PI/2, 0, bearing] applies the bearing after
                the flip, which tilts the plane up out of the ground: each
                path was rendering as an enormous coloured wedge standing in
                the air rather than as a road. */}
            <group rotation={[0, -Math.atan2(cx, -cz), 0]} position={[cx / 2, 0.06, cz / 2]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[4.2, len]} />
                <meshStandardMaterial
                  color={style.surface}
                  emissive={style.emissive}
                  emissiveIntensity={0.42}
                  roughness={0.7}
                />
              </mesh>
            </group>
            {/* One lamp per district, so each has its own colour of light. */}
            {/* Raised and dimmed. At 26 units up and 210 candela the pool
                directly beneath each lamp blew past the bloom threshold and
                burned a white hole in the ground. */}
            <pointLight
              position={[cx, 44, cz]}
              color={style.emissive}
              intensity={62}
              distance={d.spread + 96}
              decay={2}
            />
          </group>
        );
      })}

      {/* The route. It is the time axis, so it earns its light. */}
      <mesh geometry={world.route}>
        <meshStandardMaterial
          color={EMISSIVE.phaseJoint}
          emissive={EMISSIVE.interaction}
          emissiveIntensity={0.85}
          roughness={0.85}
        />
      </mesh>

      {/* Structures: one merged mesh per language, coloured by ecosystem.
          The whole world used to be a single stone. It holds eight distinct
          ecosystems and now says so — GitHub's own language hues, so a blue
          district reads as TypeScript before any label does. */}
      {world.families.map(({ family, geometry }) => (
        <mesh
          key={family}
          geometry={geometry}
          material={familyMaterials.get(family)}
          castShadow={false}
          receiveShadow={false}
        />
      ))}

      {/* NOTICE. World-side, as the loop requires: the entity being attended
          to takes light differently. No outline, no marker, no icon — it
          simply starts to resolve. */}
      {noticing && noticed && (
        <pointLight
          position={[noticed.x, noticed.height * 0.5, noticed.z]}
          color={EMISSIVE.interaction}
          intensity={30 + noticing.progress * 240}
          distance={60 + noticing.progress * 60}
          decay={2}
        />
      )}

      {/* CRAFT: works built with their apparatus first light along their
          joints. The seams already exist; the lens is what reveals them. */}
      {world.seams && (
        <mesh geometry={world.seams}>
          <meshStandardMaterial
            ref={seamRef}
            color={EMISSIVE.phaseJoint}
            emissive={EMISSIVE.interaction}
            emissiveIntensity={has("CRAFT") ? 2.6 : 0.35}
            roughness={0.4}
          />
        </mesh>
      )}

      {/* COLLABORATION: the line through eight attempts at one idea, drawn
          across the world. Visible from wherever the visitor is standing. */}
      {has("COLLABORATION") && (
        <mesh geometry={world.conduits}>
          <meshStandardMaterial
            color={EMISSIVE.phaseJoint}
            emissive={EMISSIVE.reward}
            emissiveIntensity={1.5}
            roughness={0.3}
            metalness={0.4}
          />
        </mesh>
      )}

      {/* VOID: the trajectory breaks stop being ground and become events. */}
      <mesh geometry={world.rifts}>
        <meshStandardMaterial
          color={SURFACE.ruined}
          emissive={EMISSIVE.reward}
          emissiveIntensity={has("VOID") ? 0.55 : 0}
          roughness={0.95}
          vertexColors
        />
      </mesh>

      {/* SIGNAL: the earliest trace, lit before anything else exists.
          The same object the visitor later stands in front of as ORIGIN. */}
      <pointLight
        position={[signal.x, signal.height + 3, signal.z]}
        color={EMISSIVE.interaction}
        intensity={phase === "VOID" ? 0 : phase === "SIGNAL" ? 90 : 26}
        distance={140}
        decay={2}
      />

      {/* The largest work is lit from within — the only structure that is,
          besides the running systems. Rule L1: every glow has a source. */}
      <pointLight
        position={[relicEntity.x, relicEntity.height * 0.62, relicEntity.z]}
        color={EMISSIVE.reward}
        intensity={phase === "PLAYER" ? 55 : 0}
        distance={72}
        decay={2}
      />

      {/* CORE: the synthesis, beyond the last work. A consequence of the world. */}
      <mesh position={[core.x, core.y, core.z]} rotation={[0, Math.PI / 4, Math.PI / 4]}>
        <octahedronGeometry args={[9, 0]} />
        <meshStandardMaterial
          color={SURFACE.constructed}
          emissive={EMISSIVE.reward}
          /* Every lens is granted from the first frame now, so this was
             permanently at 3.2 — an eighteen-unit emissive object standing at
             the hub the player spawns beside, bloomed into a white field
             across a third of the screen. It is a landmark, not a lamp. */
          emissiveIntensity={0.55}
          roughness={0.3}
          metalness={0.6}
          flatShading
        />
      </mesh>
      {/* The core's lamp.
          It was tuned for a core approached from four hundred units away at
          the end of a corridor. The core is the hub the districts ring now,
          which put a 320-intensity point light where the player spawns and
          washed the whole frame to white. Lifted, dimmed, and pulled in so it
          lights the hub rather than the world. */}
      <pointLight
        position={[core.x, core.y + 30, core.z]}
        color={EMISSIVE.reward}
        intensity={24}
        distance={62}
        decay={2}
      />
    </>
  );
}

export { BEATS };
