# rules/EVALUATOR.md — Topping the AI Evaluator

The exact rubric is confidential. This is a synthesis of the organizers' stated
criteria plus how automated LLM-as-judge evaluators typically score hackathon
apps. Optimize genuine quality on every dimension below. Do not attempt to game
the scorer; the org bans it and judges re-check the top entries by hand.

## The dimensions, in priority order

1. **It runs (highest weight).** Assume an app that errors scores near zero
   regardless of ambition. Zero-error happy path. The mock-data fallback in
   `geminiClient.ts` guarantees the demo path works even with no API. This single
   thing separates most winners from most entries.

2. **Problem–solution fit.** The app must obviously and directly solve the exact
   stated challenge. Restate the problem inside the UI so the connection is
   unmistakable. A clever app that solves an adjacent problem loses to a plain app
   that nails the actual one.

3. **Real agentic value.** The product performs a task autonomously: it takes
   input, reasons or plans, acts, and returns a structured, useful result that
   drives the interface. This is the "not a chatbot" requirement. A chat box
   wrapped around an API scores low.

4. **Clarity of intent / UX (the 3-second test).** A judge understands what this
   is and why it matters on first paint. Clean, polished, responsive, intentional.
   See `DESIGN.md`.

5. **Use of AI.** Gemini is the engine of the core value, not a bolt-on. The
   structured output is what makes the feature work, not a cosmetic summary.

6. **Creativity / originality.** A sharp, specific angle on the problem beats a
   generic CRUD or dashboard treatment. One memorable signature element helps.

7. **Completeness.** One feature done to 100% beats three done to 60%. Finish the
   core loop fully before adding anything.

8. **Communication (manual review + pitch).** The README, the build narrative,
   and the live pitch are read and watched. Clear, specific, well-written copy
   (per `COPYWRITING.md`) raises this. No hype, no filler.

## How this maps to choices you make
- In P1, choose the use case that scores highest on dimensions 2, 3, and 6 at
  once, while being finishable in the window (dimension 7).
- In P4, make the structured-output-drives-UI loop the centerpiece (dimensions
  3 and 5).
- In P5/P6, the verify loop and demo-proofing protect dimension 1 above all.
- In P7, the narrative and demo script serve dimension 8.

## Submission tactics
- Submit a working scoped build early (attempt 1) so you always have a non-zero
  score on the board. Only the latest submission counts, so every resubmit must
  still fully run.
- Between attempts, improve the dimension with the most upside that you can change
  without risking the happy path: usually problem-fit clarity, then UX polish,
  then an additional verified capability.
- Never resubmit an unverified change in the last five minutes.
