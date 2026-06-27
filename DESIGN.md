# DESIGN.md — Premium, Topic-Researched UI/UX Doctrine

> Model-agnostic. Works for Claude, Gemini 3 Pro, or any coding agent. Load this
> alongside your build prompt (or reference it: "follow DESIGN.md"). Goal: a
> distinctive, premium interface — never the default "AI-generated" look.

## 0. THE ONE RULE
**Research the subject before designing anything.** Every choice below — color,
type, layout, motion, copy — must be derived from the actual topic/industry/
audience, not from what's fast to reach for. If you can't justify a choice with
"because this subject/brief calls for it," it's a default. Cut it.

## 1. NAME THE BRIEF FIRST (before any code)
Answer these in writing, in your plan, before touching CSS:
1. **Subject** — what is this, concretely? (Not "a dashboard" — "a triage tool
   for hospital ER intake nurses.")
2. **Audience** — who reads this in the first 3 seconds, and what do they need
   to feel/understand immediately?
3. **The subject's own visual vernacular** — what materials, instruments,
   colors, typography, or rituals does THIS world already use? (A farming app
   borrows from seed packets and almanacs, not from SaaS dashboards. A legal
   tool borrows from letterhead and case law typesetting, not from crypto.)
4. **One sentence: the page's single job.**

If the brief doesn't pin this down, research it (web search the industry, real
products in that space, the actual terminology practitioners use) and pin it
yourself. Name your choice explicitly. Never design a "generic app" — design
*this* subject's app.

## 2. THE BANNED LIST — reasons it screams "AI-generated"
Do not use these unless the brief explicitly calls for them by name:
- **Purple-to-blue (or pink-to-orange) gradient backgrounds.** The single most
  recognizable AI-slop signature. Banned by default.
