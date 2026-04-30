# Scaler Persona Lab

A working persona-based AI chatbot for **Assignment 01 — Persona-Based AI Chatbot** in Scaler Academy Prompt Engineering.

The app lets users chat with three separate Scaler / InterviewBit personality simulations:

- **Anshuman Singh** — pragmatic founder-engineer mentor
- **Abhimanyu Saxena** — strategic founder-operator and education-system builder
- **Kshitij Mishra** — warm technical mentor and builder-oriented teacher

> These are respectful educational simulations based on public information and prompt-design research. They are not the real people and should not be treated as their actual statements.

## Live Demo

Live URL: https://scaler-persona-chatbot-pi.vercel.app

## Why this satisfies the assignment

- Real frontend and backend in one deployed-ready Next.js app
- Persona switcher for all three official personas
- Switching persona resets conversation history and swaps the system prompt
- Separate researched system prompt per persona in `app/lib/personas.ts`
- Each prompt includes persona description, few-shot examples, internal chain-of-thought instruction, output rules, and constraints
- Gemini API key is read only from environment variables
- User-friendly API error handling
- Suggestion chips, typing indicator, active persona state, and mobile-responsive UI
- `prompts.md` documents prompt choices and research rationale
- `reflection.md` contains the required 300–500 word reflection

## Features

- Polished responsive chat UI with three-panel desktop layout and stacked mobile layout
- Persona cards with active style signals
- Quick-start questions per persona
- Isolated conversation state per persona switch
- Server-side `/api/chat` route using Google Gemini via `@google/generative-ai`
- Optional Supabase Auth login gate for deployed access control
- Environment-variable-only API key handling
- Request validation and capped chat history for safer API calls
- Graceful quota/model/key error messages
- Public-source research notes in `docs/` and `research/deep-style/`
- Persona differentiation validation in `docs/persona-validation.md` with same-question test cases

## Tech stack

- Next.js App Router
- React
- TypeScript
- Google Gemini API
- CSS modules/global CSS without extra UI dependencies

## Setup

```bash
npm install
cp .env.example .env.local
```

Add your Gemini API key in `.env.local`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash-lite
GEMINI_FALLBACK_MODELS=gemini-2.0-flash-lite,gemma-3-4b-it

# Optional login/database via Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

If the Supabase variables are absent, the app runs without login for local testing. If they are present, users must sign in before calling `/api/chat`.

Run locally:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Quality checks

```bash
npm run lint
npm run build
```

Both commands should pass before submission.

## Deployment

Recommended: Vercel.

1. Push this folder to a public GitHub repo.
2. Import the repo into Vercel.
3. Add environment variables:
   - `GEMINI_API_KEY`
   - optional: `GEMINI_MODEL=gemini-2.5-flash-lite`
   - optional: `GEMINI_FALLBACK_MODELS=gemini-2.0-flash-lite,gemma-3-4b-it`
   - optional login/database: `NEXT_PUBLIC_SUPABASE_URL`
   - optional login/database: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.
5. Paste the deployed URL into the **Live Demo** section above.

## Project structure

```text
app/
  api/chat/route.ts       # Server-side Gemini API call
  lib/personas.ts         # Three persona system prompts
  lib/supabaseClient.ts   # Browser Supabase Auth client
  page.tsx                # Chat UI
  globals.css             # Responsive styling
prompts.md                # Prompt documentation and annotated decisions
reflection.md             # 300–500 word assignment reflection
docs/                     # YouTube/public-source style analysis + persona validation
research/deep-style/      # Deeper public-source synthesis and ledger
.env.example              # Safe env template, no real key
eslint.config.mjs         # ESLint flat config for modern Next.js
```

## Submission checklist

- [ ] Public GitHub repo link shared
- [x] Live deployed URL shared
- [x] README has setup instructions and live URL slot
- [x] `.env.example` is present and sanitized
- [x] Real API keys are gitignored
- [x] All three official personas are implemented
- [x] Persona switcher resets the conversation
- [x] Suggestion chips are present
- [x] Typing indicator is present
- [x] Backend passes persona-specific system prompt correctly
- [x] API errors are handled gracefully
- [x] `prompts.md` includes all three prompts and rationale
- [x] `reflection.md` is present
- [x] Mobile-responsive UI

## Ethical note

The assignment mentioned researching public sources and also classroom/WhatsApp context. This implementation intentionally avoids private or unverifiable material in the actual prompts. It uses public-source evidence, documented style patterns, and safety constraints so the personas feel useful without fabricating private beliefs or quotes.
