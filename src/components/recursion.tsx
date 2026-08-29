"use client";

import { lineage, lineageReading } from "@/data/lineage";
import { ChapterHead, Cite, EvidenceMark, Reveal, Shell } from "./primitives";

/**
 * The recursion.
 *
 * Eight attempts at one idea, laid on a single vertical line so the gaps and
 * the survivals are visible at a glance. Attempts that did not survive are
 * drawn hollow — the same marker vocabulary the evidence system uses for a
 * claim that is not made.
 */
export function Recursion() {
  return (
    <section id="recursion" className="scroll-mt-16 py-24 sm:py-32" aria-labelledby="recursion-title">
      <Shell>
        <ChapterHead
          index="04"
          kicker="The recursion"
          title="He started the same project eight times."
          standfirst="Between September 2024 and August 2026 the record shows one idea — a personal assistant — begun, abandoned and begun again. Six of the eight went nowhere. The sequence is the most informative thing in the archive, and it is not on his CV."
        />

        <ol className="mt-16 border-l border-rule pl-6 sm:pl-10">
          {lineage.map((a, i) => (
            <Reveal
              as="li"
              key={a.name}
              delay={i * 60}
              className="relative pb-12 last:pb-0"
            >
              {/* Marker: filled if it survived into the next attempt. */}
              <span
                aria-hidden="true"
                className={`absolute -left-[1.6875rem] top-[0.45rem] block h-2.5 w-2.5 rounded-full border sm:-left-[2.9375rem] ${
                  a.survived ? "border-oxide bg-oxide" : "border-ink-3 bg-transparent"
                }`}
              />
              <div className="grid gap-x-8 gap-y-3 lg:grid-cols-[8rem_1fr]">
                <div>
                  <div className="u-label u-label-ink tabular-nums">{a.from}</div>
                  <div className="u-mono mt-1 text-[0.72rem] text-ink-3">
                    {a.commits} commit{a.commits === 1 ? "" : "s"}
                  </div>
                </div>
                <div>
                  <h3 className="u-mono text-[0.95rem] tracking-[0.02em]">
                    {a.name}
                    {!a.survived && (
                      <span className="u-label ml-3 align-middle">did not survive</span>
                    )}
                  </h3>
                  <p className="mt-2.5 max-w-[42rem] text-[0.95rem] leading-[1.6] text-ink-2">
                    {a.gained}
                  </p>
                  <p className="mt-2 max-w-[42rem] text-[0.88rem] leading-[1.6] text-ink-3">
                    {a.ended}
                  </p>
                  <div className="mt-3">
                    <Cite source={a.source} />
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-16 border-t border-rule pt-8">
          <div className="grid gap-x-8 gap-y-5 lg:grid-cols-[8rem_1fr]">
            <div>
              <EvidenceMark of="read" />
            </div>
            <p className="u-lede max-w-[46rem]">{lineageReading}</p>
          </div>
        </Reveal>
      </Shell>
    </section>
  );
}
