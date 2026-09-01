"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { INTERACTABLES } from "./interactables";
import type { PlayerState } from "./Player";
import { contributors, aiTools, greetingLine, aiGreetingLine } from "@/data/contributors";
import * as audio from "@/audio/engine";

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
/** `anchorY` is how far above this NPC's own local origin its head or top
 *  actually sits. It used to be a bare constant (1.98) baked into this
 *  component — correct for the ~1.7-tall human figure it was written
 *  against, and silently wrong for anyone shorter: Jules is a sphere
 *  centred 1.1 units up with a radius of 0.24, and the crab's shell tops
 *  out under 0.6, so both were getting their name tag rendered a metre or
 *  more above their own body, floating with nothing under it. */
function NameTag({
  text,
  color,
  anchorY,
}: {
  text: string;
  color: string;
  anchorY: number;
}) {
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
    /* Drawn without a depth test, clear of whatever it is labelling. It used
       to sit at a fixed y=1.62 — exactly the human figure's own height — so
       the head it was meant to label was drawn straight through it and the
       name was invisible from every angle except side-on. */
    <group ref={ref} position={[0, anchorY, 0]} renderOrder={19}>
      <mesh renderOrder={19}>
        <planeGeometry args={[1.7, 0.32]} />
        <meshBasicMaterial
          map={texture}
          transparent
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
        />
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

/** A rounded rectangle path. `CanvasRenderingContext2D.roundRect` only
 *  landed in Safari 16.4, and this runs inside a useMemo during render —
 *  a throw here would take the whole scene down rather than degrade one
 *  bubble's corners, so the arc fallback is not optional. */
function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  const rad = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
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
  anchorY,
}: {
  text: string;
  accent: string;
  visible: React.MutableRefObject<number>;
  /** How far above this NPC's own local origin the bubble's tail should
   *  sit — see the note on NameTag's `anchorY`. */
  anchorY: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  /* The panel is measured before it is drawn, so the canvas is exactly as
     tall as the text in it. The old one was a fixed 640x220 whatever it
     held: a one-line greeting rendered as a small caption adrift in a
     mostly-empty plane, with its tail pointing at nothing, and the whole
     thing was anchored by its centre so its height changed where it sat.
     Now it is anchored by the tip of its tail, which is pinned just above
     the speaker's head, and it grows upward from there. */
  const bubble = useMemo(() => {
    const FONT = "500 52px ui-monospace, 'SFMono-Regular', Menlo, monospace";
    const W = 1024;
    const LINE_H = 66;
    const PAD_X = 32;
    const PAD_Y = 40;
    const TAIL = 26;
    /** Room for the drop shadow to fall inside the texture. */
    const MARGIN = 20;
    /** World-space width of the plane. The old 2.3 put a three-line
     *  paragraph at about the height of a doorframe seen across a street. */
    const PLANE_W = 3.4;

    const measure = document.createElement("canvas").getContext("2d");
    if (!measure) throw new Error("GreetBubble: 2D canvas context unavailable");
    measure.font = FONT;
    const lines = wrapText(measure, text, W - PAD_X * 2 - 76).slice(0, 3);

    const boxW = W - PAD_X * 2;
    const boxH = lines.length * LINE_H + PAD_Y * 2;
    const H = Math.ceil(MARGIN * 2 + boxH + TAIL * 1.4);

    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d");
    if (!ctx) throw new Error("GreetBubble: 2D canvas context unavailable");
    ctx.font = FONT;

    const boxX = PAD_X;
    const boxY = MARGIN;

    /* A drop shadow under the whole bubble. Without it the panel sat flat
       against whatever was behind it, and against a bright sky or a sunlit
       wall the dark fill lost its edge entirely. */
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowBlur = 26;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = "rgba(12,9,5,0.94)";
    roundRectPath(ctx, boxX, boxY, boxW, boxH, 18);
    ctx.fill();
    // The tail, pointing down at whoever is speaking.
    ctx.beginPath();
    ctx.moveTo(W / 2 - TAIL, boxY + boxH - 1);
    ctx.lineTo(W / 2 + TAIL, boxY + boxH - 1);
    ctx.lineTo(W / 2, boxY + boxH + TAIL * 1.4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    roundRectPath(ctx, boxX, boxY, boxW, boxH, 18);
    ctx.stroke();

    ctx.fillStyle = "#fbf4e2";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    lines.forEach((l, i) => {
      ctx.fillText(l, W / 2, boxY + PAD_Y + LINE_H * i + LINE_H / 2 - 4);
    });

    const texture = new THREE.CanvasTexture(c);
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    return { texture, planeW: PLANE_W, planeH: (PLANE_W * H) / W };
  }, [text, accent]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.quaternion.copy(state.camera.quaternion);
    const v = visible.current;
    ref.current.visible = v > 0.01;
    // Scaled about the tail tip, so it pops up out of the speaker's head
    // rather than swelling around its own middle.
    ref.current.scale.setScalar(0.82 + v * 0.18);
    if (matRef.current) matRef.current.opacity = v;
  });

  return (
    /* Anchored at the tail tip, clear of the name tag below it. depthTest
       off and a high renderOrder: what someone says has to be readable from
       wherever the player is standing, and the bubble was being clipped by
       the buildings, banners and district pads it floats in front of. */
    <group ref={ref} position={[0, anchorY, 0]} renderOrder={20} visible={false}>
      <mesh position={[0, bubble.planeH / 2, 0]} renderOrder={20}>
        <planeGeometry args={[bubble.planeW, bubble.planeH]} />
        <meshBasicMaterial
          ref={matRef}
          map={bubble.texture}
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

/** A ring of light at someone's feet, the instant they notice you — the
 *  same edge that fires the greeting chime, so what you hear and what you
 *  see happen on the same frame. Reuses the exact visual grammar a
 *  collected marker already uses (an expanding, fading ring) rather than
 *  inventing a second one: meeting someone and finding something are both
 *  "you discovered this," and this world already has a way to say that. */
function NoticeRing({ accent, t }: { accent: string; t: React.MutableRefObject<number> }) {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    const age = t.current / NOTICE_DURATION;
    if (!ref.current || !matRef.current) return;
    if (age >= 1) {
      ref.current.visible = false;
      return;
    }
    ref.current.visible = true;
    ref.current.scale.setScalar(0.4 + age * 2.6);
    matRef.current.opacity = Math.max(0, 1 - age);
  });

  return (
    <mesh ref={ref} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
      <ringGeometry args={[0.34, 0.48, 22]} />
      <meshBasicMaterial
        ref={matRef}
        color={accent}
        transparent
        opacity={0}
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  );
}

