"use client";

import { useState } from "react";
import {
  exhibits,
  gateStudies,
  limeExample,
  metrics,
  policyTable,
  type Exhibit,
} from "@/data/exhibits";
import { ChapterHead, Reveal, Rule, Shell, SourceList } from "./primitives";

/* ── apparatus: one per exhibit kind ─────────────────────────────────────── */

/**
 * VICTUS. The real enum from backend/src/policy/engine.py, made operable.
 * Choosing a risk level shows the verdict the running system would return —
 * which is a more honest demonstration than an architecture diagram.
 */
function PolicyApparatus() {
  const [selected, setSelected] = useState(2);
  const row = policyTable[selected];

  return (
    <figure className="border-t border-rule pt-6">
      <figcaption className="u-label u-label-ink">
        Policy engine · select a risk level
      </figcaption>

      <div role="radiogroup" aria-label="Tool risk level" className="mt-5 flex flex-wrap gap-px">
        {policyTable.map((r, i) => (
          <button
            key={r.risk}
            role="radio"
            aria-checked={i === selected}
            onClick={() => setSelected(i)}
            className={`u-mono border px-4 py-2.5 text-[0.6875rem] tracking-[0.13em] transition-colors duration-200 ${
              i === selected
                ? "border-oxide bg-[var(--oxide-soft)] text-oxide"
                : "border-rule text-ink-3 hover:border-ink-3 hover:text-ink-2"
            }`}
          >
            {r.risk}
          </button>
        ))}
      </div>

      <div className="mt-6 border border-rule bg-paper-raised p-6" aria-live="polite">
        <div className="u-label">Returns</div>
        <div
          className={`u-mono mt-2 text-[clamp(1.1rem,2.4vw,1.6rem)] ${
            row.executes ? "text-ink" : "text-oxide"
          }`}
        >
          PolicyDecision.{row.decision}
        </div>
        <p className="mt-4 max-w-[34rem] text-[0.92rem] leading-[1.6] text-ink-2">
          {row.example}{" "}
          {row.executes ? (
            <span className="text-ink-3">The call executes and is written to the trace.</span>
          ) : (
            <span className="text-ink-3">
              The call does not execute. It becomes a pending action and waits for a human.
            </span>
          )}
        </p>
      </div>

      {/* The record the agent leaves behind. */}
      <div className="mt-6">
        <div className="u-label u-label-ink">Written to trace_steps for every call</div>
        <ul className="u-mono mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[0.6875rem] text-ink-3">
          {["trace_id", "tool_name", "args", "decision", "output", "duration_ms", "timestamp"].map(
            (f) => (
              <li key={f}>{f}</li>
            ),
          )}
        </ul>
      </div>
    </figure>
  );
}

/** NULL. The gate, as it stands in the repository. */
function GateApparatus() {
  const revised = gateStudies.filter((s) => s.revisions).length;
  const rounds = gateStudies.reduce((n, s) => n + (s.revisions ?? 0), 0);
  return (
    <figure className="border-t border-rule pt-6">
      <figcaption className="u-label u-label-ink">
        Pre-production gate · {gateStudies.length} studies · gate recorded CLOSED, 26 Aug 2026
      </figcaption>
      <ol className="mt-5 grid gap-x-8 sm:grid-cols-2">
        {gateStudies.map((s, i) => (
          <Reveal
            as="li"
            key={s.n}
            delay={i * 30}
            className="flex items-baseline gap-3 border-b border-rule-faint py-2.5"
          >
            <span className="u-mono text-[0.6875rem] tabular-nums text-ink-3">{s.n}</span>
            <span className="flex-1 text-[0.92rem]">{s.name}</span>
            {s.revisions ? (
              <span className="u-mono text-[0.625rem] tracking-[0.1em] text-ochre">
                ×{s.revisions + 1}
              </span>
            ) : null}
            <span className="u-mono text-[0.625rem] tracking-[0.13em] text-oxide">{s.verdict}</span>
          </Reveal>
        ))}
      </ol>
      <p className="u-label mt-5">
        {revised} of the {gateStudies.length} were sent back and revised — {rounds} rounds in
        total — before a verdict was recorded. None of the rejected versions failed to run.
      </p>
      <blockquote className="mt-8 border-l-2 border-oxide pl-6">
        <p className="u-serif-italic text-[clamp(1.05rem,1.6vw,1.35rem)] leading-[1.5]">
          “No implementation is approved solely because it technically works.”
        </p>
        <cite className="u-label mt-3 block not-italic">
          NULL · docs/17-null-visual-bible.md, quoted in the review loop
        </cite>
      </blockquote>
    </figure>
  );
}

/** The phishing model, explaining one decision — its own output, quoted. */
function AttributionApparatus() {
  const max = Math.max(...limeExample.contributions.map((c) => c.weight));
  return (
    <figure className="border-t border-rule pt-6">
      <figcaption className="u-label u-label-ink">
        One decision, explained · LIME output quoted from the repository
      </figcaption>

      <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <code className="u-mono break-all text-[0.8rem] text-ink-2">{limeExample.url}</code>
        <span className="u-mono text-[0.6875rem] tracking-[0.13em] text-oxide">
          → {limeExample.verdict}
        </span>
      </div>

      <ul className="mt-6 space-y-4">
        {limeExample.contributions.map((c, i) => (
          <Reveal as="li" key={c.feature} delay={i * 90}>
            <div className="flex items-baseline justify-between gap-4">
              <span className="u-mono text-[0.75rem]">
                {c.feature} <span className="text-ink-3">= {c.value}</span>
              </span>
              <span className="u-mono text-[0.75rem] tabular-nums text-oxide">
                +{c.weight.toFixed(2)}
              </span>
            </div>
            {/* A measured bar, not a decorative meter: the axis is the weight. */}
            <div className="mt-2 h-px w-full bg-rule">
              <div
                className="h-px bg-oxide transition-[width] duration-700 ease-record"
                style={{ width: `${(c.weight / max) * 100}%` }}
              />
            </div>
            <div className="mt-1.5 text-[0.82rem] text-ink-3">{c.reading}</div>
          </Reveal>
        ))}
      </ul>

      <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-rule pt-5">
        {metrics.map((m) => (
          <div key={m.k}>
            <dt className="u-label">{m.k}</dt>
            <dd className="u-mono mt-1 text-[0.95rem] tabular-nums">{m.v}</dd>
          </div>
        ))}
      </dl>
    </figure>
  );
}

