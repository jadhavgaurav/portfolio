"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EPOCH, SPAN_DAYS, eras, lanes } from "@/data/ledger";
import { GH } from "@/lib/provenance";
import { ChapterHead, Reveal, Shell } from "./primitives";

/* ── geometry ────────────────────────────────────────────────────────────── */

const EPOCH_MS = Date.parse(EPOCH);
const DAY = 86_400_000;
const dayToDate = (d: number) => new Date(EPOCH_MS + d * DAY);
const dateToDay = (iso: string) => Math.round((Date.parse(iso) - EPOCH_MS) / DAY);

const MONTH_FMT = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" });
const DAY_FMT = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** Year gridlines that actually fall inside the span. */
const YEARS = [2024, 2025, 2026].map((y) => ({ y, d: dateToDay(`${y}-01-01`) }));

/** Summed commits per day, used for the density profile above the strata. */
function densityProfile(bins: number) {
  const out = new Array<number>(bins).fill(0);
  for (const lane of lanes) {
    for (const d of lane.d) {
      const i = Math.min(bins - 1, Math.floor((d / SPAN_DAYS) * bins));
      out[i] += 1;
    }
  }
  return out;
}

/* ── the chart ───────────────────────────────────────────────────────────── */

const PALETTE = {
  ground: "#16140e",
  lane: "rgba(222, 215, 200, 0.10)",
  tick: "rgba(222, 215, 200, 0.72)",
  tickHot: "#e8a06a",
  oxide: "#d8613c",
  label: "#9d9686",
  grid: "rgba(222, 215, 200, 0.14)",
  scan: "#d8613c",
};

