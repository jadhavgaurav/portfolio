"use client";

import { useEffect, useState } from "react";

const CHAPTERS = [
  { id: "finding", n: "01", label: "The finding" },
  { id: "ledger", n: "02", label: "The chronology" },
  { id: "exhibits", n: "03", label: "Exhibits" },
  { id: "recursion", n: "04", label: "The recursion" },
  { id: "unclaimed", n: "05", label: "Not claimed" },
  { id: "colophon", n: "06", label: "Colophon" },
];

/**
 * Navigation as a document index rather than a navbar.
 *
 * On wide screens it sits in the left margin, where a section mark belongs.
 * On narrow screens it collapses to a single fixed rule at the top carrying
 * the current chapter and a progress fill — one line, always answering
 * "where am I", never covering the text.
 *
 * Position is tracked with one IntersectionObserver over the chapter
 * headings; there are no scroll listeners.
 */
export function IndexNav() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const targets = CHAPTERS.map((c) => document.getElementById(c.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (!targets.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-12% 0px -70% 0px", threshold: 0 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  const index = CHAPTERS.findIndex((c) => c.id === active);
  const current = index >= 0 ? CHAPTERS[index] : null;

  return (
    <>
      {/* Wide: the margin index. */}
      <nav
        aria-label="Document index"
        className="u-noprint pointer-events-none fixed left-0 top-1/2 z-30 hidden -translate-y-1/2 pl-[var(--gutter)] xl:block"
      >
        <ol className="pointer-events-auto space-y-2.5">
          {CHAPTERS.map((c) => {
            const on = c.id === active;
            return (
              <li key={c.id}>
                <a
                  href={`#${c.id}`}
                  aria-current={on ? "true" : undefined}
                  className="group flex items-center gap-3"
                >
                  <span
                    aria-hidden="true"
                    className={`block h-px transition-all duration-500 ease-record ${
                      on ? "w-7 bg-oxide" : "w-3 bg-ink-3 group-hover:w-5"
                    }`}
                  />
                  <span
                    className={`u-mono text-[0.625rem] tracking-[0.13em] transition-colors duration-300 ${
                      on ? "text-oxide" : "text-ink-3 group-hover:text-ink-2"
                    }`}
                  >
                    <span className="tabular-nums">{c.n}</span>
                    <span
                      className={`ml-2 inline-block overflow-hidden align-middle whitespace-nowrap transition-[max-width,opacity] duration-500 ease-record ${
                        on ? "max-w-[9rem] opacity-100" : "max-w-0 opacity-0 group-hover:max-w-[9rem] group-hover:opacity-100"
                      }`}
                    >
                      {c.label}
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Narrow: one rule, one label. Appears only once the reader has left
          the title plate, so the opening composition stays uninterrupted. */}
      <div
        className={`u-noprint fixed inset-x-0 top-0 z-30 bg-paper transition-transform duration-500 ease-record xl:hidden ${
          current ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex items-baseline justify-between px-[var(--gutter)] py-2.5">
          <a href="#record-title" className="u-label u-label-ink">
            G. V. Jadhav — record of work
          </a>
          <span className="u-label tabular-nums">
            {index >= 0 ? index + 1 : 0}/{CHAPTERS.length}
          </span>
        </div>
        {/* Progress. The track carries its own ground so the unfilled part
            never lets the section behind show through. */}
        <div aria-hidden="true" className="h-px bg-rule-faint">
          <div
            className="h-px origin-left bg-oxide transition-transform duration-500 ease-record"
            style={{ transform: `scaleX(${index >= 0 ? (index + 1) / CHAPTERS.length : 0})` }}
          />
        </div>
      </div>
    </>
  );
}
