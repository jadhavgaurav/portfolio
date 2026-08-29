'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CORE_DEPTH } from '@/lib/core';

/** Pixels of page per metre of record. */
export const PX_PER_M = 156;

export const depthToScroll = (d: number) => d * PX_PER_M;

/**
 * Travel down the column.
 *
 * Scroll position is the raw input; the reading head follows it with damping so
 * the object has weight. The damped value lives in a ref and is read inside the
 * render loop — it never causes a React render. React only hears about the
 * *active band*, which changes a few dozen times across the whole descent.
 */
export function useTravel(enabled: boolean) {
  const depth = useRef(0);
  const target = useRef(0);
  const settled = useRef(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const read = () => {
      target.current = Math.max(0, Math.min(CORE_DEPTH, window.scrollY / PX_PER_M));
      settled.current = false;
    };
    read();
    window.addEventListener('scroll', read, { passive: true });
    return () => window.removeEventListener('scroll', read);
  }, [enabled]);

  /** Advance one frame. Returns true while still moving. */
  const step = useCallback(() => {
    const d = target.current - depth.current;
    if (reduced || Math.abs(d) < 0.0008) {
      depth.current = target.current;
      const wasMoving = !settled.current;
      settled.current = true;
      return wasMoving;
    }
    depth.current += d * 0.115;
    return true;
  }, [reduced]);

  const jumpTo = useCallback((metres: number) => {
    window.scrollTo({
      top: depthToScroll(metres),
      behavior: reduced ? 'auto' : 'smooth',
    });
  }, [reduced]);

  // Stable identity: the frame loop depends on this object, and rebuilding the
  // loop on every state change would tear down and re-request the animation
  // frame dozens of times during a descent.
  return useMemo(
    () => ({ depth, target, step, jumpTo, reduced }),
    [step, jumpTo, reduced]
  );
}
