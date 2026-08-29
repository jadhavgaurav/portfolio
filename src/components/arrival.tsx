"use client";

import { measures, subject } from "@/data/record";
import { EvidenceMark, RegistrationMarks, Reveal, Rule, Shell } from "./primitives";

const FILED = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
}).format(Date.parse(subject.lastEntry));

/**
 * Arrival.
 *
 * The convention this deliberately inverts: a portfolio opens with the name
 * and treats the work as supporting material. Here the name is filing
 * metadata and the headline is the finding — stamped, in the same breath, as
 * an interpretation rather than a boast. Establishing the evidence system in
 * the first screen is the whole point of the composition.
 */
export function Arrival() {
  return (
    <header className="relative min-h-[100svh] pb-16 pt-6 sm:pb-24" aria-labelledby="record-title">
      <RegistrationMarks />
      <Shell className="flex min-h-[calc(100svh-6rem)] flex-col">
        {/* Filing header */}
        <Reveal className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 pt-4">
          <span className="u-label u-label-ink">Record of work · 01</span>
          <span className="u-label">
            {subject.filedAs} · {subject.located}
          </span>
          <span className="u-label">Filed {FILED}</span>
        </Reveal>

        <Rule strong className="mt-4" />

        {/* The finding, as the headline. */}
        <div className="grid flex-1 content-start items-start gap-y-10 pb-10 pt-[8vh] lg:grid-cols-12 lg:gap-x-12 lg:pt-[11vh]">
          <div className="lg:col-span-8">
            <Reveal delay={80}>
              <h1
                id="record-title"
                className="u-display text-[clamp(2.6rem,7.4vw,6.2rem)]"
              >
                He builds systems
                <br />
                that are required
                <br />
                <span className="u-serif-italic">to justify themselves.</span>
              </h1>
            </Reveal>
          </div>

          <aside className="lg:col-span-4 lg:pt-4">
            <Reveal delay={200}>
              <EvidenceMark of="read" />
              <p className="mt-3 max-w-[26rem] text-[0.95rem] leading-[1.65] text-ink-2">
                A pattern read across forty repositories. It is an argument, not
                a proof, and the case against it is set out with the case for.
              </p>
              <p className="mt-6 max-w-[26rem] text-[0.95rem] leading-[1.65] text-ink-2">
                Everything else on this page is held to a stricter standard.
                Statements of fact carry the commit, file, DOI or page behind
                them. Statements a portfolio would normally make, that this
                record cannot support, are named at the end and left unmade.
              </p>
            </Reveal>
          </aside>
        </div>

        {/* Measures. Real counts, each with the caveat attached. */}
        <div className="mt-auto">
          <Rule />
          <dl className="grid grid-cols-2 gap-px lg:grid-cols-4">
            {measures.map((m, i) => (
              <Reveal key={m.label} delay={260 + i * 70} className="py-5 pr-6 sm:py-6">
                <dt className="sr-only">{m.label}</dt>
                <dd>
                  <span className="u-mono block text-[clamp(1.9rem,3.4vw,2.9rem)] leading-none tabular-nums">
                    {m.value}
                  </span>
                  <span className="u-label mt-3 block max-w-[15rem]">{m.label}</span>
                  <span className="mt-2 block max-w-[15rem] text-[0.78rem] leading-[1.5] text-ink-3">
                    {m.note}
                  </span>
                </dd>
              </Reveal>
            ))}
          </dl>
          <Rule strong />
          <Reveal delay={520}>
            <a
              href="#finding"
              className="u-label u-label-ink flex items-center justify-between py-4 transition-colors duration-300 hover:text-oxide"
            >
              <span>Begin at the finding</span>
              <span aria-hidden="true">↓</span>
            </a>
          </Reveal>
        </div>
      </Shell>
    </header>
  );
}
