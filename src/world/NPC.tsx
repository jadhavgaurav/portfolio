"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { INTERACTABLES } from "./interactables";
import type { PlayerState } from "./Player";
import { contributors, aiTools, greetingLine, aiGreetingLine } from "@/data/contributors";

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
 *
 * The meetup: walk close enough and whoever it is stops, turns, and
 * greets you with a real fact — the repos you actually both have commits
 * on, drawn from the same ledger the buildings are, never invented for
 * the one collaborator who doesn't have one.
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

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** The meetup bubble — what shows above someone's head once they notice
 *  you. Opacity and scale are driven imperatively from the parent's own
 *  useFrame via the `visible` ref (0..1), not React state, so a greeting
 *  never costs a re-render — the same reasoning as everything else in this
 *  file that animates every frame. */
function GreetBubble({
  text,
  accent,
  visible,
}: {
  text: string;
  accent: string;
  visible: React.MutableRefObject<number>;
}) {
  const ref = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const W = 640;
  const H = 220;

  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d")!;
    ctx.font = "500 32px ui-monospace, 'SFMono-Regular', Menlo, monospace";
    const lines = wrapText(ctx, text, W - 80).slice(0, 3);
    const lineH = 42;
    const pad = 28;
    const boxH = lines.length * lineH + pad * 2;
    const boxY = (H - boxH) / 2;
    ctx.fillStyle = "rgba(10,8,4,0.85)";
    ctx.fillRect(24, boxY, W - 48, boxH);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(24, boxY, W - 48, boxH);
    ctx.fillStyle = "#f3e9d2";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    lines.forEach((l, i) => {
      ctx.fillText(l, W / 2, boxY + pad + lineH * i + lineH / 2 - 4);
    });
    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    t.needsUpdate = true;
    return t;
  }, [text, accent]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.quaternion.copy(state.camera.quaternion);
    const v = visible.current;
    ref.current.visible = v > 0.01;
    ref.current.scale.setScalar(0.75 + v * 0.25);
    if (matRef.current) matRef.current.opacity = v;
  });

  return (
    <group ref={ref} position={[0, 2.12, 0]} visible={false}>
      <mesh>
        <planeGeometry args={[2.3, (2.3 * H) / W]} />
        <meshBasicMaterial
          ref={matRef}
          map={texture}
          transparent
          depthWrite={false}
          toneMapped={false}
          opacity={0}
        />
      </mesh>
    </group>
  );
}

/** How close is "noticed", how long the greeting holds, and the shape of
 *  its fade — shared by every NPC kind so a meetup always feels the same
 *  length regardless of who or what it is. */
const GREET_RADIUS = 7.5;
const GREET_DURATION = 4.5;
const GREET_FADE_IN = 0.35;
const GREET_FADE_OUT = 0.7;

interface GreetState {
  greeting: React.MutableRefObject<boolean>;
  greetT: React.MutableRefObject<number>;
  wasNear: React.MutableRefObject<boolean>;
  opacity: React.MutableRefObject<number>;
}

function useGreetState(): GreetState {
  return {
    greeting: useRef(false),
    greetT: useRef(0),
    wasNear: useRef(false),
    opacity: useRef(0),
  };
}

/** Edge-triggered: a greeting starts the moment the player crosses into
 *  range, runs for a fixed duration, and won't fire again until the player
 *  leaves and comes back — so lingering nearby doesn't replay it on a loop. */
