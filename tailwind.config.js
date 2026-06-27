/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // DESIGN.md §3: replace these with the brief's 4-6 NAMED hex values,
      // and set the matching CSS variables in src/index.css. Keep both files
      // in sync so Tailwind utility classes (bg-accent, text-ink, etc.) work.
      colors: {
        // rgb(var(...) / <alpha-value>) so bg-x/50-style opacity modifiers work.
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        "accent-calm": "rgb(var(--color-accent-calm) / <alpha-value>)",
        "accent-warm": "rgb(var(--color-accent-warm) / <alpha-value>)",
        crisis: "rgb(var(--color-crisis) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
      },
      fontFamily: {
        // DESIGN.md §3: swap these for the chosen display/body pairing and
        // load the actual font files/links in index.html.
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
      },
      keyframes: {
        breath: {
          "0%, 100%": { transform: "scaleX(1)", opacity: "0.5" },
          "50%": { transform: "scaleX(0.95)", opacity: "0.8" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "0.2", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
        },
      },
      animation: {
        breath: "breath 8s ease-in-out infinite",
        "pulse-dot": "pulse-dot 1.4s ease-in-out infinite",
      }
    },
  },
  plugins: [],
};
