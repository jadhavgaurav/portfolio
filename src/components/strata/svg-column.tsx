'use client';

import { memo, forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { BANDS, CORE_DEPTH } from '@/lib/core';
import type { VeinId } from '@/data/strata';

/**
 * The column, drawn flat.
 *
 * Not a degraded WebGL scene — the same geometry read as a measured section
 * drawing, which is how a core is actually recorded on paper. Every band, every
 * barren interval. This is what small screens, low-power devices and machines
 * without WebGL are given, and it is meant to be worth having.
 *
 * The drawing is sized to its strip in real pixels rather than scaled by a
 * viewBox, so the bands stay the same width whatever the viewport, and travel
 * moves one <g> transform imperatively.
 */

export interface SvgHandle { set(depth: number): void }

const CORE_W = 46;      // px across the core itself
const SCALE = 46;       // px per metre

export const SvgColumn = forwardRef<SvgHandle, {
  activeIndex: number;
  isolated: VeinId | null;
  showVeins: boolean;
  onPick: (i: number) => void;
}>(function SvgColumn({ activeIndex, isolated, showVeins, onPick }, ref) {
  const host = useRef<HTMLDivElement>(null);
  const g = useRef<SVGGElement>(null);
  const [box, setBox] = useState({ w: 74, h: 800 });

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      setBox({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useImperativeHandle(ref, () => ({
    set(depth: number) {
      g.current?.setAttribute('transform', `translate(0 ${-depth * SCALE})`);
    },
  }), []);

  const cx = box.w / 2;
  const head = box.h / 2;

  return (
    <div ref={host} className="h-full w-full">
      <svg
        width={box.w}
        height={box.h}
        viewBox={`0 0 ${box.w} ${box.h}`}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="relief" x1="0" x2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0.3" />
            <stop offset="0.3" stopColor="#fff" stopOpacity="0.24" />
            <stop offset="0.62" stopColor="#000" stopOpacity="0.05" />
            <stop offset="1" stopColor="#000" stopOpacity="0.36" />
          </linearGradient>
        </defs>

        <g ref={g}>
          <g transform={`translate(0 ${head})`}>
            {/* the bore the core came out of */}
            <line
              x1={cx} x2={cx} y1={-head} y2={CORE_DEPTH * SCALE + head}
              stroke="var(--rule)" strokeWidth="1" strokeDasharray="1 5"
            />
            <Bands
              activeIndex={activeIndex}
              isolated={isolated}
              showVeins={showVeins}
              onPick={onPick}
              x={cx - CORE_W / 2}
            />
          </g>
        </g>

        {/* the reading head, held at the centre of the viewport */}
        <g transform={`translate(0 ${head})`}>
          <line x1={0} x2={box.w} y1={0} y2={0} stroke="var(--ink)" strokeWidth="1" />
          <path d={`M 0 -4 L 6 0 L 0 4 Z`} fill="var(--ink)" />
        </g>
      </svg>
    </div>
  );
});

const Bands = memo(function Bands({
  activeIndex, isolated, showVeins, onPick, x,
}: {
  activeIndex: number; isolated: VeinId | null; showVeins: boolean;
  onPick: (i: number) => void; x: number;
}) {
  return (
    <>
      {BANDS.map((b) => {
        const y = b.top * SCALE;
        const h = Math.max(1.6, b.thickness * SCALE - 1);
        const dim = isolated && !b.layer.veins.includes(isolated);
        const active = b.index === activeIndex;
        return (
          <g key={b.layer.id} onClick={() => onPick(b.index)} style={{ cursor: 'pointer' }}>
            <rect
              x={x} y={y} width={CORE_W} height={h} fill={b.pigment}
              opacity={dim ? 0.14 : showVeins ? 0.34 : active ? 1 : 0.84}
            />
            <rect x={x} y={y} width={CORE_W} height={h} fill="url(#relief)" opacity={dim ? 0.2 : 0.9} />
            {active && (
              <rect
                x={x - 4} y={y - 1.5} width={CORE_W + 8} height={h + 3}
                fill="none" stroke="var(--ink)" strokeWidth="1"
              />
            )}
          </g>
        );
      })}
    </>
  );
});
