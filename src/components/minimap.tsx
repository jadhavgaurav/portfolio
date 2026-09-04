"use client";

import { useEffect, useRef } from "react";
import { DISTRICTS, districtCentre, styleFor } from "@/world/language";
import { FOOTPRINTS, POIS, type Waypoint } from "@/world/mapdata";
import type { Progress } from "@/world/progress";
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

const SIZE = 158;
const PAD = 6;

export function Minimap({
  state,
  onOpenMap,
  onOpenLog,
  waypoint,
  visited,
  muted,
  onToggleMute,
  progress,
}: {
  state: React.MutableRefObject<PlayerState>;
  onOpenMap: () => void;
  onOpenLog: () => void;
  waypoint: Waypoint | null;
  visited: string[];
  muted: boolean;
  onToggleMute: () => void;
  progress: Progress;
}) {
  /* Read through refs so the draw loop never depends on a React render. */
  const wp = useRef<Waypoint | null>(waypoint);
  wp.current = waypoint;
  const seen = useRef<Set<string>>(new Set(visited));
  seen.current = new Set(visited);
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

      ctx.fillStyle = "#3b8f2a";
      ctx.fillRect(0, 0, SIZE, SIZE);

      ctx.save();
      ctx.translate(c, c);
      ctx.rotate(rot);

      // Paths from the hub outward, so the routes read even off the edge.
      ctx.strokeStyle = "rgba(240,223,174,0.55)";
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

      // Buildings, as footprints rather than dots — the same shapes the full
      // map draws, so the two read as one place.
      for (const f of FOOTPRINTS) {
        ctx.save();
        ctx.translate((f.x - px) * k, (f.z - pz) * k);
        ctx.rotate(f.rot);
        ctx.fillStyle = f.color;
        ctx.globalAlpha = seen.current.has(`repo:${f.id}`) ? 1 : 0.55;
        const w = Math.max(1.6, f.w * k);
        const h = Math.max(1.2, f.h * k);
        ctx.fillRect(-w, -h, w * 2, h * 2);
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      // Points of interest, so a case study is findable without the full map.
      for (const p of POIS) {
        const x = (p.x - px) * k;
        const y = (p.z - pz) * k;
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle =
          p.kind === "PROJECT"
            ? "#f2b544"
            : p.kind === "WORK"
              ? "#e8834a"
              : p.kind === "CERT"
                ? "#7fd1c4"
                : p.kind === "NPC"
                  ? "#f3e9d2"
                  : "#ffb703";
        ctx.globalAlpha = seen.current.has(p.id) ? 0.45 : 1;
        ctx.beginPath();
        ctx.moveTo(0, -4);
        ctx.lineTo(4, 0);
        ctx.lineTo(0, 4);
        ctx.lineTo(-4, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      // The hub. Kept teal rather than the waypoint's gold — the two need
      // to stay visually distinct on the same small canvas.
      ctx.beginPath();
      ctx.arc((0 - px) * k, (0 - pz) * k, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "#5bc9b3";
      ctx.fill();

      // The waypoint. Inside the map it is drawn in place; outside it is
      // pinned to the rim on its own bearing, because a marker that simply
      // disappears once you walk past it is worse than none.
      const w = wp.current;
      if (w) {
        const wx = (w.x - px) * k;
        const wy = (w.z - pz) * k;
        const d = Math.hypot(wx, wy);
        ctx.fillStyle = "#ffb703";
        ctx.strokeStyle = "#ffb703";
        ctx.lineWidth = 1.6;
        if (d < r - 8) {
          ctx.beginPath();
          ctx.arc(wx, wy, 5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(wx, wy, 1.8, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const a = Math.atan2(wy, wx);
          const ex = Math.cos(a) * (r - 9);
          const ey = Math.sin(a) * (r - 9);
          ctx.save();
          ctx.translate(ex, ey);
          ctx.rotate(a + Math.PI / 2);
          ctx.beginPath();
          ctx.moveTo(0, -5);
          ctx.lineTo(4, 4);
          ctx.lineTo(-4, 4);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }

      ctx.restore();

      // The player, always at the centre, always pointing up.
      ctx.save();
      ctx.translate(c, c);
      /* Facing relative to the camera, so the arrow shows which way the
         character is turned inside a view that is already rotated by `rot`.
         canvas rotate() is clockwise, which mirrors east-west if the facing
         angle is added directly rather than subtracted — the arrow pointed
         the player's true left when they faced right. π − yaw + rot is the
         rotation that actually lands the tip on the world-space facing
         direction after the world's own `rot` twist is accounted for. */
      ctx.rotate(Math.PI - s.yaw + rot);
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
      ctx.strokeStyle = "#8a6d3f";
      ctx.lineWidth = 2;
      ctx.stroke();

      const nx = c + Math.sin(rot) * (r - 8);
      const ny = c - Math.cos(rot) * (r - 8);
      ctx.fillStyle = "#3a2c12";
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
      role="region"
      aria-label="Map"
      // Under the compass, not over it. The compass strip runs the width of
      // the screen up to 720px, and the map used to sit at the same height
      // in the corner: on anything narrower than a wide desktop it covered
      // the strip's right-hand end, and on a phone most of it.
      className="fixed right-4 top-14 z-30 flex flex-col items-end gap-2 sm:right-6 xl:top-6"
    >
      <canvas
        ref={canvas}
        width={SIZE}
        height={SIZE}
        style={{ width: SIZE, height: SIZE }}
        aria-hidden="true"
      />
      <div className="flex gap-2">
        <button
          onClick={onOpenMap}
          className="u-btn u-mono inline-flex min-h-[44px] flex-1 items-center justify-center border px-4 text-[0.58rem] uppercase tracking-[0.18em]"
          style={{
            borderColor: "rgba(240,223,174,0.35)",
            color: "#e8dcb8",
            background: "rgba(20,14,6,0.65)",
          }}
        >
          Map · M
        </button>
        <button
          onClick={onOpenLog}
          className="u-btn u-mono inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 border px-3 text-[0.58rem] uppercase tracking-[0.14em]"
          style={{
            borderColor: progress.complete ? "#a3771f" : "rgba(240,223,174,0.35)",
            color: progress.complete ? "#ffb703" : "#e8dcb8",
            background: "rgba(20,14,6,0.65)",
          }}
        >
          Log
          <span style={{ color: "#8a7a52" }}>
            {progress.found}/{progress.total}
          </span>
        </button>
        <button
          onClick={onToggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
          aria-pressed={muted}
          className="u-btn inline-flex min-h-[44px] min-w-[44px] items-center justify-center border"
          style={{
            borderColor: "rgba(240,223,174,0.35)",
            background: "rgba(20,14,6,0.65)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M2 6h2.4L8 3v10L4.4 10H2z"
              fill={muted ? "#8a7a52" : "#e8dcb8"}
            />
            {!muted && (
              <path
                d="M10.6 5.4a3.6 3.6 0 0 1 0 5.2M12.2 3.8a6 6 0 0 1 0 8.4"
                stroke="#e8dcb8"
                strokeWidth="1.1"
                fill="none"
                strokeLinecap="round"
              />
            )}
            {muted && (
              <path
                d="M10.5 5.5l4 4m0-4l-4 4"
                stroke="#8a7a52"
                strokeWidth="1.1"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}
