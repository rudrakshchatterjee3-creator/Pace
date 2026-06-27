# rules/COMPETITION.md — PromptWars In-Person: Format, Rules, Strategy

## The event shape (two gates, not one)
A secret problem statement is revealed on the day. You get a focused build window
(typically ~2–3 hours, confirm on the day) to build a working AI solution from
scratch using Google Antigravity. Scoring happens in two stages:

1. **AI Evaluator → leaderboard.** Your submission is scored by an automated
   evaluator that ranks the public leaderboard. At a cutoff the leaderboard
   freezes and roughly the top ~10 advance.
2. **Live human pitch → winners.** The advancing teams pitch live to a jury.
   The jury decides final placements and prizes on the spot.

You must win BOTH gates. A high evaluator score with a weak pitch loses; a great
pitch you never reach the stage with also loses. Build for the evaluator, but
build something you can stand up and demo with conviction in 60 seconds.

## Submissions
- You get **three submission attempts**. Each attempt is scored.
- **Only your latest submission counts** toward the leaderboard. This means every
  resubmission must still fully run — never resubmit a broken improvement over a
  working build.
- Strategy: **submit a working, scoped build on attempt 1** as early as you safely
  can. Never risk finishing the window with zero submissions because you were
  polishing. Then use attempts 2 and 3 to raise the score with verified
  improvements only.

## Hard requirements
- **Built in Antigravity**, during the window, from scratch. No pre-built repo.
- The org bans unfair means: plagiarism, copying existing projects, multiple
  accounts, or gaming the evaluator. Everything here optimizes *genuine* quality,
  not tricks. Do not attempt to game the evaluator.
- Build a **real AI solution that performs a task** in a real-world domain
  (education, healthcare, productivity, finance, civic, logistics, etc.). The
  brief explicitly wants tools/agents that DO something, not chatbots.

## What "good" looks like to the organizers (their own words, paraphrased)
- Working apps where the intent is clear and the user experience is smooth.
- Creativity and problem-solving applied to a real problem.
- AI used as the engine of the solution, not as decoration.
- Not "just a chatbot."

## The night before (do NOT spend the timed window on these)
- Google Cloud project created, billing enabled, Cloud Run + Cloud Build APIs on.
- `gcloud` CLI installed and authenticated; default project + region set.
- Gemini API key created and tested.
- Antigravity installed, signed in, and this whole `promptwars-starter/` folder in
  your workspace so all rule files load.
- Confirm whether the venue requires submission to their portal or accepts a
  deployed Cloud Run URL.

## Time budget (for a ~2.5h window; scale to the actual time given)
- 0:00–0:10 Frame + messaging brief + design tokens (read PIPELINE P1)
- 0:10–0:20 Plan + scaffold start
- 0:20–1:10 Core agentic feature, fully wired
- 1:10–1:20 First working build → **submit attempt 1**
- 1:20–1:45 Verify loop + polish (DESIGN + COPYWRITING passes)
- 1:45–2:00 Deploy to Cloud Run, verify live → **submit attempt 2**
- 2:00–2:20 Hardening, demo script, narrative
- 2:20–2:30 Final pass → **submit attempt 3**; rehearse the 60-second pitch
