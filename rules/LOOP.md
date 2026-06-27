# rules/LOOP.md — The Verify Loop (Honest, Not Self-Graded)

> CORRECTION: an earlier version of this file claimed Antigravity has no
> native `/goal` command and that this was a Claude Code/Codex-only feature.
> That was wrong. Antigravity 2.0 ships `/goal`, `/grill-me`, `/browser`, and
> `/schedule` as native slash commands. This file now uses the real one.

## The real mechanism: Antigravity's native `/goal`
`/goal` is typed as a prefix in the Antigravity chat input. Per Antigravity's
own docs: it runs the agent until the stated condition is completely finished,
without asking for intermediate input. This is the actual "walk away, come back
to it done" mechanism, not something you have to fake with a hand-rolled prompt
loop.

**Honest limit of what I can confirm:** I could not verify whether Antigravity's
`/goal` uses a separate, smaller checker model to grade each turn the way
Claude Code's documented `/goal` does. Treat that detail as unconfirmed. Because
of that uncertainty, this file still asks YOU to write the condition with the
scoring discipline below, so the rigor lives in what you type, not in an
assumed internal mechanism.

## Your first prompt, using the real command
Type this directly in Antigravity's chat input (not as plain text inside
another file):

```
/goal Build the app for this challenge: <paste challenge text>.
Read GEMINI.md and every file in rules/, plus DESIGN.md and COPYWRITING.md,
in full, then follow rules/PIPELINE.md end to end. Treat the task as finished
only when every P1 acceptance criterion scores 8/10 or higher under the
scoring rule below, with real evidence, not self-assessment. Max 5 verify
passes per feature. Stop and report if blocked, do not guess silently on
anything destructive.
```

If `/goal` is unavailable in your installed version, fall back to typing
`Build: <challenge>` as a normal prompt; GEMINI.md still routes you through the
same pipeline, just without the native unattended-loop guarantee.

## The scoring discipline (write this into the goal condition or apply it manually)
This is the part that prevents grade inflation, the failure mode where the
agent that built the feature also grades it and calls it done early because it
wants to stop:
- Score each P1 acceptance criterion 1-10. Act as a **hostile critic actively
  trying to fail the work**, not a cheerleader trying to finish.
- **No score of 8+ without evidence.** Evidence means: the browser actually
  showed the result, a command actually exited 0, a screenshot actually shows
  the thing claimed. "I believe this works" is not evidence.
- **Run a real check, report what it says, not what you think it says.**

## Use `/browser` explicitly, do not assume it happens on its own
Google made browser verification an explicit opt-in slash command on purpose,
because the agent was not reliably deciding on its own when to use it. This
means a single `/goal` or `Build:` prompt might skip real browser verification
unless you ask for it. At each point in `rules/PIPELINE.md` that says "launch
in the Antigravity browser" (P3 and P5), if the agent does not proactively open
the browser, type `/browser` to force it before trusting the result.

## Stop conditions (write these in, never just "stop when done")
- **Success** — every P1 criterion scores 8+ with real evidence. Move on. Do
  not keep iterating past this; that burns the clock for nothing.
- **Failure** — the same criterion fails 2-3 fix attempts in a row. Stop
  thrashing it: ship the mock-data fallback path for that one piece, note it
  as a known limitation, move on to the rest.
- **Budget** — **cap at 5 verify passes per feature.** If not all criteria are
  8+ by pass 5, ship the best version plus a short "still weak" note in the
  build narrative. Never fake a PASS to stop the loop.
- Time is the hard outer budget regardless of pass count: see the time budget
  in `rules/COMPETITION.md`. If the window is closing, stop iterating and
  submit what is verified, even if a lower-priority criterion is still weak.

## Why this matters more than anything else in this folder
Every other file in this starter (stack, design, copy) only matters if the
thing you ship actually works and you know honestly whether it works. A loop
that lies to itself about being done is worse than no loop at all, because it
gives you false confidence right up until the live demo breaks in front of
the jury.
