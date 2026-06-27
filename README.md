# Pace: Mental Wellness Tracker for Exam Prep

Pace frames exam prep as a marathon rather than a sprint. It is a GenAI-powered journaling app that helps students process burnout and regain rhythm without feeling like a medical intervention.

## Problem & Solution
**Problem:** Students preparing for high-stakes exams (NEET, JEE, UPSC) often face severe stress, burnout, and self-doubt. They don't want a clinical therapy bot; they just need a place to unpack their thoughts.
**Solution:** Pace acts as a "Daily Debrief". Students drop their thoughts into a simple, calming interface. The app analyzes their entry to reflect back their stress triggers and provides one actionable, non-clinical grounding strategy.

## How to Run
1. Clone this repository.
2. Run `npm install`.
3. Set your `GEMINI_API_KEY` in a `.env` file (copy from `.env.example`).
4. Run `npm run dev`.
5. Open the local server URL. 
(Note: You can click "Load Demo" to run the app using fallback data if you don't have an API key).

## Architecture & Stack
- **Frontend:** React + Vite + Tailwind CSS + TypeScript.
- **Backend:** Express proxy server.
- **AI Engine:** Nvidia NIM API (`meta/llama-3.1-70b-instruct`). We migrated to Nvidia NIM for powerful open-source model access and to quickly process mental wellness journaling safely, utilizing Llama 3.1 70B for deep reasoning and accurate stressor detection.
- **Security:** The Nvidia API key is strictly stored server-side. The frontend calls `/api/agent` to fetch analysis securely.

## Safety Requirement
Pace handles real emotional states. If a journal entry contains signals of self-harm or crisis-level distress, the AI analysis is immediately overridden. A calm, prominent "Crisis Support" card with real helpline numbers (like KIRAN or AASRA in India) is displayed instead of standard coaching.