- **Glowing neon accents on near-black** ("dark mode SaaS" cliché #2) — bright
  acid-green, electric violet, or vermilion glow-shadows used as the whole
  personality.
- **Glassmorphism everywhere** (frosted blur cards stacked on a gradient mesh)
  used as decoration rather than a deliberate, restrained choice.
- **Generic warm-cream + serif + terracotta** "editorial" template — legitimate
  for some briefs, a default for most.
- **Broadsheet hairline-rules-and-zero-radius** look applied regardless of subject.
- **Emoji used as icons.** Use a real icon set (lucide, heroicons, phosphor) or
  none at all.
- **Bouncy/floaty scattered micro-animations on every element** — card tilts,
  pulsing dots, infinite gradient shimmer. Reads as "AI-generated," not premium.
- **Numbered markers (01 / 02 / 03) used as decoration** when the content isn't
  actually a sequence.
- **Generic dashboard-card grid**: identical rounded-rectangle cards with an
  icon top-left, a big number, and a small label — the templated "metrics"
  layout — used regardless of whether the content is actually metrics.
- **Inter/Roboto + system defaults with no type pairing decision.** A typeface
  picked because it's the default, not because it suits the subject.
- **Robotic copy**: "Welcome to the future of X," "Unlock the power of Y,"
  "Seamlessly leverage Z," exclamation-heavy marketing voice, or cold system
  language ("Error: null reference") in user-facing text.
- **Stock-photo-style AI-generated hero images** of generic smiling people /
  abstract 3D blobs unrelated to the subject.

If you catch yourself reaching for any of these because they're fast — stop.
Pick the thing this specific subject calls for instead.

## 3. THE TOKEN SYSTEM (build this before code, every time)
Work in two passes: brainstorm a plan, critique it against §2, then build.

**Color — 4 to 6 NAMED hex values**, derived from the subject (not a palette
generator default). Example pattern (not a default to copy): a wildfire alert
tool pulls char-black, ember-orange, smoke-grey, ash-white — not a generic red.
State each as `--color-name: #HEX;` with a one-line reason tied to the subject.

**Type — pick 2–3 real typefaces with a deliberate pairing:**
- A **display** face with actual character, used with restraint (headlines,
  the signature element only). Reach beyond the obvious five. Consider, by
  mood — pick ones that fit the *researched* subject, don't default to the
  first on this list:
  - Editorial/serious: *Fraunces, Source Serif 4, Newsreader, Canela, Tiempos*
  - Technical/precise: *Söhne, Neue Montreal, General Sans, Aktiv Grotesk*
  - Warm/human: *Lora, Spectral, Reckless, Sentinel*
  - Sharp/modern: *Cabinet Grotesk, Clash Display, Archivo Expanded*
  - Mono/data: *JetBrains Mono, IBM Plex Mono, Berkeley Mono*
- A **body** face that's legible at small sizes and complements (not matches)
  the display face in mood. Never the same family for both unless that's a
  deliberate, stated choice.
- Optional **utility/mono** face for data, captions, timestamps, code.
- Define a **type scale** with intentional jumps (not evenly-spaced defaults):
  e.g. `12 / 14 / 16 / 20 / 28 / 40 / 64px` with specific weights and
  letter-spacing per level. Display sizes get tighter tracking; small caption
  text gets looser tracking for legibility.
- **Fluid type, not fixed breakpoints**: use `clamp(min, preferred, max)` for
  headline and body sizes so type scales smoothly across viewport widths
  instead of jumping at breakpoints.

**Layout — describe the concept in one sentence + an ASCII wireframe.**
Question grids before defaulting to them. Asymmetry, a single dominant column,
an unconventional split — justify the choice from the subject's content shape.

**Signature — name the ONE element this design will be remembered by.**
A distinctive chart style, an unusual hero treatment, a typographic flourish,
an interaction pattern unique to this subject. Spend your boldness here only;
keep everything else quiet and disciplined.

## 4. ULTRA-RESPONSIVE BY CONSTRUCTION (not an afterthought)
- Build mobile-first; treat desktop as the enhancement, not the baseline.
- Fluid type/spacing via `clamp()` and `cqw`/`vw` units over rigid breakpoints;
  add breakpoints only where the layout structure must actually change
  (column count, nav pattern), not to patch font sizes.
- Touch targets ≥ 44px; generous tap spacing on mobile; hover-only affordances
  must have a touch-equivalent (no information locked behind `:hover`).
- Test the layout at 320px, 768px, 1024px, 1440px, and ultra-wide — describe
  what changes structurally at each, not just "it shrinks."
- Respect `prefers-reduced-motion` and `prefers-color-scheme` by default.
- Images/media: intrinsic sizing, `aspect-ratio` set, no layout shift on load.

## 5. MOTION — orchestrated, not scattered
- One deliberate page-load sequence OR one scroll-triggered reveal OR hover
  micro-interactions — pick what the direction calls for, not all three.
- Motion should clarify hierarchy or relationship (this caused that), never
  decorate for its own sake.
- Easing and duration are choices: a precise/technical subject wants snappy,
  short-duration, linear-ish easing; a warm/editorial subject wants slightly
  longer, softer easing. State which you picked and why.
- Less is more by default. If unsure whether to add an animation — don't.

## 6. WRITING IS DESIGN MATERIAL
> Full authority on copy lives in `COPYWRITING.md` (research process, voice-of-
> customer mining, the banned AI-tell list, editing passes, zero em dashes).
> This section is the short version.
- Write from the user's side of the screen: name things by what people
  control and recognize ("Save changes," not "Submit," not "webhook config").
- Active voice; one verb stays consistent through a flow (the button that says
  "Publish" produces a toast that says "Published," not "Submission successful").
- No filler, no marketing voice, no exclamation points doing the work that
  specificity should do. Sentence case throughout.
- Empty states are an invitation to act, not a dead end. Errors state what
  broke and how to fix it, in the interface's voice — never "Oops!" and never
  a raw stack trace.
- Every word earns its place: a label labels, an example demonstrates — never
  double duty.

## 7. THE RESTRAINT PASS (do this before calling it done)
1. Take a screenshot (or describe the rendered result) and critique it against
   §2's banned list, line by line. Anything that snuck in — cut or replace.
2. Spend boldness in exactly ONE place (§3 Signature). Everything else: quiet.
3. Chanel's rule: remove one accessory before you ship. Find the one extra
   decorative element that isn't doing work, and remove it.
4. Confirm: would a designer who specializes in *this subject's industry* sign
   off on this, or does it look like a template wearing the subject's words?

## 8. RESEARCH STEP (do this first, every new topic)
Before locking the token system, spend a few searches/lookups on:
- 2–3 real, respected products/brands/publications in this exact subject area
  — note their actual color/type choices, not to copy, but to understand the
  vernacular and then deliberately diverge or refine it.
- The terminology practitioners in this field actually use (avoid generic
  tech-speak when the subject has its own vocabulary).
- Any domain-specific visual conventions worth honoring or worth breaking on
  purpose (e.g., medical = clarity & contrast over decoration; finance =
  precision & restraint; creative tools = can afford more personality).
Write 2–3 sentences on what you learned and how it changed your token system
BEFORE writing code. If research changes nothing about your first instinct,
that's a signal your first instinct was a generic default — revisit it.

## 9. QUALITY FLOOR (silent, always-on — don't announce, just do)
- No console errors. Visible keyboard focus on every interactive element.
- Color contrast meets WCAG AA at minimum for body text.
- Real content, not lorem ipsum, in every screen shown.
- Loading skeletons (not spinners-as-decoration), real empty states, real
  inline errors — see §6.
- Fast first paint; no layout shift; images sized.

## 10. ONE-LINE PROMPT TO INVOKE
> "Follow DESIGN.md. Research the subject (§8), build the token system (§3),
> apply the responsive (§4) and motion (§5) rules, write copy per §6, then run
> the restraint pass (§7) before showing me anything."
