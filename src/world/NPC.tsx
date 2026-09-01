"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { INTERACTABLES } from "./interactables";
import { contributors, aiTools } from "@/data/contributors";

/**
 * The rest of the team.
 *
 * The world was Gaurav's own commit record and nothing else — accurate, but
 * it read as a place one person built entirely alone, which digibranders'
 * own history says is not true. This is the layer that puts everyone else
 * in it: the real people who committed alongside him, walking their home
 * district rather than standing on it, and the two AI tools with a real,
 * measurable hand in the record — Claude as the crab the player asked for
 * by name, Jules (Google's own coding agent, found in the data, not
 * invented) as something that reads as clearly not-a-crab beside it.
 *
 * Same box-built, stylised construction as Avatar.tsx, deliberately not
 * photoreal — nobody here consented to appearing as a likeness, only their
 * name and login are real. A shared skin tone rather than a guessed one:
 * there is zero information about what any of these people actually look
 * like, and inventing an appearance would be worse than a plain one.
 */

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

const SKIN = "#c98a5e";
const TROUSER = "#2b3440";
const SHOE = "#12171a";
const HAIR = "#17120f";

/** A small palette of jacket/accent pairs, distinct from the player's own
 *  teal (#2fa89a) so an NPC is never mistaken for the avatar at a glance. */
const PALETTE: [jacket: string, jacketDark: string, accent: string][] = [
  ["#7a4fd1", "#5c39a3", "#c9a6ff"],
  ["#d1704f", "#a3543c", "#ffb08c"],
  ["#4f9bd1", "#3a76a3", "#a6d9ff"],
  ["#c9a53a", "#9c7f2b", "#ffe08c"],
  ["#4fb87a", "#3a8f5c", "#a6f0c2"],
  ["#c9507a", "#9c3c5e", "#ff9cbb"],
];

/** A name tag, billboarded to face the camera. Canvas texture, same reason
 *  Markers.tsx gives for not using drei's Text: no network font dependency. */