export function Ledger() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0, labels: 0, laneH: 13 });
  const [progress, setProgress] = useState(0);
  const [cursorDay, setCursorDay] = useState<number | null>(null);
  const [hoverLane, setHoverLane] = useState<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const monoRef = useRef<string>("");
  const fontProbeRef = useRef<HTMLSpanElement>(null);

  const totalCommits = useMemo(() => lanes.reduce((n, l) => n + l.d.length, 0), []);

  /* Resolve the mono stack from a live element — see note in draw(). */
  useEffect(() => {
    if (fontProbeRef.current) {
      monoRef.current = getComputedStyle(fontProbeRef.current).fontFamily;
    }
  }, []);

  /* Measure. A single ResizeObserver decides the responsive shape:
     wide → labelled lanes; narrow → unlabelled, tighter strata. */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      const wide = w >= 720;
      const laneH = wide ? 13 : 8;
      setSize({ w, h: lanes.length * laneH + 132, labels: wide ? 232 : 0, laneH });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* Draw once revealed, animating a left-to-right wipe so the record reads
     forwards in time. Reduced motion skips straight to the full plate. */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        if (reduce) return setProgress(1);
        const t0 = performance.now();
        const step = (t: number) => {
          const p = Math.min(1, (t - t0) / 1500);
          setProgress(p < 1 ? 1 - Math.pow(1 - p, 3) : 1);
          if (p < 1) rafRef.current = requestAnimationFrame(step);
        };
        rafRef.current = requestAnimationFrame(step);
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !size.w) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size.w * dpr;
    canvas.height = size.h * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size.w, size.h);

    /* Canvas cannot resolve a CSS custom property inside a font shorthand,
       so the mono stack is read off a live element once and cached. */
    const mono = monoRef.current || "monospace";

    const L = size.labels;
    const plotW = size.w - L;
    const x = (d: number) => L + (d / SPAN_DAYS) * plotW;
    const profH = 58;
    const top = profH + 34;
    const cut = L + plotW * progress;
    const bottom = top + lanes.length * size.laneH;

    /* Density profile. Square-rooted, because one month holds 126 commits and
       a linear axis flattens everything else into the baseline. */
    const bins = Math.max(64, Math.floor(plotW / 2));
    const prof = densityProfile(bins);
    const peak = Math.sqrt(Math.max(...prof));
    ctx.beginPath();
    ctx.moveTo(L, profH);
    for (let i = 0; i < bins; i++) {
      const px = L + (i / (bins - 1)) * plotW;
      ctx.lineTo(px, profH - (Math.sqrt(prof[i]) / peak) * profH);
    }
    ctx.lineTo(L + plotW, profH);
    ctx.closePath();
    ctx.fillStyle = "rgba(216, 97, 60, 0.26)";
    ctx.fill();
    ctx.strokeStyle = PALETTE.oxide;
    ctx.lineWidth = 1.25;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(L, profH + 0.5);
    ctx.lineTo(L + plotW, profH + 0.5);
    ctx.strokeStyle = PALETTE.grid;
    ctx.lineWidth = 1;
    ctx.stroke();

    /* Year gridlines, labelled at the top where the eye already is. */
    ctx.font = `10px ${mono}`;
    ctx.textBaseline = "alphabetic";
    for (const { y, d } of YEARS) {
      const px = Math.round(x(d)) + 0.5;
      ctx.beginPath();
      ctx.moveTo(px, profH + 6);
      ctx.lineTo(px, bottom + 8);
      ctx.strokeStyle = PALETTE.grid;
      ctx.stroke();
      ctx.fillStyle = PALETTE.label;
      ctx.fillText(String(y), px + 6, profH + 20);
    }

    /* Scan window: the fortnight the readout is summarising. */
    if (cursorDay !== null) {
      const a = x(Math.max(0, cursorDay - 14));
      const b = x(Math.min(SPAN_DAYS, cursorDay + 14));
      ctx.fillStyle = "rgba(216, 97, 60, 0.10)";
      ctx.fillRect(a, profH + 6, b - a, bottom + 8 - (profH + 6));
    }

    /* Strata. One row per repository, ordered by first commit. */
    lanes.forEach((lane, i) => {
      const y = Math.round(top + i * size.laneH) + 0.5;
      const first = x(lane.d[0]);
      const last = x(lane.d[lane.d.length - 1]);
      const hovered = i === hoverLane;
      const hot = lane.d.length >= 30;

      // The repository's lifespan. Where it stops, it stops.
      ctx.beginPath();
      ctx.moveTo(first, y);
      ctx.lineTo(Math.min(last, cut), y);
      ctx.strokeStyle = hovered ? PALETTE.oxide : PALETTE.lane;
      ctx.lineWidth = 1;
      ctx.stroke();

      const h = size.laneH - 3;
      ctx.strokeStyle = hovered ? PALETTE.oxide : hot ? PALETTE.tickHot : PALETTE.tick;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (const d of lane.d) {
        const px = x(d);
        if (px > cut) break;
        const rx = Math.round(px) + 0.5;
        ctx.moveTo(rx, y - h / 2);
        ctx.lineTo(rx, y + h / 2);
      }
      ctx.stroke();

      if (L && first <= cut) {
        ctx.fillStyle = hovered ? PALETTE.oxide : hot ? "#c8bfae" : PALETTE.label;
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.font = `${hovered ? 500 : 400} 10px ${mono}`;
        ctx.fillText(lane.r, L - 14, y, L - 22);
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
      }
    });

    /* Scan line. */
    if (cursorDay !== null) {
      const px = Math.round(x(cursorDay)) + 0.5;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, bottom + 8);
      ctx.strokeStyle = PALETTE.scan;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }, [size, progress, cursorDay, hoverLane]);

  useEffect(() => {
    draw();
  }, [draw]);

  /* Readout: what the record contains within a fortnight of the scan line. */
  const readout = useMemo(() => {
    if (cursorDay === null) return null;
    const active = lanes
      .map((l) => ({ r: l.r, n: l.d.filter((d) => Math.abs(d - cursorDay) <= 14).length }))
      .filter((a) => a.n > 0)
      .sort((a, b) => b.n - a.n);
    const lane = hoverLane !== null ? lanes[hoverLane] : null;
    return {
      date: DAY_FMT.format(dayToDate(cursorDay)),
      total: active.reduce((n, a) => n + a.n, 0),
      active,
      lane: lane
        ? {
            r: lane.r,
            n: lane.d.length,
            from: dayToDate(lane.d[0]).toISOString().slice(0, 10),
            to: dayToDate(lane.d[lane.d.length - 1]).toISOString().slice(0, 10),
          }
        : null,
    };
  }, [cursorDay, hoverLane]);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const plotW = size.w - size.labels;
    const plotX = e.clientX - rect.left - size.labels;
    if (plotW <= 0) return;
    setCursorDay(plotX < 0 ? null : Math.round((plotX / plotW) * SPAN_DAYS));

    const top = 58 + 34;
    const i = Math.floor((e.clientY - rect.top - top) / size.laneH);
    setHoverLane(i >= 0 && i < lanes.length ? i : null);
  };

  const clear = () => {
    setCursorDay(null);
    setHoverLane(null);
  };

  /* Seed the scan at the first commit so the first arrow press is informative
     rather than landing on empty record. */
  const onFocus = () => setCursorDay((c) => (c === null ? lanes[0].d[0] : c));

  const onKey = (e: React.KeyboardEvent) => {
    const stepDays = e.shiftKey ? 90 : 30;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      setCursorDay((c) => {
        const next = (c ?? 0) + (e.key === "ArrowRight" ? stepDays : -stepDays);
        return Math.max(0, Math.min(SPAN_DAYS, next));
      });
    }
    if (e.key === "Escape") clear();
  };

  return (
    <section className="u-void relative py-24 sm:py-32" aria-labelledby="ledger-title">
      <Shell>
        <ChapterHead
          id="ledger"
          index="02"
          kicker="The chronology"
          title="Every commit, in the order it happened."
        />

        <div className="mt-8 grid gap-x-12 gap-y-6 lg:grid-cols-12">
          <p className="u-lede lg:col-span-6">
            Forty repositories, four hundred and thirty-three authored commits, thirty-nine months.
            One row per repository, ordered by the day it began. A row that stops is a project that
            stopped.
          </p>
          <p className="u-mono text-[0.72rem] leading-[1.75] text-ink-3 lg:col-span-4 lg:col-start-9">
            Method — GitHub commit search, author and owner both jadhavgaurav, read 29 August 2026.
            Default branches only, so the real total is higher. Two of these repositories are
            private; they are counted because the commits are attributable, and their contents are
            not described.
          </p>
        </div>

        <Reveal delay={140} className="mt-12">
          <div
            ref={wrapRef}
            tabIndex={0}
            role="img"
            aria-describedby="ledger-readout"
            aria-label={`Chronology of ${totalCommits} commits across ${lanes.length} repositories between May 2023 and August 2026. Two dense periods dominate: May 2025, and August 2026. A tabular version follows below.`}
            onPointerMove={onMove}
            onPointerLeave={clear}
            onFocus={onFocus}
            onKeyDown={onKey}
            className="relative w-full cursor-crosshair touch-pan-y outline-offset-4"
          >
            <canvas
              ref={canvasRef}
              style={{ width: "100%", height: size.h ? `${size.h}px` : "560px" }}
              className="block"
            />
            <span className="u-label absolute left-0 top-0" style={{ color: PALETTE.label }}>
              Commits per fortnight · square-root scale
            </span>
            <span ref={fontProbeRef} aria-hidden="true" className="u-mono sr-only" />
          </div>
        </Reveal>

        {/* Readout. Announced politely so keyboard users hear the scan. */}
        <div
          id="ledger-readout"
          aria-live="polite"
          className="mt-6 min-h-[4.5rem] border-t border-rule pt-4"
        >
          {readout ? (
            <div className="grid gap-x-10 gap-y-3 sm:grid-cols-[13rem_1fr]">
              <div>
                <div className="u-mono text-sm text-[var(--void-ink)]">{readout.date}</div>
                <div className="u-label mt-1">
                  {readout.total} commit{readout.total === 1 ? "" : "s"} ± a fortnight
                </div>
              </div>
              <div>
                {readout.lane ? (
                  <div className="u-mono text-[0.8rem] text-[var(--void-ink)]">
                    {readout.lane.r}
                    <span className="u-label ml-4">
                      {readout.lane.n} commits · {readout.lane.from} → {readout.lane.to}
                    </span>
                  </div>
                ) : (
                  <div className="u-mono text-[0.75rem] leading-[1.7] text-ink-3">
                    {readout.active.slice(0, 5).map((a) => `${a.r} ×${a.n}`).join("   ") ||
                      "no commits in this window"}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="u-label">
              Move across the plate to read a date, or along a row to read a repository. Focus it
              and use the arrow keys to step by month.
            </p>
          )}
        </div>

        {/* Eras. The chart shows shape; these say what the shape was. */}
        <ol className="mt-20 grid gap-px border-t border-rule sm:grid-cols-2 lg:grid-cols-5">
          {eras.map((era, i) => (
            <Reveal
              as="li"
              key={era.name}
              delay={i * 70}
              className="border-b border-rule pb-6 pr-6 pt-6 sm:border-b-0"
            >
              <div className="u-mono text-[0.625rem] tracking-[0.13em]" style={{ color: PALETTE.oxide }}>
                {MONTH_FMT.format(Date.parse(`${era.from}-01`))}
                {era.from !== era.to && ` — ${MONTH_FMT.format(Date.parse(`${era.to}-01`))}`}
              </div>
              <h3 className="u-display mt-3 text-[1.5rem]">{era.name}</h3>
              <p className="mt-3 text-[0.9rem] leading-[1.6] text-ink-2">{era.gloss}</p>
            </Reveal>
          ))}
        </ol>

        {/* Non-visual equivalent. Not a fallback bolted on — the same data. */}
        <details className="u-noprint mt-16 border-t border-rule pt-5">
          <summary className="u-label cursor-pointer">Read the chronology as a table</summary>
          <table className="mt-6 w-full border-collapse text-left">
            <caption className="sr-only">
              Repositories with authored commits, ordered by first commit
            </caption>
            <thead>
              <tr className="u-label">
                <th scope="col" className="border-b border-rule pb-2 font-normal">Repository</th>
                <th scope="col" className="border-b border-rule pb-2 font-normal">First</th>
                <th scope="col" className="border-b border-rule pb-2 font-normal">Last</th>
                <th scope="col" className="border-b border-rule pb-2 text-right font-normal">Commits</th>
              </tr>
            </thead>
            <tbody className="u-mono text-[0.75rem]">
              {lanes.map((l) => (
                <tr key={l.r} className="border-b border-rule-faint">
                  <td className="py-2 pr-4">
                    <a className="u-cite" href={`${GH}/${l.r}`} target="_blank" rel="noreferrer noopener">
                      {l.r}
                    </a>
                  </td>
                  <td className="py-2 pr-4 text-ink-3">
                    {dayToDate(l.d[0]).toISOString().slice(0, 10)}
                  </td>
                  <td className="py-2 pr-4 text-ink-3">
                    {dayToDate(l.d[l.d.length - 1]).toISOString().slice(0, 10)}
                  </td>
                  <td className="py-2 text-right tabular-nums">{l.d.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>

      </Shell>
    </section>
  );
}
