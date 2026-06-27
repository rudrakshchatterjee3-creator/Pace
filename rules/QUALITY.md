# rules/QUALITY.md — Security, Efficiency, Testing, Accessibility

These four are graded dimensions in many hackathon rubrics, separate from
`DESIGN.md` (look/feel) and `COPYWRITING.md` (words). Apply concretely, not as
buzzwords. Run the checklist below in P6 (Polish) alongside the design and copy
passes, and again in `rules/CHECKLIST.md` before each submission.

## Security
- API key never reaches the client. Already enforced: `server/index.ts` proxies
  Gemini, the key is read server-side only from `GEMINI_API_KEY`. Verify the
  built `dist/` bundle contains no key string before deploying.
- Validate `/api/agent` input: reject empty `task`/`schemaHint`, cap input size
  (e.g. reject payloads over ~50KB) so one bad request can't hang the server.
- Same-origin only. No open CORS wildcard; the frontend and API share one
  origin in this architecture, so don't add `cors()` with `*` unless a real
  cross-origin need appears.
- **If the app handles sensitive personal content** (health, mental health,
  financial, identity data): do not log the raw content to server console in
  production. Log metadata (timestamp, task name, success/fail), not the
  payload. State this explicitly in the README as a privacy note; judges
  notice when sensitive-data handling is treated seriously.
- Secrets live in `.env` / Cloud Run env vars only, never committed; `.gitignore`
  already covers this.

## Efficiency
- Debounce any AI call triggered by typing (e.g. 500-800ms after the user
  stops), never fire a request per keystroke.
- Don't re-render expensive chart/list components on every parent state change;
  memoize where the data is large or the component is heavy.
- Keep the production bundle lean: this starter currently builds to roughly
  150KB JS / 7KB CSS pre-gzip. If a new dependency roughly doubles that, ask
  whether it's earning its place.
- Use the fast model (`gemini-3.5-flash`) for anything latency-sensitive in the
  UI; reserve the heavier model for one-shot, non-interactive reasoning steps.

## Testing
A full test suite is not realistic in a 2-3 hour window. Do this instead, and
it is enough to credibly answer "how did you test this":
- **One smoke-test script** that hits `/healthz` and `/api/agent` with a real
  payload and checks the response shape. A 15-line script is enough; it does
  not need a framework. Run it after deploy against the live Cloud Run URL.
- **Manual click-through of the full happy path**, every `rules/LOOP.md` pass,
  with the result actually observed (browser-verified), not assumed.
- **One deliberate bad-input test**: submit empty input, oversized input, or a
  request with no network, and confirm the app degrades to the mock fallback
  or a clear error rather than a blank screen or crash.

## Accessibility
- Every interactive element has a visible keyboard focus state (already in
  `src/index.css` via `:focus-visible`; do not remove it).
- Every icon-only button needs an `aria-label` (lucide-react icons carry no
  label by default). Every input needs an associated `<label>`, not just a
  placeholder.
- Any AI-generated result that appears asynchronously (the agentic loop's
  output) should live in a region a screen reader announces on update, e.g.
  `aria-live="polite"` on the result container, so the result isn't silently
  missed.
- Color contrast: body text on the `--color-paper` background must meet at
  least WCAG AA. Check the actual hex pair chosen in P1, don't assume.
- `prefers-reduced-motion` is already respected globally in `src/index.css`;
  keep it that way when adding new animations.
- **If the topic involves a vulnerable or stressed audience** (health, mental
  health, exam stress, crisis-adjacent topics): keep the interface calm by
  default — no autoplay sound, no flashing or urgent-feeling motion, generous
  whitespace, larger touch targets than the baseline 44px where the audience
  may be using the app one-handed or under stress.
