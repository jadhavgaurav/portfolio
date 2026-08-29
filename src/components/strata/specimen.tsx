'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { SPECIMENS, FORMATIONS, VEINS } from '@/data/strata';
import { fmtDate, fmtSize, fmtDepth, centreOf, bandsInVein, type Band } from '@/lib/core';

/**
 * The cut face.
 *
 * A layer opened is a catalogue entry, not a modal with a thumbnail and two
 * buttons. Prose first, instrument readings in the margin, the repository last
 * — because the repository is where you go when you are already interested.
 */
export function Specimen({
  band,
  onClose,
  onGoTo,
}: {
  band: Band;
  onClose: () => void;
  onGoTo: (index: number) => void;
}) {
  const spec = SPECIMENS[band.layer.id];
  const formation = FORMATIONS.find((f) => f.id === band.layer.formation)!;
  const panel = useRef<HTMLDivElement>(null);

  // Focus trap: the cut face is a place you are inside of.
  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const prev = document.activeElement as HTMLElement | null;
    el.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const f = el.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    el.addEventListener('keydown', onKey);
    return () => { el.removeEventListener('keydown', onKey); prev?.focus?.(); };
  }, []);

  const related = band.layer.veins
    .flatMap((v) => bandsInVein(v).map((b) => ({ b, v })))
    .filter(({ b }) => b.index !== band.index);

  const seen = new Set<number>();
  const unique = related.filter(({ b }) => (seen.has(b.index) ? false : (seen.add(b.index), true))).slice(0, 6);

  return (
    <motion.div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label={`${band.layer.title}, specimen`}
      tabIndex={-1}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.44, ease: [0.22, 0.61, 0.36, 1] }}
      className="fixed inset-0 z-50 overflow-y-auto outline-none"
      style={{ background: 'var(--paper)' }}
    >
      {/* the cut edge — the pigment of the band you opened, full height */}
      <div
        className="fixed left-0 top-0 h-full w-[6px] md:w-[10px]"
        style={{ background: formation.pigment }}
        aria-hidden
      />

      <div className="mx-auto w-full max-w-[68rem] px-[calc(var(--gutter)+10px)] py-[clamp(3rem,9vh,6rem)]">
        <div className="rule-b mb-10 flex flex-wrap items-baseline justify-between gap-4 pb-4">
          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
            <span className="mono" style={{ color: formation.pigment }}>{formation.name}</span>
            <span className="mono">{fmtDepth(centreOf(band))}</span>
            <span className="mono">{fmtDate(band.layer.created)}</span>
          </div>
          <button onClick={onClose} className="mono mono-11 text-[var(--ink)]">
            Close cut <span aria-hidden>— Esc</span>
          </button>
        </div>

        <div className="grid gap-x-[clamp(2rem,5vw,5rem)] gap-y-12 md:grid-cols-[minmax(0,1fr)_15rem]">
          {/* body */}
          <div className="min-w-0">
            <h1
              className="mb-6 text-[length:clamp(2.1rem,1.4rem+3vw,3.9rem)] font-normal leading-[0.99] tracking-[-0.02em]"
              style={{ fontFamily: 'var(--serif)' }}
            >
              {band.layer.title}
            </h1>

            {spec ? (
              <>
                <p
                  className="mb-10 max-w-[42ch] text-[length:clamp(1.15rem,1rem+0.7vw,1.55rem)] font-light leading-[1.42] text-[var(--ink)]"
                  style={{ fontFamily: 'var(--serif)' }}
                >
                  {spec.problem}
                </p>

                <Section label="What is in it">
                  <ul className="space-y-3">
                    {spec.built.map((b, i) => (
                      <li key={i} className="prose-field flex gap-4">
                        <span className="mono mt-[0.42em] shrink-0">{String(i + 1).padStart(2, '0')}</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </Section>

                {spec.friction && (
                  <Section label="Evidence of difficulty">
                    <p className="prose-field field-note mb-2">{spec.friction.observation}</p>
                    <p className="mono">read from — {spec.friction.evidence}</p>
                  </Section>
                )}

                <Section label="Reading">
                  <p className="prose-field">{spec.reading}</p>
                </Section>
              </>
            ) : (
              <>
                <p
                  className="mb-10 max-w-[42ch] text-[length:clamp(1.1rem,1rem+0.6vw,1.45rem)] font-light leading-[1.44] text-[var(--ink)]"
                  style={{ fontFamily: 'var(--serif)' }}
                >
                  {band.layer.note}
                </p>
                {band.layer.description && (
                  <Section label="As described in the repository">
                    <p className="prose-field field-note">“{band.layer.description}”</p>
                  </Section>
                )}
                <Section label="Reading">
                  <p className="prose-field">
                    This layer has no expanded entry. It is thin, or short-lived, or was
                    made to practise something — and it is in the column for exactly that
                    reason. Not everything deposited is a project.
                  </p>
                </Section>
              </>
            )}

            {unique.length > 0 && (
              <Section label="Cut by the same veins">
                <ul className="space-y-2">
                  {unique.map(({ b, v }) => (
                    <li key={b.index}>
                      <button
                        onClick={() => onGoTo(b.index)}
                        className="group flex w-full items-baseline gap-4 text-left"
                      >
                        <span className="mono shrink-0 w-[5.5rem]">
                          {VEINS.find((x) => x.id === v)?.name}
                        </span>
                        <span
                          className="ink-link text-[length:var(--t-16)]"
                          style={{ fontFamily: 'var(--serif)' }}
                        >
                          {b.layer.title}
                        </span>
                        <span className="mono ml-auto shrink-0">{fmtDepth(centreOf(b))}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </div>

          {/* instrument margin */}
          <aside className="mono space-y-5 md:pt-3">
            <Reading k="Repository" v={band.layer.repo} />
            <Reading k="Created" v={fmtDate(band.layer.created)} />
            <Reading k="Last push" v={fmtDate(band.layer.pushed)} />
            <Reading k="Language" v={band.layer.language ?? '—'} />
            <Reading k="Size" v={fmtSize(band.layer.sizeKb)} />
            <Reading k="Stars" v={String(band.layer.stars)} />
            <Reading k="Forks" v={String(band.layer.forks)} />
            <Reading k="Band thickness" v={`${band.thickness.toFixed(2)} m`} />
            <div className="rule-t pt-5">
              <a
                className="util text-[var(--ink)]"
                href={`https://github.com/jadhavgaurav/${band.layer.repo}`}
                target="_blank"
                rel="noreferrer noopener"
              >
                Open on GitHub <span aria-hidden>↗</span>
              </a>
            </div>
          </aside>
        </div>
      </div>
    </motion.div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="rule-t mb-10 pt-5">
      <h2 className="mono mb-4">{label}</h2>
      {children}
    </section>
  );
}

function Reading({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="mono">{k}</div>
      <div className="mono mono-11 mt-0.5 normal-case tracking-[0.04em] text-[var(--ink)]">{v}</div>
    </div>
  );
}
