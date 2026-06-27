# rules/STACK.md — Locked Tech Stack & Architecture

Do not deliberate over the stack during the window. It is decided. Spend your
thinking on the problem and the UX, not on tooling choices. Deviate only if the
challenge makes a specific piece genuinely unfit, and say why if you do.

## Frontend
- **Vite + React 18 + TypeScript.** Instant dev server, fast HMR. Verify with
  the **`/browser` slash command explicitly** — Antigravity does not always
  decide on its own to use browser tools, so don't assume it opens one unasked.
- **Tailwind CSS** for styling. For UI primitives, hand-roll small accessible
  components in `src/components/ui/` (Tailwind classes, no extra dependency) —
  this starter does NOT pre-run the shadcn CLI, since it needs network/prompts
  that can be flaky mid-event. Only run `npx shadcn@latest init` yourself if you
  have time to spare and want its broader component set.
  Use **lucide-react** for icons (never emoji as icons) and **recharts** for any
  data visualization.
- Tokens (color, type scale, spacing) come from `DESIGN.md`. Do not hardcode
  arbitrary values; derive them from the design plan you lock in P1.

## AI brain
- **Gemini API via `@google/genai`.** Default model `gemini-3.5-flash` for the
  fast, in-app agent calls (cheap, low latency, reliable).
- Escalate to **`gemini-3.1-pro`** ONLY for steps that genuinely need deep
  reasoning or very long context. Most calls should stay on Flash.
- **Always use structured output** (`responseMimeType: "application/json"` plus a
  schema or a clearly specified JSON shape). The model output must be typed data
  that drives UI, never a raw text blob dumped on screen.
- **The API key lives server-side only.** The browser never sees it. The frontend
  calls a same-origin `/api/agent` endpoint. See `server/index.ts`.
- **If `@google/genai` throws an import or method error on first run** (SDKs
  shift between versions), web search "@google/genai generateContent" for the
  current method signature and adjust `server/index.ts` accordingly rather than
  guessing. The call shape (model, contents, structured-output config) is the
  core API and rarely changes, but confirm rather than assume mid-event.

## Optional, only if the challenge needs it
- **Google Maps JS API** for location/mapping tasks (browser key, restricted by
  HTTP referrer).
- **jsPDF** for client-side report/PDF generation.
- **zustand** for state only if you have more than two shared stores; otherwise
  plain React state.

## Architecture (one container)
A single Cloud Run container does two jobs:
1. Serves the built SPA from `dist/`.
2. Proxies Gemini at `POST /api/agent`, holding `GEMINI_API_KEY` server-side.

This keeps the key safe AND makes the live demo more reliable (the
`geminiClient.ts` wrapper adds retry + a mock-data fallback so a rate limit or
flaky venue wifi never shows the judges an error).

Files already provided in this starter, fully wired and ready to run (do not
recreate them — see SETUP.md for the full list and the one-time setup steps):
`package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`,
`index.html`, `src/main.tsx`, `src/index.css`, `src/App.tsx` (a REFERENCE
agentic loop to extend, not replace), `src/lib/geminiClient.ts`,
`server/index.ts`, `Dockerfile`, `.dockerignore`, `.gitignore`, `.env.example`.

## Run + deploy
- Local: `npm run dev` (Vite + server together; see SETUP.md).
- Deploy: `gcloud run deploy <app> --source . --region asia-south1
  --allow-unauthenticated` with the key as an env var or Secret Manager secret.
  `--source .` builds from the Dockerfile for you. Region `asia-south1` (Mumbai)
  for low latency in India.

## Optional accelerant: Google Stitch MCP, if connected
If Stitch MCP is configured in your IDE, it can speed up the P1 design step:
it natively reads a `DESIGN.md`-format file (same format this starter already
uses) to generate on-brand UI directly, instead of starting from a blank
prompt. Feed it this project's `DESIGN.md` plus the locked P1 tokens, ask for
2-3 screen variants, then have Antigravity implement the one you pick.
**Real limits, don't over-rely on it:** Stitch exports HTML/CSS/Tailwind only,
not React, so output still needs conversion into `src/App.tsx`. Independent
reviews describe first-draft quality as inconsistent ("fine for a prototype,"
not finished), so treat it as a fast moodboard for the signature element and
layout idea, then still run the full `DESIGN.md` §7 restraint pass yourself —
do not ship Stitch output unreviewed.

## Optional accelerant: Claude Code, if available
If you have Claude Code available alongside Antigravity (e.g. in the same
terminal), it can be useful for a focused, scoped sub-task (one tricky
function, one test script) without context-switching tools. Confirm with
PromptWars organizers whether mixing tools is allowed under the event rules
before relying on this during the actual timed window (see
`rules/COMPETITION.md`); do not assume it is permitted.
Seed realistic mock data and a visible "Load Demo" action. The happy path must
work end to end EVEN with no network and no API. The live demo never depends on
a successful API call in the room.
