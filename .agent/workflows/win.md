---
description: Run the full PromptWars one-shot win pipeline on a new challenge
---

When I type `/win <challenge>`, do this:

1. First, open and fully READ these files (do not rely on memory or summaries):
   `GEMINI.md`, `rules/COMPETITION.md`, `rules/STACK.md`, `rules/PIPELINE.md`,
   `rules/LOOP.md`, `rules/EVALUATOR.md`, `DESIGN.md`, `COPYWRITING.md`,
   `rules/CHECKLIST.md`, and `SETUP.md`.

2. Then execute `rules/PIPELINE.md` (P1 → P8) end to end, fully autonomously.
   Do not pause for approval between phases. Stop only if a required secret is
   missing or an action is destructive/irreversible.

3. P5 runs `rules/LOOP.md`: score every acceptance criterion as a hostile
   critic, no 8+ without real evidence, max 5 passes, never a faked PASS.
   Submit a working scoped build early; only the latest of three submissions
   counts, so each resubmit must still fully run.

4. Run `rules/CHECKLIST.md` before every submission. Deploy to Google Cloud Run,
   verify the live URL, hand me the public URL + 60-second demo script, then say
   READY.

The individual files are the source of truth. If anything conflicts, the specific
file wins. Follow DESIGN.md and COPYWRITING.md for everything a human sees, with
zero em dashes.
