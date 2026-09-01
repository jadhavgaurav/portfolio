"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { INTERACTABLES, type Interactable } from "./interactables";
import { DISTRICTS, districtCentre, styleFor } from "./language";
import { collect as collectSfx, reveal as revealSfx } from "@/audio/engine";

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

/** How long the flash on a freshly-opened case study or job holds, in
 *  milliseconds — shared between the marker's own emissive spike and the
 *  shard burst's lifetime, so the two read as one moment. */
const FLASH_MS = 380;

interface Shard {
  dx: number;
  dz: number;
  dy: number;
  spin: number;
}

interface BurstData {
  id: string;
  x: number;
  y: number;
  z: number;
  born: number;
  /** A case study or job, not a plain repo/cert — gets the shard shower. */
  major: boolean;
  color: string;
  shards: Shard[];
}

/** A handful of random outward directions for one shard burst, generated
 *  once when the burst is created and held fixed for its whole life —
 *  this is an ephemeral celebration cue, not part of the world's own
 *  generated data, so there is nothing to keep deterministic here. */
function makeShards(): Shard[] {
  const count = 9;
  return Array.from({ length: count }, () => {
    const a = Math.random() * Math.PI * 2;
    const r = 0.6 + Math.random() * 0.4;
    return {
      dx: Math.sin(a) * r,
      dz: Math.cos(a) * r,
      dy: 0.5 + Math.random() * 0.9,
      spin: (Math.random() - 0.5) * 10,
    };
  });
}

/**
 * One collect burst: the shared expanding ring for every kind, plus — for a
 * case study or job — a shower of small shards thrown out from the marker
 * and pulled back down by the same gravity the player falls under.
 *
 * Its own component rather than a shared imperative loop in the parent: a
 * burst's shards need their own ref per shard, and there can be several
 * bursts alive at once (walking past a run of markers quickly), so this
 * keeps each burst's animation state — and its cleanup — self-contained.
 */
function Burst({ b, onDone }: { b: BurstData; onDone: (id: string) => void }) {
  const ring = useRef<THREE.Mesh>(null);
  const shardRefs = useRef<(THREE.Mesh | null)[]>([]);
  const done = useRef(false);
  const lifeMs = b.major ? 900 : 550;

  useFrame(() => {
    const age = (performance.now() - b.born) / lifeMs;
    const k = Math.min(1, age);
    if (ring.current) {
      ring.current.scale.setScalar(0.4 + k * 3.2);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - k);
    }
    for (let i = 0; i < b.shards.length; i++) {
      const mesh = shardRefs.current[i];
      if (!mesh) continue;
      const sh = b.shards[i];
      // Thrown out, arcing under gravity, same shape as the collect ring's
      // own expansion — outward first, falling as they go.
      mesh.position.set(sh.dx * k * 2.8, b.y + 0.3 + sh.dy * k * 2.0 - k * k * 2.2, sh.dz * k * 2.8);
      mesh.rotation.set(k * sh.spin, k * sh.spin * 1.3, 0);
      mesh.scale.setScalar(Math.max(0, 1 - k) * 0.3);
      (mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - k);
    }
    if (age >= 1 && !done.current) {
      done.current = true;
      onDone(b.id);
    }
  });

  return (
    <group position={[b.x, 0, b.z]}>
      <mesh ref={ring} position={[0, b.y, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.68, 20]} />
        <meshBasicMaterial
          color={b.major ? b.color : "#ffd35c"}
          transparent
          opacity={1}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
      {b.major &&
        b.shards.map((_, i) => (
          <mesh
            key={i}
            ref={(m) => {
              shardRefs.current[i] = m;
            }}
          >
            <tetrahedronGeometry args={[0.22, 0]} />
            <meshBasicMaterial color={b.color} transparent opacity={1} toneMapped={false} depthWrite={false} />
          </mesh>
        ))}
    </group>
  );
}

/** How far above a marker's own floating height its name reads, and how
 *  long a title can run before it has to be cut — a single compact line,
 *  not a wrapped paragraph, since this is a hint to walk closer for the
 *  real thing rather than the thing itself. */
const LABEL_MAX_CHARS = 26;

/** A name, floating above a marker, billboarded to face the camera.
 *
 * Reported directly: you could reach a marker, see the interact prompt at
 * the bottom of the screen, and only then find out it was Project Victus —
 * every diamond in the world looked the same from a distance whether it was
 * a flagship case study or a repository nobody would recognise by name.
 * NPCs already solved this with a name tag over their heads; markers never
 * got the same treatment. Same technique as NPC.tsx's own NameTag: a canvas
 * texture rather than drei's Text (no network font dependency), no depth
 * test so a building's own wall can never hide it, and no distance fade —
 * it is a real object at a fixed world size, so perspective alone makes it
 * legible up close and small at range, the same as everything else here. */
