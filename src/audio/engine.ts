import { styleFor } from "@/world/language";

/**
 * Sound.
 *
 * There was none. A world that looks like a place and makes no sound reads
 * as a render, not somewhere you are standing — and the previous builds
 * never had this problem to solve, because nothing before this one had a
 * character in it.
 *
 * Everything here is synthesised, the same way the world itself is: no
 * audio files, no CDN, no license to track. A footstep is a filtered noise
 * burst, a chime is two detuned oscillators, the ambient bed is layered
 * tones crossfaded by which district the player is standing in. It costs
 * nothing to ship and nothing can fail to load.
 *
 * Browsers refuse to start an AudioContext before a user gesture, so
 * `unlock()` is called from the button that starts the game — the one
 * gesture guaranteed to happen before any sound is needed.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let ambientGain: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;
let muted = false;

function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) {
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.68;
    master.connect(ctx.destination);

    ambientGain = ctx.createGain();
    ambientGain.gain.value = 0.5;
    ambientGain.connect(master);

    // White noise, pre-rendered once and reused for every footstep and
    // texture hit — cheaper than generating a new buffer per step.
    const len = ctx.sampleRate * 1;
    noiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  }
  return ctx;
}

export function unlock() {
  const c = ensure();
  if (c && c.state === "suspended") c.resume();
}

export function setMuted(v: boolean) {
  muted = v;
  if (master && ctx) master.gain.setTargetAtTime(v ? 0 : 0.68, ctx.currentTime, 0.08);
}

export function isMuted() {
  return muted;
}

function now() {
  return ctx?.currentTime ?? 0;
}

/** A short filtered noise burst — the shared material footsteps, lands and
 *  interface ticks are all built from. */
function noiseBurst(opts: {
  duration: number;
  gain: number;
  filterFreq: number;
  filterQ?: number;
  type?: BiquadFilterType;
  destination?: AudioNode;
}) {
  if (!ctx || !master || !noiseBuffer) return;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  const filter = ctx.createBiquadFilter();
  filter.type = opts.type ?? "bandpass";
  filter.frequency.value = opts.filterFreq;
  filter.Q.value = opts.filterQ ?? 0.9;
  const gain = ctx.createGain();
  const t = now();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(opts.gain, t + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + opts.duration);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(opts.destination ?? master);
  src.start(t);
  src.stop(t + opts.duration + 0.02);
}

/** A short tone, for chimes and UI feedback. */
function tone(opts: {
  freq: number;
  duration: number;
  gain: number;
  type?: OscillatorType;
  detune?: number;
  destination?: AudioNode;
}) {
  if (!ctx || !master) return;
  const osc = ctx.createOscillator();
  osc.type = opts.type ?? "sine";
  osc.frequency.value = opts.freq;
  if (opts.detune) osc.detune.value = opts.detune;
  const gain = ctx.createGain();
  const t = now();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(opts.gain, t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + opts.duration);
  osc.connect(gain);
  gain.connect(opts.destination ?? master);
  osc.start(t);
  osc.stop(t + opts.duration + 0.02);
}

/** Deterministic per-language pitch, so a district's ambient tone and its
 *  footstep colour are always the same on every visit rather than random. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

// ── Footsteps ───────────────────────────────────────────────────────────

let stepPhase = 0;
let lastStepSide = 1;

/** Called every frame with the player's speed; fires a footstep exactly
 *  when the walk cycle's foot would be planting — the same cadence formula
 *  the avatar's legs animate on, so sound and motion never drift apart. */
export function driveFootsteps(dt: number, speed: number, grounded: boolean, language: string) {
  if (!grounded || speed < 0.6) {
    stepPhase = 0;
    return;
  }
  stepPhase += speed * dt * 1.35;
  if (stepPhase < Math.PI) return;
  stepPhase -= Math.PI;
  lastStepSide *= -1;
  const base = 900 + hash(language) * 500;
  noiseBurst({
    duration: 0.09,
    gain: Math.min(0.22, 0.08 + speed * 0.012),
    filterFreq: base + lastStepSide * 60,
    filterQ: 1.1,
    type: "bandpass",
  });
}

export function jump() {
  tone({ freq: 220, duration: 0.16, gain: 0.16, type: "triangle" });
  noiseBurst({ duration: 0.08, gain: 0.1, filterFreq: 1400, type: "highpass" });
}

export function land(impactSpeed: number) {
  const g = Math.min(0.32, 0.1 + impactSpeed * 0.012);
  noiseBurst({ duration: 0.14, gain: g, filterFreq: 260, filterQ: 0.7, type: "lowpass" });
}

// ── Interface ───────────────────────────────────────────────────────────

