'use client';

import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BANDS, CORE_DEPTH, VEIN_RUNS, centreOf, bandAtDepth, inVoid, fmtDepth } from '@/lib/core';
import { TOTALS, type VeinId } from '@/data/strata';
import { useTravel, depthToScroll } from './use-travel';
import { DepthGauge, type GaugeHandle } from './depth-gauge';
import { SvgColumn, type SvgHandle } from './svg-column';
import { Marginalia } from './marginalia';
import { Specimen } from './specimen';
import type { ColumnScene } from './column-scene';

type Mode = 'section' | 'veins';

function canRunWebGL() {
  if (typeof window === 'undefined') return false;
  if (window.innerWidth < 860) return false;                       // the drawing is better on a phone
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (mem !== undefined && mem < 4) return false;                  // low-memory devices get the drawing
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

export default function World() {
  const [mounted, setMounted] = useState(false);
  const [webgl, setWebgl] = useState(false);
  const [mode, setMode] = useState<Mode>('section');
  const [isolated, setIsolated] = useState<VeinId | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [voidState, setVoidState] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const [logOpen, setLogOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<ColumnScene | null>(null);
  const gaugeRef = useRef<GaugeHandle>(null);
  const svgRef = useRef<SvgHandle>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const collarRef = useRef<HTMLDivElement>(null);
  const marginRef = useRef<HTMLDivElement>(null);
  const focus = useRef(0);

  const [pageHeight, setPageHeight] = useState(0);
  const travel = useTravel(open === null && !logOpen);

  // live refs so the frame loop never reads stale state
  const st = useRef({ mode, isolated, activeIndex, open });
  st.current = { mode, isolated, activeIndex, open };

  useLayoutEffect(() => {
    setMounted(true);
    setWebgl(canRunWebGL());
    document.documentElement.dataset.world = 'on';
    document.documentElement.classList.add('no-native-bar');
    const measure = () => setPageHeight(depthToScroll(CORE_DEPTH) + window.innerHeight + 2);
    measure();
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      delete document.documentElement.dataset.world;
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.log = logOpen ? 'open' : 'closed';
  }, [logOpen]);

  /* ── the scene, imported only when it will actually be used ─────── */
  useEffect(() => {
    if (!webgl || !canvasRef.current) return;
    let scene: ColumnScene | null = null;
    let cancelled = false;

    import('./column-scene').then(({ ColumnScene }) => {
      if (cancelled || !canvasRef.current) return;
      scene = new ColumnScene(canvasRef.current);
      scene.resize(window.innerWidth, window.innerHeight);
      scene.onPick = (b) => setOpen(b.index);
      sceneRef.current = scene;
    });

    const onResize = () => {
      sceneRef.current?.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelled = true;
      window.removeEventListener('resize', onResize);
      scene?.dispose();
      sceneRef.current = null;
    };
  }, [webgl]);

  /* ── one loop ───────────────────────────────────────────────────── */
  useEffect(() => {
    if (!mounted) return;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const moving = travel.step();
      const depth = travel.depth.current;

      const wantFocus = st.current.open !== null ? 1 : 0;
      if (Math.abs(focus.current - wantFocus) > 0.002) {
        focus.current += (wantFocus - focus.current) * (travel.reduced ? 1 : 0.09);
      } else focus.current = wantFocus;

      gaugeRef.current?.set(depth);
      svgRef.current?.set(depth);

      // the surface note and the collar plate fade with depth, not with scroll events
      if (surfaceRef.current) {
        const o = Math.max(0, 1 - depth / 1.5);
        surfaceRef.current.style.opacity = String(o);
        surfaceRef.current.style.pointerEvents = o < 0.05 ? 'none' : 'auto';
      }
      if (collarRef.current) {
        const o = Math.max(0, Math.min(1, (depth - (CORE_DEPTH - 3.2)) / 1.6));
        collarRef.current.style.opacity = String(o);
        collarRef.current.style.pointerEvents = o < 0.5 ? 'none' : 'auto';
      }
      // One reading slot, one occupant. The margin takes over after the surface
      // note has fully dissolved and stands down before the collar plate begins
      // to appear — the boundaries are hard, so the two never ghost through each
      // other during a long jump.
      if (marginRef.current) {
        const entering = Math.max(0, Math.min(1, (depth - 1.55) / 0.85));
        const o = depth > CORE_DEPTH - 3.4 ? 0 : entering;
        marginRef.current.style.opacity = String(o);
        marginRef.current.style.visibility = o < 0.02 ? 'hidden' : 'visible';
      }

      const scene = sceneRef.current;
      if (scene) {
        scene.depth = depth;
        scene.mode = st.current.mode;
        scene.isolated = st.current.isolated;
        scene.activeIndex = st.current.activeIndex;
        scene.focus = focus.current;
        if (moving || focus.current !== wantFocus) scene.invalidate();
        scene.frame();
      }

      const band = bandAtDepth(depth);
      if (band.index !== st.current.activeIndex) setActiveIndex(band.index);
      const v = inVoid(depth);
      setVoidState((prev) => (prev === v ? prev : v));
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mounted, travel]);

  /* ── travel helpers ─────────────────────────────────────────────── */
  const goToIndex = useCallback((i: number) => {
    const b = BANDS[Math.max(0, Math.min(BANDS.length - 1, i))];
    travel.jumpTo(centreOf(b));
  }, [travel]);

  const step = useCallback((dir: 1 | -1) => {
    const pool = isolated ? BANDS.filter((b) => b.layer.veins.includes(isolated)) : BANDS;
    const here = travel.target.current;
    const next = dir === 1
      ? pool.find((b) => centreOf(b) > here + 0.05)
      : [...pool].reverse().find((b) => centreOf(b) < here - 0.05);
    if (next) travel.jumpTo(centreOf(next));
  }, [isolated, travel]);

  /* ── keys ───────────────────────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        if (open !== null) setOpen(null);
        else if (logOpen) setLogOpen(false);
        else if (isolated) setIsolated(null);
        else if (mode === 'veins') setMode('section');
        return;
      }
      if (open !== null || logOpen) return;

      switch (e.key) {
        case 'ArrowDown': case 'j': e.preventDefault(); step(1); break;
        case 'ArrowUp':   case 'k': e.preventDefault(); step(-1); break;
        case 'Enter': e.preventDefault(); setOpen(activeIndex); break;
        case 'Home': e.preventDefault(); travel.jumpTo(0); break;
        case 'End': e.preventDefault(); travel.jumpTo(CORE_DEPTH); break;
        case 'v': case 'V': setMode((m) => (m === 'veins' ? 'section' : 'veins')); break;
        case 'l': case 'L': setLogOpen(true); break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, logOpen, isolated, mode, activeIndex, step, travel]);

  useEffect(() => {
    document.body.style.overflow = open !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const band = BANDS[activeIndex];

  return (
    <>
      {/* the page is as deep as the core */}
      <div style={{ height: pageHeight }} aria-hidden />

      <div className="bore-shadow" aria-hidden />
      {mounted && webgl && <div className="reading-head" aria-hidden />}

      {/* the object */}
      {mounted && webgl && (
        <canvas ref={canvasRef} className="fixed inset-0 z-10 h-full w-full" aria-hidden />
      )}
      {mounted && !webgl && (
        <div className="section-strip" aria-hidden>
          <SvgColumn
            ref={svgRef}
            activeIndex={activeIndex}
            isolated={isolated}
            showVeins={mode === 'veins'}
            onPick={setOpen}
          />
        </div>
      )}

      {mounted && (
        <>
          {mode === 'section' && (
            <Marginalia ref={marginRef} band={band} inVoid={voidState} onOpen={() => setOpen(activeIndex)} />
          )}
          <DepthGauge ref={gaugeRef} activeIndex={activeIndex} onSeek={travel.jumpTo} />
          {mode === 'section' && <Surface ref={surfaceRef} onDescend={() => travel.jumpTo(1.6)} />}
          <Collar ref={collarRef} />
          <Utilities
            mode={mode}
            isolated={isolated}
            onMode={(m) => { setMode(m); if (m === 'section') setIsolated(null); }}
            onLog={() => setLogOpen(true)}
          />
          {mode === 'veins' && (
            <VeinIndex
              isolated={isolated}
              activeIndex={activeIndex}
              onSelect={(v) => {
                setIsolated(v);
                if (v) {
                  const first = BANDS.find((b) => b.layer.veins.includes(v));
                  if (first) travel.jumpTo(centreOf(first));
                }
              }}
              onGoTo={(i) => travel.jumpTo(centreOf(BANDS[i]))}
              onOpen={setOpen}
            />
          )}
          <AnimatePresence>
            {open !== null && (
              <Specimen
                band={BANDS[open]}
                onClose={() => setOpen(null)}
                onGoTo={(i) => { setOpen(null); goToIndex(i); }}
              />
            )}
          </AnimatePresence>
          {logOpen && <LogCloser onClose={() => setLogOpen(false)} />}
        </>
      )}
    </>
  );
}

