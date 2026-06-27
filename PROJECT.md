# Project: Mental Wellness Tracker

## Architecture
- **Frontend (Vite + React 18 + TS + Tailwind CSS)**:
  - Entry point: `src/main.tsx`
  - Core views: User Profile, Journaling, Trends Dashboard.
  - State management: React Context or React states in `src/App.tsx`, persisted via Local Storage.
- **Backend (Node.js + Express 8081)**:
  - Endpoint `/api/agent`: proxies LLM requests to NVIDIA llama-3.1-70b-instruct, injecting user profile context.
- **Data Flow**:
  - User details + entry input -> call `/api/agent` (includes user profile details context) -> returns stress/resilience analysis -> state updated & persisted in Local Storage -> Recharts renders scores.

## Code Layout
- `src/main.tsx`: App rendering and Google OAuth setup.
- `src/App.tsx`: App router, layout, profiles, journaling state, dashboard views.
- `src/lib/history.ts`: History schema, helper functions for stats (day streak, entries count).
- `server/index.ts`: Express backend proxying LLM requests.
- `src/mocks/`: Mock implementations for tests.

## Milestones
| # | Name | Scope | Dependencies | Status | Conversation ID |
|---|---|---|---|---|---|
| 1 | Milestone 1: User Profile & LLM Context | Profile capture (age, name, exam) + templates + LLM prompt injection | None | DONE | 9b72cfbe-0dbd-49c4-9871-a6a36810bdef |
| 2 | Milestone 2: Resilience Scoring & Dashboards | Add resilience scoring + Recharts Area chart + LocalStorage persistence | M1 | PLANNED | |
| 3 | Milestone 3: Google Auth Persistence | Persist Google credential in Local Storage + restore on mount + handle expiration | None | PLANNED | |
| 4 | Milestone 4: Quality & Testing Pipeline Setup | Install/configure Vitest, ESLint + jsx-a11y, fix audit vulnerabilities | None | PLANNED | |
| 5 | Milestone 5: E2E Test Suite (Tiers 1-4) | Write 60 opaque-box tests covering all feature tiers, publish `TEST_READY.md` | M1, M2, M3, M4 | PLANNED | |
| 6 | Milestone 6: Adversarial Hardening (Tier 5) | Run challenger, check coverage gaps, write adversarial tests | M5 | PLANNED | |

## Interface Contracts
### Client ↔ Server `/api/agent`
- **Request (PaceIn)**:
  ```typescript
  interface PaceIn {
    task: string; // "analyze-journal"
    input: string; // user entry
    profile: {
      name: string;
      age: number;
      exam: string;
    };
    template?: string; // problem template if used
  }
  ```
- **Response (PaceOut)**:
  ```typescript
  interface PaceOut {
    is_crisis: boolean;
    detected_stressors: string[];
    emotional_tone: string;
    strategy: string;
    resilience_score: number; // 1-10 rating
  }
  ```
