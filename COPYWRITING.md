# COPYWRITING.md: Words That Solve the Problem

> Model-agnostic. Works for Claude, Gemini 3 Pro, or any agent. Load alongside
> your build prompt, or reference it: "follow COPYWRITING.md". This governs every
> word a human will read: UI microcopy, the hero, empty states, errors, the
> README, and the demo or blog narrative.
>
> Note: this file is written under its own rules. There is not a single em dash
> in it. Match that.

## 0. THE CORE PRINCIPLE
Real copywriters do not start by writing. They start by listening. Before a
single line is drafted, they know the reader better than the reader knows
themselves, and they steal the reader's own words to say it back. Copy is
research first, writing second. If you write before you have done sections 1
through 3, you are guessing, and guessing reads as generic.

## 1. THE BRIEF (answer in writing before any copy)
Name these out loud in your plan:
1. **The subject.** What is this, concretely, and what does it actually do?
2. **The one reader.** Not a demographic. One person. What do they want, fear,
   struggle with, and dream about, in relation to this exact problem? Write copy
   to that single person, never to "users."
3. **The offer.** What changes for them, and why should they care in the next
   five seconds?
4. **The single job of this screen / page / asset.** One sentence. If it has two
   jobs, split it.
5. **The transformation.** Where is the reader before, and where are they after?
   That before to after move is the story every piece of copy tells.

## 2. VOICE OF CUSTOMER (mine the real words)
The most respected conversion copywriters say they do not write copy, they
assemble it from the language real people already use. Do the same:
- For the build's topic, find where its real users talk: app store reviews of
  similar tools, Reddit and forum threads, support complaints, YouTube comments,
  G2 / Trustpilot. Search a few of these before writing.
- Pull the exact phrases people use for the problem and the relief. Their words,
  not yours. If users say "I keep losing track of which bills I paid," the
  headline is closer to that than to "Streamlined expense management."
- Pay attention to the questions people ask and the objections they raise. Each
  objection is a line of copy waiting to be written.
- Outcome over feature, in their language. Not "Advanced filtering," but the
  result they described wanting.

## 3. MESSAGE HIERARCHY (decide order before wording)
- Lead with the reader's problem or desired outcome, not your product name or a
  feature. The hero answers "what is this and why do I care," fast.
- Rank what to say: the one thing they must understand first, then the proof,
  then the objection handling, then the action. Place each line where the reader
  needs it, not where it is convenient.
- One idea per element. A headline makes one promise. A button names one action.
- Every screen ends in a clear next action. Name it by what happens.

## 4. WRITE TO THE STRUCTURE
Copy and layout are one decision, not two. Draft the words into the wireframe so
length, hierarchy, and flow are real. A headline that needs three lines on mobile
is a headline problem, not a CSS problem. (See DESIGN.md; this section is the
deeper authority on the words themselves.)

## 5. HOW TO WRITE EACH LINE
- **Plain verbs, said out loud.** If you would not say it to a colleague across a
  desk, rewrite it until you would.
- **Specific beats clever.** A real number, a real name, a concrete detail. "Cuts
  triage time from 9 minutes to under 2" beats "dramatically faster."
- **Active voice, consistent vocabulary.** The button that says "Publish" makes a
  toast that says "Published." The same noun for the same thing every time. Do
  not cycle synonyms to sound varied.
- **Take a position.** Say the one true, slightly opinionated thing. Hedged copy
  that offends no one persuades no one.
- **Vary the rhythm.** Mix a five word sentence with a long one. Let one be a
  single word. Real thinking is uneven, and so is real writing.

## 6. THE BANNED LIST (these are why writing reads as AI)
Do not use, unless quoting someone or naming a real product:

**Punctuation tells**
- **Em dashes. None.** Use a comma, a period, parentheses, or split the sentence.
  This is the single most common machine signature. Zero of them.
- Do not stack parentheses or lean on the colon for fake drama.
- Exclamation points only when a real person genuinely would, and rarely.

