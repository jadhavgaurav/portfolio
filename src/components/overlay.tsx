"use client";

import type { ReactNode } from "react";
import { exhibits } from "@/data/exhibits";
import { lineage } from "@/data/lineage";
import { finding, subject, unclaimed } from "@/data/record";
import { EMISSIVE, UI } from "@/world/palette";
import type { Entity } from "@/world/telemetry";
import { scrollAtEntity, type Phase } from "@/world/sequence";
import { DISCOVERIES, LENS_ORDER, discoveryFor, type Lens } from "@/world/discovery";

/**
 * The interface layer.
 *
 * NULL's UI direction has a forbidden list and a rule: the world is the
 * primary interface, text is the fallback. So this is an information ladder,
 * not a dashboard — a minimal persistent HUD, and passages that resolve as
 * the visitor reaches the part of the world they describe. No cards, no
 * tiles, no panels floating for their own sake.
 */

/** Beats along the traverse. `at` is scroll progress; each holds for `hold`. */
interface Passage {
  /** The structure this passage is about. Position is derived from it. */
  entity?: string;
  /** Only for passages with no structure of their own. */
  at?: number;
  hold: number;
  kicker: string;
  title: string;
  body: string;
  meta?: string;
  align?: "left" | "right";
}

const PASSAGES: Passage[] = [
  {
    at: 0,
    hold: 0.075,
    kicker: "Arrival",
    title: finding.headline,
    body: "Everything here was generated from a real commit history — forty repositories, four hundred and thirty-three commits. Walk forward and you walk through it, first commit to last.",
    meta: "Scroll to move",
  },
  {
    entity: "twitter-blockchain-web3",
    hold: 0.07,
    kicker: "Origin · the earliest trace",
    title: "A blockchain Twitter clone, and a habit that starts here.",
    body: "The first thing in the record is a semester project. The second is a thesis on making voting auditable — published, with a DOI. The instinct to build systems that can be inspected shows up before anything else does.",
    meta: "twitter-blockchain-web3 · E-Voting · IJREAM, April 2024",
    align: "right",
  },
  {
    entity: "machine-learning-project-template",
    hold: 0.07,
    kicker: "Monolith · late 2024",
    title: "Before building the models, he built the thing that makes models reproducible.",
    body: "A project template with logging, exception handling and a pipeline — committed weeks before the five machine-learning repositories that used it. The apparatus arrives first. That ordering is the whole argument of this world.",
    meta: "machine-learning-project-template",
  },
  {
    entity: "CodeB_Internship_Project",
    hold: 0.075,
    kicker: "The relic · 112 commits",
    title: "A classifier that has to explain itself.",
    body: "Phishing detection, taken from an 11,430-row dataset to a deployed application. Eighty-nine features cut to twenty-eight by four independent methods. SHAP and LIME attached, so a flagged URL can be argued with rather than merely trusted. 95.83% accuracy, 0.990 ROC-AUC.",
    meta: "CodeB_Internship_Project · the largest structure in this world",
    align: "right",
  },
  {
    entity: "Kidney_disease_classification_cnn",
    hold: 0.07,
    kicker: "The crush · May 2025",
    title: "126 commits in a single month.",
    body: "The internship, a kidney-CT classifier on MLflow and DVC, YOLO, an email agent, VisionX, and the first attempt at Victus. Six months in which most of what he now knows was acquired at speed. The density of this stretch is not decoration — it is the commit record, plotted.",
    meta: "Kidney_disease_classification_cnn · Vision-X · smart-email-assistant",
  },
  {
    entity: "JarvisAI-pro",
    hold: 0.07,
    kicker: "The recursion",
    title: "He started the same project eight times.",
    body: "assistant, Jarvis, JarvisAI-pro, a local-first build, victus-AI, Victus-AI-Assistant, PROJECT-VICTUS, then the split into a backend and a frontend. Six went nowhere. What finally made the eighth different was not a better model — it was deciding who is allowed to authorise an action.",
    meta: `${lineage.length} attempts · 2024-09 to 2026-01`,
  },
  {
    entity: "PROJECT-VICTUS",
    hold: 0.075,
    kicker: "Landmark · governance",
    title: "An agent that will not act without asking.",
    body: "Every tool call in PROJECT-VICTUS passes a policy engine that can return REQUIRE_APPROVAL. A high-risk call does not run: it becomes a pending action and waits for a human. Every step — tool, arguments, decision, duration — is written to a trace the client renders beside the conversation.",
    meta: "backend/src/policy/engine.py · backend/src/models/trace.py",
    align: "right",
  },
  {
    entity: "Null",
    hold: 0.032,
    kicker: "August 2026 · 124 commits in eight days",
    title: "The world you are standing in was designed here, and never built.",
    body: "NULL is his: a browser game that reconstructs a developer's history as a place. Twenty-one design documents, four architecture decisions, fourteen visual studies each gated behind binding rules and a recorded verdict. The rule reads: no implementation is approved solely because it technically works. This site is that design, executed.",
    meta: "Null · private repository · gate recorded CLOSED, 26 Aug 2026",
    align: "right",
  },
  {
    at: 0.775,
    hold: 0.058,
    kicker: "Not claimed",
    title: "What this record does not show.",
    body: "No adoption, no traffic, no revenue — the public repositories carry four stars between them. Open-source contribution is intent, not history: twenty-six forks in three days and no merged pull request yet. Two of the four busiest repositories are private and are counted here but not described.",
    meta: `${unclaimed.length} claims a portfolio would make, and does not`,
  },
];

