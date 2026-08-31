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
}: {
  state: React.MutableRefObject<PlayerState>;
  onClose: () => void;
  onTravel: (x: number, z: number) => void;
  waypoint: Waypoint | null;
  onWaypoint: (w: Waypoint | null) => void;
  visited: string[];
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
      dot.current?.setAttribute(
        "transform",
        `translate(${s.position.x} ${s.position.z}) rotate(${(s.yaw * 180) / Math.PI + 180})`,
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
      style={{ background: "rgba(5,7,8,0.985)" }}
    >
      <div className="mx-auto max-w-[74rem]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="u-display text-[clamp(1.4rem,4vw,2rem)]" style={{ color: "#e2e8f0" }}>
              World map
            </h2>
            <p className="u-mono mt-1 text-[0.6rem] uppercase tracking-[0.16em]" style={{ color: "#69757a" }}>
              Drag to pan · scroll to zoom · click to set a waypoint
            </p>
          </div>
          <div className="flex items-center gap-2">
            {waypoint && (
              <button
                onClick={() => onWaypoint(null)}
                className="u-mono inline-flex min-h-[44px] items-center border px-4 text-[0.58rem] uppercase tracking-[0.16em]"
                style={{ borderColor: "#43665e", color: "#8cbcae" }}
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
              style={{ borderColor: "#2a2f32", color: "#9eaab0" }}
            >
              Reset view
            </button>
            <button
              onClick={onClose}
              className="u-mono inline-flex min-h-[44px] items-center border px-5 text-[0.6rem] uppercase tracking-[0.18em]"
              style={{ borderColor: "#2a2f32", color: "#9eaab0" }}
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
                background: "#080b0d",
                border: "1px solid #2a2f32",
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
                  <stop offset="0%" stopColor="#182228" />
                  <stop offset="70%" stopColor="#101619" />
                  <stop offset="100%" stopColor="#080b0d" />
                </radialGradient>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1b2429" strokeWidth="0.7" />
                </pattern>
              </defs>

              <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
                {/* Terrain. A landmass with an edge, so the world has a shape
                    rather than being an infinite black field. */}
                <circle cx={0} cy={0} r={MAP_EXTENT} fill="url(#ground)" />
                <circle cx={0} cy={0} r={MAP_EXTENT} fill="url(#grid)" opacity={0.5} />
                <circle
                  cx={0}
                  cy={0}
                  r={MAP_EXTENT}
                  fill="none"
                  stroke="#2f3a40"
                  strokeWidth={2 / zoom}
                />

                {/* Roads: a casing and an inner line, which is what makes a
                    line read as a road rather than as a connection. */}
                {ROADS.map((r, i) => (
                  <g key={i}>
                    <line
                      x1={r.x1}
                      y1={r.z1}
                      x2={r.x2}
                      y2={r.z2}
                      stroke="#222c31"
                      strokeWidth={r.language === "ring" ? 7 : 9}
                      strokeLinecap="round"
                    />
                    <line
                      x1={r.x1}
                      y1={r.z1}
                      x2={r.x2}
                      y2={r.z2}
                      stroke={r.color}
                      strokeOpacity={r.language === "ring" ? 0.3 : 0.5}
                      strokeWidth={r.language === "ring" ? 3 : 4}
                      strokeLinecap="round"
                    />
                  </g>
                ))}

                {/* Districts. */}
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
                        fill={style.ui + (on ? "30" : "16")}
                        stroke={style.ui}
                        strokeOpacity={on ? 1 : 0.75}
                        strokeWidth={(on ? 2.6 : 1.6) / zoom}
                      />
                      <circle
                        cx={cx}
                        cy={cz}
                        r={d.spread + 8}
                        fill="none"
                        stroke={style.ui}
                        strokeOpacity={0.22}
                        strokeWidth={1 / zoom}
                        strokeDasharray={`${6 / zoom} ${5 / zoom}`}
                      />
                      <text
                        x={cx}
                        y={cz - d.spread - 24}
                        fill={style.ui}
                        fontSize={15 / Math.max(0.85, zoom * 0.72)}
                        textAnchor="middle"
                        fontFamily="ui-monospace, monospace"
                        style={{ letterSpacing: 1.4 }}
                      >
                        {style.label.toUpperCase()}
                        {known ? "" : " ·"}
                      </text>
                    </g>
                  );
                })}

                {/* Buildings. Footprints, not dots. */}
                {FOOTPRINTS.map((f) => (
                  <rect
                    key={f.id}
                    x={-f.w}
                    y={-f.h}
                    width={f.w * 2}
                    height={f.h * 2}
                    transform={`translate(${f.x} ${f.z}) rotate(${(f.rot * 180) / Math.PI})`}
                    fill={f.color}
                    fillOpacity={seen.has(`repo:${f.id}`) ? 0.95 : 0.55}
                    stroke="#05080a"
                    strokeWidth={0.8 / zoom}
                  >
                    <title>{`${f.name} · ${f.commits} commits`}</title>
                  </rect>
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
                    <circle r={11 / zoom} fill="none" stroke="#8cbcae" strokeWidth={2 / zoom} />
                    <circle r={3 / zoom} fill="#8cbcae" />
                    <line
                      x1={-16 / zoom}
                      y1={0}
                      x2={16 / zoom}
                      y2={0}
                      stroke="#8cbcae"
                      strokeWidth={1 / zoom}
                    />
                    <line
                      x1={0}
                      y1={-16 / zoom}
                      x2={0}
                      y2={16 / zoom}
                      stroke="#8cbcae"
                      strokeWidth={1 / zoom}
                    />
                  </g>
                )}

                <g ref={dot}>
                  <circle r={9} fill="#ffffff" fillOpacity={0.14} />
                  <path d="M 0 -9 L 6.5 7.5 L 0 3.5 L -6.5 7.5 Z" fill="#ffffff" />
                </g>
              </g>

              {/* Compass and scale sit outside the panned group: they belong
                  to the frame, not to the terrain. */}
              <g transform={`translate(${VIEW / 2 - 46} ${-VIEW / 2 + 46})`}>
                <circle r={22} fill="rgba(6,8,9,0.7)" stroke="#2f3a40" strokeWidth={1} />
                <path d="M 0 -15 L 4 0 L 0 -4 L -4 0 Z" fill="#cfd6d3" />
                <text
                  y={-17}
                  fill="#8b979c"
                  fontSize={8}
                  textAnchor="middle"
                  fontFamily="ui-monospace, monospace"
                >
                  N
                </text>
              </g>
              <g transform={`translate(${-VIEW / 2 + 26} ${VIEW / 2 - 26})`}>
                <line x1={0} y1={0} x2={50 * zoom} y2={0} stroke="#8b979c" strokeWidth={2} />
                <line x1={0} y1={-4} x2={0} y2={4} stroke="#8b979c" strokeWidth={2} />
                <line
                  x1={50 * zoom}
                  y1={-4}
                  x2={50 * zoom}
                  y2={4}
                  stroke="#8b979c"
                  strokeWidth={2}
                />
                <text
                  x={0}
                  y={-8}
                  fill="#8b979c"
                  fontSize={9}
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
                    style={{ color: "#8b979c" }}
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
              style={{ color: "#8b979c", borderColor: "#2a2f32" }}
            >
              Travel
            </h3>
            <ul>
              {DISTRICT_GATES.map(({ d, cx, cz, style }) => {
                const here = entities.filter((e) => e.language === d.language);
                const live = here.filter((e) => factByName.get(e.name)?.homepage).length;
                const found = here.filter((e) => seen.has(`repo:${e.id}`)).length;
                return (
                  <li key={d.language} style={{ borderBottom: "1px solid #2a2f32" }}>
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
                        <span className="u-mono flex-1 text-[0.78rem]" style={{ color: "#e2e8f0" }}>
                          {style.label}
                        </span>
                        <span
                          className="u-mono text-[0.58rem] uppercase tracking-[0.12em]"
                          style={{ color: "#8b979c" }}
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
                        style={{ borderColor: "#2a2f32", color: "#69757a" }}
                      >
                        Mark
                      </button>
                    </div>
                  </li>
                );
              })}
              <li style={{ borderBottom: "1px solid #2a2f32" }}>
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
                  <span className="u-mono flex-1 text-[0.78rem]" style={{ color: "#e2e8f0" }}>
                    The core
                  </span>
                  <span
                    className="u-mono text-[0.58rem] uppercase tracking-[0.12em]"
                    style={{ color: "#8b979c" }}
                  >
                    Who this is
                  </span>
                </button>
              </li>
            </ul>

            <h3
              className="u-mono mt-7 border-b pb-2 text-[0.6rem] uppercase tracking-[0.2em]"
              style={{ color: "#8b979c", borderColor: "#2a2f32" }}
            >
              Found · {visited.length} of {POIS.length + entities.length}
            </h3>
            <p className="mt-3 text-[0.82rem] leading-[1.55]" style={{ color: "#69757a" }}>
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
