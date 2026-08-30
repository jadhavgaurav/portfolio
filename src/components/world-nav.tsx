"use client";

import { useEffect, useMemo, useState } from "react";
import { EXHIBIT_BY_ENTITY } from "@/data/exhibits";
import { DISCOVERIES, LENS_ORDER, discoveryFor } from "@/world/discovery";
import { UI } from "@/world/palette";
import { scrollAtEntity } from "@/world/sequence";
import { dayToLabel, entities, type Entity } from "@/world/telemetry";

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
}: {
  discovered: string[];
  onTravel: (scroll: number) => void;
  onFocus: (entity: Entity) => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close world index" : "Open world index"}
        className="u-mono pointer-events-auto fixed left-5 top-5 z-40 border px-3 py-2 text-[0.6rem] uppercase tracking-[0.18em] transition-colors sm:left-8 sm:top-7"
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
                {found} of {LENS_ORDER.length} lenses · {entities.length} structures
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
                        className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5"
                        style={{ borderBottom: `1px solid ${UI.border}` }}
                      >
                        <button
                          onClick={() => {
                            onTravel(scrollAtEntity(e.id));
                            setOpen(false);
                          }}
                          className="u-mono flex-1 text-left text-[0.8rem] underline-offset-4 hover:underline"
                          style={{ color: UI.textHighlight }}
                        >
                          {e.name}
                        </button>
                        <span
                          className="u-mono text-[0.6rem] uppercase tracking-[0.14em]"
                          style={{ color: UI.textMuted }}
                        >
                          {e.type} · {e.commits} · {dayToLabel(e.firstDay)}
                        </span>
                        {lens && (
                          <span
                            className="u-mono text-[0.6rem] tracking-[0.14em]"
                            style={{ color: got ? "#8cbcae" : UI.border }}
                          >
                            {lens}
                          </span>
                        )}
                        {record && (
                          <button
                            onClick={() => {
                              onTravel(scrollAtEntity(e.id));
                              onFocus(e);
                              setOpen(false);
                            }}
                            className="u-mono border px-2.5 py-1 text-[0.55rem] uppercase tracking-[0.16em]"
                            style={{ borderColor: UI.border, color: UI.textSecondary }}
                          >
                            Record
                          </button>
                        )}
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
                        style={{ color: got ? "#8cbcae" : UI.border }}
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
          </div>
        </nav>
      )}
    </>
  );
}
