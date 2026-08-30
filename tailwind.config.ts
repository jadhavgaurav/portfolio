import type { Config } from "tailwindcss";

/**
 * Tailwind is used for layout and spacing only. Colour and type live in
 * globals.css and in src/world/palette.ts, which is what the renderer reads,
 * so the interface and the world cannot drift apart.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ground: "var(--ground)",
        ink: "var(--ink)",
        rule: "var(--rule)",
      },
      fontFamily: {
        text: ["var(--font-text)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: {
        shell: "var(--shell)",
        measure: "var(--measure)",
      },
      transitionTimingFunction: {
        record: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
