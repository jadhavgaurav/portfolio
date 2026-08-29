import { FORMATIONS, VEINS, SPECIMENS, TOTALS, LAYERS } from '@/data/strata';
import { BANDS, CORE_DEPTH, centreOf, fmtDate, fmtSize, fmtDepth } from '@/lib/core';

/**
 * The field log.
 *
 * This is server-rendered on every request and is the complete record: all 46
 * layers, every date, size and note, in depth order. With JavaScript disabled or
 * WebGL unavailable it *is* the site — a measured archive that stands on its own.
 * With the world running it is held aside and opened with the Field Log control.
 *
 * The same markup serving both is deliberate. There is no second, thinner
 * version of the content anywhere.
 */
export function FieldRecord() {
  return (
    <div id="field-record" className="relative z-[1]">
      <div className="mx-auto w-full max-w-[64rem] px-[var(--gutter)] py-[clamp(3rem,8vh,6rem)]">

        <header className="rule-b mb-14 pb-8">
          <p className="mono mb-6">
            Field log · {TOTALS.layers} layers · {fmtDepth(CORE_DEPTH)} of record ·
            {' '}{TOTALS.firstPush} to {TOTALS.lastPush}
          </p>
          <h1
            className="mb-6 text-[length:clamp(2.2rem,1.5rem+3.4vw,4.4rem)] font-light leading-[0.96] tracking-[-0.024em]"
            style={{ fontFamily: 'var(--serif)' }}
          >
            Strata
          </h1>
          <p className="prose-field mb-4 max-w-[52ch] text-[length:clamp(1.05rem,1rem+0.4vw,1.25rem)]">
            The complete public record of Gaurav Vijay Jadhav, read as a section.
            Every mechanical figure below — dates, languages, sizes, stars — is
            transcribed from the GitHub API on 29 August 2026 and is not rounded
            or embellished. The notes are readings, and say so when they are.
          </p>
          <p className="mono">
            Ordered by depth: most recent first, oldest last. The profile reports
            {' '}{TOTALS.publicReposReported} public repositories; the {TOTALS.layers} charted
            here are the non-fork sources. The balance are forks or empty.
          </p>
          <p className="log-only mono mt-6">
            Press Esc to return to the column.
          </p>
        </header>

        {/* ── formations ────────────────────────────────────────── */}
        {FORMATIONS.map((f) => {
          const bands = BANDS.filter((b) => b.layer.formation === f.id);
          if (!bands.length) return null;
          return (
            <section key={f.id} className="mb-20" aria-labelledby={`f-${f.id}`}>
              <div className="rule-t mb-8 flex flex-wrap items-baseline gap-x-6 gap-y-1 pt-4">
                <span aria-hidden className="mt-[0.35em] block h-[9px] w-[9px]" style={{ background: f.pigment }} />
                <h2
                  id={`f-${f.id}`}
                  className="text-[length:var(--t-33)] font-normal leading-none tracking-[-0.015em]"
                  style={{ fontFamily: 'var(--serif)' }}
                >
                  {f.name}
                </h2>
                <span className="mono">{f.span}</span>
                <span className="mono ml-auto">
                  {fmtDepth(Math.min(...bands.map((b) => b.top)))} — {fmtDepth(Math.max(...bands.map((b) => b.top + b.thickness)))}
                </span>
              </div>

              <p className="prose-field mb-10 max-w-[58ch]">{f.reading}</p>

              <ol className="space-y-0">
                {bands.map((b) => {
                  const spec = SPECIMENS[b.layer.id];
                  return (
                    <li key={b.layer.id} className="rule-t grid gap-x-8 gap-y-3 py-6 md:grid-cols-[7.5rem_minmax(0,1fr)]">
                      <div className="mono space-y-1">
                        <div className="text-[var(--ink)]">{fmtDepth(centreOf(b))}</div>
                        <div>{fmtDate(b.layer.created)}</div>
                        <div>{b.layer.language ?? '—'}</div>
                        <div>{fmtSize(b.layer.sizeKb)}</div>
                      </div>

                      <div className="min-w-0">
                        <h3
                          className="mb-1 text-[length:var(--t-26)] font-normal leading-tight tracking-[-0.012em]"
                          style={{ fontFamily: 'var(--serif)' }}
                        >
                          <a
                            className="ink-link"
                            href={`https://github.com/jadhavgaurav/${b.layer.repo}`}
                            target="_blank"
                            rel="noreferrer noopener"
                          >
                            {b.layer.title}
                          </a>
                        </h3>
                        <p className="mono mb-3">
                          {b.layer.repo}
                          {b.layer.veins.length > 0 && (
                            <> · cuts {b.layer.veins.map((v) => VEINS.find((x) => x.id === v)?.name).join(' · ')}</>
                          )}
                        </p>
                        <p className="prose-field field-note mb-4 max-w-[58ch]">{b.layer.note}</p>

                        {spec && (
                          <details className="max-w-[58ch]">
                            <summary className="mono cursor-pointer text-[var(--ink)]">Full entry</summary>
                            <div className="mt-4 space-y-4">
                              <p className="prose-field">{spec.problem}</p>
                              <ul className="space-y-2">
                                {spec.built.map((x, i) => (
                                  <li key={i} className="prose-field flex gap-4">
                                    <span className="mono mt-[0.42em] shrink-0">{String(i + 1).padStart(2, '0')}</span>
                                    <span>{x}</span>
                                  </li>
                                ))}
                              </ul>
                              {spec.friction && (
                                <div>
                                  <p className="prose-field field-note">{spec.friction.observation}</p>
                                  <p className="mono mt-1">read from — {spec.friction.evidence}</p>
                                </div>
                              )}
                              <p className="prose-field">{spec.reading}</p>
                            </div>
                          </details>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}

        {/* ── veins ─────────────────────────────────────────────── */}
        <section className="mb-20" aria-labelledby="veins">
          <h2
            id="veins"
            className="rule-t mb-8 pt-4 text-[length:var(--t-33)] font-normal tracking-[-0.015em]"
            style={{ fontFamily: 'var(--serif)' }}
          >
            Veins
          </h2>
          <p className="prose-field mb-10 max-w-[58ch]">
            Formations are when. Veins are what keeps coming back — ideas that cut
            vertically through the column, connecting layers that are years apart.
          </p>
          <dl className="space-y-0">
            {VEINS.map((v) => {
              const layers = LAYERS.filter((l) => l.veins.includes(v.id));
              return (
                <div key={v.id} className="rule-t grid gap-x-8 gap-y-2 py-6 md:grid-cols-[7.5rem_minmax(0,1fr)]">
                  <dt className="mono">{layers.length} layers</dt>
                  <dd className="min-w-0">
                    <h3
                      className="mb-2 text-[length:var(--t-26)] font-normal leading-tight"
                      style={{ fontFamily: 'var(--serif)' }}
                    >
                      {v.name}
                    </h3>
                    <p className="prose-field mb-3 max-w-[58ch]">{v.reading}</p>
                    <p className="mono">{layers.map((l) => l.repo).join(' · ')}</p>
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>

        {/* ── collar ────────────────────────────────────────────── */}
        <footer className="rule-t pt-8">
          <p className="mono mb-6">Base of hole · {fmtDepth(CORE_DEPTH)} · 26 May 2023</p>
          <p
            className="mb-8 max-w-[46ch] text-[length:clamp(1.15rem,1rem+0.7vw,1.6rem)] font-light leading-[1.38]"
            style={{ fontFamily: 'var(--serif)' }}
          >
            Below this there is no record.
          </p>
          <ul className="space-y-2">
            <li><a className="util text-[var(--ink)]" href="mailto:gaurav.vjadhav01@gmail.com">gaurav.vjadhav01@gmail.com</a></li>
            <li><a className="util" href="https://github.com/jadhavgaurav" target="_blank" rel="noreferrer noopener">github.com/jadhavgaurav ↗</a></li>
            <li><a className="util" href="/resume/resume.pdf">Résumé (PDF)</a></li>
          </ul>
          <p className="mono mt-10 max-w-[58ch] leading-[1.9]">
            Mumbai · Data science and AI engineering · Currently building for
            Fynix Digital and, in the evenings, still rebuilding the assistant.
          </p>
        </footer>
      </div>
    </div>
  );
}