/** How close is "noticed", how far you can drift while actually talking to
 *  someone, and the shape of the bubble's fade — shared by every NPC kind
 *  so a meetup always behaves the same regardless of who or what it is. */
const GREET_RADIUS = 7.5;
/** While their panel is open they hold the conversation over a wider ring,
 *  so standing on the edge of the greet radius cannot end it from under you. */
const ENGAGED_RADIUS = 16;
const GREET_FADE_IN = 0.35;
const GREET_FADE_OUT = 0.7;
/** How long the ground pulse takes to expand and fade, in seconds. */
const NOTICE_DURATION = 0.7;

interface GreetState {
  greeting: React.MutableRefObject<boolean>;
  wasNear: React.MutableRefObject<boolean>;
  opacity: React.MutableRefObject<number>;
  /** Seconds since this person last noticed the player arriving — the same
   *  edge that fires the chime. Starts past NOTICE_DURATION so nothing
   *  pulses on mount, before anyone has actually walked up. */
  noticeT: React.MutableRefObject<number>;
}

function useGreetState(): GreetState {
  return {
    greeting: useRef(false),
    wasNear: useRef(false),
    opacity: useRef(0),
    noticeT: useRef(NOTICE_DURATION + 1),
  };
}

/** A greeting lasts as long as you are actually standing there.
 *
 *  It used to run on a fixed 4.5-second timer, which meant anyone you walked
 *  up to turned their back and wandered off mid-conversation while you were
 *  still reading what they said. The chime is still edge-triggered on
 *  arrival, so it sounds once per encounter rather than on a loop, but the
 *  stop-and-face and the bubble now simply track presence: they hold while
 *  you are in range and release when you leave.
 *
 *  `engaged` is set while this person's own panel is open, which both widens
 *  the ring and keeps them there even if the player nudges past its edge.
 *  `seed` identifies who's greeting, purely to pitch their chime. */