/* ── the surface ──────────────────────────────────────────────────── */

const Surface = forwardRef<HTMLDivElement, { onDescend: () => void }>(
  function Surface({ onDescend }, ref) {
    return (
      <div ref={ref} className="reading-slot fixed inset-0 z-30 flex items-center" style={{ opacity: 1 }}>
        <div className="max-w-[34rem]">
          <div className="mono mb-8">
            Core sample · {TOTALS.layers} layers · {fmtDepth(CORE_DEPTH)} of record
          </div>
          <h1
            className="mb-7 text-[length:clamp(2.6rem,1.6rem+4.2vw,5.2rem)] font-light leading-[0.94] tracking-[-0.026em]"
            style={{ fontFamily: 'var(--serif)' }}
          >
            Gaurav Vijay<br />Jadhav
          </h1>
          <p className="prose-field mb-4 text-[length:clamp(1rem,0.94rem+0.4vw,1.2rem)]">
            Everything he has published since May 2023, drilled out and stood on end.
            Each band is one repository. Thickness is how much is in it. The gaps are
            months where nothing was pushed.
          </p>
          <p className="prose-field field-note mb-9">
            Depth is time. Going down goes backwards.
          </p>
          <button onClick={onDescend} className="mono mono-11 text-[var(--ink)]">
            <span className="ink-link" style={{ backgroundSize: '100% 1px' }}>Begin descent</span>
            <span aria-hidden className="ml-3">↓</span>
          </button>
          <p className="mono mt-10 hidden leading-[1.9] md:block">
            ↑ ↓ move between layers · enter opens one<br />
            v reads the veins · l opens the written record
          </p>
          <p className="mono mt-10 leading-[1.9] md:hidden">
            Tap a band to open it · the log holds the whole record
          </p>
        </div>
      </div>
    );
  }
);