function tickGreet(g: GreetState, dt: number, dist: number) {
  const near = dist < GREET_RADIUS;
  if (near && !g.wasNear.current) {
    g.greeting.current = true;
    g.greetT.current = 0;
  }
  g.wasNear.current = near;
  if (g.greeting.current) {
    g.greetT.current += dt;
    if (g.greetT.current > GREET_DURATION || !near) g.greeting.current = false;
  }
  const t = g.greetT.current;
  g.opacity.current = !g.greeting.current
    ? 0
    : t < GREET_FADE_IN
      ? t / GREET_FADE_IN
      : t > GREET_DURATION - GREET_FADE_OUT
        ? Math.max(0, (GREET_DURATION - t) / GREET_FADE_OUT)
        : 1;
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

function HumanNPC({
  id,
  seed,
  playerState,
}: {
  id: string;
  seed: string;
  playerState: React.MutableRefObject<PlayerState>;
}) {
  const it = useMemo(() => INTERACTABLES.find((x) => x.id === id), [id]);
  const [jacket, jacketDark, accent] = PALETTE[Math.floor(hash(seed) * PALETTE.length)];
  const greetText = it?.contributor ? greetingLine(it.contributor) : "";

  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const phase = useRef(hash(seed) * 10);
  const leg = useRef(0); // 0 or 1: which waypoint is the current target
  const pause = useRef(0); // seconds remaining at the current waypoint
  const greet = useGreetState();

  // Two waypoints around the interactable's own starting spot, which was
  // already placed inside the person's home district in interactables.ts.
  const points = useMemo(() => (it ? wanderPoints(seed, it.x, it.z, 14) : null), [it, seed]);

  useFrame((state, rawDelta) => {
    if (!root.current || !it || !points) return;
    const dt = Math.min(0.05, rawDelta);
    const cur = root.current.position;

    const pp = playerState.current.position;
    const distToPlayer = Math.hypot(pp.x - cur.x, pp.z - cur.z);
    tickGreet(greet, dt, distToPlayer);

    let speed01 = 0;
    if (greet.greeting.current) {
      // Stopped, facing whoever just walked up.
      const dx = pp.x - cur.x;
      const dz = pp.z - cur.z;
      if (Math.hypot(dx, dz) > 0.1) root.current.rotation.y = Math.atan2(dx, dz);
    } else {
      const target = points[leg.current];
      const dx = target.x - cur.x;
      const dz = target.z - cur.z;
      const dist = Math.hypot(dx, dz);
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
    }

    // Write the live position back into the shared interactable object, so
    // the proximity/interact system (and the minimap) track where this NPC
    // actually is, not where it started.
    it.x = cur.x;
    it.z = cur.z;

    phase.current += speed01 * dt * 3.2;
    const swing = Math.sin(phase.current) * 0.5 * speed01;
    if (legL.current) legL.current.rotation.x = greet.greeting.current ? 0 : swing;
    if (legR.current) legR.current.rotation.x = greet.greeting.current ? 0 : -swing;
    if (body.current) {
      body.current.position.y = greet.greeting.current
        ? 0
        : Math.abs(Math.sin(phase.current * 2)) * 0.05 * speed01;
    }
    if (armR.current) {
      if (greet.greeting.current) {
        // A raised, waving arm — reads as a greeting from any angle once
        // the figure has already turned to face the player.
        armR.current.rotation.x = -2.5;
        armR.current.rotation.z = 0.35 + Math.sin(state.clock.elapsedTime * 9) * 0.35;
      } else {
        armR.current.rotation.x = 0;
        armR.current.rotation.z = 0;
      }
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
        {/* Left arm — always hangs. */}
        <group position={[-0.3, h * 0.85, 0]}>
          <mesh position={[0, -h * 0.15, 0]} castShadow>
            <boxGeometry args={[0.13, h * 0.3, 0.14]} />
            <meshStandardMaterial color={jacketDark} roughness={0.75} />
          </mesh>
        </group>
        {/* Right arm — the one that waves. */}
        <group ref={armR} position={[0.3, h * 0.85, 0]}>
          <mesh position={[0, -h * 0.15, 0]} castShadow>
            <boxGeometry args={[0.13, h * 0.3, 0.14]} />
            <meshStandardMaterial color={jacketDark} roughness={0.75} />
          </mesh>
        </group>
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
      <GreetBubble text={greetText} accent={accent} visible={greet.opacity} />
    </group>
  );
}

const CRAB_SHELL = "#d9622f";
const CRAB_SHELL_DARK = "#a8431d";
const CRAB_CLAW = "#f2864a";

/** Claude, as a crab — the player's own idea. Scuttles a short loop near the
 *  core rather than standing in one district: it touched code across the
 *  record, not one ecosystem. */
function Crab({ id, playerState }: { id: string; playerState: React.MutableRefObject<PlayerState> }) {
  const it = useMemo(() => INTERACTABLES.find((x) => x.id === id), [id]);
  const greetText = useMemo(() => {
    const a = aiTools.find((x) => x.tool === "Claude");
    return a ? aiGreetingLine(a) : "";
  }, []);
  const root = useRef<THREE.Group>(null);
  const clawL = useRef<THREE.Group>(null);
  const clawR = useRef<THREE.Group>(null);
  const t0 = useRef(Math.random() * 10);
  const greet = useGreetState();

  const points = useMemo(() => (it ? wanderPoints("claude-crab", it.x, it.z, 9) : null), [it]);
  const leg = useRef(0);
  const pause = useRef(0);

  useFrame((state, rawDelta) => {
    if (!root.current || !it || !points) return;
    const dt = Math.min(0.05, rawDelta);
    const t = state.clock.elapsedTime + t0.current;
    const cur = root.current.position;

    const pp = playerState.current.position;
    const distToPlayer = Math.hypot(pp.x - cur.x, pp.z - cur.z);
    tickGreet(greet, dt, distToPlayer);

    let moving = false;
    if (greet.greeting.current) {
      const dx = pp.x - cur.x;
      const dz = pp.z - cur.z;
      if (Math.hypot(dx, dz) > 0.1) root.current.rotation.y = Math.atan2(dx, dz) + Math.PI / 2;
    } else {
      const target = points[leg.current];
      const dx = target.x - cur.x;
      const dz = target.z - cur.z;
      const dist = Math.hypot(dx, dz);
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
    }
    it.x = cur.x;
    it.z = cur.z;

    root.current.position.y = Math.abs(Math.sin(t * 6)) * 0.05 * (moving ? 1 : 0.3);
    if (greet.greeting.current) {
      // Both claws thrown up and waved — the crab's version of a wave.
      const wave = Math.sin(t * 7) * 0.3;
      if (clawL.current) clawL.current.rotation.z = 1.5 + wave;
      if (clawR.current) clawR.current.rotation.z = -1.5 - wave;
    } else {
      const pinch = Math.sin(t * 3) * 0.25;
      if (clawL.current) clawL.current.rotation.z = 0.5 + pinch;
      if (clawR.current) clawR.current.rotation.z = -0.5 - pinch;
    }
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
      <GreetBubble text={greetText} accent="#ffb08c" visible={greet.opacity} />
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
function JulesBot({ id, playerState }: { id: string; playerState: React.MutableRefObject<PlayerState> }) {
  const it = useMemo(() => INTERACTABLES.find((x) => x.id === id), [id]);
  const greetText = useMemo(() => {
    const a = aiTools.find((x) => x.tool === "Jules");
    return a ? aiGreetingLine(a) : "";
  }, []);
  const root = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Group>(null);
  const home = useRef<[number, number] | null>(null);
  const t0 = useRef(Math.random() * 10);
  const greet = useGreetState();

  useFrame((state, rawDelta) => {
    if (!root.current || !it) return;
    if (!home.current) home.current = [it.x, it.z];
    const dt = Math.min(0.05, rawDelta);
    const t = state.clock.elapsedTime + t0.current;

    const [hx, hz] = home.current;
    const cur = root.current.position;

    const pp = playerState.current.position;
    const distToPlayer = Math.hypot(pp.x - cur.x, pp.z - cur.z);
    tickGreet(greet, dt, distToPlayer);

    if (greet.greeting.current) {
      // Holds still and faces the player rather than drifting — the fixed
      // attention reads as "noticing you" for something with no face.
      const dx = pp.x - cur.x;
      const dz = pp.z - cur.z;
      if (Math.hypot(dx, dz) > 0.1) root.current.rotation.y = Math.atan2(dx, dz);
      cur.y = 1.1 + Math.sin(t * 3) * 0.06;
    } else {
      // A slow circular drift around its home point, plus a bob — hovering,
      // never touching the ground.
      const orbit = 3.5;
      cur.x = hx + Math.sin(t * 0.35) * orbit;
      cur.z = hz + Math.cos(t * 0.35) * orbit;
      cur.y = 1.1 + Math.sin(t * 1.4) * 0.12;
      root.current.rotation.y = t * 0.4;
    }

    it.x = cur.x;
    it.z = cur.z;

    if (ring.current) ring.current.rotation.z = t * (greet.greeting.current ? 4.5 : 1.6);
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
      <GreetBubble text={greetText} accent="#8ab4f8" visible={greet.opacity} />
    </group>
  );
}

export function NPCs({ playerState }: { playerState: React.MutableRefObject<PlayerState> }) {
  return (
    <>
      {contributors.map((c) => (
        <HumanNPC
          key={c.login ?? c.name}
          id={`npc:${c.login ?? c.name}`}
          seed={c.login ?? c.name}
          playerState={playerState}
        />
      ))}
      {aiTools.map((a) =>
        a.tool === "Claude" ? (
          <Crab key={a.tool} id={`ai:${a.tool}`} playerState={playerState} />
        ) : (
          <JulesBot key={a.tool} id={`ai:${a.tool}`} playerState={playerState} />
        ),
      )}
    </>
  );
}