function NameTag({ text, color }: { text: string; color: string }) {
  const ref = useRef<THREE.Group>(null);
  const texture = useMemo(() => {
    const w = 512;
    const h = 96;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d")!;
    ctx.font = "600 46px ui-monospace, 'SFMono-Regular', Menlo, monospace";
    ctx.fillStyle = "rgba(10,8,4,0.55)";
    ctx.fillRect(0, 14, w, h - 28);
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
    ref.current?.quaternion.copy(state.camera.quaternion);
  });

  return (
    <group ref={ref} position={[0, 1.62, 0]}>
      <mesh>
        <planeGeometry args={[1.7, 0.32]} />
        <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Two waypoints inside a disk, deterministic from a seed — the same short
 *  patrol loop every reload, so a person's spot in the world is stable. */
function wanderPoints(seed: string, cx: number, cz: number, radius: number) {
  const a1 = hash(seed) * Math.PI * 2;
  const a2 = hash(seed + "§") * Math.PI * 2;
  const r1 = radius * (0.3 + hash(seed + "#r1") * 0.6);
  const r2 = radius * (0.3 + hash(seed + "#r2") * 0.6);
  return [
    new THREE.Vector3(cx + Math.sin(a1) * r1, 0, cz + Math.cos(a1) * r1),
    new THREE.Vector3(cx + Math.sin(a2) * r2, 0, cz + Math.cos(a2) * r2),
  ] as const;
}

function HumanNPC({ id, seed }: { id: string; seed: string }) {
  const it = useMemo(() => INTERACTABLES.find((x) => x.id === id), [id]);
  const [jacket, jacketDark, accent] = PALETTE[Math.floor(hash(seed) * PALETTE.length)];

  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const phase = useRef(hash(seed) * 10);
  const leg = useRef(0); // 0 or 1: which waypoint is the current target
  const pause = useRef(0); // seconds remaining at the current waypoint

  // Two waypoints around the interactable's own starting spot, which was
  // already placed inside the person's home district in interactables.ts.
  const points = useMemo(() => (it ? wanderPoints(seed, it.x, it.z, 14) : null), [it, seed]);

  useFrame((_, rawDelta) => {
    if (!root.current || !it || !points) return;
    const dt = Math.min(0.05, rawDelta);

    const target = points[leg.current];
    const cur = root.current.position;
    const dx = target.x - cur.x;
    const dz = target.z - cur.z;
    const dist = Math.hypot(dx, dz);

    let speed01 = 0;
    if (pause.current > 0) {
      pause.current -= dt;
    } else if (dist < 0.4) {
      leg.current = leg.current === 0 ? 1 : 0;
      pause.current = 1.2 + hash(seed + String(leg.current)) * 1.8;
    } else {
      const spd = 1.1;
      const step = Math.min(dist, spd * dt);
      cur.x += (dx / dist) * step;
      cur.z += (dz / dist) * step;
      root.current.rotation.y = Math.atan2(dx, dz);
      speed01 = 1;
    }

    // Write the live position back into the shared interactable object, so
    // the proximity/interact system (and the minimap) track where this NPC
    // actually is, not where it started.
    it.x = cur.x;
    it.z = cur.z;

    phase.current += speed01 * dt * 3.2;
    const swing = Math.sin(phase.current) * 0.5 * speed01;
    if (legL.current) legL.current.rotation.x = swing;
    if (legR.current) legR.current.rotation.x = -swing;
    if (body.current) {
      body.current.position.y = Math.abs(Math.sin(phase.current * 2)) * 0.05 * speed01;
    }
  });

  if (!it || !it.contributor) return null;
  const h = 1.62; // a hair under the player's own 1.7 — this is not the player

  return (
    <group ref={root} position={[it.x, 0, it.z]}>
      <group ref={body}>
        <mesh position={[0, h * 0.62, 0]} castShadow>
          <boxGeometry args={[0.48, h * 0.34, 0.28]} />
          <meshStandardMaterial color={jacket} roughness={0.72} />
        </mesh>
        <mesh position={[0, h * 0.9, 0]} castShadow>
          <boxGeometry args={[0.28, 0.3, 0.27]} />
          <meshStandardMaterial color={SKIN} roughness={0.85} />
        </mesh>
        <mesh position={[0, h * 0.985, -0.01]}>
          <boxGeometry args={[0.305, 0.14, 0.285]} />
          <meshStandardMaterial color={HAIR} roughness={0.95} />
        </mesh>
        <mesh position={[0, h * 0.64, 0.145]}>
          <boxGeometry args={[0.12, 0.12, 0.02]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} roughness={0.4} />
        </mesh>
        <mesh position={[-0.3, h * 0.7, 0]} castShadow>
          <boxGeometry args={[0.13, h * 0.3, 0.14]} />
          <meshStandardMaterial color={jacketDark} roughness={0.75} />
        </mesh>
        <mesh position={[0.3, h * 0.7, 0]} castShadow>
          <boxGeometry args={[0.13, h * 0.3, 0.14]} />
          <meshStandardMaterial color={jacketDark} roughness={0.75} />
        </mesh>
      </group>

      <group ref={legL} position={[-0.13, h * 0.45, 0]}>
        <mesh position={[0, -h * 0.22, 0]} castShadow>
          <boxGeometry args={[0.17, h * 0.44, 0.18]} />
          <meshStandardMaterial color={TROUSER} roughness={0.8} />
        </mesh>
        <mesh position={[0, -h * 0.45, 0.03]}>
          <boxGeometry args={[0.18, 0.1, 0.25]} />
          <meshStandardMaterial color={SHOE} roughness={0.7} />
        </mesh>
      </group>
      <group ref={legR} position={[0.13, h * 0.45, 0]}>
        <mesh position={[0, -h * 0.22, 0]} castShadow>
          <boxGeometry args={[0.17, h * 0.44, 0.18]} />
          <meshStandardMaterial color={TROUSER} roughness={0.8} />
        </mesh>
        <mesh position={[0, -h * 0.45, 0.03]}>
          <boxGeometry args={[0.18, 0.1, 0.25]} />
          <meshStandardMaterial color={SHOE} roughness={0.7} />
        </mesh>
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.46, 18]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.3} depthWrite={false} />
      </mesh>

      <NameTag text={it.title} color={accent} />
    </group>
  );
}

