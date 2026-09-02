import type { BodyType } from "./rig";

/**
 * Who looks like what.
 *
 * The bodies are shared: every man in the world is the same mesh and
 * every woman is the same mesh. That is a deliberate budget decision —
 * one more distinct character costs about another megabyte on a page
 * that already drops to a low quality tier on every phone — and it means
 * the differentiation has to come from somewhere cheaper.
 *
 * It comes from hair colour and height. Both are free: hair is its own
 * material on both meshes, so tinting it touches nothing else, and height
 * is a scale on the root. Neither invents anything about a real person
 * beyond what the shared body already does; they exist so a crowd reads
 * as a crowd rather than as one man printed twelve times.
 *
 * Skin and clothing cannot be varied the same way. Mixamo packs both into
 * a single atlas texture per character, so a colour multiply that changed
 * a shirt would change the face with it.
 */

/**
 * Body type per person.
 *
 * Inferred from given names, which is a guess and is wrong for anyone
 * whose name does not read the way their name reads to a stranger. It is
 * deliberately a plain table rather than a heuristic so that correcting
 * any single person is a one-line edit rather than an argument with a
 * regex. Keys are the seed each NPC is constructed with, which is the
 * GitHub login where there is one and the git author name where there is
 * not. Anyone absent defaults to `male`.
 */
const BODY_BY_SEED: Record<string, BodyType> = {
  KarthikaThiruvengatam: "female",
};

export function bodyFor(seed: string): BodyType {
  return BODY_BY_SEED[seed] ?? "male";
}

/** Deterministic per-seed noise, same construction the rest of the world
 *  uses: the same person is the same person on every visit. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

/** Natural hair colours only. The meshes ship with a dark brown texture
 *  and the material tint multiplies it, so these are all at or lighter
 *  than that: a multiply can lift a colour towards a hue, never past it. */
const HAIR: string[] = [
  "#ffffff", // unchanged — the texture's own dark brown
  "#c9a06a", // lifted towards fair
  "#e0b98a",
  "#a8703c", // towards auburn
  "#8a5a3c",
  "#6b6b6b", // greying
];

export function hairFor(seed: string): string {
  return HAIR[Math.floor(hash(seed + "hair") * HAIR.length)] ?? HAIR[0];
}

/**
 * Height, in world units.
 *
 * Centred a little under the player's own 1.75 for the same reason the
 * box figures were: the person you are is not one of the crowd. The
 * spread is deliberately small — enough that a group does not look
 * stamped, not so much that anyone reads as a child or a giant.
 */
export function heightFor(seed: string, base = 1.68): number {
  return base * (0.955 + hash(seed + "height") * 0.09);
}
