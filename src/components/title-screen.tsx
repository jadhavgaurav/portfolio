"use client";

import { subject } from "@/data/record";
import { DISTRICTS, styleFor } from "@/world/language";
import { entities } from "@/world/telemetry";

/**
 * The title screen.
 *
 * The build dropped you straight into a character standing in a field with no
 * idea what this was, who it belonged to, or which key moves. A game opens on
 * a title and a control list; only a demo starts mid-scene.
 *
 * It also carries the one thing the world cannot say quickly — whose record
 * this is — so a visitor who never presses a key still leaves knowing.
 */

export function TitleScreen({
  onStart,
  onRead,
  touch,
}: {
  onStart: () => void;
  onRead: () => void;
  touch: boolean;
}) {
  const commits = entities.reduce((n, e) => n + e.commits, 0);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain"
      style={{
        background:
          "radial-gradient(120% 90% at 50% 8%, #16222a 0%, #0d1316 46%, #07090a 100%)",
      }}
    >
      {/* A landmark, so the title screen's content is not loose in the
          accessibility tree. Not <main>: the written record already holds
          that role in the same document. */}
      <section
        aria-label="NULL — a world generated from a commit history"
        className="mx-auto flex min-h-full max-w-[46rem] flex-col justify-center px-6 py-14"
      >
        {/* The mark. Ten logo files shipped in this repository and had never
            been put on screen once. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo/logo-256.png"
          alt=""
          width={54}
          height={54}
          className="mb-8 h-[54px] w-[54px] opacity-90"
        />

        <h1
          className="u-mono text-[clamp(3.2rem,15vw,7rem)] leading-[0.86] tracking-[0.06em]"
          style={{ color: "#f2f6f7" }}
        >
          NULL
        </h1>
        <p
          className="u-mono mt-4 text-[0.68rem] uppercase tracking-[0.3em]"
          style={{ color: "#8cbcae" }}
        >
          {subject.name}
        </p>

        <p className="mt-7 max-w-[34rem] text-[1rem] leading-[1.6]" style={{ color: "#b9c4c9" }}>
          A world generated from a real commit history — {entities.length}{" "}
          repositories, {commits} commits. Every structure is a repository, its
          mass is its commit count, its decay is the time since it was last
          touched. Walk it.
        </p>

        {/* The districts, named before you arrive, so the colours mean
            something the first time you see them. */}
        <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
          {DISTRICTS.map((d) => {
            const style = styleFor(d.language);
            const n = entities.filter((e) => e.language === d.language).length;
            if (!n) return null;
            return (
              <span key={d.language} className="flex items-center gap-2">
                <span
                  className="block h-2.5 w-2.5 rounded-full"
                  style={{ background: style.ui }}
                />
                <span
                  className="u-mono text-[0.62rem] uppercase tracking-[0.14em]"
                  style={{ color: "#8b979c" }}
                >
                  {style.label} · {n}
                </span>
              </span>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <button
            onClick={onStart}
            autoFocus
            className="u-mono inline-flex min-h-[52px] items-center border px-8 text-[0.7rem] uppercase tracking-[0.22em] transition-colors"
            style={{ borderColor: "#8cbcae", color: "#0b0e10", background: "#8cbcae" }}
          >
            Enter the world
          </button>
          <button
            onClick={onRead}
            className="u-mono inline-flex min-h-[52px] items-center border px-6 text-[0.65rem] uppercase tracking-[0.18em]"
            style={{ borderColor: "#2f383c", color: "#9eaab0" }}
          >
            Read it instead
          </button>
        </div>

        {/* Controls, before they are needed rather than after. */}
        <div className="mt-12 border-t pt-6" style={{ borderColor: "#232a2e" }}>
          <h2
            className="u-mono text-[0.6rem] uppercase tracking-[0.24em]"
            style={{ color: "#69757a" }}
          >
            Controls
          </h2>
          <dl className="mt-4 grid gap-x-10 gap-y-3 sm:grid-cols-2">
            {(touch
              ? ([
                  ["Left thumb", "Walk — push further to run"],
                  ["Right thumb", "Look around"],
                  ["Jump", "Bottom-right button"],
                  ["Open", "Tap the prompt when it appears"],
                  ["Map / Log", "Top-right buttons"],
                ] as const)
              : ([
                  ["W A S D", "Move"],
                  ["Shift", "Run"],
                  ["Space", "Jump"],
                  ["Drag", "Look around"],
                  ["E", "Open what you are near"],
                  ["M", "Open the map"],
                  ["O", "Open the log"],
                  ["Esc", "Back to this screen"],
                ] as const)
            ).map(([k, v]) => (
              <div key={k} className="flex items-baseline gap-4">
                <dt
                  className="u-mono w-[5.6rem] shrink-0 text-[0.62rem] uppercase tracking-[0.14em]"
                  style={{ color: "#cfd6d3" }}
                >
                  {k}
                </dt>
                <dd className="text-[0.86rem]" style={{ color: "#8b979c" }}>
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}