/* ── the collar plate at the base of the hole ─────────────────────── */

const Collar = forwardRef<HTMLDivElement>(function Collar(_props, ref) {
  return (
    <div
      ref={ref}
      className="reading-slot fixed inset-0 z-30 flex items-center"
      style={{ opacity: 0 }}
    >
      <div className="max-w-[32rem]">
        <div className="mono mb-6">Base of hole · {fmtDepth(CORE_DEPTH)} · May 2023</div>
        <p
          className="mb-8 text-[length:clamp(1.2rem,1rem+0.9vw,1.7rem)] font-light leading-[1.36]"
          style={{ fontFamily: 'var(--serif)' }}
        >
          Below this there is no record. The account was created on 24 May 2023 and
          the first thing pushed was a Twitter clone with two classmates’ names on it.
        </p>
        <p className="prose-field field-note mb-9">
          Two months later he made a four-kilobyte file called Jarvis. He is still
          working on it.
        </p>
        <div className="flex flex-col items-start gap-2">
          <a className="util text-[var(--ink)]" href="mailto:gaurav.vjadhav01@gmail.com">
            gaurav.vjadhav01@gmail.com
          </a>
          <a className="util" href="https://github.com/jadhavgaurav" target="_blank" rel="noreferrer noopener">
            github.com/jadhavgaurav ↗
          </a>
          <a className="util" href="/resume/resume.pdf">Résumé (PDF)</a>
        </div>
      </div>
    </div>
  );
});

/* ── utilities ────────────────────────────────────────────────────── */

