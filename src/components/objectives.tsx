"use client";

import { useEffect, useRef } from "react";
import type { Progress } from "@/world/progress";

/**
 * The log.
 *
 * The map buried a found-count in grey text in a corner. That told you a
 * number and nothing else — not what the categories were, not which was
 * closest to finished, not that finishing one meant anything. This is the
 * place that answers "what is there to do here": four categories the
 * world's own content divides into, each with a bar and a count, and the
 * ones already closed out marked as closed.
 */
export function Objectives({
  progress,
  onClose,
}: {
  progress: Progress;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.code === "KeyO") onClose();
    };
    window.addEventListener("keydown", onKey);
    panel.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const pct = progress.total ? Math.round((progress.found / progress.total) * 100) : 0;

  return (
    <div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label="The log"
      tabIndex={-1}
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain px-5 py-8 sm:px-10 sm:py-14"
      style={{ background: "rgba(16,11,5,0.97)" }}
    >
      <div className="mx-auto max-w-[38rem]">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div
              className="u-mono text-[0.6rem] uppercase tracking-[0.22em]"
              style={{ color: "#8a7a52" }}
            >
              The log
            </div>
            <h2
              className="u-display mt-2 text-[clamp(1.6rem,5vw,2.4rem)]"
              style={{ color: "#f3e9d2" }}
            >
              What is here
            </h2>
          </div>
          <button
            onClick={onClose}
            className="u-mono inline-flex min-h-[44px] shrink-0 items-center border px-5 text-[0.6rem] uppercase tracking-[0.18em]"
            style={{ borderColor: "#3a2c12", color: "#c9b98a" }}
          >
            Close · O
          </button>
        </div>

        <div className="mt-8 flex items-baseline gap-4">
          <span
            className="u-mono text-[2.4rem] leading-none"
            style={{ color: progress.complete ? "#ffb703" : "#f3e9d2" }}
          >
            {pct}%
          </span>
          <span className="u-mono text-[0.72rem]" style={{ color: "#b8a678" }}>
            {progress.found} of {progress.total} found
          </span>
        </div>
        <div className="mt-4 h-[3px] w-full" style={{ background: "#232a2e" }}>
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: progress.complete ? "#ffb703" : "#6b5a34",
            }}
          />
        </div>

        <div className="mt-10 space-y-7">
          {progress.categories.map((c) => (
            <div key={c.key}>
              <div className="flex items-center justify-between gap-4">
                <span
                  className="u-mono flex items-center gap-2 text-[0.82rem]"
                  style={{ color: c.complete ? "#ffb703" : "#e8dcb8" }}
                >
                  {c.complete && (
                    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                      <path
                        d="M2 6.2 L4.8 9 L10 3"
                        fill="none"
                        stroke="#ffb703"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {c.label}
                </span>
                <span
                  className="u-mono text-[0.68rem] uppercase tracking-[0.1em]"
                  style={{ color: "#8a7a52" }}
                >
                  {c.found}/{c.total}
                </span>
              </div>
              <div className="mt-2 h-px w-full" style={{ background: "#232a2e" }}>
                <div
                  className="h-px transition-all duration-500"
                  style={{
                    width: `${c.total ? (c.found / c.total) * 100 : 0}%`,
                    background: c.complete ? "#ffb703" : "#6b5a34",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {progress.complete ? (
          <p className="mt-10 text-[0.9rem] leading-[1.6]" style={{ color: "#ffb703" }}>
            Everything here has been found. There is no further reward for
            that — the record was always the whole point.
          </p>
        ) : (
          <p className="mt-10 text-[0.9rem] leading-[1.6]" style={{ color: "#8a7a52" }}>
            Walk up to a structure and press E, or Open on touch. The map
            marks what is still unfound faintly.
          </p>
        )}
      </div>
    </div>
  );
}
