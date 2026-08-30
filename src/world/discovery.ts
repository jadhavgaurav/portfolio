import { entities, type Entity } from "./telemetry";

/**
 * The discovery loop.
 *
 *   EXPLORE → NOTICE → INVESTIGATE → DISCOVER → REWARD → WORLD CHANGES
 *
 * Implemented as the state machine the design specifies rather than as a
 * decoration on top of scrolling. Salience is the single scalar that drives
 * NOTICE, computed per entity per tick in this layer with no renderer input,
 * using the weights the game-loop document fixes.
 *
 * Two rules from that document constrain everything here:
 *
 *   NOTICE is world-side, not UI-side. No outlines, markers, icons or
 *   tooltips — an entity announces itself by how it takes light.
 *
 *   A REWARD is expressed through the world. The lens is granted, and the
 *   world visibly changes from where the visitor is already standing. If the
 *   change needs them to move to perceive it, the reward has failed.
 */

/** The seven canonical lenses. There are exactly seven and no others. */
export type Lens = "TIME" | "CRAFT" | "LANGUAGE" | "COLLABORATION" | "IMPACT" | "VOID" | "DNA";

export const LENS_ORDER: Lens[] = [
  "TIME",
  "CRAFT",
  "LANGUAGE",
  "COLLABORATION",
  "IMPACT",
  "VOID",
  "DNA",
];

/** Tuning constants, kept together rather than scattered through the code. */
export const TUNING: Record<string, number> & {
  investigateSeconds: number;
  awarenessRadius: number;
} = {
  w_prox: 0.35,
  w_gaze: 0.3,
  w_sig: 0.25,
  w_seen: 0.4,
  noticeThreshold: 0.42,
  investigateThreshold: 0.62,
  /**
   * Sustained attention required to resolve.
   *
   * 2.4s was measured against the actual interaction: the visitor moves by
   * scrolling, so dwelling means stopping, and nothing invited them to stop.
   * Most visitors reached the end with nothing resolved. 1.3s is reachable by
   * slowing down, which people already do when something appears.
   */
  investigateSeconds: 1.3,
  awarenessRadius: 92,
  relaxSeconds: 1.2,
};

export interface Discovery {
  entity: string;
  lens: Lens;
  /** What the lens reveals, stated as the world change it causes. */
  grants: string;
  /** The evidence in the record that justifies this being a discovery. */
  because: string;
}

/**
 * Which works grant which lens. Each is the work in this record that most
 * directly earns it, so the progression is the subject's own history rather
 * than an arbitrary unlock order.
 */
export const DISCOVERIES: Discovery[] = [
  {
    entity: "twitter-blockchain-web3",
    lens: "TIME",
    grants: "Construction courses become visible on every structure in view.",
    because: "The earliest trace in the record. Everything else dates from after it.",
  },
  {
    entity: "machine-learning-project-template",
    lens: "CRAFT",
    grants: "Works built with their apparatus first light along their joints.",
    because: "Logging, exceptions and a pipeline, committed before the models that used it.",
  },
  {
    entity: "CodeB_Internship_Project",
    lens: "IMPACT",
    grants: "Works that actually shipped cast light onto the ground around them.",
    because: "112 commits, and the only one deployed to a public URL for someone else to use.",
  },
  {
    entity: "Kidney_disease_classification_cnn",
    lens: "LANGUAGE",
    grants: "Ecosystems separate: the Python mass, the TypeScript mass, the rest.",
    because: "The point where the record commits to Python and stops being coursework.",
  },
  {
    entity: "JarvisAI-pro",
    lens: "COLLABORATION",
    grants: "The line through eight attempts at one idea is drawn across the world.",
    because: "The first attempt with a real architecture, and the one reopened fourteen months later.",
  },
  {
    entity: "PROJECT-VICTUS",
    lens: "VOID",
    grants: "Abandoned works stop hiding. What stopped becomes as visible as what shipped.",
    because: "The attempt that survived, which only makes sense beside the six that did not.",
  },
  {
    entity: "Null",
    lens: "DNA",
    grants: "The core resolves. The world admits what it is a picture of.",
    because: "The design this world is built from, gated behind fourteen studies and never built.",
  },
];

const BY_ID = new Map(entities.map((e) => [e.id, e]));

export const DISCOVERY_TARGETS: { discovery: Discovery; entity: Entity }[] = DISCOVERIES
  .map((d) => ({ discovery: d, entity: BY_ID.get(d.entity)! }))
  .filter((x) => x.entity);

/**
 * Salience for one entity, from the camera's position and heading.
 * Monotonic in proximity and in alignment; discovered entities recede.
 */
export function salience(
  e: Entity,
  camX: number,
  camZ: number,
  headingX: number,
  headingZ: number,
  discovered: boolean,
): number {
  const dx = e.x - camX;
  const dz = e.z - camZ;
  const dist = Math.hypot(dx, dz);
  if (dist > TUNING.awarenessRadius) return 0;

  const proximity = 1 - dist / TUNING.awarenessRadius;

  // Cosine falloff between the view vector and the entity.
  const len = Math.hypot(dx, dz) || 1;
  const gaze = Math.max(0, (dx / len) * headingX + (dz / len) * headingZ);

  return (
    TUNING.w_prox * proximity +
    TUNING.w_gaze * gaze +
    TUNING.w_sig * e.significance -
    (discovered ? TUNING.w_seen : 0)
  );
}

/**
 * The most salient discoverable entity in range, if any crosses the notice
 * threshold.
 *
 * Deliberately scoped to the works that carry a discovery. Ranking every
 * entity and then testing whether the winner happens to be discoverable means
 * the loop almost never fires, because the nearest structure is usually an
 * ordinary one — which is what the first implementation got wrong.
 */
export function mostSalient(
  camX: number,
  camZ: number,
  headingX: number,
  headingZ: number,
  discoveredIds: Set<string>,
): { entity: Entity; salience: number } | null {
  let best: Entity | null = null;
  let bestS: number = TUNING.noticeThreshold;
  for (const { entity } of DISCOVERY_TARGETS) {
    if (discoveredIds.has(entity.id)) continue;
    const s = salience(entity, camX, camZ, headingX, headingZ, false);
    if (s > bestS) {
      bestS = s;
      best = entity;
    }
  }
  return best ? { entity: best, salience: bestS } : null;
}

export const discoveryFor = (id: string) =>
  DISCOVERIES.find((d) => d.entity === id) ?? null;