function Utilities({
  mode, isolated, onMode, onLog,
}: { mode: Mode; isolated: VeinId | null; onMode: (m: Mode) => void; onLog: () => void }) {
  return (
    <div className="fixed bottom-0 left-0 z-40 flex flex-wrap items-center gap-x-6 gap-y-2 py-6 pl-[var(--gutter)] pr-[calc(var(--strip)+var(--gutter)+0.75rem)]">
      <button
        onClick={() => onMode('section')}
        className="util"
        style={{ color: mode === 'section' ? 'var(--ink)' : undefined }}
        aria-pressed={mode === 'section'}
      >
        Section
      </button>
      <button
        onClick={() => onMode('veins')}
        className="util"
        style={{ color: mode === 'veins' ? 'var(--ink)' : undefined }}
        aria-pressed={mode === 'veins'}
      >
        Veins{isolated ? ` — ${isolated}` : ''}
      </button>
      <button onClick={onLog} className="util">Field log</button>
      <a className="util" href="https://github.com/jadhavgaurav" target="_blank" rel="noreferrer noopener">GitHub</a>
      <a className="util" href="mailto:gaurav.vjadhav01@gmail.com">Contact</a>
    </div>
  );
}

/* ── vein index ───────────────────────────────────────────────────── */

function VeinIndex({
  isolated, activeIndex, onSelect, onGoTo, onOpen,
}: {
  isolated: VeinId | null;
  activeIndex: number;
  onSelect: (v: VeinId | null) => void;
  onGoTo: (i: number) => void;
  onOpen: (i: number) => void;
}) {
  const run = VEIN_RUNS.find((r) => r.vein.id === isolated);

  return (
    <motion.aside
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 0.61, 0.36, 1] }}
      className="reading-slot fixed left-0 top-0 z-30 flex h-full w-full items-center"
      aria-label="Veins"
    >
      <div className="w-full max-w-[29rem]">
        {!run ? (
          <>
            <div className="mono rule-b mb-5 pb-2">Ideas that cut across the column</div>
            <ul className="mb-6 space-y-2">
              {VEIN_RUNS.map((r) => (
                <li key={r.vein.id}>
                  <button
                    onClick={() => onSelect(r.vein.id)}
                    className="group flex w-full items-baseline gap-4 text-left"
                  >
                    <span
                      className="text-[length:var(--t-26)] leading-tight text-[var(--ink-2)] transition-colors group-hover:text-[var(--ink)]"
                      style={{ fontFamily: 'var(--serif)' }}
                    >
                      {r.vein.name}
                    </span>
                    <span className="mono ml-auto">{r.count} layers</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="prose-field field-note">
              The rock is transparent now. Pick one and the column keeps only the
              layers it runs through.
            </p>
          </>
        ) : (
          <>
            <div className="mono mb-4 flex items-baseline gap-4">
              <button onClick={() => onSelect(null)} className="text-[var(--ink)]">
                <span aria-hidden>←</span> All veins
              </button>
              <span className="ml-auto">{run.count} layers · {run.top.toFixed(1)}–{run.base.toFixed(1)} m</span>
            </div>
            <h2
              className="mb-4 text-[length:var(--t-42)] font-normal leading-none tracking-[-0.017em]"
              style={{ fontFamily: 'var(--serif)' }}
            >
              {run.vein.name}
            </h2>
            <p className="prose-field field-note rule-b mb-5 pb-5">{run.vein.reading}</p>
            <ol className="max-h-[38vh] space-y-1.5 overflow-y-auto pr-2">
              {run.bands.map((b) => (
                <li key={b.layer.id}>
                  <button
                    onClick={() => (b.index === activeIndex ? onOpen(b.index) : onGoTo(b.index))}
                    className="flex w-full items-baseline gap-4 text-left"
                  >
                    <span className="mono w-[5.4rem] shrink-0">{fmtDepth(centreOf(b))}</span>
                    <span
                      className="text-[length:var(--t-16)] transition-colors"
                      style={{
                        fontFamily: 'var(--serif)',
                        color: b.index === activeIndex ? 'var(--ink)' : 'var(--ink-2)',
                      }}
                    >
                      {b.layer.title}
                    </span>
                    <span className="mono ml-auto shrink-0">{b.layer.created.slice(0, 7)}</span>
                  </button>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </motion.aside>
  );
}

function LogCloser({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      className="mono mono-11 fixed right-[var(--gutter)] top-6 z-[60] text-[var(--ink)]"
    >
      Close log <span aria-hidden>— Esc</span>
    </button>
  );
}