**Vocabulary tells** (pick a plain word or a concrete description instead)
delve, dive into, embark, journey, realm, landscape (as metaphor), tapestry,
vibrant, leverage, harness, unlock, unleash, supercharge, elevate, empower,
seamless, seamlessly, robust, streamline, facilitate, utilize, showcase,
underscore, pivotal, crucial, paramount, meticulous, intricate, multifaceted,
testament, transformative, groundbreaking, revolutionary, game-changing,
cutting-edge, ever-evolving, paradigm, holistic, comprehensive.

**Stock phrases**
"in today's fast-paced world," "in the ever-evolving world of," "it is important
to note," "when it comes to," "at the end of the day," "navigating the
landscape," "more than just," "we have got you covered," "look no further,"
"welcome to the future of."

**Structure tells**
- **Negative parallelism.** No "not just X, but Y" and no "it is not X, it is Y."
- **Rule of three.** Do not default to listing everything in tidy triples. Vary
  list length.
- **Transition clusters.** Avoid stacking Furthermore, Moreover, Additionally,
  Consequently. Most can be cut with no loss.
- **Copula avoidance.** Do not write "serves as," "stands as," "boasts,"
  "features" to dodge the word "is." Just use is, are, has.
- **Chatbot residue.** Never "Certainly," "Great question," "I hope this helps."

## 7. THE EDITING PASSES (do all of them)
1. **The cynical read.** Step away, then read it as a busy, skeptical stranger
   with zero patience. Cut anything that makes them shrug or scroll.
2. **Read aloud.** Every sentence. Anything you stumble on or would never say,
   rewrite. This single pass removes most machine cadence.
3. **Cut.** Delete every word that does not change the meaning. Then cut one more.
   If a label and an example are doing the same job, keep one.
4. **Specificity pass.** Replace every "many," "various," "powerful," and "fast"
   with a concrete fact, or remove the claim.
5. **Consistency pass.** Same word for the same thing, button to toast to heading.
6. **Banned-list pass.** Run section 6 against the draft, line by line. Scrub em
   dashes first.

## 8. UI MICROCOPY RULES (the small words that decide trust)
- **Buttons name the outcome.** "Analyze report," not "Submit." "Find homes," not
  "Go."
- **Empty states invite action.** Say what this becomes and how to start, not
  "No data."
- **Errors are direction, not apology.** State what broke and the next step, in
  the product's voice. Never a raw stack trace, never "Oops, something went
  wrong."
- **Loading is honest.** Say what is happening if it takes a moment.
- **Labels label, in the user's terms.** Name things people control and
  recognize, never how the system is built.

## 9. THE DEMO / BLOG NARRATIVE (this is scored, write it well)
For PromptWars, a human reviewer reads your narrative. Make it a real
story, not a feature dump:
- Open on the problem, in a real person's words (from section 2).
- Show the before to after transformation with one concrete example.
- Be specific about how the product solves it. One honest, opinionated sentence
  about why this approach is right.
- No hype words, no em dashes, no rule-of-three padding. Short and true wins.

## 10. PRE-SHIP CHECKLIST (run before submitting)
- [ ] Every line traces to the one reader's real words or need (sections 1 to 2)
- [ ] Hero states problem and value in the first read, no product-name-first
- [ ] Buttons name outcomes; one verb stays consistent through each flow
- [ ] Empty states invite action; errors give direction, not apology
- [ ] Read aloud; nothing you would not say to a person
- [ ] Specific facts replaced vague claims
- [ ] **Zero em dashes**; banned vocabulary and stock phrases scrubbed
- [ ] No negative parallelism, no forced triples, no transition clusters
- [ ] At least one honest, slightly opinionated line; not all hedged

## 11. ONE-LINE PROMPT TO INVOKE
> "Follow COPYWRITING.md. Do the brief and voice-of-customer research first
> (sections 1 to 2), set the message hierarchy, write to the wireframe, then run
> all editing passes (section 7) and the banned-list scrub. No em dashes."
