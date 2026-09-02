"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Input } from "@/world/Player";

/**
 * Touch controls.
 *
 * A phone has no WASD, and the previous build's answer to that was to make
 * the whole thing a scroll — which is why it played like a page. Left thumb
 * moves, right half of the screen looks. Both are absolute-position sticks
 * that appear where the thumb lands rather than at a fixed spot, because a
 * fixed stick is only reachable if the phone happens to be the size you
 * designed for.
 */

const RADIUS = 58;

export function Joystick({ input }: { input: React.MutableRefObject<Input> }) {
  const [stick, setStick] = useState<{ ox: number; oy: number; dx: number; dy: number } | null>(
    null,
  );
  const moveId = useRef<number | null>(null);
  const lookId = useRef<number | null>(null);
  const lookLast = useRef<{ x: number; y: number } | null>(null);

  const onDown = useCallback(
    (e: React.PointerEvent) => {
      if ((e.target as HTMLElement)?.closest("button, a, [role=dialog], nav")) return;
      const half = window.innerWidth / 2;
      // A new touch on a side always takes it over, rather than only being
      // accepted while that side's pointer id is still null. A release that
      // never reaches us — the one mobile Pointer Events bug the capture and
      // the window-level safety net below can't fully rule out — used to
      // leave the old id parked here forever: every later touch on that
      // side was silently ignored because the slot looked occupied, and the
      // last real input (often mid-run) just kept being read. The thumb
      // going down again is as clear a signal as a release ever was.
      if (e.clientX < half) {
        moveId.current = e.pointerId;
        // Capture, so this pointer keeps reporting to us even if the thumb
        // slides over the jump button or off the edge of the screen. Without
        // it the release lands on whatever is on top, our handler never runs,
        // and the character keeps running with no way to stop it.
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        setStick({ ox: e.clientX, oy: e.clientY, dx: 0, dy: 0 });
      } else {
        lookId.current = e.pointerId;
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        lookLast.current = { x: e.clientX, y: e.clientY };
      }
    },
    [],
  );

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerId === moveId.current) {
        setStick((s) => {
          if (!s) return s;
          let dx = e.clientX - s.ox;
          let dy = e.clientY - s.oy;
          const d = Math.hypot(dx, dy);
          if (d > RADIUS) {
            dx = (dx / d) * RADIUS;
            dy = (dy / d) * RADIUS;
          }
          const i = input.current;
          i.strafe = dx / RADIUS;
          i.forward = -dy / RADIUS;
          // Push the stick to the edge and you are running. No run button.
          // Two thirds sounds generous but is well inside where an actual
          // thumb rests once it's pressed down at all, so running was
          // effectively the only speed the stick could reach.
          i.run = Math.hypot(dx, dy) / RADIUS > 0.85;
          return { ...s, dx, dy };
        });
      } else if (e.pointerId === lookId.current && lookLast.current) {
        input.current.lookX += (e.clientX - lookLast.current.x) * 0.0058;
        input.current.lookY += (e.clientY - lookLast.current.y) * 0.0058;
        lookLast.current = { x: e.clientX, y: e.clientY };
      }
    },
    [input],
  );

  const release = useCallback(
    (pointerId: number | null) => {
      if (pointerId === null || pointerId === moveId.current) {
        moveId.current = null;
        setStick(null);
        const i = input.current;
        i.forward = 0;
        i.strafe = 0;
        i.run = false;
      }
      if (pointerId === null || pointerId === lookId.current) {
        lookId.current = null;
        lookLast.current = null;
      }
    },
    [input],
  );

  /* Belt and braces. Pointer capture covers the thumb sliding somewhere else;
     these cover the cases where the browser takes the pointer away without
     ever telling us it went up — a system gesture, a notification, the tab
     going to the background, the phone locking. Every one of them used to
     leave the stick stuck on. */
  useEffect(() => {
    const stop = () => release(null);
    window.addEventListener("pointercancel", stop);
    window.addEventListener("blur", stop);
    window.addEventListener("contextmenu", stop);
    document.addEventListener("visibilitychange", stop);
    return () => {
      window.removeEventListener("pointercancel", stop);
      window.removeEventListener("blur", stop);
      window.removeEventListener("contextmenu", stop);
      document.removeEventListener("visibilitychange", stop);
    };
  }, [release]);

  const onUp = useCallback(
    (e: React.PointerEvent) => {
      release(e.pointerId);
    },
    [release],
  );


  return (
    <>
      <div
        className="fixed inset-0 z-10 touch-none"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        // Fires whenever this pointer's capture ends, including the cases
        // where a mobile browser drops it without ever sending pointerup —
        // the specific gap the takeover in onDown otherwise has to wait for
        // a second touch to notice.
        onLostPointerCapture={onUp}
        aria-hidden="true"
      />

      {stick && (
        <div
          className="pointer-events-none fixed z-20"
          style={{ left: stick.ox - RADIUS, top: stick.oy - RADIUS }}
          aria-hidden="true"
        >
          <div
            className="rounded-full border"
            style={{
              width: RADIUS * 2,
              height: RADIUS * 2,
              borderColor: "rgba(255,183,3,0.32)",
              background: "rgba(20,14,6,0.32)",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 46,
              height: 46,
              left: RADIUS - 23 + stick.dx,
              top: RADIUS - 23 + stick.dy,
              background: "rgba(255,183,3,0.6)",
              boxShadow: "0 0 18px rgba(255,183,3,0.4)",
            }}
          />
        </div>
      )}

      {!stick && (
        <aside
          aria-label="Touch control hint"
          className="pointer-events-none fixed inset-x-0 bottom-7 z-20 text-center"
        >
          <span
            className="u-mono text-[0.58rem] uppercase tracking-[0.18em]"
            style={{ color: "#b8a678" }}
          >
            Left thumb to walk · right to look
          </span>
        </aside>
      )}

      {/* Jump. The one thing a thumb stick cannot express. */}
      <aside aria-label="Jump control">
        <button
          onClick={() => {
            input.current.jump = true;
          }}
          aria-label="Jump"
          className="u-btn u-mono fixed bottom-24 right-6 z-30 flex h-[68px] w-[68px] items-center justify-center rounded-full border text-[0.55rem] uppercase tracking-[0.14em]"
          style={{
            borderColor: "rgba(240,223,174,0.35)",
            color: "#e8dcb8",
            background: "rgba(20,14,6,0.48)",
          }}
        >
          Jump
        </button>
      </aside>
    </>
  );
}
