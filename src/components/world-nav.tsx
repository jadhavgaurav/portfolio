"use client";

import { useEffect, useMemo } from "react";
import { EXHIBIT_BY_ENTITY } from "@/data/exhibits";
import { DISCOVERIES, LENS_ORDER, discoveryFor } from "@/world/discovery";
import { UI } from "@/world/palette";
import { scrollAtEntity } from "@/world/sequence";
import { dayToLabel, entities, type Entity } from "@/world/telemetry";
import { subject } from "@/data/record";

/**
 * Navigation.
 *
 * Not a navbar over a page — there are no pages. It is an index of the world,
 * and choosing an entry travels there: the visitor is moved along the same
 * spine they would have walked, so position always means the same thing.
 *
 * The design's rule is that the visitor must always be able to answer where
 * am I, what can I explore, and how do I move. The persistent HUD answers the
 * first; this answers the other two.
 */

const ERAS: { name: string; from: number; to: number }[] = [
  { name: "Coursework", from: 0, to: 500 },
  { name: "Apparatus", from: 500, to: 620 },
  { name: "The first crush", from: 620, to: 800 },
  { name: "Products", from: 800, to: 1180 },
  { name: "The second crush", from: 1180, to: 1300 },
];

export function WorldNav({
  discovered,
  onTravel,
  onFocus,
  open,
  setOpen,
}: {
  discovered: string[];
  onTravel: (scroll: number) => void;
  onFocus: (entity: Entity) => void;
  /** Owned by the experience, so the core and the index are never both up. */
  open: boolean;
  setOpen: (v: boolean) => void;
}) {

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  /* Only structures worth travelling to: fragments are scenery. */
  const grouped = useMemo(() => {
    const listed = entities
      .filter((e) => e.type !== "FRAGMENT")
      .sort((a, b) => a.firstDay - b.firstDay);
    return ERAS.map((era) => ({
      era,
      items: listed.filter((e) => e.firstDay >= era.from && e.firstDay < era.to),
    })).filter((g) => g.items.length);
  }, []);

  const found = discovered.length;
  /* The world holds forty structures; the fragments are scenery and are not
     travel targets, so the count says how many of them this list actually
     offers rather than implying it lists them all. */
  const listedCount = grouped.reduce((n, g) => n + g.items.length, 0);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        data-focus-return="index"
        aria-expanded={open}
        aria-label={open ? "Close world index" : "Open world index"}
        className="u-mono pointer-events-auto fixed left-5 top-5 z-40 inline-flex min-h-[44px] min-w-[44px] items-center justify-center border px-4 text-[0.6rem] uppercase tracking-[0.18em] transition-colors sm:left-8 sm:top-7"
        style={{
          borderColor: open ? UI.borderActive : UI.border,
          color: open ? UI.textHighlight : UI.textSecondary,
          background: "rgba(6,8,9,0.72)",
        }}
      >
        {open ? "Close" : "Index"}
      </button>

      {open && (
        <nav
          aria-label="World index"
          className="fixed inset-0 z-30 overflow-y-auto overscroll-contain px-5 pb-12 pt-20 sm:px-8"
          style={{ background: "rgba(6,8,9,0.95)" }}
        >
          <div className="mx-auto max-w-[52rem]">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2
                className="u-display text-[clamp(1.5rem,4vw,2.2rem)]"
                style={{ color: UI.textPrimary }}
              >
                Where you can go
              </h2>
              <span className="u-mono text-[0.65rem]" style={{ color: UI.textMuted }}>
                {found} of {LENS_ORDER.length} lenses · {listedCount} of {entities.length} structures
              </span>
            </div>

            <p
              className="mt-3 max-w-[34rem] text-[0.88rem] leading-[1.55]"
              style={{ color: UI.textMuted }}
            >
              Every entry is a repository. Choosing one travels there along the
              same route you would have walked. A structure with a record can
              be opened once you are standing at it.
            </p>

            {grouped.map(({ era, items }) => (
              <section key={era.name} className="mt-9">
                <h3
                  className="u-mono pb-2 text-[0.6rem] uppercase tracking-[0.2em]"
                  style={{ color: UI.textMuted, borderBottom: `1px solid ${UI.border}` }}
                >
                  {era.name}
                </h3>
                <ul>
                  {items.map((e) => {
                    const lens = discoveryFor(e.id)?.lens;
                    const got = discovered.includes(e.id);
                    const record = EXHIBIT_BY_ENTITY[e.id];
                    return (
                      <li
                        key={e.id}
                        className="flex flex-col items-stretch gap-x-4 sm:flex-row sm:flex-wrap sm:items-center"
                        style={{ borderBottom: `1px solid ${UI.border}` }}
                      >
                        <button
                          onClick={() => {
                            onTravel(scrollAtEntity(e.id));
                            setOpen(false);
                          }}
                          className="u-mono flex min-h-[44px] flex-1 items-center break-all pt-1 text-left text-[0.8rem] underline-offset-4 hover:underline sm:break-normal sm:pt-0"
                          style={{ color: UI.textHighlight }}
                        >
                          {e.name}
                        </button>
                        {/* Stacked under the name on a phone: the aligned
                            columns that keep the list readable on a wide
                            screen were forcing the names to hyphenate over
                            three lines at 390px. */}
                        <span className="flex items-center gap-4 pb-2 sm:contents sm:pb-0">
                          <span
                            className="u-mono flex-1 text-[0.6rem] uppercase tracking-[0.14em] sm:w-[13rem] sm:flex-none sm:shrink-0 sm:text-right"
                            style={{ color: UI.textMuted }}
                          >
                            {e.type} · {e.commits} · {dayToLabel(e.firstDay)}
                          </span>
                          <span
                            className="u-mono text-[0.6rem] tracking-[0.14em] sm:w-[6.5rem] sm:shrink-0"
                            style={{ color: got ? "#8cbcae" : UI.textMuted }}
                          >
                            {lens ?? ""}
                          </span>
                          <span className="sm:w-[5.5rem] sm:shrink-0">
                            {record && (
                              <button
                                onClick={() => {
                                  onTravel(scrollAtEntity(e.id));
                                  onFocus(e);
                                  setOpen(false);
                                }}
                                className="u-mono inline-flex min-h-[44px] items-center border px-3 text-[0.55rem] uppercase tracking-[0.16em]"
                                style={{ borderColor: UI.border, color: UI.textSecondary }}
                              >
                                Record
                              </button>
                            )}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}

            <section className="mt-10">
              <h3
                className="u-mono pb-2 text-[0.6rem] uppercase tracking-[0.2em]"
                style={{ color: UI.textMuted, borderBottom: `1px solid ${UI.border}` }}
              >
                Lenses
              </h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {DISCOVERIES.map((d) => {
                  const got = discovered.includes(d.entity);
                  return (
                    <li key={d.lens} className="text-[0.8rem]">
                      <span
                        className="u-mono mr-2 text-[0.65rem] tracking-[0.14em]"
                        style={{ color: got ? "#8cbcae" : UI.textMuted }}
                      >
                        {d.lens}
                      </span>
                      <span style={{ color: got ? UI.textSecondary : UI.textMuted }}>
                        {got ? d.grants : "Not yet resolved."}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* The core states these too, but the core is at the end of the
                route. Someone navigating by keyboard or by screen reader
                should not have to walk the whole world to find an address. */}
            <section className="mt-10">
              <h3
                className="u-mono pb-2 text-[0.6rem] uppercase tracking-[0.2em]"
                style={{ color: UI.textMuted, borderBottom: `1px solid ${UI.border}` }}
              >
                Reach him
              </h3>
              <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                {[
                  { label: "Email", href: `mailto:${subject.email}` },
                  { label: "GitHub", href: subject.github },
                  { label: "LinkedIn", href: subject.linkedin },
                  { label: "Curriculum vitae", href: "/resume/resume.pdf" },
                ].map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target={l.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer noopener"
                      className="u-mono border-b pb-1 text-[0.7rem] uppercase tracking-[0.14em]"
                      style={{ color: UI.textHighlight, borderColor: UI.border }}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </nav>
      )}
    </>
  );
}
