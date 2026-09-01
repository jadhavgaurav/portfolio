/**
 * The discovery loop.
 *
 *   EXPLORE → NOTICE → INVESTIGATE → DISCOVER → REWARD → WORLD CHANGES
 *
 * This originally implemented that whole state machine — salience scored
 * per entity against the camera's position and gaze, a notice threshold, a
 * dwell timer to resolve a discovery. It only ever drove the old scroll-rail
 * camera (World.tsx/CameraRig.tsx, both since removed as dead code once the
 * free-roam Player took over): a discovery was something you scrolled past
 * and the camera noticed on your behalf. A player who walks and opens things
 * themselves doesn't need a proximity-and-gaze score to decide that for
 * them, which is why every lens is simply granted from the first frame now
 * (GameCanvas.tsx) rather than earned through this loop.
 *
 * What's left is the two rules from that document this file's data still
 * has to honour:
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