/** The reproducibility chain, as a chain. */
function PipelineApparatus() {
  const stages = [
    { n: "Data", d: "DVC, versioned to Google Cloud Storage" },
    { n: "Train", d: "VGG16 transfer learning, Keras" },
    { n: "Track", d: "MLflow via DagsHub, model registered" },
    { n: "Package", d: "Docker image, pushed to Docker Hub" },
    { n: "Serve", d: "Flask under Gunicorn, behind Nginx on EC2" },
    { n: "Repeat", d: "GitHub Actions, on change" },
  ];
  return (
    <figure className="border-t border-rule pt-6">
      <figcaption className="u-label u-label-ink">
        The chain · each stage exists so the next one can be re-derived
      </figcaption>
      <ol className="mt-5">
        {stages.map((s, i) => (
          <Reveal
            as="li"
            key={s.n}
            delay={i * 70}
            className="grid grid-cols-[2.5rem_1fr] items-baseline gap-4 border-b border-rule-faint py-3.5"
          >
            <span className="u-mono text-[0.6875rem] tabular-nums text-oxide">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>
              <span className="text-[0.95rem]">{s.n}</span>
              <span className="u-mono ml-3 text-[0.72rem] text-ink-3">{s.d}</span>
            </span>
          </Reveal>
        ))}
      </ol>
    </figure>
  );
}

const APPARATUS = {
  policy: PolicyApparatus,
  gate: GateApparatus,
  attribution: AttributionApparatus,
  pipeline: PipelineApparatus,
  system: null,
} as const;

/* ── the exhibit ─────────────────────────────────────────────────────────── */

function ExhibitPlate({ ex }: { ex: Exhibit }) {
  const Apparatus = APPARATUS[ex.kind];

  return (
    <article
      id={`exhibit-${ex.id}`}
      aria-labelledby={`exhibit-${ex.id}-title`}
      className="scroll-mt-16 border-t border-rule-strong pt-8"
    >
      <div className="grid gap-x-12 gap-y-10 lg:grid-cols-12">
        {/* Margin: index, dates, stack, sources. The apparatus of the plate. */}
        <div className="lg:col-span-3">
          <Reveal className="lg:sticky lg:top-16">
            <div className="u-mono text-[clamp(2rem,4vw,2.75rem)] leading-none text-oxide">
              {ex.index}
            </div>
            <div className="u-label mt-4">{ex.period}</div>
            <div className="mt-1.5 text-[0.82rem] leading-[1.5] text-ink-3">{ex.status}</div>

            <div className="mt-8 space-y-4">
              {ex.stack.map((g) => (
                <div key={g.group}>
                  <div className="u-label">{g.group}</div>
                  <div className="u-mono mt-1.5 text-[0.72rem] leading-[1.65] text-ink-2">
                    {g.items.join(" · ")}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Body */}
        <div className="lg:col-span-9">
          <Reveal>
            <h3
              id={`exhibit-${ex.id}-title`}
              className="u-display text-[clamp(1.9rem,4vw,3.1rem)]"
            >
              {ex.title}
            </h3>
            <p className="u-lede mt-5 max-w-[42rem]">{ex.standfirst}</p>
          </Reveal>

          {/* Progressive disclosure: the questions a reader actually asks,
              in the order they ask them. */}
          <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {ex.reading.map((r, i) => (
              <Reveal key={r.q} delay={i * 70}>
                <dt className="u-label u-label-ink border-t border-rule pt-4">{r.q}</dt>
                <dd className="mt-3 text-[0.95rem] leading-[1.62] text-ink-2">{r.a}</dd>
              </Reveal>
            ))}
          </dl>

          {Apparatus ? (
            <Reveal delay={120} className="mt-14">
              <Apparatus />
            </Reveal>
          ) : null}

          <Reveal className="mt-12 border-t border-rule pt-6">
            <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:gap-10">
              <span className="u-label u-label-ink sm:w-28">Not demonstrated</span>
              <p className="max-w-[38rem] text-[0.9rem] leading-[1.6] text-ink-3">{ex.limit}</p>
            </div>
            <div className="mt-6">
              <SourceList sources={ex.sources} />
            </div>
          </Reveal>
        </div>
      </div>
    </article>
  );
}

export function Exhibits() {
  return (
    <section id="exhibits" className="scroll-mt-16 py-24 sm:py-32" aria-labelledby="exhibits-title">
      <Shell>
        <ChapterHead
          index="03"
          kicker="Exhibits"
          title="Six pieces of work, each shown through its own apparatus."
          standfirst="A policy engine is not a card and an approval gate is not a screenshot. Each exhibit below is presented using the instrument the project actually contains, because that instrument is the evidence."
        />
        <div className="mt-20 space-y-28">
          {exhibits.map((ex) => (
            <ExhibitPlate key={ex.id} ex={ex} />
          ))}
        </div>
        <Rule strong className="mt-24" />
      </Shell>
    </section>
  );
}