/** Resolve a passage to a scroll position, from its structure where it has one. */
function anchorOf(p: Passage): number {
  return p.entity !== undefined ? scrollAtEntity(p.entity) : (p.at ?? 0);
}

function passageState(scroll: number, p: Passage, start: number) {
  const fadeIn = 0.022;
  const end = start + p.hold;
  if (scroll < start - fadeIn || scroll > end + fadeIn) return 0;
  if (scroll < start) return (scroll - (start - fadeIn)) / fadeIn;
  if (scroll > end) return 1 - (scroll - end) / fadeIn;
  return 1;
}

export function Overlay({
  phase,
  scroll,
  passing,
  dateLabel,
  scrollVh,
  fallback,
  discovered,
  noticing,
  reward,
  total,
  record,
  onFocus,
  focusing,
}: {
  phase: Phase;
  scroll: number;
  passing: Entity | null;
  dateLabel: string;
  scrollVh: number;
  fallback: ReactNode;
  discovered: string[];
  noticing: { id: string; progress: number } | null;
  reward: { lens: Lens; grants: string; entity: string } | null;
  total: number;
  /** The record for the structure being passed, if it has one. */
  record: { title: string } | null;
  onFocus: () => void;
  /** True while a record is open. Everything transient stands down. */
  focusing: boolean;
}) {
  const arrived = phase === "PLAYER" && !focusing;
  const atCore = scroll > 0.956;

  /* Anchors can sit close together where the record itself is dense, so more
     than one passage can be in range at once. Only the strongest is shown —
     two columns of prose over a moving world is unreadable. */
  const activePassage = PASSAGES.map((p) => ({ p, o: passageState(scroll, p, anchorOf(p)) }))
    .filter((x) => x.o > 0)
    .sort((a, b) => b.o - a.o)[0];

  return (
    <>
      {/* Scroll length. The text layer stays in the accessibility tree so a
          screen reader, which cannot perceive the world, still gets its
          content. */}
      <div style={{ height: `${scrollVh}vh` }} aria-hidden="true" />
      <div className="sr-only">{fallback}</div>

      {/* Opening: nothing at all. No logo, no spinner. Emptiness reads as a
          place; a loading state would read as a browser tab. */}
      {!arrived && (
        <div className="pointer-events-none fixed inset-0 z-20 flex items-end justify-center pb-12">
          <p
            className="u-mono text-[0.625rem] uppercase tracking-[0.24em] transition-opacity duration-1000"
            style={{ color: UI.textMuted, opacity: phase === "VOID" ? 0 : 0.65 }}
          >
            {phase === "SIGNAL"
              ? "Something exists"
              : phase === "EMERGENCE"
                ? "The world resolves"
                : "Arriving"}
          </p>
        </div>
      )}

      {/* Persistent HUD. Two readings and a route indicator — the minimum
          that answers where am I and what am I looking at. */}
      {arrived && !atCore && (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-20 px-5 pt-5 sm:px-8 sm:pt-7">
          <div className="flex items-start justify-between gap-4 pl-[4.5rem] sm:pl-[5.5rem]">
            <div>
              <div
                className="u-mono text-[0.625rem] uppercase tracking-[0.2em]"
                style={{ color: UI.textMuted }}
              >
                {subject.filedAs}
              </div>
              <div
                className="u-mono mt-1 text-[0.7rem] tracking-[0.08em]"
                style={{ color: UI.textSecondary }}
              >
                {dateLabel}
              </div>
            </div>
            <div className="text-right">
              <div
                className="u-mono text-[0.625rem] uppercase tracking-[0.2em]"
                style={{ color: UI.textMuted }}
              >
                {passing ? passing.type : "Traverse"}
              </div>
              <div
                className="u-mono mt-1 max-w-[52vw] truncate text-[0.7rem] tracking-[0.04em]"
                style={{ color: passing ? UI.textHighlight : UI.textMuted }}
              >
                {passing ? passing.name : "—"}
              </div>
              {passing && (
                <div
                  className="u-mono mt-0.5 text-[0.625rem] tracking-[0.08em]"
                  style={{ color: UI.textMuted }}
                >
                  {passing.commits} commit{passing.commits === 1 ? "" : "s"}
                </div>
              )}
            </div>
          </div>
          {/* The lenses earned so far. Marks, not a meter — a lens is a way of
              seeing, and the world is where the progress actually shows. */}
          <div className="mt-4 flex items-center gap-2">
            {LENS_ORDER.map((l) => {
              const got = discovered.some((id) => discoveryFor(id)?.lens === l);
              return (
                <span
                  key={l}
                  title={l}
                  className="block h-px transition-all duration-700"
                  style={{
                    width: got ? 26 : 10,
                    background: got ? UI.textHighlight : UI.border,
                  }}
                />
              );
            })}
            <span className="u-mono ml-2 text-[0.625rem] tracking-[0.16em]" style={{ color: UI.textMuted }}>
              {discovered.length}/{total} lenses
            </span>
          </div>

          {/* Route progress. */}
          <div className="mt-4 h-px w-full" style={{ background: UI.border }}>
            <div
              className="h-px origin-left"
              style={{
                background: UI.borderActive,
                transform: `scaleX(${scroll})`,
                transition: "transform 120ms linear",
              }}
            />
          </div>
        </div>
      )}

      {/* FOCUS is offered only where there is something to focus on, and only
          while the visitor is actually standing at it. */}
      {arrived && !atCore && !reward && record && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-20 flex justify-center px-5">
          <button
            onClick={onFocus}
            className="u-mono pointer-events-auto border px-5 py-2.5 text-[0.6rem] uppercase tracking-[0.18em] transition-colors"
            style={{
              borderColor: UI.borderActive,
              color: UI.textHighlight,
              background: "rgba(6,8,9,0.7)",
            }}
          >
            Open the record for {record.title}
          </button>
        </div>
      )}

      {/* INVESTIGATE. The entity resolves in the world; this is the only
          interface acknowledgement, and it carries no name or icon. */}
      {arrived && noticing && !reward && (
        <div className="pointer-events-none fixed inset-x-0 bottom-20 z-20 flex justify-center">
          <span
            className="block h-px transition-none"
            style={{
              width: `${28 + noticing.progress * 92}px`,
              background: UI.textSecondary,
              opacity: 0.25 + noticing.progress * 0.65,
            }}
          />
        </div>
      )}

      {/* REWARD. A short beat: the lens is named once, and what changed in the
          world is stated. Then it goes away and the change stays. */}
      {reward && !atCore && (
        <div
          className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center px-6"
          style={{
            background:
              "radial-gradient(58% 46% at 50% 48%, rgba(6,8,9,0.9) 0%, rgba(6,8,9,0.66) 38%, rgba(6,8,9,0.28) 68%, rgba(6,8,9,0) 100%)",
          }}
        >
          <div className="max-w-[30rem] text-center">
            <div
              className="u-mono text-[0.625rem] uppercase tracking-[0.28em]"
              style={{ color: UI.textMuted }}
            >
              Resolved · {reward.entity}
            </div>
            <div
              className="u-mono mt-4 text-[clamp(1.5rem,3.4vw,2.3rem)] tracking-[0.14em]"
              style={{ color: "#8cbcae" }}
            >
              {reward.lens}
            </div>
            <p className="mt-4 text-[0.95rem] leading-[1.55]" style={{ color: UI.textSecondary }}>
              {reward.grants}
            </p>
          </div>
        </div>
      )}

      {/* Passages. They resolve where the world they describe is. */}
      {arrived &&
        !atCore &&
        !reward &&
        activePassage &&
        [activePassage].map(({ p, o }) => {
          return (
            <div
              key={p.kicker}
              className={`pointer-events-none fixed inset-x-0 z-20 px-5 sm:px-10 ${
                p.align === "right" ? "flex justify-end" : ""
              }`}
              style={{
                bottom: "13vh",
                opacity: o,
                transform: `translateY(${(1 - o) * 18}px)`,
              }}
            >
              <div className="relative max-w-[34rem]">
                {/* The scrim extends well past the text so its falloff happens
                    off the edge of the copy rather than at it. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-x-[45%] -inset-y-[70%] -z-10"
                  style={{
                    background:
                      "radial-gradient(closest-side, rgba(6,8,9,0.92) 0%, rgba(6,8,9,0.75) 38%, rgba(6,8,9,0.4) 62%, rgba(6,8,9,0) 100%)",
                  }}
                />
                <div
                  className="u-mono text-[0.625rem] uppercase tracking-[0.2em]"
                  style={{ color: UI.textMuted }}
                >
                  {p.kicker}
                </div>
                <h2
                  className="u-display mt-3 text-[clamp(1.6rem,3.4vw,2.9rem)] leading-[1.04]"
                  style={{ color: UI.textPrimary }}
                >
                  {p.title}
                </h2>
                <p
                  className="mt-4 text-[0.95rem] leading-[1.6]"
                  style={{ color: UI.textSecondary }}
                >
                  {p.body}
                </p>
                {p.meta && (
                  <div
                    className="u-mono mt-4 text-[0.6875rem] tracking-[0.04em]"
                    style={{ color: UI.textMuted }}
                  >
                    {p.meta}
                  </div>
                )}
              </div>
            </div>
          );
        })}

      {/* The CORE. Only here does the identity become explicit, and only here
          is there anything to click. */}
      {atCore && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto overscroll-contain px-5 py-10 transition-opacity duration-700"
          style={{
            opacity: Math.min(1, (scroll - 0.956) / 0.025),
            background:
              "radial-gradient(70% 60% at 50% 46%, rgba(6,8,9,0.9) 0%, rgba(6,8,9,0.72) 55%, rgba(6,8,9,0.25) 100%)",
          }}
        >
          <div className="max-w-[36rem] text-center">
            {/* Only at the CORE does the identity become explicit — Bible §16.
                The portrait is graded into the world's own colour so it reads
                as part of the place rather than as a pasted avatar. */}
            <div className="relative mx-auto mb-6 h-[92px] w-[92px] sm:h-[132px] sm:w-[132px]">
              <span
                aria-hidden="true"
                className="absolute -inset-[6px] rounded-full"
                style={{
                  background: `radial-gradient(circle, ${EMISSIVE.reward}55, transparent 68%)`,
                }}
              />
              {/* Already sized and encoded at build time; the optimiser has
                  nothing left to do here. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/portrait.webp"
                width={132}
                height={132}
                loading="lazy"
                alt="Gaurav Vijay Jadhav"
                className="relative h-full w-full rounded-full object-cover"
                style={{
                  filter: "saturate(0.3) contrast(1.1) brightness(0.95)",
                  border: `1px solid ${UI.borderActive}`,
                }}
              />
            </div>
            <div
              className="u-mono text-[0.625rem] uppercase tracking-[0.24em]"
              style={{ color: UI.textMuted }}
            >
              The core
            </div>
            <h2
              className="u-display mt-4 text-[clamp(1.75rem,6.5vw,3.4rem)] leading-[1.04]"
              style={{ color: UI.textPrimary }}
            >
              {subject.name}
            </h2>
            <p
              className="mt-4 text-[0.92rem] leading-[1.55] sm:text-[1rem]"
              style={{ color: UI.textSecondary }}
            >
              Full Stack AI Engineer at Alsonotify, a Digibranders brand,
              in Mumbai. Everything you passed is verifiable:
              every structure is a repository, its mass is its commit count, its
              decay is the time since it was last touched.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {[
                { label: "Email", href: `mailto:${subject.email}` },
                { label: "GitHub", href: subject.github },
                { label: "LinkedIn", href: subject.linkedin },
                { label: "Curriculum vitae", href: "/resume/resume.pdf" },
              ].map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer noopener"
                  className="u-mono border-b pb-1 text-[0.6875rem] uppercase tracking-[0.16em] transition-colors duration-200"
                  style={{ color: UI.textHighlight, borderColor: UI.border }}
                >
                  {l.label}
                </a>
              ))}
            </div>
            <div className="mt-8 border-t pt-5" style={{ borderColor: UI.border }}>
              <div
                className="u-mono text-[0.625rem] uppercase tracking-[0.2em]"
                style={{ color: UI.textMuted }}
              >
                Lenses resolved · {discovered.length} of {total}
              </div>
              <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
                {DISCOVERIES.map((d) => {
                  const got = discovered.includes(d.entity);
                  return (
                    <span
                      key={d.lens}
                      className="u-mono text-[0.625rem] tracking-[0.16em]"
                      style={{ color: got ? UI.textHighlight : UI.border }}
                    >
                      {d.lens}
                    </span>
                  );
                })}
              </div>
              {discovered.length < total && (
                <p className="u-mono mt-4 text-[0.625rem] leading-[1.7]" style={{ color: UI.textMuted }}>
                  The rest are still out there. Attention is the only mechanic —
                  approach a structure and stay with it.
                </p>
              )}
              <p
                className="u-mono mt-4 text-[0.625rem] leading-[1.7] tracking-[0.04em]"
                style={{ color: UI.textMuted }}
              >
                Every structure you passed is a repository. {exhibits.length} of
                them are described in full where the world names them.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
