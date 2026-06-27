# GEMINI.md — PromptWars "One-Shot Win" Router

> Place at PROJECT ROOT. Antigravity auto-loads THIS file every session. It does
> NOT auto-load the files below — so your FIRST action every session is to open
> and READ them in full with your file tools. They hold the real, uncompressed
> rules; this router is deliberately short so nothing here is truncated.

## READ FIRST (open each file fully before doing anything)
1. `rules/COMPETITION.md` — event format, the two gates, the 3-attempt rule, prep.
2. `rules/STACK.md` — locked tech stack + Cloud Run architecture.
3. `rules/PIPELINE.md` — the P1–P8 build pipeline (your main script).
4. `rules/LOOP.md` — the honest, scored verify loop (no self-graded PASS).
5. `rules/EVALUATOR.md` — how the AI Evaluator scores; what to maximize.
6. `rules/QUALITY.md` — Security, Efficiency, Testing, Accessibility checklists.
7. `DESIGN.md` — premium UI/UX doctrine + the banned "AI-slop" list.
8. `COPYWRITING.md` — copy process + the banned AI-tell list (zero em dashes).
9. `rules/CHECKLIST.md` — run before every submission.
10. `SETUP.md` — package scripts, vite proxy, exact gcloud deploy command.

Do NOT rely on memory or on any summary of these files. If a phase references a
file, re-open it and follow it exactly. These files are the source of truth; if
anything conflicts, the specific file wins over this router.

## ACTIVATION (the only prompt I send)
Antigravity has a native `/goal` slash command (confirmed real, not a Claude
Code exclusive as an earlier version of this file wrongly stated). Preferred
first prompt, typed directly in the chat input:

```
/goal Build the app for this challenge: <CHALLENGE TEXT>. Read GEMINI.md and
every file in rules/, plus DESIGN.md and COPYWRITING.md, in full, then follow
rules/PIPELINE.md end to end per rules/LOOP.md's scoring discipline.
```

If `/goal` isn't available in your installed version, `Build: <CHALLENGE TEXT>`
as a plain prompt still works; this router applies either way. Either way:
execute the full pipeline in `rules/PIPELINE.md` (P1→P8) end to end,
autonomously. Do not wait for approval between phases. Stop only if a required
secret/key is missing or an action is destructive/irreversible.

## AUTONOMY & LOOP (the one behavior that matters most)
- Plan first (Planning Mode artifact), then build.
- After every feature: run it, verify in the Antigravity browser, fix before
  moving on. Never claim "done" without a browser-verified happy path + a
  screenshot artifact.
- The P5 verify loop runs UNTIL all P1 acceptance criteria pass, with no questions
  between iterations. Looping is expected and fine.
- Submit a working scoped build early (attempt 1); only the latest of 3 counts, so
  every resubmit must still fully run.

## NON-NEGOTIABLES (full detail in the files above)
- Real AI solution that performs a task — NOT a chatbot.
- It must run; a scoped working app beats an ambitious broken one.
- Demo-proof: seed mock data + "Load Demo" so the happy path works with no API.
- Deploy target is Google Cloud Run; build in Antigravity, from scratch.
- Follow DESIGN.md and COPYWRITING.md for everything a human sees. Zero em dashes.
- No plagiarism, no multi-account, no gaming the evaluator. Genuine quality only.

## QUICK DEFAULTS (authoritative versions live in the files)
- Stack: Vite + React + TS + Tailwind (hand-rolled primitives, shadcn CLI
  optional); Gemini via `@google/genai`,
  `gemini-3.5-flash` (escalate to `gemini-3.1-pro` only for heavy reasoning),
  structured JSON output, key SERVER-SIDE via `/api/agent`. See `rules/STACK.md`.
- Pipeline phases: Frame → Plan → Scaffold → Core feature → Verify loop → Polish →
  Submit assets → Deploy. See `rules/PIPELINE.md`.
