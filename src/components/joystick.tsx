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
 *
 * Everything that drives the character lives in refs and is written straight
 * from the event handlers. The stick's position used to be computed inside a
 * setState updater that also wrote the input struct as a side effect, and
 * React runs queued updaters at render time, not when the event fires: the
 * pointermove that always lands a millisecond before the finger lifts was
 * still sitting in the queue when the release zeroed the input, then ran
 * during the next render and wrote the last stick position straight back.
 * The stick vanished, the ids were cleared, and the character kept running
 * with nothing left on screen to stop it. State here is for drawing only.
 */

const RADIUS = 58;
/** Pixels the thumb has to travel from where it landed before the character
 *  moves at all. A thumb pressed still on glass wanders a few pixels on its
 *  own, and with no dead zone every one of those was a step. */
const DEAD = 8;
/** Deflection, as a fraction of the reach past the dead zone, at which a
 *  walk becomes a run. Inside it the stick is analog: half way is half
 *  walking pace. */
const RUN_AT = 0.85;

interface Stick {
  ox: number;
  oy: number;
  dx: number;
  dy: number;
}

export function Joystick({ input }: { input: React.MutableRefObject<Input> }) {
  const [stick, setStick] = useState<Stick | null>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const moveId = useRef<number | null>(null);
  const lookId = useRef<number | null>(null);
  const lookLast = useRef<{ x: number; y: number } | null>(null);

  const stopMoving = useCallback(() => {
    moveId.current = null;
    origin.current = null;
    setStick(null);
    const i = input.current;
    i.forward = 0;
    i.strafe = 0;
    i.run = false;
  }, [input]);

  const stopLooking = useCallback(() => {
    lookId.current = null;
    lookLast.current = null;
  }, []);

  const release = useCallback(
    (pointerId: number | null) => {
      if (pointerId === null || pointerId === moveId.current) stopMoving();
      if (pointerId === null || pointerId === lookId.current) stopLooking();
    },
    [stopMoving, stopLooking],
  );

  const onDown = useCallback(
    (e: React.PointerEvent) => {
      if ((e.target as HTMLElement)?.closest("button, a, [role=dialog], nav")) return;
      // Only a real press. A pen hovering or a mouse moving with no button
      // down also reports here on some devices.
      if (e.button !== 0 && e.pointerType !== "touch") return;
      const half = window.innerWidth / 2;
      // Capture, so this pointer keeps reporting to us even if the thumb
      // slides over the jump button or off the edge of the screen. Without
      // it the release lands on whatever is on top, our handler never runs,
      // and the character keeps running with no way to stop it.
      try {
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      } catch {
        // The pointer can already be gone by the time this runs; the
        // window-level safety net below still catches its release.
      }
      // A new touch on a side always takes it over, rather than only being
      // accepted while that side's pointer id is still null. A release that
      // never reaches us used to leave the old id parked forever: every
      // later touch on that side was silently ignored because the slot
      // looked occupied, and the last real input just kept being read. The
      // thumb going down again is as clear a signal as a release ever was.
      if (e.clientX < half) {
        if (moveId.current !== null && moveId.current !== e.pointerId) stopMoving();
        moveId.current = e.pointerId;
        origin.current = { x: e.clientX, y: e.clientY };
        setStick({ ox: e.clientX, oy: e.clientY, dx: 0, dy: 0 });
      } else {
        lookId.current = e.pointerId;
        lookLast.current = { x: e.clientX, y: e.clientY };
      }
    },
    [stopMoving],
  );

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerId === moveId.current && origin.current) {
        let dx = e.clientX - origin.current.x;
        let dy = e.clientY - origin.current.y;
        const d = Math.hypot(dx, dy);
        if (d > RADIUS) {
          dx = (dx / d) * RADIUS;
          dy = (dy / d) * RADIUS;
        }
        const i = input.current;
        if (d <= DEAD) {
          i.forward = 0;
          i.strafe = 0;
          i.run = false;
        } else {
          // How far past the dead zone, 0 at its edge and 1 at the rim.
          const reach = Math.min(1, (d - DEAD) / (RADIUS - DEAD));
          // Full walking pace arrives at the run threshold, so the stick
          // never has to jump from a slow walk straight to a sprint.
          const pace = Math.min(1, reach / RUN_AT);
          i.strafe = (dx / d) * pace;
          i.forward = (-dy / d) * pace;
          // Push the stick to the edge and you are running. No run button.
          i.run = reach >= RUN_AT;
        }
        setStick({ ox: origin.current.x, oy: origin.current.y, dx, dy });
      } else if (e.pointerId === lookId.current && lookLast.current) {
        input.current.lookX += (e.clientX - lookLast.current.x) * 0.0058;
        input.current.lookY += (e.clientY - lookLast.current.y) * 0.0058;
        lookLast.current = { x: e.clientX, y: e.clientY };
      }
    },
    [input],
  );

  const onUp = useCallback(
    (e: React.PointerEvent) => {
      release(e.pointerId);
    },
    [release],
  );

  /* Belt and braces. Pointer capture covers the thumb sliding somewhere else;
     these cover the cases where the browser takes the pointer away without
     ever telling us it went up — a system gesture, a notification, the tab
     going to the background, the phone locking. Every one of them used to
     leave the stick stuck on.

     The window-level pointerup and pointercancel are keyed by id rather than
     clearing everything: a release that reaches the window but somehow not
     the overlay still frees exactly the finger that lifted, and only that
     one, so the other thumb keeps what it was doing. */
  useEffect(() => {
    const stopAll = () => release(null);
    const stopOne = (e: PointerEvent) => release(e.pointerId);
    /* Android fires contextmenu on a long press even with touch-action none,
       and the thumb is still firmly on the glass when it does. Releasing on
       it dropped the stick mid-hold; the finger then dragged nothing until
       it was lifted and put down again. The overlay prevents the menu, so
       only a contextmenu that actually opened one — a real right-click on
       a hybrid — still counts as the pointer having been taken away. */
    const onMenu = (e: MouseEvent) => {
      if (!e.defaultPrevented) release(null);
    };
    window.addEventListener("pointerup", stopOne);
    window.addEventListener("pointercancel", stopOne);
    window.addEventListener("blur", stopAll);
    window.addEventListener("contextmenu", onMenu);
    document.addEventListener("visibilitychange", stopAll);
    return () => {
      window.removeEventListener("pointerup", stopOne);
      window.removeEventListener("pointercancel", stopOne);
      window.removeEventListener("blur", stopAll);
      window.removeEventListener("contextmenu", onMenu);
      document.removeEventListener("visibilitychange", stopAll);
      /* Unmounting is a release too. The controls come down the moment a
         panel or the map goes up, and a thumb still on the stick at that
         instant never reports its lift to a component that is gone. The
         input struct outlives this component, so what it was last told is
         what the character keeps doing once the panel closes — which used
         to be a run with nothing on screen to stop it. */
      release(null);
    };
  }, [release]);

  return (
    <>
      <div
        className="fixed inset-0 z-10 touch-none select-none"
        style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none" }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        // Fires whenever this pointer's capture ends, including the cases
        // where a mobile browser drops it without ever sending pointerup —
        // the specific gap the takeover in onDown otherwise has to wait for
        // a second touch to notice.
        onLostPointerCapture={onUp}
        onContextMenu={(e) => e.preventDefault()}
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
              background: input.current.run ? "rgba(255,183,3,0.9)" : "rgba(255,183,3,0.6)",
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
          {/* On a ground, like the desktop key reminder: bare text at this
              size was unreadable over the lighter districts. */}
          <span
            className="u-mono inline-block border px-3 py-1.5 text-[0.58rem] uppercase tracking-[0.18em]"
            style={{
              color: "#d3c39a",
              borderColor: "rgba(240,223,174,0.22)",
              background: "rgba(20,14,6,0.72)",
            }}
          >
            Left thumb to walk, push to run · right to look
          </span>
        </aside>
      )}

      {/* Jump. The one thing a thumb stick cannot express. Fires on the
          press rather than the click that follows the release: a jump that
          waits for the thumb to come back up reads as lag. */}
      <aside aria-label="Jump control">
        <button
          type="button"
          onPointerDown={(e) => {
            // No focus ring, no synthetic click, no double-tap zoom.
            e.preventDefault();
            input.current.jump = true;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              input.current.jump = true;
            }
          }}
          aria-label="Jump"
          // Lower on a short landscape screen: the map block under the compass
          // reaches most of the way down a phone held sideways, and at
          // bottom-24 the button sat underneath its mute control.
          className="u-btn u-mono fixed bottom-24 right-6 z-30 flex h-[68px] w-[68px] touch-manipulation select-none items-center justify-center rounded-full border text-[0.55rem] uppercase tracking-[0.14em] [@media(max-height:520px)]:bottom-6"
          style={{
            borderColor: "rgba(240,223,174,0.35)",
            color: "#e8dcb8",
            background: "rgba(20,14,6,0.48)",
            WebkitTouchCallout: "none",
          }}
        >
          Jump
        </button>
      </aside>
    </>
  );
}
