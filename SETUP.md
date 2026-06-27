# SETUP — what's already wired vs. what you do once

Everything below already exists in this starter and is ready to run. This file
is a reference, not a to-do list. The agent should not recreate these files.

## Already provided (full scaffold, app boots immediately)
- `package.json` — scripts (`dev`, `build`, `start`) and all deps pinned.
- `vite.config.ts` — dev server + `/api` proxy to the Express server.
- `tsconfig.json`, `tsconfig.node.json` — TypeScript config for client + server.
- `tailwind.config.js`, `postcss.config.js` — Tailwind wired to CSS variables.
- `index.html`, `src/main.tsx`, `src/index.css` — app entry + token placeholders.
- `src/App.tsx` — a REFERENCE agentic-loop implementation (input → Gemini →
  structured JSON → loading/result/empty/error states, with mock fallback).
  Replace its task/schema/mock/UI with the real challenge feature in P4; keep
  the same shape.
- `src/lib/geminiClient.ts` — typed, demo-proof frontend wrapper (retry, JSON
  parse, mock fallback).
- `server/index.ts` — Express: serves `dist/` + proxies Gemini server-side.
- `Dockerfile`, `.dockerignore`, `.gitignore` — Cloud Run container + git hygiene.
- `.env.example` — copy to `.env` for local; set the same vars in Cloud Run.

## One-time, before the event
1. `npm install`
2. `cp .env.example .env` and fill in a real `GEMINI_API_KEY`.
3. `npm run dev` — Vite on `:5173`, API server on `:8080`, proxied. Confirm the
   reference demo in `App.tsx` runs (type something, press Run, see a result).
4. `gcloud auth login` and `gcloud config set project YOUR_PROJECT_ID`.
5. Confirm Cloud Run + Cloud Build APIs are enabled on that project.

## During the event, after `Build: <challenge>`
The agent edits `App.tsx` and adds files under `src/` as needed per
`rules/PIPELINE.md`. The scaffold, proxy, server, and Docker setup do not need
to change unless the challenge genuinely requires a different architecture.

## Deploy to Cloud Run (one command, builds from the Dockerfile)
```bash
# fast path: key as a plain env var
gcloud run deploy promptwars-app \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=YOUR_KEY,GEMINI_MODEL=gemini-3.5-flash

# cleaner: key in Secret Manager (set this up the night before)
echo -n "YOUR_KEY" | gcloud secrets create gemini-api-key --data-file=-
gcloud run deploy promptwars-app \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_MODEL=gemini-3.5-flash \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest
```
`--source .` lets Cloud Run build the image for you (no manual `docker build`/push).
After deploy, open the printed URL and run the full demo path on the live instance.
