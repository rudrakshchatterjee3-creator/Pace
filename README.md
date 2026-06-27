# Pace — Mental Wellness Tracker for Exam Students

> **Problem Statement:** Students preparing for high-stakes board exams and competitive entrance tests (NEET, JEE, CUET, CAT, GATE, UPSC, SSC) often face severe stress, burnout, and self-doubt. Standard productivity apps miss the emotional layer. Pace is a Generative AI-powered mental wellness companion that analyzes open-ended daily journaling and mood logs to uncover hidden stress triggers and emotional patterns, providing hyper-personalized, contextual wellness support — real-time coping strategies, adaptive mindfulness exercises, and motivational encouragement — as an empathetic, always-available digital companion throughout their academic journey.

---

## Features Mapped to the Problem Statement

| Problem | Pace Feature |
|---|---|
| Students face severe stress and burnout | Daily journal with AI-powered emotional analysis |
| Standard trackers miss hidden stress triggers | LLM extracts `detected_stressors` and `emotional_tone` from free-text entries |
| Need hyper-personalized, contextual support | User profile (name, age, target exam) is injected into every LLM call for exam-specific advice |
| Adaptive mindfulness exercises | Box Breathing timer and grounding strategies on the Resources tab |
| Motivational encouragement | AI-generated `strategy` addresses user by name with exam-specific guidance |
| Resilience tracking over time | LLM rates each entry with a `resilience_score` (1–10), visualized as a line graph on the Trends dashboard |
| Always-available companion | Works offline with Local Storage persistence; fallback mock data when API is unavailable |
| Crisis/safety override | Detects crisis signals and immediately surfaces KIRAN (1800-599-0019) and AASRA helplines |

---

## Where and Why GenAI is Used

### Primary AI Integration — NVIDIA NIM (Llama 3.1 70B Instruct)
- **File:** `server/index.ts` → `/api/agent` POST route
- **Why:** The backend proxies all LLM requests through the NVIDIA NIM API (`meta/llama-3.1-70b-instruct`). This keeps the API key server-side and never exposed to the client bundle.
- **What it does:**
  1. Analyzes the student's free-text journal entry
  2. Detects crisis signals (self-harm, suicidal ideation) → triggers safety override
  3. Identifies stress triggers specific to the student's exam (NEET bio memorization vs. JEE speed-accuracy trade-offs)
  4. Rates the student's mental resilience on a scale of 1–10 (`resilience_score`)
  5. Generates one personalized, actionable grounding strategy — addressed by name, tuned to exam and age
- **Schema enforced:** `{ is_crisis: boolean, detected_stressors: string[], emotional_tone: string, strategy: string, resilience_score: number }`

### Client-Side Fallback — Mock Data
- **File:** `src/lib/geminiClient.ts`
- **Why:** The `callAgent` wrapper gracefully falls back to deterministic mock data when the API is rate-limited or the network is down. This keeps the demo flawless at competition venues with unreliable Wi-Fi.

---

## Tech Stack

- **Frontend:** React 18 + TypeScript, Vite, Tailwind CSS, Recharts
- **Backend:** Node.js + Express (API proxy, static file serving)
- **Auth:** Google OAuth via `@react-oauth/google` (session persisted in `localStorage`)
- **AI:** NVIDIA NIM API (`meta/llama-3.1-70b-instruct`) via server-side fetch proxy
- **Data:** Browser `localStorage` (per Google account, keyed by email)
- **Deployment:** Google Cloud Run (via `Dockerfile`)

---

## Running Locally

```bash
# 1. Set your API key
echo "NVIDIA_API_KEY=your_key_here" > .env

# 2. Install dependencies
npm install

# 3. Start dev server (Vite + Express concurrently)
npm run dev
```

App runs at `http://localhost:5174`. API proxy runs at `http://localhost:8081`.

---

## Quality & Testing

```bash
npm test              # Run Vitest test suite (mocked API, no key needed)
npm run test:coverage # Coverage report (v8)
npm run lint          # ESLint with TypeScript + jsx-a11y
npm run typecheck     # tsc --noEmit
npm run audit         # npm audit --audit-level=high
```

---

## Deployment (Google Cloud Run)

```bash
gcloud run deploy pace-app \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NVIDIA_API_KEY=your_key_here"
```
