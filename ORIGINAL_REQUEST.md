# Original User Request

## Initial Request — 2026-06-27T07:55:44Z

# Teamwork Project Prompt — Draft

> Status: Ready for launch — awaiting user approval.
> Goal: Craft prompt → get user approval → delegate to teamwork_preview

A mental wellness web app for students preparing for competitive exams (NEET, JEE, etc.). Features user profiling, GenAI-based journaling with resilience scoring and templates, persisted Google authentication, and dynamic dashboards with graphs. The codebase must pass rigorous automated checks for test coverage, linting, accessibility, security, and performance.

Working directory: c:\Users\muzee\OneDrive\Documents\Mental Wellness Tracker
Integrity mode: demo

## Requirements

### R1. User Profiles & LLM Context
Implement a user details page to capture age, name, profile picture, and target exam (NEET, JEE, CUET, CAT, GATE, UPSC, SSC, Others). Pass these details to the LLM so advice is exam-specific. Provide structured templates for common student problems in addition to open-ended chat.

### R2. Resilience Scoring & Dashboards
Use the LLM logic engine to analyze journal entries and generate a Mental Resilience Score. Implement a dynamic dashboard using Recharts (or similar) to visualize this score and trends over time. Persist all user details, scores, and entries using Local Storage.

### R3. Authentication Persistence
Fix the Google authentication implementation so that the user remains logged in even when they refresh the site.

### R4. PromptWars Quality & Testing Pipeline
- **Coverage**: Add `@vitest/coverage-v8`, mock the LLM API, and write meaningful tests for all state transitions and failure paths.
- **Quality**: Ensure `npm run lint` (including `jsx-a11y`) and `tsc --noEmit` pass with zero warnings/errors.
- **Security**: Ensure API keys are server-side only. Run `npm run audit` and fix vulnerabilities.
- **Performance**: Ensure LLM calls are debounced. Optimize bundle size.
- **Final Gate**: `npm run lint && npm test && npm run build && npm run audit` must run flawlessly.

## Acceptance Criteria

### Features & Persistence
- [ ] User profile details can be saved and persist on page refresh.
- [ ] Journaling generates a Resilience Score, which is visualized on a dashboard graph.
- [ ] Google authentication state is preserved across page reloads.

### Quality & Verification
- [ ] `npm test` runs successfully without an active API key, covering failure paths.
- [ ] The command `npm run lint && npm test && npm run build && npm run audit` executes successfully with exit code 0.
- [ ] The `README.md` is updated to align with the original problem statement.
