# E2E Test Infra: Mental Wellness Tracker

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + BVA + Pairwise + Workload Testing.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | User Profile Management | R1 (User Profiles & LLM Context) | 5 | 5 | ✓ |
| 2 | Structured Templates & Chat | R1 (Structured templates + open-ended) | 5 | 5 | ✓ |
| 3 | LLM Resilience Analysis | R2 (Resilience Scoring) | 5 | 5 | ✓ |
| 4 | Resilience Dashboard | R2 (Visualizing trends & LocalStorage) | 5 | 5 | ✓ |
| 5 | Auth Persistence | R3 (Google Auth Persistence) | 5 | 5 | ✓ |

## Test Architecture
- **Test Runner**: Vitest (configured to run headlessly, simulating UI interactions).
- **Test Case Format**: TS/JS test files using testing-library to check state changes, mock window.localStorage, and mock google auth APIs.
- **Directory Layout**:
  - Test suites: `src/**/*.test.ts`, `src/**/*.test.tsx`
  - Mock handlers: `src/mocks/`

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | First-Time User Registration & Journaling | User Profile, Chat Templates, LLM Resilience, Dashboard, Auth Persistence | High |
| 2 | Exam Preparation Stress Journaling (NEET/JEE) | User Profile (NEET/JEE context), Structured templates, Resilience trends | High |
| 3 | Dashboard Persistence & Historical Score Trend | LocalStorage, Dashboard trends graph, Resilience scoring | Medium |
| 4 | Session Expiration and Re-authentication | Auth Persistence, Profile access, Logout/Login | Medium |
| 5 | Crisis Ideation Alert & Actionable Strategy | LLM analysis (crisis tone), Structured templates, Grounding strategy display | High |

## Coverage Thresholds
- Tier 1: ≥5 per feature (Total 25)
- Tier 2: ≥5 per feature (Total 25)
- Tier 3: Pairwise coverage of major feature interactions (Total 5)
- Tier 4: ≥5 realistic application scenarios (Total 5)
- **Total Minimum: 60 test cases**