export function interactOpen() {
  tone({ freq: 523.25, duration: 0.22, gain: 0.14, type: "sine" });
  tone({ freq: 659.25, duration: 0.28, gain: 0.1, type: "sine", detune: -6 });
}

export function interactClose() {
  tone({ freq: 392, duration: 0.14, gain: 0.09, type: "sine" });
}

export function uiTick() {
  tone({ freq: 1046.5, duration: 0.05, gain: 0.06, type: "sine" });
}

export function waypointSet() {
  tone({ freq: 784, duration: 0.1, gain: 0.09, type: "sine" });
  tone({ freq: 1174.7, duration: 0.16, gain: 0.07, type: "sine" });
}

export function districtEnter(language: string) {
  const f = 220 + hash(language) * 180;
  tone({ freq: f, duration: 0.9, gain: 0.05, type: "sine" });
  tone({ freq: f * 1.5, duration: 1.2, gain: 0.03, type: "sine", detune: 4 });
}

/** A coin, badge, or star, picked up in the world — separate from
 *  interactOpen() because opening a panel and collecting the marker above a
 *  structure are two different events and happen on different triggers. */
export function collect() {
  tone({ freq: 880, duration: 0.09, gain: 0.11, type: "triangle" });
  tone({ freq: 1318.5, duration: 0.16, gain: 0.09, type: "triangle", detune: 3 });
}

/** Plays once, the instant someone in the world notices you and the meetup
 *  bubble opens — a warm two-note "hey, I know you" chime, pitched a little
 *  differently per person so no two collaborators sound identical but the
 *  same one always sounds the same. Softer and shorter than milestone()
 *  so a meetup never reads as a bigger event than finishing a district. */
export function greet(seed: string) {
  const base = 440 + hash(seed) * 220;
  tone({ freq: base, duration: 0.18, gain: 0.13, type: "sine" });
  tone({ freq: base * 1.5, duration: 0.36, gain: 0.11, type: "sine", detune: -4 });
}

export function coreArrival() {
  [261.6, 329.6, 392, 523.2].forEach((f, i) => {
    tone({ freq: f, duration: 1.6, gain: 0.05, type: "sine", detune: i * 2 });
  });
}

/** A category — every certification, every district — closes out. Brighter
 *  and longer than interactOpen(), because completing a set is a different
 *  size of event than opening one thing. */
export function milestone() {
  [392, 493.9, 587.3, 784].forEach((f, i) => {
    tone({ freq: f, duration: 1.1, gain: 0.09, type: "triangle", detune: i * 1.5 });
  });
}

// ── Ambient bed ─────────────────────────────────────────────────────────

interface Voice {
  osc: OscillatorNode;
  gain: GainNode;
  filter: BiquadFilterNode;
}

let droneA: Voice | null = null;
let droneB: Voice | null = null;
let started = false;
let currentLanguage = "";
let ambientBaseFreq = 80;
let ambientTargetFreq = 80;

function makeDrone(freq: number): Voice {
  const c = ctx!;
  const osc = c.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.value = freq;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 340;
  filter.Q.value = 0.4;
  const gain = c.createGain();
  gain.gain.value = 0;
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ambientGain!);
  osc.start();
  return { osc, gain, filter };
}

/** Call once, after unlock(). Starts the ambient bed at silence; `tick`
 *  fades it in and crossfades it as the player moves between districts. */
function startAmbient() {
  if (started || !ctx) return;
  started = true;
  droneA = makeDrone(ambientBaseFreq);
  droneB = makeDrone(ambientBaseFreq * 1.5);
  droneA.gain.gain.setTargetAtTime(0.045, now(), 3);
  droneB.gain.gain.setTargetAtTime(0.025, now(), 3);
}

/** Driven every frame from the world. Reads only the player's position and
 *  the nearest district's language — everything else about the ambient bed
 *  is internal state, so this never causes a React render. */
export function tickAmbient(language: string) {
  if (!ctx) return;
  if (!started) startAmbient();
  if (!droneA || !droneB) return;

  if (language !== currentLanguage) {
    currentLanguage = language;
    ambientTargetFreq = 66 + hash(language) * 40;
  }
  ambientBaseFreq += (ambientTargetFreq - ambientBaseFreq) * 0.01;
  const t = now();
  droneA.osc.frequency.setTargetAtTime(ambientBaseFreq, t, 1.5);
  droneB.osc.frequency.setTargetAtTime(ambientBaseFreq * 1.5, t, 1.5);
  droneA.filter.frequency.setTargetAtTime(280 + hash(language) * 260, t, 2);
}

export const languageTone = (language: string) => styleFor(language).ui;
