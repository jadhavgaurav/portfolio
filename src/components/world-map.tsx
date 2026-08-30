"use client";

import { useEffect, useRef, useState } from "react";
import { DISTRICTS, districtCentre, styleFor } from "@/world/language";
import { entities } from "@/world/telemetry";
import { factByName } from "@/data/repo-facts";
import type { PlayerState } from "@/world/Player";

/**
 * The full map.
 *
 * North-up and labelled, which is the opposite of the minimap on purpose:
 * the minimap answers "what is around me right now" and this answers "what
 * is in this world and where". Choosing a district walks you to it.
 */

/* The furthest district centre is 186 out, plus a 62 spread and a label
   pushed 30 beyond that. 268 cropped Python's label off the top and cut
   TypeScript's in half at the right edge. */
const R = 312;

export function WorldMap({
  state,
  onClose,
  onTravel,
}: {
  state: React.MutableRefObject<PlayerState>;
  onClose: () => void;
  onTravel: (x: number, z: number) => void;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const dot = useRef<SVGGElement>(null);

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

  return (
    <div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label="World map"
      tabIndex={-1}
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain px-4 py-6 sm:px-8"
      style={{ background: "rgba(6,8,9,0.96)" }}
    >
      <div className="mx-auto max-w-[62rem]">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="u-display text-[clamp(1.5rem,4vw,2.2rem)]" style={{ color: "#e2e8f0" }}>
            Where you can go
          </h2>
          <button
            onClick={onClose}
            className="u-mono inline-flex min-h-[44px] items-center border px-5 text-[0.6rem] uppercase tracking-[0.18em]"
            style={{ borderColor: "#2a2f32", color: "#9eaab0" }}
          >
            Close · Esc
          </button>
        </div>
        <p className="mt-2 max-w-[38rem] text-[0.88rem]" style={{ color: "#8b979c" }}>
          Eight districts, one per language, ringing the core. Choose one and you
          walk there. Every dot is a repository, sized by its commit count.
        </p>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.35fr_1fr]">
          <svg
            viewBox={`${-R} ${-R} ${R * 2} ${R * 2}`}
            className="w-full rounded-sm"
            style={{ background: "#0b0e10", border: "1px solid #2a2f32" }}
            role="img"
            aria-label="Map of the world's districts"
          >
            {/* Paths from the core out to each district. */}
            {DISTRICTS.map((d) => {
              const [x, z] = districtCentre(d);
              return (
                <line
                  key={`p-${d.language}`}
                  x1={0}
                  y1={0}
                  x2={x}
                  y2={z}
                  stroke="rgba(226,232,240,0.16)"
                  strokeWidth={2}
                />
              );
            })}

            {DISTRICTS.map((d) => {
              const [x, z] = districtCentre(d);
              const style = styleFor(d.language);
              const on = hover === d.language;
              return (
                <g
                  key={d.language}
                  onMouseEnter={() => setHover(d.language)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => {
                    onTravel(x, z);
                    onClose();
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <circle
                    cx={x}
                    cy={z}
                    r={d.spread + 16}
                    fill={style.ui + (on ? "44" : "22")}
                    stroke={style.ui}
                    strokeWidth={on ? 3 : 1.6}
                  />
                  {/* Pushed outward along the district's own bearing rather
                      than straight up, so neighbouring labels never stack. */}
                  <text
                    x={x + (x / (Math.hypot(x, z) || 1)) * (d.spread + 30)}
                    y={z + (z / (Math.hypot(x, z) || 1)) * (d.spread + 30)}
                    fill={style.ui}
                    fontSize={15}
                    textAnchor="middle"
                    fontFamily="ui-monospace, monospace"
                    style={{ textTransform: "uppercase", letterSpacing: 1.5 }}
                  >
                    {style.label}
                  </text>
                </g>
              );
            })}

            {entities.map((e) => (
              <circle
                key={e.id}
                cx={e.x}
                cy={e.z}
                r={Math.max(2, e.mass * 0.55)}
                fill={styleFor(e.language).ui}
                opacity={0.95}
              >
                <title>{`${e.name} · ${e.commits} commits`}</title>
              </circle>
            ))}

            {/* The core. */}
            <circle cx={0} cy={0} r={9} fill="#8cbcae" />
            <text
              x={0}
              y={-18}
              fill="#8cbcae"
              fontSize={13}
              textAnchor="middle"
              fontFamily="ui-monospace, monospace"
              style={{ letterSpacing: 1.5 }}
            >
              CORE
            </text>

            <g ref={dot}>
              <path d="M 0 -11 L 8 9 L 0 4 L -8 9 Z" fill="#ffffff" />
            </g>
          </svg>

          <div>
            <h3
              className="u-mono border-b pb-2 text-[0.6rem] uppercase tracking-[0.2em]"
              style={{ color: "#8b979c", borderColor: "#2a2f32" }}
            >
              Districts
            </h3>
            <ul>
              {DISTRICTS.map((d) => {
                const [x, z] = districtCentre(d);
                const style = styleFor(d.language);
                const here = entities.filter((e) => e.language === d.language);
                const live = here.filter((e) => factByName.get(e.name)?.homepage).length;
                return (
                  <li key={d.language} style={{ borderBottom: "1px solid #2a2f32" }}>
                    <button
                      onClick={() => {
                        onTravel(x, z);
                        onClose();
                      }}
                      onMouseEnter={() => setHover(d.language)}
                      onMouseLeave={() => setHover(null)}
                      className="flex min-h-[52px] w-full items-center gap-3 text-left"
                    >
                      <span
                        className="block h-3 w-3 shrink-0 rounded-full"
                        style={{ background: style.ui }}
                      />
                      <span className="u-mono flex-1 text-[0.78rem]" style={{ color: "#e2e8f0" }}>
                        {style.label}
                      </span>
                      <span
                        className="u-mono text-[0.6rem] uppercase tracking-[0.12em]"
                        style={{ color: "#8b979c" }}
                      >
                        {here.length} {here.length === 1 ? "repo" : "repos"}
                        {live > 0 ? ` · ${live} live` : ""}
                      </span>
                    </button>
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
                    className="u-mono text-[0.6rem] uppercase tracking-[0.12em]"
                    style={{ color: "#8b979c" }}
                  >
                    Who this is
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
