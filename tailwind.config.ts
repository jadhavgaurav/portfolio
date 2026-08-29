import type { Config } from "tailwindcss";

/**
 * Tailwind is used for layout only — flex, grid, spacing, positioning.
 *
 * Every design decision (colour, type scale, rules, gutters) lives in
 * `src/app/globals.css` as CSS custom properties, and is reached through
 * arbitrary values like `text-[var(--ink)]`. There is deliberately no theme
 * extension: one source of truth for the design system, and it is not this file.
 */
const config: Config = {
    content: [
        "./src/app/**/*.{ts,tsx}",
        "./src/components/**/*.{ts,tsx}",
        "./src/data/**/*.{ts,tsx}",
    ],
    theme: { extend: {} },
    plugins: [],
};
export default config;
