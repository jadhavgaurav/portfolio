"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { INTERACTABLES, type Interactable } from "./interactables";
import { DISTRICTS, districtCentre, styleFor } from "./language";
import { collect as collectSfx } from "@/audio/engine";

/**
 * Markers and signage.
 *
 * Two problems this solves at once. Nothing in the world announced that it
 * could be interacted with, so a player could walk past every case study in
 * the record without knowing one was there; and nothing said which district
 * you were standing in, so the colours were decoration rather than
 * wayfinding.
 *
 * Markers are the game convention on purpose — a floating diamond over a
 * thing you can use. Inventing a subtler language here would only mean the
 * player has to learn one.
 */

/**
 * A label, drawn to a canvas and mapped onto a plane.
 *
 * drei's Text was tried and removed: troika fetches its font over the
 * network, which failed outright behind a proxy and would have made the
 * world's signage depend on a CDN being up. A canvas texture has no such
 * dependency, uses the same monospace the interface uses, and at this size
 * is indistinguishable.
 */
function SignLabel({ text, color }: { text: string; color: string }) {
  const texture = useMemo(() => {
    const w = 1024;
    const h = 160;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, w, h);
    ctx.font = "600 84px ui-monospace, 'SFMono-Regular', Menlo, monospace";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // Letter-spaced by hand: canvas has no tracking control worth the name.
    const spaced = text.split("").join(" ");
    ctx.fillText(spaced, w / 2, h / 2 + 4);
    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    t.needsUpdate = true;
    return t;
  }, [text, color]);

  return (
    <mesh position={[0, 8.1, 0.29]}>
      <planeGeometry args={[9.2, 1.44]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

const KIND_COLOR: Record<Interactable["kind"], string> = {
  CORE: "#8cbcae",
  PROJECT: "#f2b544",
  WORK: "#e8834a",
  CERT: "#7fd1c4",
  REPO: "#f2c94c",
  /* Unused — NPCs are filtered out of this marker loop below. A walking
     figure is its own marker; a diamond hovering over it would be redundant. */
  NPC: "#ffffff",
};

/** Plain repositories get a smaller, dimmer mark: there are thirty-odd of
 *  them and they should read as texture, not as a quest list. */
const KIND_SCALE: Record<Interactable["kind"], number> = {
  CORE: 1.15,
  PROJECT: 1.1,
  WORK: 1.05,
  CERT: 0.85,
  REPO: 0.55,
  NPC: 1,
};

export function Markers({
  activeId,
  visited,
}: {
  /** The one currently in reach, which lifts and brightens. */
  activeId: string | null;
  /** Ids already opened. They stay marked but stop asking for attention. */
  visited: string[];
}) {
  const group = useRef<THREE.Group>(null);
  const seen = useMemo(() => new Set(visited), [visited]);

  /* A coin for the forty-two repositories, a star for the seven
     certifications, and a gem for everything singular — the core, the
     eleven case studies, the two employers. One shared shape read as
     decoration; different shapes read as different kinds of thing to find,
     which is what the log's four categories actually are. */
  const geoByKind = useMemo<Record<Interactable["kind"], THREE.BufferGeometry>>(
    () => ({
      REPO: new THREE.CylinderGeometry(0.5, 0.5, 0.14, 14),
      CERT: new THREE.TetrahedronGeometry(0.56, 0),
      PROJECT: new THREE.OctahedronGeometry(0.62, 0),
      WORK: new THREE.OctahedronGeometry(0.62, 0),
      CORE: new THREE.OctahedronGeometry(0.62, 0),
      NPC: new THREE.OctahedronGeometry(0.62, 0), // unused, see KIND_COLOR.NPC
    }),
    [],
  );
  const materials = useMemo(() => {
    const out: Record<string, THREE.MeshStandardMaterial> = {};
    for (const [kind, color] of Object.entries(KIND_COLOR)) {
      out[kind] = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 1.1,
        roughness: 0.3,
      });
    }
    return out;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const g = group.current;
    if (!g) return;
    for (const child of g.children) {
      const kind = child.userData.kind as string;
      const id = child.userData.id as string;
      const base = child.userData.baseY as number;
      const active = id === activeId;
      child.rotation.y = t * (active ? 1.5 : 0.6);
      child.position.y = base + Math.sin(t * 1.6 + child.userData.phase) * 0.32 + (active ? 0.6 : 0);
      const s = (KIND_SCALE[kind as Interactable["kind"]] ?? 1) * (active ? 1.45 : 1);
      child.scale.setScalar(s);
      const m = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = seen.has(id) ? 0.35 : active ? 1.9 : 1.1;
    }
  });

  /* A coin, badge or star picked up plays a stinger and a brief expanding
     ring at the spot it was standing — the moment "visited" happens, not
     just the fact that it eventually did. */
  const [bursts, setBursts] = useState<{ id: string; x: number; y: number; z: number; born: number }[]>([]);
  const prevVisited = useRef<Set<string>>(new Set());

  useEffect(() => {
    const now = performance.now();
    const fresh: typeof bursts = [];
    for (const id of visited) {
      if (prevVisited.current.has(id)) continue;
      const it = INTERACTABLES.find((x) => x.id === id);
      if (!it) continue;
      fresh.push({ id, x: it.x, y: it.y, z: it.z, born: now });
    }
    prevVisited.current = new Set(visited);
    if (fresh.length) {
      collectSfx();
      setBursts((b) => [...b, ...fresh]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visited]);

  const burstRefs = useRef(new Map<string, THREE.Mesh>());

  useFrame(() => {
    const now = performance.now();
    let expired = false;
    for (const b of bursts) {
      const mesh = burstRefs.current.get(b.id);
      const age = (now - b.born) / 550;
      if (mesh) {
        const s = 0.4 + age * 3.2;
        mesh.scale.setScalar(s);
        (mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - age);
      }
      if (age >= 1) expired = true;
    }
    if (expired) {
      const cutoff = now - 600;
      setBursts((b) => b.filter((x) => x.born > cutoff));
    }
  });

  return (
    <>
      <group ref={group}>
        {INTERACTABLES.filter((it) => it.kind !== "NPC").map((it, i) => (
          <mesh
            key={it.id}
            geometry={geoByKind[it.kind]}
            material={materials[it.kind]}
            position={[it.x, it.y, it.z]}
            userData={{ kind: it.kind, id: it.id, baseY: it.y, phase: i * 1.7 }}
          />
        ))}
      </group>

      {bursts.map((b) => (
        <mesh
          key={b.id}
          ref={(m) => {
            if (m) burstRefs.current.set(b.id, m);
            else burstRefs.current.delete(b.id);
          }}
          position={[b.x, b.y, b.z]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.5, 0.68, 20]} />
          <meshBasicMaterial color="#ffd35c" transparent opacity={1} toneMapped={false} depthWrite={false} />
        </mesh>
      ))}

      {/* District signage. Placed at the near edge of each pad, facing the
          core, so you read it on the way in. */}
      {DISTRICTS.map((d) => {
        const [cx, cz] = districtCentre(d);
        const len = Math.hypot(cx, cz) || 1;
        const inset = d.spread + 15;
        const sx = cx - (cx / len) * inset;
        const sz = cz - (cz / len) * inset;
        const style = styleFor(d.language);
        const facing = Math.atan2(-sx, -sz) + Math.PI;
        return (
          <group key={d.language} position={[sx, 0, sz]} rotation={[0, facing, 0]}>
            {/* Two posts and a beam. A gate reads as an entrance; a floating
                label reads as a HUD that happens to be in the world. */}
            {[-4.6, 4.6].map((ox) => (
              <mesh key={ox} position={[ox, 4.2, 0]}>
                <boxGeometry args={[0.5, 8.4, 0.5]} />
                <meshStandardMaterial
                  color={style.surface}
                  emissive={style.emissive}
                  emissiveIntensity={0.5}
                  roughness={0.5}
                />
              </mesh>
            ))}
            <mesh position={[0, 8.1, 0]}>
              <boxGeometry args={[10, 1.5, 0.42]} />
              <meshStandardMaterial
                color={style.surface}
                emissive={style.emissive}
                emissiveIntensity={0.85}
                roughness={0.45}
              />
            </mesh>
            <SignLabel text={style.label.toUpperCase()} color={style.ui} />
          </group>
        );
      })}
    </>
  );
}