const CRAB_SHELL = "#d9622f";
const CRAB_SHELL_DARK = "#a8431d";
const CRAB_CLAW = "#f2864a";

/** Claude, as a crab — the player's own idea. Scuttles a short loop near the
 *  core rather than standing in one district: it touched code across the
 *  record, not one ecosystem. */
function Crab({ id }: { id: string }) {
  const it = useMemo(() => INTERACTABLES.find((x) => x.id === id), [id]);
  const root = useRef<THREE.Group>(null);
  const clawL = useRef<THREE.Group>(null);
  const clawR = useRef<THREE.Group>(null);
  const t0 = useRef(Math.random() * 10);

  const points = useMemo(() => (it ? wanderPoints("claude-crab", it.x, it.z, 9) : null), [it]);
  const leg = useRef(0);
  const pause = useRef(0);

  useFrame((state, rawDelta) => {
    if (!root.current || !it || !points) return;
    const dt = Math.min(0.05, rawDelta);
    const t = state.clock.elapsedTime + t0.current;

    const target = points[leg.current];
    const cur = root.current.position;
    const dx = target.x - cur.x;
    const dz = target.z - cur.z;
    const dist = Math.hypot(dx, dz);
    let moving = false;
    if (pause.current > 0) {
      pause.current -= dt;
    } else if (dist < 0.3) {
      leg.current = leg.current === 0 ? 1 : 0;
      pause.current = 1.5 + hash(String(leg.current) + t) * 1.5;
    } else {
      const step = Math.min(dist, 0.7 * dt);
      // Crabs walk sideways: face perpendicular to the direction of travel.
      cur.x += (dx / dist) * step;
      cur.z += (dz / dist) * step;
      root.current.rotation.y = Math.atan2(dx, dz) + Math.PI / 2;
      moving = true;
    }
    it.x = cur.x;
    it.z = cur.z;

    root.current.position.y = Math.abs(Math.sin(t * 6)) * 0.05 * (moving ? 1 : 0.3);
    const pinch = Math.sin(t * 3) * 0.25;
    if (clawL.current) clawL.current.rotation.z = 0.5 + pinch;
    if (clawR.current) clawR.current.rotation.z = -0.5 - pinch;
  });

  if (!it) return null;

  return (
    <group ref={root} position={[it.x, 0, it.z]}>
      <mesh position={[0, 0.22, 0]} scale={[1, 0.55, 0.8]} castShadow>
        <sphereGeometry args={[0.38, 16, 12]} />
        <meshStandardMaterial color={CRAB_SHELL} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.24, 0]} scale={[0.94, 0.4, 0.72]}>
        <sphereGeometry args={[0.38, 16, 12]} />
        <meshStandardMaterial color={CRAB_SHELL_DARK} roughness={0.6} />
      </mesh>
      {/* Eye stalks. */}
      {[-0.14, 0.14].map((ox) => (
        <group key={ox} position={[ox, 0.4, 0.28]}>
          <mesh>
            <cylinderGeometry args={[0.025, 0.025, 0.14, 6]} />
            <meshStandardMaterial color={CRAB_SHELL_DARK} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.09, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#1a1006" roughness={0.3} />
          </mesh>
        </group>
      ))}
      {/* Claws. */}
      <group ref={clawL} position={[-0.36, 0.24, 0.12]}>
        <mesh castShadow>
          <boxGeometry args={[0.22, 0.13, 0.16]} />
          <meshStandardMaterial color={CRAB_CLAW} roughness={0.5} />
        </mesh>
      </group>
      <group ref={clawR} position={[0.36, 0.24, 0.12]}>
        <mesh castShadow>
          <boxGeometry args={[0.22, 0.13, 0.16]} />
          <meshStandardMaterial color={CRAB_CLAW} roughness={0.5} />
        </mesh>
      </group>
      {/* Legs, three a side. */}
      {[-1, 1].map((side) =>
        [-0.12, 0, 0.12].map((oz) => (
          <mesh
            key={`${side}-${oz}`}
            position={[side * 0.3, 0.1, oz]}
            rotation={[0, 0, side * 0.6]}
            castShadow
          >
            <cylinderGeometry args={[0.018, 0.018, 0.24, 5]} />
            <meshStandardMaterial color={CRAB_SHELL_DARK} roughness={0.7} />
          </mesh>
        )),
      )}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.42, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.28} depthWrite={false} />
      </mesh>
      <NameTag text="Claude" color="#ffb08c" />
    </group>
  );
}

