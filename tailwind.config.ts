import type { Config } from "tailwindcss";

/**
 * Tailwind is used for layout and spacing only. Colour, type and the
 * evidence markers live in globals.css as tokens, so the visual system has a
 * single source of truth that a designer can read without knowing Tailwind.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        "paper-sunk": "var(--paper-sunk)",
        "paper-raised": "var(--paper-raised)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        "ink-3": "var(--ink-3)",
        rule: "var(--rule)",
        "rule-faint": "var(--rule-faint)",
        oxide: "var(--oxide)",
        ochre: "var(--ochre)",
        void: "var(--void)",
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