function tickGreet(
  g: GreetState,
  dt: number,
  dist: number,
  seed: string,
  engaged: boolean,
) {
  const near = dist < (engaged ? ENGAGED_RADIUS : GREET_RADIUS);
  if (near && !g.wasNear.current) {
    audio.greet(seed);
    g.noticeT.current = 0;
  } else {
    g.noticeT.current += dt;
  }
  g.wasNear.current = near;
  g.greeting.current = near || engaged;

  // Ease toward the target rather than snapping, so leaving is a fade and
  // not a disappearance. Asymmetric on purpose: quick to appear, slower to go.
  const target = g.greeting.current ? 1 : 0;
  const delta = target - g.opacity.current;
  const rate = dt / (delta > 0 ? GREET_FADE_IN : GREET_FADE_OUT);
  g.opacity.current += Math.sign(delta) * Math.min(Math.abs(delta), rate);
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

/** Whose panel is currently open, or null. A ref rather than a prop value
 *  because it is read inside useFrame: engaging someone must not re-render
 *  every NPC in the world. */
type EngagedRef = React.MutableRefObject<string | null>;

function HumanNPC({
  id,
  seed,
  playerState,
  engagedId,
}: {
  id: string;
  seed: string;
  playerState: React.MutableRefObject<PlayerState>;
  engagedId: EngagedRef;
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
    tickGreet(greet, dt, distToPlayer, seed, engagedId.current === id);

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

      <NameTag text={it.title} color={accent} anchorY={h + 0.36} />
      <GreetBubble text={greetText} accent={accent} visible={greet.opacity} anchorY={h + 0.58} />
      <NoticeRing accent={accent} t={greet.noticeT} />
    </group>
  );
}

const CRAB_SHELL = "#d9622f";
const CRAB_SHELL_DARK = "#a8431d";
const CRAB_CLAW = "#f2864a";

/** Claude, as a crab — the player's own idea. Scuttles a short loop near the
 *  core rather than standing in one district: it touched code across the
 *  record, not one ecosystem. */
function Crab({
  id,
  playerState,
  engagedId,
}: {
  id: string;
  playerState: React.MutableRefObject<PlayerState>;
  engagedId: EngagedRef;
}) {
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
    tickGreet(greet, dt, distToPlayer, "claude-crab", engagedId.current === id);

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
      <NameTag text="Claude" color="#ffb08c" anchorY={0.85} />
      <GreetBubble text={greetText} accent="#ffb08c" visible={greet.opacity} anchorY={1.05} />
      <NoticeRing accent="#ffb08c" t={greet.noticeT} />
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
function JulesBot({
  id,
  playerState,
  engagedId,
}: {
  id: string;
  playerState: React.MutableRefObject<PlayerState>;
  engagedId: EngagedRef;
}) {
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
    tickGreet(greet, dt, distToPlayer, "jules-bot", engagedId.current === id);

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
      <NameTag text="Jules" color="#8ab4f8" anchorY={0.54} />
      <GreetBubble text={greetText} accent="#8ab4f8" visible={greet.opacity} anchorY={0.74} />
      <NoticeRing accent="#8ab4f8" t={greet.noticeT} />
    </group>
  );
}

export function NPCs({
  playerState,
  engagedId,
}: {
  playerState: React.MutableRefObject<PlayerState>;
  engagedId: EngagedRef;
}) {
  return (
    <>
      {contributors.map((c) => (
        <HumanNPC
          key={c.login ?? c.name}
          id={`npc:${c.login ?? c.name}`}
          seed={c.login ?? c.name}
          playerState={playerState}
          engagedId={engagedId}
        />
      ))}
      {aiTools.map((a) =>
        a.tool === "Claude" ? (
          <Crab
            key={a.tool}
            id={`ai:${a.tool}`}
            playerState={playerState}
            engagedId={engagedId}
          />
        ) : (
          <JulesBot
            key={a.tool}
            id={`ai:${a.tool}`}
            playerState={playerState}
            engagedId={engagedId}
          />
        ),
      )}
    </>
  );
}
