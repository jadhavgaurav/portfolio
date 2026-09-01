"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { entities } from "@/world/telemetry";
import { factByName } from "@/data/repo-facts";
import {
  DISTRICT_GATES,
  FOOTPRINTS,
  MAP_EXTENT,
  POIS,
  ROADS,
  type Waypoint,
} from "@/world/mapdata";
import type { PlayerState } from "@/world/Player";
import type { Progress } from "@/world/progress";

/**
 * The map.
 *
 * The first one was a diagram: eight circles and a scatter of dots on black.
 * It told you the districts existed and nothing else — you could not see the
 * shape of a district, could not tell one building from another, could not
 * zoom in on anything, and could not mark a place to walk to.
 *
 * This one draws what is actually there. Buildings have footprints and
 * rotations. Roads have casings and a ring joining the gates. Points of
 * interest are typed by shape as well as colour. It pans, it zooms, and
 * clicking anywhere sets a waypoint that the compass and the minimap then
 * carry back into the world, which is the whole reason to open a map rather
 * than a list.
 */

const VIEW = 720;

export function WorldMap({
  state,
  onClose,
  onTravel,
  waypoint,
  onWaypoint,
  visited,
  progress,
}: {
  state: React.MutableRefObject<PlayerState>;
  onClose: () => void;
  onTravel: (x: number, z: number) => void;
  waypoint: Waypoint | null;
  onWaypoint: (w: Waypoint | null) => void;
  visited: string[];
  progress: Progress;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panel = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const dot = useRef<SVGGElement>(null);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const moved = useRef(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.code === "KeyM") onClose();
    };
    window.addEventListener("keydown", onKey);
    panel.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* The player marker tracks live without re-rendering the map. */
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const s = state.current;
      /* The arrow points "screen up" (world -Z) unrotated. SVG's rotate()
         is clockwise in this y-down coordinate system, which mirrors the
         east-west component if the facing angle is added directly — the
         arrow pointed the player's true left when they faced right.
         180 − yaw is the rotation that actually lands the tip on
         (sin(yaw), cos(yaw)), the avatar's real world-space facing. */
      dot.current?.setAttribute(
        "transform",
        `translate(${s.position.x} ${s.position.z}) rotate(${180 - (s.yaw * 180) / Math.PI})`,
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [state]);

  /** Screen point → world point, through the current pan and zoom. */
  const toWorld = useCallback(
    (clientX: number, clientY: number) => {
      const el = svg.current;
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const u = ((clientX - r.left) / r.width) * VIEW - VIEW / 2;
      const v = ((clientY - r.top) / r.height) * VIEW - VIEW / 2;
      return { x: (u - pan.x) / zoom, z: (v - pan.y) / zoom };
    },
    [pan, zoom],
  );

  const onWheel = (e: React.WheelEvent) => {
    const next = Math.min(4.5, Math.max(0.62, zoom * (e.deltaY < 0 ? 1.16 : 1 / 1.16)));
    setZoom(next);
  };

  const onDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    moved.current = false;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.hypot(dx, dy) > 4) moved.current = true;
    const el = svg.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPan({ x: d.px + (dx / r.width) * VIEW, y: d.py + (dy / r.height) * VIEW });
  };
  const onUp = (e: React.PointerEvent) => {
    const wasDrag = moved.current;
    drag.current = null;
    // A drag pans; a click marks. Distinguishing them by distance is what
    // stops every pan from dropping a waypoint.
    if (wasDrag) return;
    const w = toWorld(e.clientX, e.clientY);
    if (!w) return;
    if (Math.hypot(w.x, w.z) > MAP_EXTENT) return;
    onWaypoint({ x: w.x, z: w.z, label: "Marked position" });
  };

  const seen = new Set(visited);

  return (
    <div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label="World map"
      tabIndex={-1}
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain px-3 py-4 sm:px-6 sm:py-6"
      style={{ background: "rgba(16,11,5,0.985)" }}
    >
      <div className="mx-auto max-w-[74rem]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="u-display text-[clamp(1.4rem,4vw,2rem)]" style={{ color: "#f3e9d2" }}>
              World map
            </h2>
            <p className="u-mono mt-1 text-[0.6rem] uppercase tracking-[0.16em]" style={{ color: "#8a7a52" }}>
              Drag to pan · scroll to zoom · click to set a waypoint
            </p>
          </div>
          <div className="flex items-center gap-2">
            {waypoint && (
              <button
                onClick={() => onWaypoint(null)}
                className="u-mono inline-flex min-h-[44px] items-center border px-4 text-[0.58rem] uppercase tracking-[0.16em]"
                style={{ borderColor: "#a3771f", color: "#ffb703" }}
              >
                Clear waypoint
              </button>
            )}
            <button
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className="u-mono inline-flex min-h-[44px] items-center border px-4 text-[0.58rem] uppercase tracking-[0.16em]"
              style={{ borderColor: "#3a2c12", color: "#c9b98a" }}
            >
              Reset view
            </button>
            <button
              onClick={onClose}
              className="u-mono inline-flex min-h-[44px] items-center border px-5 text-[0.6rem] uppercase tracking-[0.18em]"
              style={{ borderColor: "#3a2c12", color: "#c9b98a" }}
            >
              Close · Esc
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="relative">
            <svg
              ref={svg}
              viewBox={`${-VIEW / 2} ${-VIEW / 2} ${VIEW} ${VIEW}`}
              className="w-full touch-none select-none"
              style={{
                background: "#3b8f2a",
                border: "3px solid #8a6d3f",
                borderRadius: "4px",
                cursor: drag.current ? "grabbing" : "crosshair",
              }}
              onWheel={onWheel}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={() => {
                drag.current = null;
              }}
              role="img"
              aria-label="Map of the world"
            >
              <defs>
                <radialGradient id="ground" cx="50%" cy="50%">
                  <stop offset="0%" stopColor="#6fc24a" />
                  <stop offset="70%" stopColor="#4fa838" />
                  <stop offset="100%" stopColor="#3b8f2a" />
                </radialGradient>
                <pattern id="grass" width="42" height="42" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="12" r="7" fill="#5cb63f" opacity="0.35" />
                  <circle cx="31" cy="30" r="9" fill="#458f2e" opacity="0.3" />
                  <circle cx="24" cy="6" r="5" fill="#7fce55" opacity="0.28" />
                </pattern>
              </defs>

              <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
                {/* Terrain. A landmass with an edge, so the world has a shape
                    rather than being an infinite black field — grass, to
                    match the ground the game itself now stands on, not a
                    technical grid on black. */}
                <circle cx={0} cy={0} r={MAP_EXTENT} fill="url(#ground)" />
                <circle cx={0} cy={0} r={MAP_EXTENT} fill="url(#grass)" />
                <circle
                  cx={0}
                  cy={0}
                  r={MAP_EXTENT}
                  fill="none"
                  stroke="#8a6d3f"
                  strokeWidth={5 / zoom}
                />
                <circle
                  cx={0}
                  cy={0}
                  r={MAP_EXTENT}
                  fill="none"
                  stroke="#e8d9a6"
                  strokeWidth={1.4 / zoom}
                />

                {/* Roads: a dirt casing and a bright travelled centre-line,
                    the same sandy-path-with-a-glowing-line the world itself
                    draws underfoot. */}
                {ROADS.map((r, i) => (
                  <g key={i}>
                    <line
                      x1={r.x1}
                      y1={r.z1}
                      x2={r.x2}
                      y2={r.z2}
                      stroke="#a3814a"
                      strokeWidth={r.language === "ring" ? 8 : 10}
                      strokeLinecap="round"
                    />
                    <line
                      x1={r.x1}
                      y1={r.z1}
                      x2={r.x2}
                      y2={r.z2}
                      stroke="#f0dfae"
                      strokeWidth={r.language === "ring" ? 4 : 5}
                      strokeLinecap="round"
                    />
                    <line
                      x1={r.x1}
                      y1={r.z1}
                      x2={r.x2}
                      y2={r.z2}
                      stroke={r.color}
                      strokeOpacity={r.language === "ring" ? 0.55 : 0.85}
                      strokeWidth={r.language === "ring" ? 1.8 : 2.4}
                      strokeLinecap="round"
                      strokeDasharray={`${2 / zoom} ${5 / zoom}`}
                    />
                  </g>
                ))}

                {/* Districts: filled territories, the way a fantasy map
                    colours a region rather than tracing it in wireframe. */}
                {DISTRICT_GATES.map(({ d, cx, cz, style }) => {
                  const on = hover === d.language;
                  const known = entities.some(
                    (e) => e.language === d.language && seen.has(`repo:${e.id}`),
                  );
                  return (
                    <g
                      key={d.language}
                      onMouseEnter={() => setHover(d.language)}
                      onMouseLeave={() => setHover(null)}
                    >
                      <circle
                        cx={cx}
                        cy={cz}
                        r={d.spread + 16}
                        fill={style.ui}
                        fillOpacity={on ? 0.62 : 0.42}
                        stroke={style.ui}
                        strokeOpacity={1}
                        strokeWidth={(on ? 4 : 2.6) / zoom}
                      />
                      <text
                        x={cx}
                        y={cz - d.spread - 24}
                        fill="#3a2c12"
                        fontSize={16 / Math.max(0.85, zoom * 0.72)}
                        textAnchor="middle"
                        fontFamily="ui-monospace, monospace"
                        fontWeight={700}
                        style={{ letterSpacing: 1.4, paintOrder: "stroke", stroke: "#f6ecc9", strokeWidth: 3 }}
                      >
                        {style.label.toUpperCase()}
                        {known ? "" : " ·"}
                      </text>
                    </g>
                  );
                })}

                {/* Buildings: a little roof and a wall, not a bare rectangle
                    — the same silhouette the world builds them from. */}
                {FOOTPRINTS.map((f) => (
                  <g
                    key={f.id}
                    transform={`translate(${f.x} ${f.z}) rotate(${(f.rot * 180) / Math.PI})`}
                    opacity={seen.has(`repo:${f.id}`) ? 1 : 0.6}
                  >
                    <title>{`${f.name} · ${f.commits} commits`}</title>
                    <rect
                      x={-f.w}
                      y={-f.h * 0.3}
                      width={f.w * 2}
                      height={f.h * 1.3}
                      fill={f.color}
                      stroke="#3a2c12"
                      strokeWidth={0.7 / zoom}
                    />
                    <path
                      d={`M ${-f.w * 1.15} ${-f.h * 0.3} L 0 ${-f.h * 1.3} L ${f.w * 1.15} ${-f.h * 0.3} Z`}
                      fill="#3a2c12"
                      fillOpacity={0.75}
                    />
                  </g>
                ))}

                {/* Points of interest, typed by shape as well as colour. */}
                {POIS.map((p) => (
                  <g
                    key={p.id}
                    transform={`translate(${p.x} ${p.z}) scale(${1 / Math.max(0.7, zoom * 0.8)})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onWaypoint({ x: p.x, z: p.z, label: p.title });
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <Poi kind={p.kind} seen={seen.has(p.id)} />
                    <title>{`${p.title} — ${p.kicker}`}</title>
                  </g>
                ))}

                {/* The waypoint, and the line to it from the player. */}
                {waypoint && (
                  <g transform={`translate(${waypoint.x} ${waypoint.z})`}>
                    <circle r={11 / zoom} fill="none" stroke="#ffb703" strokeWidth={2.4 / zoom} />
                    <circle r={3 / zoom} fill="#ffb703" />
                    <line
                      x1={-16 / zoom}
                      y1={0}
                      x2={16 / zoom}
                      y2={0}
                      stroke="#ffb703"
                      strokeWidth={1.4 / zoom}
                    />
                    <line
                      x1={0}
                      y1={-16 / zoom}
                      x2={0}
                      y2={16 / zoom}
                      stroke="#ffb703"
                      strokeWidth={1.4 / zoom}
                    />
                  </g>
                )}

                <g ref={dot}>
                  <circle r={10} fill="#3a2c12" fillOpacity={0.3} />
                  <path d="M 0 -9 L 6.5 7.5 L 0 3.5 L -6.5 7.5 Z" fill="#ffffff" stroke="#3a2c12" strokeWidth={1} />
                </g>
              </g>

              {/* Compass and scale sit outside the panned group: they belong
                  to the frame, not to the terrain. */}
              <g transform={`translate(${VIEW / 2 - 48} ${-VIEW / 2 + 48})`}>
                <circle r={26} fill="#f6ecc9" stroke="#8a6d3f" strokeWidth={2} />
                <path d="M 0 -18 L 5 0 L 0 -5 L -5 0 Z" fill="#c73a2f" />
                <path d="M 0 18 L 5 0 L 0 5 L -5 0 Z" fill="#3a2c12" />
                <path d="M -18 0 L 0 5 L -5 0 L 0 -5 Z" fill="#3a2c12" opacity={0.6} />
                <path d="M 18 0 L 0 5 L 5 0 L 0 -5 Z" fill="#3a2c12" opacity={0.6} />
                <text
                  y={-21}
                  fill="#3a2c12"
                  fontSize={9}
                  fontWeight={700}
                  textAnchor="middle"
                  fontFamily="ui-monospace, monospace"
                >
                  N
                </text>
              </g>
              <g transform={`translate(${-VIEW / 2 + 28} ${VIEW / 2 - 28})`}>
                <line x1={0} y1={0} x2={50 * zoom} y2={0} stroke="#3a2c12" strokeWidth={2.4} />
                <line x1={0} y1={-4} x2={0} y2={4} stroke="#3a2c12" strokeWidth={2.4} />
                <line
                  x1={50 * zoom}
                  y1={-4}
                  x2={50 * zoom}
                  y2={4}
                  stroke="#3a2c12"
                  strokeWidth={2.4}
                />
                <text
                  x={0}
                  y={-8}
                  fill="#3a2c12"
                  fontSize={10}
                  fontWeight={700}
                  fontFamily="ui-monospace, monospace"
                >
                  50m
                </text>
              </g>
            </svg>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
              {(
                [
                  ["PROJECT", "Case study"],
                  ["WORK", "Employment"],
                  ["CERT", "Certification"],
                  ["CORE", "The core"],
                ] as const
              ).map(([k, label]) => (
                <span key={k} className="flex items-center gap-2">
                  <svg width={16} height={16} viewBox="-8 -8 16 16">
                    <Poi kind={k} seen={false} />
                  </svg>
                  <span
                    className="u-mono text-[0.58rem] uppercase tracking-[0.14em]"
                    style={{ color: "#b8a678" }}
                  >
                    {label}
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3
              className="u-mono border-b pb-2 text-[0.6rem] uppercase tracking-[0.2em]"
              style={{ color: "#b8a678", borderColor: "#3a2c12" }}
            >
              Travel
            </h3>
            <ul>
              {DISTRICT_GATES.map(({ d, cx, cz, style }) => {
                const here = entities.filter((e) => e.language === d.language);
                const live = here.filter((e) => factByName.get(e.name)?.homepage).length;
                const found = here.filter((e) => seen.has(`repo:${e.id}`)).length;
                return (
                  <li key={d.language} style={{ borderBottom: "1px solid #3a2c12" }}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onTravel(cx, cz);
                          onClose();
                        }}
                        onMouseEnter={() => setHover(d.language)}
                        onMouseLeave={() => setHover(null)}
                        className="flex min-h-[52px] flex-1 items-center gap-3 text-left"
                      >
                        <span
                          className="block h-3 w-3 shrink-0 rounded-full"
                          style={{ background: style.ui }}
                        />
                        <span className="u-mono flex-1 text-[0.78rem]" style={{ color: "#f3e9d2" }}>
                          {style.label}
                        </span>
                        <span
                          className="u-mono text-[0.58rem] uppercase tracking-[0.12em]"
                          style={{ color: "#b8a678" }}
                        >
                          {found}/{here.length}
                          {live > 0 ? ` · ${live} live` : ""}
                        </span>
                      </button>
                      <button
                        onClick={() =>
                          onWaypoint({ x: cx, z: cz, label: `${style.label} district` })
                        }
                        aria-label={`Set waypoint to ${style.label}`}
                        className="u-mono inline-flex min-h-[44px] shrink-0 items-center border px-2.5 text-[0.52rem] uppercase tracking-[0.12em]"
                        style={{ borderColor: "#3a2c12", color: "#8a7a52" }}
                      >
                        Mark
                      </button>
                    </div>
                  </li>
                );
              })}
              <li style={{ borderBottom: "1px solid #3a2c12" }}>
                <button
                  onClick={() => {
                    onTravel(0, 0);
                    onClose();
                  }}
                  className="flex min-h-[52px] w-full items-center gap-3 text-left"
                >
                  <span
                    className="block h-3 w-3 shrink-0 rounded-full"
                    style={{ background: "#8cbcae" }}
                  />
                  <span className="u-mono flex-1 text-[0.78rem]" style={{ color: "#f3e9d2" }}>
                    The core
                  </span>
                  <span
                    className="u-mono text-[0.58rem] uppercase tracking-[0.12em]"
                    style={{ color: "#b8a678" }}
                  >
                    Who this is
                  </span>
                </button>
              </li>
            </ul>

            <h3
              className="u-mono mt-7 border-b pb-2 text-[0.6rem] uppercase tracking-[0.2em]"
              style={{ color: "#b8a678", borderColor: "#3a2c12" }}
            >
              Found · {progress.found} of {progress.total}
            </h3>
            <p className="mt-3 text-[0.82rem] leading-[1.55]" style={{ color: "#8a7a52" }}>
              Districts you have not walked into are marked with a dot and their
              buildings are drawn faint. Click any point on the map, or Mark a
              district, and the compass will hold the bearing until you get
              there.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The point-of-interest glyphs. Shape carries the type, so the map is still
 *  readable to someone who cannot separate the colours. */
function Poi({ kind, seen }: { kind: string; seen: boolean }) {
  const color =
    kind === "PROJECT"
      ? "#f2b544"
      : kind === "WORK"
        ? "#e8834a"
        : kind === "CERT"
          ? "#7fd1c4"
          : "#8cbcae";
  const o = seen ? 0.5 : 1;
  const common = { fill: color, fillOpacity: o, stroke: "#05080a", strokeWidth: 1.1 };
  if (kind === "PROJECT") return <path d="M 0 -7 L 7 0 L 0 7 L -7 0 Z" {...common} />;
  if (kind === "WORK") return <rect x={-5.6} y={-5.6} width={11.2} height={11.2} {...common} />;
  if (kind === "CERT")
    return <path d="M 0 -7 L 6 -3.5 L 6 3 L 0 7.5 L -6 3 L -6 -3.5 Z" {...common} />;
  return <path d="M 0 -8 L 7 -4 L 7 4 L 0 8 L -7 4 L -7 -4 Z" {...common} />;
}
