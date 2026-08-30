"use client";

import { useEffect, useRef } from "react";
import { DISTRICTS, districtCentre, styleFor } from "@/world/language";
import { entities } from "@/world/telemetry";
import type { PlayerState } from "@/world/Player";

/**
 * The minimap.
 *
 * There was no map, and a world you cannot navigate is a world you wander in
 * until you give up. This one is drawn to a canvas from the player ref on its
 * own animation frame — a HUD that re-rendered React sixty times a second to
 * move a dot would cost more than the world it sits over.
 *
 * Player-up rather than north-up, because a rotating map is what makes "the
 * blue district is on my left" true without having to do the maths. A fixed
 * north mark keeps the orientation recoverable.
 */

/** Everything fits inside this radius, in world units. */
export const WORLD_RADIUS = 268;

const SIZE = 158;
const PAD = 6;

export function Minimap({
  state,
  onOpenMap,
}: {
  state: React.MutableRefObject<PlayerState>;
  onOpenMap: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    el.width = SIZE * dpr;
    el.height = SIZE * dpr;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    let raf = 0;
    const c = SIZE / 2;
    const r = c - PAD;
    // How much of the world the minimap shows. Not all of it: a map zoomed to
    // the whole world is a map of dots you cannot tell apart.
    const view = 150;
    const k = r / view;

    const draw = () => {
      const s = state.current;
      const px = s.position.x;
      const pz = s.position.z;
      const rot = -s.camYaw;

      ctx.clearRect(0, 0, SIZE, SIZE);

      ctx.save();
      ctx.beginPath();
      ctx.arc(c, c, r, 0, Math.PI * 2);
      ctx.clip();

      ctx.fillStyle = "#0b0e10";
      ctx.fillRect(0, 0, SIZE, SIZE);

      ctx.save();
      ctx.translate(c, c);
      ctx.rotate(rot);

      // Paths from the hub outward, so the routes read even off the edge.
      ctx.strokeStyle = "rgba(226,232,240,0.14)";
      ctx.lineWidth = 1.5;
      for (const d of DISTRICTS) {
        const [dx, dz] = districtCentre(d);
        ctx.beginPath();
        ctx.moveTo((0 - px) * k, (0 - pz) * k);
        ctx.lineTo((dx - px) * k, (dz - pz) * k);
        ctx.stroke();
      }

      // District pads, in their own colour.
      for (const d of DISTRICTS) {
        const [dx, dz] = districtCentre(d);
        const style = styleFor(d.language);
        ctx.beginPath();
        ctx.arc((dx - px) * k, (dz - pz) * k, (d.spread + 16) * k, 0, Math.PI * 2);
        ctx.fillStyle = style.ui + "2e";
        ctx.fill();
        ctx.strokeStyle = style.ui + "cc";
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      // Structures. Size by footprint so the big ones are findable.
      for (const e of entities) {
        const style = styleFor(e.language);
        ctx.beginPath();
        ctx.arc((e.x - px) * k, (e.z - pz) * k, Math.max(1.3, e.mass * k * 1.5), 0, Math.PI * 2);
        ctx.fillStyle = style.ui;
        ctx.fill();
      }

      // The hub.
      ctx.beginPath();
      ctx.arc((0 - px) * k, (0 - pz) * k, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "#8cbcae";
      ctx.fill();

      ctx.restore();

      // The player, always at the centre, always pointing up.
      ctx.save();
      ctx.translate(c, c);
      // Facing relative to the camera, so the arrow shows which way the
      // character is turned inside a view that is already rotated.
      ctx.rotate(s.yaw + rot + Math.PI);
      ctx.beginPath();
      ctx.moveTo(0, -7);
      ctx.lineTo(5, 6);
      ctx.lineTo(0, 3);
      ctx.lineTo(-5, 6);
      ctx.closePath();
      ctx.fillStyle = "#f2f6f7";
      ctx.fill();
      ctx.restore();

      ctx.restore();

      // Rim and north.
      ctx.beginPath();
      ctx.arc(c, c, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(226,232,240,0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();

      const nx = c + Math.sin(rot) * (r - 8);
      const ny = c - Math.cos(rot) * (r - 8);
      ctx.fillStyle = "rgba(226,232,240,0.72)";
      ctx.font = "600 9px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("N", nx, ny);

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [state]);

  /* Where the player is, in the DOM, five times a second.
     Two uses: a screen reader can be told which district it is in rather than
     being handed a canvas, and the position becomes measurable from outside
     — which is how the run-that-would-not-stop was caught, since comparing
     frames cannot distinguish a moving player from a breathing world. */
  useEffect(() => {
    const id = setInterval(() => {
      const s = state.current;
      const el = wrap.current;
      if (!el) return;
      const near = DISTRICTS.map((d) => {
        const [x, z] = districtCentre(d);
        return { d, dist: Math.hypot(s.position.x - x, s.position.z - z) };
      }).sort((a, b) => a.dist - b.dist)[0];
      const where =
        Math.hypot(s.position.x, s.position.z) < 40
          ? "the core"
          : near.dist < near.d.spread + 26
            ? `the ${styleFor(near.d.language).label} district`
            : "open ground";
      el.dataset.pos = `${s.position.x.toFixed(1)},${s.position.z.toFixed(1)}`;
      el.dataset.speed = s.speed01.toFixed(3);
      el.setAttribute("aria-label", `Map. You are in ${where}.`);
    }, 200);
    return () => clearInterval(id);
  }, [state]);

  return (
    <div
      ref={wrap}
      role="group"
      aria-label="Map"
      className="fixed right-4 top-4 z-30 flex flex-col items-end gap-2 sm:right-6 sm:top-6"
    >
      <canvas
        ref={canvas}
        width={SIZE}
        height={SIZE}
        style={{ width: SIZE, height: SIZE }}
        aria-hidden="true"
      />
      <button
        onClick={onOpenMap}
        className="u-mono inline-flex min-h-[44px] items-center border px-4 text-[0.58rem] uppercase tracking-[0.18em]"
        style={{
          borderColor: "rgba(226,232,240,0.28)",
          color: "#cfd6d3",
          background: "rgba(6,8,9,0.6)",
        }}
      >
        Map · M
      </button>
    </div>
  );
}
