"use client";

import { finding, findingEvidence } from "@/data/record";
import { EVIDENCE_DEFINITION, EVIDENCE_LABEL, type EvidenceClass } from "@/lib/provenance";
import { ChapterHead, ClaimBlock, EvidenceMark, Reveal, Rule, Shell } from "./primitives";

const CLASSES: EvidenceClass[] = ["attested", "read", "unclaimed"];

/**
 * The finding, argued.
 *
 * Structure follows the shape of an actual finding: the claim, the reasoning,
 * the supporting evidence enumerated with provenance, and — before the reader
 * has to ask for it — the strongest available reading against it.
 */
export function Finding() {
  return (
    <section id="finding" className="scroll-mt-16 py-24 sm:py-32" aria-labelledby="finding-title">
      <Shell>
        <ChapterHead
          index="01"
          kicker="The finding"
          title="The technologies change completely. The habit does not."
        />

        <div className="mt-14 grid gap-x-12 gap-y-14 lg:grid-cols-12">
          <div className="lg:col-span-7 lg:col-start-1">
            <div className="u-prose">
              {finding.body.map((p, i) => (
                <Reveal as="p" key={i} delay={i * 90} className={i === 0 ? "u-lede" : "mt-5"}>
                  {p}
                </Reveal>
              ))}
            </div>

          </div>

          {/* The legend. Stated once, early and beside the argument, because
              everything after it depends on the reader trusting the marks. */}
          <Reveal delay={280} className="lg:col-span-4 lg:col-start-9">
            <div className="border-t border-rule pt-6">
              <span className="u-label u-label-ink">How to read this document</span>
              <dl className="mt-6 space-y-6">
                {CLASSES.map((c) => (
                  <div key={c}>
                    <dt>
                      <EvidenceMark of={c}>{EVIDENCE_LABEL[c]}</EvidenceMark>
                    </dt>
                    <dd className="mt-2 text-[0.85rem] leading-[1.55] text-ink-3">
                      {EVIDENCE_DEFINITION[c]}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>

          {/* The evidence, enumerated across the full measure so the claims
              carry the weight the argument needs. */}
          <div className="lg:col-span-12">
            <Reveal className="flex items-baseline justify-between border-t border-rule-strong pt-5">
              <span className="u-label u-label-ink">Supporting evidence</span>
              <span className="u-label">{findingEvidence.length} items</span>
            </Reveal>
            <div className="mt-8 grid gap-x-12 gap-y-6 lg:grid-cols-2">
              {findingEvidence.map((c, i) => (
                <Reveal key={c.id} delay={i * 55}>
                  <ClaimBlock claim={c} n={String(i + 1).padStart(2, "0")} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* The case against. */}
        <Reveal className="mt-20">
          <Rule strong />
          <div className="grid gap-x-8 gap-y-6 pt-8 lg:grid-cols-[8rem_1fr]">
            <span className="u-label u-label-ink">Read against</span>
            <p className="max-w-[46rem] text-[1.05rem] leading-[1.6] text-ink-2">
              {finding.counterEvidence}
            </p>
          </div>
        </Reveal>
      </Shell>
    </section>
  );
}
