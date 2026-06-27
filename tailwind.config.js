/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // DESIGN.md §3: replace these with the brief's 4-6 NAMED hex values,
      // and set the matching CSS variables in src/index.css. Keep both files
      // in sync so Tailwind utility classes (bg-accent, text-ink, etc.) work.
      colors: {
        ink: "var(--color-ink)",
        paper: "var(--color-paper)",
        "accent-calm": "var(--color-accent-calm)",
        "accent-warm": "var(--color-accent-warm)",
        crisis: "var(--color-crisis)",
        muted: "var(--color-muted)",
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
        }
      },
      animation: {
        breath: "breath 8s ease-in-out infinite",
      }
    },
  },
  plugins: [],
};
