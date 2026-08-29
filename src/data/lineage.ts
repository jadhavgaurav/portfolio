import { Source, repo } from "@/lib/provenance";

/**
 * The recursion.
 *
 * Between September 2024 and August 2026 the subject started the same project
 * eight times. Not a series of different assistants — the same one, restarted.
 * The dates and commit counts are from the chronology; the reading of each
 * attempt is drawn from its file tree and README.
 *
 * This is the most human thing in the record and it is not in his CV.
 */
export interface Attempt {
  name: string;
  from: string;
  commits: number;
  /** What this attempt added that the previous one did not have. */
  gained: string;
  /** Why it stopped, where the record shows it. */
  ended: string;
  source: Source;
  /** Attempts that survived into the next one. */
  survived: boolean;
}

export const lineage: Attempt[] = [
  {
    name: "assistant",
    from: "2024-09",
    commits: 5,
    gained: "A wake word, a WhatsApp hook, a chat reply borrowed from a hosted API. JavaScript. Four days of work.",
    ended: "Stops after the fourth commit. Nothing carries forward but the idea.",
    source: repo("assistant"),
    survived: false,
  },
  {
    name: "Jarvis",
    from: "2025-06",
    commits: 2,
    gained: "A name and a repository. Four kilobytes.",
    ended: "Abandoned within a day, superseded by the attempt started two days earlier.",
    source: repo("Jarvis"),
    survived: false,
  },
  {
    name: "JarvisAI-pro",
    from: "2025-06",
    commits: 10,
    gained:
      "The first real architecture: core/ for wake word, speech and routing; skills/ as separate modules; rag_engine/ split into embedder, retriever, vectorstore and prompt builder. An ML intent classifier decides whether a request needs a skill or a language model.",
    ended: "Reaches “phase 5 complete”, then goes quiet for fourteen months — until a single commit in August 2026 reopens it.",
    source: repo("JarvisAI-pro"),
    survived: true,
  },
  {
    name: "Jarvis-AI-Personal_Assistant",
    from: "2025-06",
    commits: 4,
    gained: "A 47 MB attempt to run the whole thing locally: Vosk, Porcupine, a quantised LLaMA 3 through Ollama, ChromaDB.",
    ended: "Four commits over five days. The local-first version does not survive.",
    source: repo("Jarvis-AI-Personal_Assistant"),
    survived: false,
  },
  {
    name: "victus-AI",
    from: "2025-07",
    commits: 2,
    gained: "A new name. The entire README is: “use python 3.11 for this project”.",
    ended: "Two commits, same day.",
    source: repo("victus-AI"),
    survived: false,
  },
  {
    name: "Victus-AI-Assistant",
    from: "2025-07",
    commits: 1,
    gained: "Nine kilobytes. The README is empty.",
    ended: "One commit. Nine days later the eighth attempt begins, and it is the one that works.",
    source: repo("Victus-AI-Assistant"),
    survived: false,
  },
  {
    name: "PROJECT-VICTUS",
    from: "2025-08",
    commits: 11,
    gained:
      "Everything the previous seven were reaching for, plus the thing none of them had: a policy engine, a trace table and a human approval step. This is where the assistant stops being a demo and becomes a system that can be held to account.",
    ended: "Still open. Restructured into a src/ layout in January 2026.",
    source: repo("PROJECT-VICTUS"),
    survived: true,
  },
  {
    name: "victus-backend · victus-frontend",
    from: "2026-01",
    commits: 2,
    gained:
      "The split. The client grows an observability panel, a policy decision list, a tool timeline and an approvals queue — the governance model becoming the interface rather than hiding behind it.",
    ended: "Current.",
    source: repo("victus-frontend"),
    survived: true,
  },
];

export const lineageReading =
  "Six of these eight went nowhere. Read as output that is a poor return on twenty-three months. Read as process it is the most informative sequence in the record: the same problem, restated until the restatement was good enough, and the thing that finally made the eighth attempt different was not a better model but a decision about who is allowed to authorise an action.";
