"use client";

/**
 * The achievement banner.
 *
 * A category closing out used to print a small grey monospace pill —
 * technically correct, unmistakably not a reward. Everything else in the
 * world now reads as a game: a coin for a repository, a star for a
 * certification, a burst and a stinger the moment one is actually picked
 * up. The banner announcing four of those adding up to a finished category
 * should look like it belongs to the same game, not to the data-terminal
 * this was before.
 */

const ICON: Record<string, (color: string) => JSX.Element> = {
  districts: (color) => (
    <path
      d="M4 2v20M4 3h13l-3 4 3 4H4"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  ),
  projects: (color) => (
    <path d="M14 2 L26 14 L14 26 L2 14 Z" fill={color} stroke="#3a2c12" strokeWidth="1.4" />
  ),
  certs: (color) => (
    <path
      d="M14 2 L18 10 L27 11.5 L20.5 18 L22 27 L14 22.5 L6 27 L7.5 18 L1 11.5 L10 10 Z"
      fill={color}
      stroke="#3a2c12"
      strokeWidth="1.2"
    />
  ),
  repos: (color) => (
    <>
      <circle cx="14" cy="14" r="12" fill={color} stroke="#3a2c12" strokeWidth="1.6" />
      <circle cx="14" cy="14" r="8" fill="none" stroke="#3a2c12" strokeOpacity="0.4" strokeWidth="1.2" />
    </>
  ),
};

const COLOR: Record<string, string> = {
  districts: "#8cbcae",
  projects: "#f2b544",
  certs: "#7fd1c4",
  repos: "#ffd35c",
};

export function AchievementBanner({ achievementKey, label }: { achievementKey: string; label: string }) {
  const color = COLOR[achievementKey] ?? "#ffd35c";
  const icon = (ICON[achievementKey] ?? ICON.repos)(color);

  return (
    <aside
      aria-label="Achievement"
      className="pointer-events-none fixed inset-x-0 top-14 z-40 flex justify-center px-5"
    >
      <div
        role="status"
        className="achievement-pop flex items-center gap-3.5 rounded-lg px-5 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
        style={{
          background: "linear-gradient(180deg, #fdf3d8 0%, #f3e2ab 100%)",
          border: "2px solid #c9a24a",
        }}
      >
        <svg width="30" height="30" viewBox="0 0 28 28" aria-hidden="true" className="shrink-0">
          {icon}
        </svg>
        <div>
          <div
            className="u-mono text-[0.56rem] font-bold uppercase tracking-[0.2em]"
            style={{ color: "#a3771f" }}
          >
            Achievement unlocked
          </div>
          <div className="u-mono text-[0.82rem] font-bold" style={{ color: "#3a2c12" }}>
            {label}
          </div>
        </div>
      </div>
      <style jsx>{`
        .achievement-pop {
          animation: achievement-pop 0.42s cubic-bezier(0.2, 1.4, 0.4, 1);
        }
        @keyframes achievement-pop {
          0% {
            transform: translateY(-14px) scale(0.85);
            opacity: 0;
          }
          60% {
            transform: translateY(2px) scale(1.04);
            opacity: 1;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </aside>
  );
}