/** Inside this distance the label is fully invisible — the camera trailing
 *  the player can pass within a unit or two of a marker floating at its own
 *  fixed height (a WORK marker sits at y=5 regardless of the ground under
 *  it), and depthTest is off so nothing else in the scene can hide the
 *  label either. Together those meant a label that reads perfectly well
 *  from twenty units away filled the entire screen with a dark rectangle
 *  the one time the camera actually passed close by it. */
const LABEL_FADE_NEAR = 1.6;
const LABEL_FADE_FAR = 4.5;

function MarkerLabel({ it, color }: { it: Interactable; color: string }) {
  const ref = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const text =
    it.title.length > LABEL_MAX_CHARS ? `${it.title.slice(0, LABEL_MAX_CHARS - 1)}…` : it.title;

  const texture = useMemo(() => {
    const w = 640;
    const h = 108;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d")!;
    ctx.font = "600 40px ui-monospace, 'SFMono-Regular', Menlo, monospace";
    ctx.fillStyle = "rgba(10,8,4,0.62)";
    ctx.fillRect(0, 16, w, h - 32);
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, w / 2, h / 2 + 2);
    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    t.needsUpdate = true;
    return t;
  }, [text, color]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.quaternion.copy(state.camera.quaternion);
    const d = ref.current.position.distanceTo(state.camera.position);
    const t = (d - LABEL_FADE_NEAR) / (LABEL_FADE_FAR - LABEL_FADE_NEAR);
    if (matRef.current) matRef.current.opacity = Math.max(0, Math.min(1, t));
  });

  // A fixed offset above the marker's own resting height, not its live
  // bobbing position — the bob is +/-0.32 units, small enough that a label
  // riding a touch above it never looks detached from what it is labelling.
  return (
    <group ref={ref} position={[it.x, it.y + 1.05, it.z]} renderOrder={19}>
      <mesh renderOrder={19}>
        <planeGeometry args={[Math.min(4.4, 1.1 + text.length * 0.14), 0.42]} />
        <meshBasicMaterial
          ref={matRef}
          map={texture}
          transparent
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
          opacity={0}
        />
      </mesh>
    </group>
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

/** The kinds that get their own identity and the full flash-and-shatter
 *  reveal below, rather than the shared per-kind gem: the eleven case
 *  studies and the two employers are what the log actually counts by
 *  name, not one of forty-odd interchangeable repository coins. */
function isAchievement(kind: Interactable["kind"]): boolean {
  return kind === "PROJECT" || kind === "WORK";
}

/**
 * A shape per project, chosen from real data rather than a shared gem.
 *
 * `p.tag` is the case study's own authored category (FLAGSHIP, SAAS,
 * BLOCKCHAIN, MOBILE...), already written for the case-study cards — this
 * reuses it rather than inventing a new axis just to make markers look
 * different from each other. Every achievement used to render the exact
 * same orange octahedron; the eleven case studies and two employers were
 * indistinguishable from across the plaza and only readable one at a time,
 * on foot, by opening each in turn.
 */
const TAG_SHAPE: Record<string, () => THREE.BufferGeometry> = {
  // A taller spire, not just a bigger one — the runtime marker loop drives
  // every marker's scale uniformly (a pulse and an on-approach pop), so the
  // stretch has to live in the geometry's own vertices or that scale.
  // setScalar() would flatten it back to round on the very next frame.
  FLAGSHIP: () => new THREE.OctahedronGeometry(0.62, 0).scale(1, 1.55, 1),
  "MAJOR SYSTEM": () => new THREE.OctahedronGeometry(0.62, 0), // the baseline, unchanged
  "OPEN SOURCE": () => new THREE.DodecahedronGeometry(0.56, 0), // many small facets — many contributors
  SAAS: () => new THREE.CapsuleGeometry(0.32, 0.42, 4, 8), // a smooth, product-shaped pill
  "AI/ML": () => new THREE.IcosahedronGeometry(0.58, 0), // dense-faceted, "trained" look
  BLOCKCHAIN: () => new THREE.TorusGeometry(0.4, 0.15, 8, 16), // a literal link
  // A cube read as a plain box; rotated into a gem-cut diamond it reads as
  // one of this world's own markers. Baked in for the same reason as
  // FLAGSHIP's stretch — the per-frame y-spin would otherwise fight a
  // rotation set through props.
  MOBILE: () => new THREE.BoxGeometry(0.62, 0.62, 0.62).rotateX(Math.PI / 4).rotateZ(Math.PI / 4),
  FEATURED: () => new THREE.ConeGeometry(0.5, 0.9, 8), // a small trophy spike
};
const DEFAULT_SHAPE = () => new THREE.OctahedronGeometry(0.62, 0);

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

  /** Every case study and job's own shape and colour: shape from its
   *  authored `tag`, colour from the language of the repository it stands
   *  over (or TypeScript's, for the two employers with no repository of
   *  their own — the ecosystem both were actually built in). Built once
   *  from INTERACTABLES, which is a module-level constant. */
  const achievementVisual = useMemo(() => {
    const langMaterial = new Map<string, THREE.MeshStandardMaterial>();
    const materialFor = (language: string) => {
      let m = langMaterial.get(language);
      if (!m) {
        const color = styleFor(language).emissive;
        m = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.1, roughness: 0.3 });
        langMaterial.set(language, m);
      }
      return m;
    };
    const out = new Map<string, { geometry: THREE.BufferGeometry; material: THREE.MeshStandardMaterial; color: string }>();
    for (const it of INTERACTABLES) {
      if (it.kind !== "PROJECT" && it.kind !== "WORK") continue;
      const tag = it.project?.tag ?? "";
      const geometry = (TAG_SHAPE[tag] ?? DEFAULT_SHAPE)();
      const language = it.entity?.language ?? "TypeScript";
      out.set(it.id, { geometry, material: materialFor(language), color: styleFor(language).emissive });
    }
    return out;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const now = performance.now();
    const g = group.current;
    if (!g) return;
    for (const child of g.children) {
      const kind = child.userData.kind as string;
      const id = child.userData.id as string;
      const base = child.userData.baseY as number;
      const active = id === activeId;
      child.rotation.y = t * (active ? 1.5 : 0.6);
      child.position.y = base + Math.sin(t * 1.6 + child.userData.phase) * 0.32 + (active ? 0.6 : 0);
      let s = (KIND_SCALE[kind as Interactable["kind"]] ?? 1) * (active ? 1.45 : 1);
      const m = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
      let intensity = seen.has(id) ? 0.35 : active ? 1.9 : 1.1;

      // The flash: a sword drawn and held up for a third of a second, the
      // instant a case study or job is first opened, before it settles to
      // the ordinary "already found" glow.
      const flashEnd = flashUntil.current.get(id);
      if (flashEnd !== undefined) {
        const remaining = flashEnd - now;
        if (remaining > 0) {
          const k = remaining / FLASH_MS;
          intensity = 1.1 + k * 3.2;
          s *= 1 + k * 0.7;
        } else {
          flashUntil.current.delete(id);
        }
      }

      child.scale.setScalar(s);
      m.emissiveIntensity = intensity;
    }
  });

  /* A coin, badge or star picked up plays a stinger and a brief expanding
     ring at the spot it was standing — the moment "visited" happens, not
     just the fact that it eventually did. A case study or job gets more: a
     flash on the marker itself and a shower of coloured shards, because
     those are the achievements the log counts by name, not one of
     forty-odd interchangeable repository coins. */
  const [bursts, setBursts] = useState<BurstData[]>([]);
  const prevVisited = useRef<Set<string>>(new Set());
  const flashUntil = useRef(new Map<string, number>());

  useEffect(() => {
    const now = performance.now();
    const fresh: BurstData[] = [];
    let anyMajor = false;
    for (const id of visited) {
      if (prevVisited.current.has(id)) continue;
      const it = INTERACTABLES.find((x) => x.id === id);
      if (!it) continue;
      const major = isAchievement(it.kind);
      if (major) {
        anyMajor = true;
        flashUntil.current.set(id, now + FLASH_MS);
      }
      const color = achievementVisual.get(id)?.color ?? "#ffd35c";
      fresh.push({
        id,
        x: it.x,
        y: it.y,
        z: it.z,
        born: now,
        major,
        color,
        shards: major ? makeShards() : [],
      });
    }
    prevVisited.current = new Set(visited);
    if (fresh.length) {
      if (anyMajor) revealSfx();
      if (fresh.some((b) => !b.major)) collectSfx();
      setBursts((b) => [...b, ...fresh]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visited, achievementVisual]);

  const finishBurst = (id: string) => {
    setBursts((b) => b.filter((x) => x.id !== id));
  };

  return (
    <>
      <group ref={group}>
        {INTERACTABLES.filter((it) => it.kind !== "NPC").map((it, i) => {
          const own = achievementVisual.get(it.id);
          return (
            <mesh
              key={it.id}
              geometry={own?.geometry ?? geoByKind[it.kind]}
              material={own?.material ?? materials[it.kind]}
              position={[it.x, it.y, it.z]}
              userData={{ kind: it.kind, id: it.id, baseY: it.y, phase: i * 1.7 }}
            />
          );
        })}
      </group>

      {/* Names, for everything worth naming from a distance — every kind
          except the forty-odd plain repository coins (still texture, not a
          quest list) and NPCs (a person is their own name tag already,
          drawn in NPC.tsx). */}
      {INTERACTABLES.filter((it) => it.kind !== "REPO" && it.kind !== "NPC").map((it) => (
        <MarkerLabel
          key={it.id}
          it={it}
          color={achievementVisual.get(it.id)?.color ?? KIND_COLOR[it.kind]}
        />
      ))}

      {bursts.map((b) => (
        <Burst key={b.id} b={b} onDone={finishBurst} />
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