const JULES_BODY = "#e8eef2";
const JULES_RING = "#4285f4"; // Google blue — the four brand colours, not invented.
const JULES_RING2 = "#ea4335";
const JULES_RING3 = "#fbbc05";
const JULES_RING4 = "#34a853";

/** Jules — Google's own coding agent, found as a real, substantial
 *  contributor in the commit data. Deliberately not a second crab: it
 *  hovers rather than walks, so the two AI collaborators never read as the
 *  same character from a distance. */
function JulesBot({ id }: { id: string }) {
  const it = useMemo(() => INTERACTABLES.find((x) => x.id === id), [id]);
  const root = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Group>(null);
  const home = useRef<[number, number] | null>(null);
  const t0 = useRef(Math.random() * 10);

  useFrame((state, rawDelta) => {
    if (!root.current || !it) return;
    if (!home.current) home.current = [it.x, it.z];
    const dt = Math.min(0.05, rawDelta);
    const t = state.clock.elapsedTime + t0.current;
    void dt;

    // A slow circular drift around its home point, plus a bob — hovering,
    // never touching the ground.
    const [hx, hz] = home.current;
    const orbit = 3.5;
    const cur = root.current.position;
    cur.x = hx + Math.sin(t * 0.35) * orbit;
    cur.z = hz + Math.cos(t * 0.35) * orbit;
    cur.y = 1.1 + Math.sin(t * 1.4) * 0.12;
    root.current.rotation.y = t * 0.4;

    it.x = cur.x;
    it.z = cur.z;

    if (ring.current) ring.current.rotation.z = t * 1.6;
  });

  if (!it) return null;

  return (
    <group ref={root} position={[it.x, 1.1, it.z]}>
      <mesh castShadow>
        <sphereGeometry args={[0.24, 20, 16]} />
        <meshStandardMaterial color={JULES_BODY} roughness={0.3} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0, 0.2]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#1a1d21" roughness={0.2} />
      </mesh>
      {/* The four-colour ring — Google's own brand colours, quartered. */}
      <group ref={ring} rotation={[Math.PI / 2, 0, 0]}>
        {[JULES_RING, JULES_RING2, JULES_RING3, JULES_RING4].map((color, i) => (
          <mesh key={color} rotation={[0, 0, (i / 4) * Math.PI * 2]}>
            <torusGeometry args={[0.36, 0.025, 8, 10, (Math.PI * 2) / 4 - 0.08]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.4} />
          </mesh>
        ))}
      </group>
      <NameTag text="Jules" color="#8ab4f8" />
    </group>
  );
}

export function NPCs() {
  return (
    <>
      {contributors.map((c) => (
        <HumanNPC key={c.login ?? c.name} id={`npc:${c.login ?? c.name}`} seed={c.login ?? c.name} />
      ))}
      {aiTools.map((a) =>
        a.tool === "Claude" ? (
          <Crab key={a.tool} id={`ai:${a.tool}`} />
        ) : (
          <JulesBot key={a.tool} id={`ai:${a.tool}`} />
        ),
      )}
    </>
  );
}
