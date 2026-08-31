"use client";

import { useEffect, useRef } from "react";
import { DISTRICT_GATES, type Waypoint } from "@/world/mapdata";
import type { PlayerState } from "@/world/Player";

/**
 * The compass strip.
 *
 * A map you have to open is a map you stop opening. This is the part that
 * stays: a heading tape across the top of the screen with the eight districts
 * marked at their true bearings, so from anywhere in the world you can turn
 * until the district you want slides into the centre and walk.
 *
 * Drawn to a canvas on its own frame for the same reason the minimap is —
 * this updates every frame and must never cost a React render.
 */

const H = 34;

export function Compass({
  state,
  waypoint,
}: {
  state: React.MutableRefObject<PlayerState>;
  waypoint: Waypoint | null;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const wp = useRef<Waypoint | null>(waypoint);
  wp.current = waypoint;

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let width = 0;

    const size = () => {
      width = Math.min(720, Math.max(280, window.innerWidth - 40));
      el.width = width * dpr;
      el.height = H * dpr;
      el.style.width = `${width}px`;
      el.style.height = `${H}px`;
    };
    size();
    window.addEventListener("resize", size);

    const ctx = el.getContext("2d");
    if (!ctx) {
      window.removeEventListener("resize", size);
      return;
    }

    let raf = 0;
    /** Degrees of heading visible across the whole strip. */
    const SPAN = 150;

    const draw = () => {
      const s = state.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, H);

      // Heading, in degrees, clockwise from north.
      const heading = ((-s.camYaw * 180) / Math.PI + 360) % 360;
      const pxPerDeg = width / SPAN;

      /** Where a bearing lands on the strip, or null if it is off it. */
      const at = (bearing: number) => {
        const d = ((bearing - heading + 540) % 360) - 180;
        if (Math.abs(d) > SPAN / 2) return null;
        return width / 2 + d * pxPerDeg;
      };

      /* Labels are placed through a claim list rather than drawn wherever
         their bearing lands. Eight districts plus four cardinals plus the
         waypoint distance inside a 150-degree window collide constantly —
         "NOT", "JAVA" and "90m" were printed on top of each other. Whatever
         claims the space first keeps it, and the order below is the priority:
         waypoint, then districts, then cardinals. */
      const claimed: [number, number][] = [];
      const claim = (x: number, halfWidth: number) => {
        for (const [a, b] of claimed) {
          if (x + halfWidth > a && x - halfWidth < b) return false;
        }
        claimed.push([x - halfWidth, x + halfWidth]);
        return true;
      };

      ctx.fillStyle = "rgba(6,8,9,0.62)";
      ctx.fillRect(0, 0, width, H);
      ctx.strokeStyle = "rgba(226,232,240,0.14)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, H - 0.5);
      ctx.lineTo(width, H - 0.5);
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Ticks. Every ten degrees, always drawn — they never collide.
      for (let b = 0; b < 360; b += 10) {
        const x = at(b);
        if (x === null) continue;
        const cardinal = b % 90 === 0;
        ctx.strokeStyle = cardinal ? "rgba(226,232,240,0.6)" : "rgba(226,232,240,0.22)";
        ctx.beginPath();
        ctx.moveTo(x, cardinal ? 6 : 11);
        ctx.lineTo(x, 15);
        ctx.stroke();
      }

      // The waypoint, first claim on the label row.
      const w = wp.current;
      if (w) {
        const dx = w.x - s.position.x;
        const dz = w.z - s.position.z;
        const bearing = ((Math.atan2(dx, -dz) * 180) / Math.PI + 360) % 360;
        const dist = Math.round(Math.hypot(dx, dz));
        const d = ((bearing - heading + 540) % 360) - 180;
        const off = Math.abs(d) > SPAN / 2;
        const x = off ? (d > 0 ? width - 10 : 10) : width / 2 + d * pxPerDeg;
        ctx.fillStyle = "#8cbcae";
        ctx.beginPath();
        ctx.moveTo(x, 3);
        ctx.lineTo(x + 5, 11);
        ctx.lineTo(x - 5, 11);
        ctx.closePath();
        ctx.fill();
        const text = off ? "" : `${dist}m`;
        if (text) {
          ctx.font = "600 9px ui-monospace, monospace";
          if (claim(x, ctx.measureText(text).width / 2 + 4)) ctx.fillText(text, x, 27);
        }
      }

      // The districts, at their true bearings from where the player stands.
      ctx.font = "600 8px ui-monospace, monospace";
      for (const g of DISTRICT_GATES) {
        const bearing =
          ((Math.atan2(g.cx - s.position.x, -(g.cz - s.position.z)) * 180) / Math.PI + 360) % 360;
        const x = at(bearing);
        if (x === null) continue;
        ctx.fillStyle = g.style.ui;
        ctx.beginPath();
        ctx.moveTo(x, 4);
        ctx.lineTo(x + 3.4, 9);
        ctx.lineTo(x - 3.4, 9);
        ctx.closePath();
        ctx.fill();
        const text = g.style.label.slice(0, 4).toUpperCase();
        if (claim(x, ctx.measureText(text).width / 2 + 4)) ctx.fillText(text, x, 27);
      }

      // Cardinals last: they are recoverable from the ticks alone.
      ctx.font = "600 9px ui-monospace, monospace";
      ctx.fillStyle = "rgba(226,232,240,0.72)";
      for (let b = 0; b < 360; b += 90) {
        const x = at(b);
        if (x === null) continue;
        const text = ["N", "E", "S", "W"][b / 90];
        if (claim(x, 7)) ctx.fillText(text, x, 27);
      }

      // The centre line: what you are actually facing.
      ctx.strokeStyle = "#f2f6f7";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(width / 2, 2);
      ctx.lineTo(width / 2, H - 2);
      ctx.stroke();

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
    };
  }, [state]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-20 flex justify-center pt-3">
      <canvas ref={canvas} aria-hidden="true" />
    </div>
  );
}
