# rules/CHECKLIST.md — Pre-Submit Checklist

Run this before EVERY submission (all three attempts). If any box fails, fix it
before submitting, unless fixing it risks the happy path with no time to verify.

## Runs and works
- [ ] `npm run dev` boots clean, no console errors
- [ ] Full demo path works end to end WITH live API
- [ ] Full demo path works end to end WITHOUT live API (mock fallback engages)
- [ ] No unhandled promise rejections, no red console errors during the demo
- [ ] Every acceptance criterion scored 8+ in rules/LOOP.md with real evidence
      (not self-graded by the same pass that built the feature)

## Solves the problem
- [ ] Solves the exact stated challenge, not an adjacent one
- [ ] The problem is restated in the UI so the connection is obvious
- [ ] AI produces STRUCTURED output that visibly drives the interface
- [ ] It performs a task (agentic), it is not a chatbot

## Looks the part (DESIGN.md)
- [ ] 3-second test passes: problem + value clear on first paint
- [ ] Signature element present; nothing reads as a banned AI default
- [ ] Responsive laptop + mobile + projector; visible keyboard focus
- [ ] Real content everywhere, no lorem ipsum
- [ ] Restraint pass done; one unnecessary element removed

## Reads the part (COPYWRITING.md)
- [ ] Hero leads with the reader's problem in their words, not the product name
- [ ] Buttons named by outcome; one verb stays consistent through each flow
- [ ] Empty states invite action; errors give direction, not apology
- [ ] Read aloud; nothing you would not say to a person
- [ ] Vague claims replaced with specific facts
- [ ] **Zero em dashes**; banned vocabulary and stock phrases scrubbed
- [ ] No negative parallelism, no forced triples, no transition clusters

## Shippable
- [ ] README + 60-second demo script + build narrative present
- [ ] Clean `npm install && npm run dev` from a fresh clone
- [ ] Deployed to Cloud Run; public URL loads and runs the happy path
- [ ] Screenshots / browser walkthrough captured as artifacts
