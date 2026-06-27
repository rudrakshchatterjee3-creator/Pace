# rules/PIPELINE.md — The Autonomous Build Pipeline (P1–P8)

Run these phases end to end when activated. Produce a Task List + Implementation
Plan artifact in Planning Mode FIRST, then execute. Do not pause for approval
between phases. Only stop if a required secret is missing or an action is
destructive/irreversible.

Before P1: open and fully read `DESIGN.md` and `COPYWRITING.md`. They are the
authority for UI and copy and are too long to summarize here.

---

## P1 — Frame  (≈10 min)
1. Restate the challenge in one sentence in your own words.
2. Pick the ONE killer use case that best fits the evaluator (read
   `rules/EVALUATOR.md`). Resist scope; one sharp thing beats three half things.
3. Write **5–8 acceptance criteria** as a checklist. These are the exit condition
   for the P5 verify loop. Each must be objectively checkable in the browser.
4. Name the app and a one-line value prop.
5. **Design plan** (DESIGN.md §1, §3, §8): research the subject briefly, then lock
   4–6 named hex colors, a display+body+(mono) type pairing, a layout concept, and
   ONE signature element. Confirm none of it is a banned default (DESIGN.md §2).
6. **Messaging brief** (COPYWRITING.md §1–§2): the one reader, their real words
   (quick voice-of-customer lookup), and the before→after the product delivers.
7. State the **3-second test**: exactly what a judge sees and understands on first
   paint.

## P2 — Plan  (≈5 min)
Implementation Plan artifact: screens/routes, the single **agentic loop**
(input → Gemini reasons/plans → performs the task → returns STRUCTURED data →
renders real UI), the data model, the Gemini response schema, and the mock-data
fallback shape. Keep it to 1–3 screens.

## P3 — Verify scaffold, apply design tokens  (≈10 min)
The Vite + React + TS + Tailwind + Express scaffold already exists (`SETUP.md`
lists every file — do not recreate `package.json`, `vite.config.ts`, etc.).
Run `npm install` if not yet done, then `npm run dev` and confirm the reference
demo in `src/App.tsx` boots and runs (type something, press Run, see a result,
including the mock fallback if offline). **Type `/browser` explicitly** if the
agent does not proactively open one to check this; Antigravity does not always
decide on its own to use browser tools (see `rules/LOOP.md`). Then apply
the P1 design tokens: update the CSS variables in `src/index.css` and the font
links in `index.html` to match the locked brief. Do this BEFORE feature work so
P4 is built on the real visual foundation, not the placeholder one.

## P4 — Core feature  (≈45 min)
**Extend `src/App.tsx`** (do not start a new file) into the real challenge
feature. Replace the demo task/schema/mock/UI with the actual agentic loop:
the model returns STRUCTURED data that drives real UI (cards, table, map,
chart, generated document) — visible work being done, never a chat transcript.
Keep the same four states already wired (loading skeleton → result → empty →
error) and the demo-data fallback + "Load Demo" button pattern.

## P5 — Verify loop  (run per rules/LOOP.md until PASS)
Open `rules/LOOP.md` and follow it exactly: score every P1 acceptance criterion
1-10 as a hostile critic, no 8+ without real evidence (browser-verified, command
exit code, actual screenshot), max 5 passes, never a faked PASS. **Type
`/browser` explicitly** before trusting any "it works" claim that depends on
seeing the rendered UI; do not assume the agent opens it on its own. Capture
screenshots and a browser walkthrough as artifacts (judges trust shown proof
over claims).

→ As soon as the happy path is green and deployed-or-ready, **submit attempt 1.**

## P6 — Polish  (≈20 min)
Apply the full `DESIGN.md` §7 restraint pass and the full `COPYWRITING.md` §7
editing passes:
- Hero leads with the reader's problem→solution, in their words.
- Spend boldness only on the signature element; quiet everything else.
- Responsive laptop → mobile → projector; visible keyboard focus; reduced-motion
  respected; no console errors; fast first paint; no layout shift.
- Copy: read every line aloud, cut filler, make claims specific, buttons named by
  outcome, consistent vocabulary, and scrub the banned list — **zero em dashes**,
  no hype words, no "not just X but Y."
- Take a screenshot and self-critique against both files before calling it done.
  Remove one unnecessary element (Chanel's rule).
- Run `rules/QUALITY.md`: security (key never in client, input validated, no
  sensitive content logged), efficiency (debounced AI calls, lean bundle), one
  smoke-test script against the deployed URL, and accessibility (focus states,
  aria-labels, aria-live on async results, contrast, reduced motion).

## P7 — Submit assets
Generate `README.md` (problem, what it does, run steps, stack, how AI is used), a
**60-second demo script** (the exact click path that always works), and a short
**build narrative** written per COPYWRITING.md §9 (problem in a real voice,
before→after, one honest opinionated line; no hype, no em dashes). Confirm a clean
`npm install && npm run dev` from a fresh clone.

## P8 — Deploy to Cloud Run
Containerize and deploy (read `rules/STACK.md` and `SETUP.md` for the exact
command). Open the live URL in the browser, run the full happy path on the
deployed instance, screenshot it. Run the `rules/CHECKLIST.md` before each
submission. Hand back the public URL + demo script, then say READY.
