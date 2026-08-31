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
import { getGroundDetailTexture, getStructureDetailTexture, getToonRamp } from "./textures";
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
function fogTarget(phase: Phase, t: number): number {
  // VOID and SIGNAL are opaque. EMERGENCE clears to the working density.
  return phase === "VOID"
    ? 0.32
    : phase === "SIGNAL"
      ? 0.19
      : phase === "EMERGENCE"
        ? 0.19 - t * 0.184
        : 0.0018;
}

function Atmosphere({ phase, t }: { phase: Phase; t: number }) {
  const { scene } = useThree();
  /* Starts at whatever this mount's phase already calls for, not at the old
     cinematic's opening density. The live game renders phase="PLAYER" from
     its very first frame, and a fog that opens at 0.09 and lerps toward a
     0.0018 target over many frames means every frame before it catches up
     renders under fifty-times too much fog — which used to read as a moody
     dark haze and now, with a bright pale fog colour, reads as the whole
     world washed to white for as long as that catch-up takes. */
  const fog = useMemo(() => new THREE.FogExp2(LIGHT.aerial, fogTarget(phase, t)), []); // eslint-disable-line react-hooks/exhaustive-deps

  useMemo(() => {
    scene.fog = fog;
    scene.background = new THREE.Color(LIGHT.aerialFar);
  }, [scene, fog]);

  useFrame(() => {
    const target = fogTarget(phase, t);
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

  const toonRamp = useMemo(() => (typeof document === "undefined" ? null : getToonRamp()), []);

  const groundMaterial = useMemo(() => {
    const mat = new THREE.MeshToonMaterial({
      color: SURFACE.ground,
      gradientMap: toonRamp,
    });
    if (groundDetail) applyTriplanarDetail(mat, groundDetail, 0.055, 0.42);
    return mat;
  }, [groundDetail, toonRamp]);

  const padMaterials = useMemo(() => {
    const map = new Map<string, THREE.MeshToonMaterial>();
    for (const d of DISTRICTS) {
      const style = styleFor(d.language);
      const mat = new THREE.MeshToonMaterial({
        color: style.surface,
        emissive: style.emissive,
        emissiveIntensity: 0.18,
        gradientMap: toonRamp,
      });
      if (groundDetail) applyTriplanarDetail(mat, groundDetail, 0.09, 0.3);
      map.set(d.language, mat);
    }
    return map;
  }, [groundDetail, toonRamp]);

  const familyMaterials = useMemo(() => {
    const map = new Map<string, THREE.MeshToonMaterial>();
    for (const { family } of world.families) {
      const style = styleFor(family);
      const mat = new THREE.MeshToonMaterial({
        color: style.surface,
        emissive: style.emissive,
        emissiveIntensity: 0.1,
        vertexColors: true,
        gradientMap: toonRamp,
      });
      // A bright rim so every silhouette edge reads a cel-shaded outline —
      // the thing that most reads as "toon" rather than "matte plastic".
      if (structureDetail) {
        applyTriplanarDetail(mat, structureDetail, 0.34, 0.55, {
          color: "#ffffff",
          strength: 0.3,
        });
      }
      map.set(family, mat);
    }
    return map;
  }, [world.families, structureDetail, toonRamp]);

  /** The core's own stone — not any one district's colour, since it belongs
   *  to none of them and all of them. */
  const coreMaterial = useMemo(() => {
    const mat = new THREE.MeshToonMaterial({ color: SURFACE.constructed, gradientMap: toonRamp });
    if (structureDetail) {
      applyTriplanarDetail(mat, structureDetail, 0.28, 0.5, { color: "#ffffff", strength: 0.3 });
    }
    return mat;
  }, [structureDetail, toonRamp]);
  const seamRef = useRef<THREE.MeshStandardMaterial>(null);
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const coreGemRef = useRef<THREE.Mesh>(null);
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
    if (coreGemRef.current) {
      coreGemRef.current.rotation.y = time * 0.4;
      coreGemRef.current.position.y = 22 + Math.sin(time * 0.8) * 0.6;
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

      {/* Lighting: one dominant warm key, a bright sky/ground hemisphere so
          shadow faces read as "in shade" rather than "unlit", and a soft
          cool fill so silhouettes separate without fighting the key. */}
      <hemisphereLight args={["#dff3ff", "#bfe0a0", 0.65]} />
      <directionalLight color={LIGHT.fill} intensity={0.3} position={[52, 16, 70]} />
      <primitive object={target} />
      <directionalLight
        ref={keyRef}
        color={LIGHT.key}
        // Starts at this mount's resting intensity — see the matching note
        // on Sky's uOpacity for why starting at 0 and ramping per-frame is
        // the wrong default now that the live game never actually opens on
        // phase="VOID".
        intensity={phase === "VOID" ? 0 : phase === "SIGNAL" ? 0.5 : LIGHT.keyIntensity}
        position={LIGHT.keyPos as unknown as [number, number, number]}
        target={target}
      />

      {/* Ground. Grass, so structures stand somewhere rather than on a
          drafting-table plane. */}
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
              <meshBasicMaterial color={style.emissive} toneMapped={false} />
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
                <planeGeometry args={[4.4, len]} />
                <meshToonMaterial color={style.surface} gradientMap={toonRamp} />
              </mesh>
              {/* A bright wayfinding centerline — the thing that makes a
                  path read as "walk this way" rather than as tinted ground. */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                <planeGeometry args={[0.5, len]} />
                <meshBasicMaterial color={style.emissive} toneMapped={false} />
              </mesh>
            </group>
            {/* One lamp per district, so each has its own colour of light. */}
            <pointLight
              position={[cx, 44, cz]}
              color={style.emissive}
              intensity={28}
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
        intensity={phase === "VOID" ? 0 : phase === "SIGNAL" ? 90 : 40}
        distance={140}
        decay={2}
      />

      {/* The largest work is lit from within — the only structure that is,
          besides the running systems. Rule L1: every glow has a source. */}
      <pointLight
        position={[relicEntity.x, relicEntity.height * 0.62, relicEntity.z]}
        color={EMISSIVE.reward}
        intensity={phase === "PLAYER" ? 70 : 0}
        distance={72}
        decay={2}
      />

      {/* CORE: the synthesis, at the hub every district rings. A small
          hand-built gazebo rather than one abstract gem, so the one place in
          the world with no repository behind it still reads as a place —
          a plinth, a ring of pillars, a roof, and the same reward-coloured
          gem it always had, now floating above a building instead of being
          the only thing there. */}
      <group position={[core.x, 0, core.z]}>
        <mesh position={[0, 1, 0]} material={coreMaterial}>
          <cylinderGeometry args={[10, 11, 2, 12]} />
        </mesh>
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2;
          const r = 8;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * r, 7, Math.sin(a) * r]}
              material={coreMaterial}
            >
              <cylinderGeometry args={[0.6, 0.7, 10, 8]} />
            </mesh>
          );
        })}
        <mesh position={[0, 15, 0]}>
          <coneGeometry args={[11.5, 6, 12]} />
          <meshToonMaterial
            color={SURFACE.constructed}
            emissive={EMISSIVE.reward}
            emissiveIntensity={0.12}
            gradientMap={toonRamp}
          />
        </mesh>
        <mesh ref={coreGemRef} position={[0, 22, 0]} rotation={[0, Math.PI / 4, Math.PI / 4]}>
          <octahedronGeometry args={[3.4, 0]} />
          <meshStandardMaterial
            color={SURFACE.constructed}
            emissive={EMISSIVE.reward}
            emissiveIntensity={1.1}
            roughness={0.25}
            metalness={0.5}
            flatShading
          />
        </mesh>
        <pointLight position={[0, 26, 0]} color={EMISSIVE.reward} intensity={55} distance={70} decay={2} />
      </group>
    </>
  );
}

export { BEATS };
