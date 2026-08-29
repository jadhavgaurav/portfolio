'use client';

import { memo, forwardRef, useImperativeHandle, useRef } from 'react';
import { FORMATION_RANGES, CORE_DEPTH, BANDS, fmtDepth, dateAtDepth, centreOf } from '@/lib/core';

/**
 * The depth gauge.
 *
 * Simultaneously the scrollbar, the map, the chapter index and the formation
 * legend — one mechanism doing four jobs, rather than a nav bar bolted onto a
 * world. Every band is a real button with an accessible name, so the whole
 * column is reachable by keyboard and by screen reader with the canvas
 * uninvolved.
 *
 * The track is memoised and only redraws when the active band changes. The head
 * moves imperatively, so travelling the column costs no React renders at all.
 */

export interface GaugeHandle { set(depth: number): void }

export const DepthGauge = forwardRef<GaugeHandle, {
  activeIndex: number;
  onSeek: (metres: number) => void;
}>(function DepthGauge({ activeIndex, onSeek }, ref) {
  const head = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLDivElement>(null);
  const metres = useRef<HTMLSpanElement>(null);
  const stamp = useRef<HTMLSpanElement>(null);
  const lastDate = useRef('');

  useImperativeHandle(ref, () => ({
    set(depth: number) {
      const pct = (Math.min(depth, CORE_DEPTH) / CORE_DEPTH) * 100;
      const top = `calc(92px + ${pct}%)`;
      if (head.current) head.current.style.top = top;
      if (readout.current) readout.current.style.top = top;
      if (metres.current) metres.current.textContent = fmtDepth(depth);
      const d = dateAtDepth(depth);
      if (stamp.current && d !== lastDate.current) {
        stamp.current.textContent = d;
        lastDate.current = d;
      }
    },
  }), []);

  return (
    <div className="fixed right-0 top-0 z-40 h-full w-[var(--gutter)] min-w-[58px] select-none">
      <div className="absolute inset-y-[92px] right-[calc(var(--gutter)/2)] w-px bg-[var(--rule)]" aria-hidden />
      <GaugeTrack activeIndex={activeIndex} onSeek={onSeek} />

      <div
        ref={head}
        className="pointer-events-none absolute right-[calc(var(--gutter)/2-9px)] h-px w-[19px] bg-[var(--ink)]"
        style={{ top: '92px' }}
        aria-hidden
      />
      <div
        ref={readout}
        className="gauge-readout pointer-events-none absolute right-[calc(var(--gutter)/2+18px)] -translate-y-1/2 text-right"
        style={{ top: '92px' }}
        aria-hidden
      >
        <span ref={metres} className="mono mono-11 block whitespace-nowrap text-[var(--ink)]">0.00 m</span>
        <span ref={stamp} className="mono block whitespace-nowrap" />
      </div>
    </div>
  );
});

const GaugeTrack = memo(function GaugeTrack({
  activeIndex, onSeek,
}: { activeIndex: number; onSeek: (m: number) => void }) {
  const pct = (m: number) => `${(m / CORE_DEPTH) * 100}%`;
  return (
    <>
      <nav aria-label="Formations" className="absolute inset-y-[92px] right-[calc(var(--gutter)/2-3px)] w-[7px]">
        {FORMATION_RANGES.map((r) => (
          <button
            key={r.formation.id}
            onClick={() => onSeek(r.top + 0.4)}
            title={`${r.formation.name} — ${r.formation.span}`}
            className="absolute left-0 w-[7px]"
            style={{ top: pct(r.top), height: pct(r.base - r.top), background: r.formation.pigment, opacity: 0.6 }}
          >
            <span className="sr-only">{r.formation.name}, {r.formation.span}, {r.count} layers</span>
          </button>
        ))}
      </nav>

      <nav aria-label="Layers" className="absolute inset-y-[92px] right-[calc(var(--gutter)/2+7px)] w-[13px]">
        {BANDS.map((b) => (
          <button
            key={b.layer.id}
            onClick={() => onSeek(centreOf(b))}
            className="absolute right-0 h-[8px] w-[13px] -translate-y-1/2"
            style={{ top: pct(centreOf(b)) }}
          >
            <span
              className="block h-px w-full origin-right transition-all duration-200"
              style={{
                background: b.index === activeIndex ? 'var(--ink)' : 'var(--rule)',
                transform: b.index === activeIndex ? 'scaleX(1)' : 'scaleX(0.45)',
              }}
            />
            <span className="sr-only">{b.layer.title}, {b.layer.created}, depth {fmtDepth(centreOf(b))}</span>
          </button>
        ))}
      </nav>
    </>
  );
});
