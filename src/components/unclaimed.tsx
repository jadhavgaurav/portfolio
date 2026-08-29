"use client";

import { unclaimed } from "@/data/record";
import { ChapterHead, EvidenceMark, Reveal, Shell } from "./primitives";

/**
 * The negative space.
 *
 * The section that makes the rest of the document credible. It is set on the
 * sunk paper stock and given real space rather than tucked into a footer,
 * because naming the limits of the evidence is the strongest thing this
 * record does.
 */
export function Unclaimed() {
  return (
    <section
      id="unclaimed"
      className="scroll-mt-16 bg-paper-sunk py-24 sm:py-32"
      aria-labelledby="unclaimed-title"
    >
      <Shell>
        <ChapterHead
          index="05"
          kicker="Not claimed"
          title="What this record does not show."
          standfirst="A portfolio is normally a list of the strongest available readings. These are the claims a portfolio would make here, and the reason each one is not being made."
        />

        <ol className="mt-16 grid gap-x-12 gap-y-12 lg:grid-cols-2">
          {unclaimed.map((c, i) => (
            <Reveal as="li" key={c.id} delay={i * 70} className="border-t border-rule pt-6">
              <EvidenceMark of="unclaimed" />
              <h3 className="u-display mt-4 text-[clamp(1.35rem,2.4vw,1.9rem)]">{c.text}</h3>
              <p className="mt-4 max-w-[34rem] text-[0.95rem] leading-[1.62] text-ink-2">
                {c.note}
              </p>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-20 border-t border-rule-strong pt-8">
          <p className="u-lede u-prose">
            None of the above is a defect. It is a description of a career that
            is three years old, most of it spent learning in public. The reason
            it appears here in full is that a record which only lists its
            strengths is not a record.
          </p>
        </Reveal>
      </Shell>
    </section>
  );
}
