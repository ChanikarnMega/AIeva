# Candidate Evaluation

An AI candidate-evaluation tool: upload a candidate's résumé/answers (and an
optional job description), get a pass/fail score with a written breakdown,
then ask an AI follow-up questions about that candidate. This is the real
implementation of the `Candidate Evaluation.dc.html` design handed off from
Claude Design (see `../README.md` and `../chats/chat1.md` at the repo root
for the original design brief).

Pink theme + rounded corners layered on top of the "Modernist" design
system (`src/modernist.css` is the system unmodified; `src/theme.css` is
the app's override, matching what the design prototype did).

## Stack

- **Frontend:** React + Vite, client-side routing (`react-router-dom`,
  hash-based so it works on any static host with no server rewrite rules).
- **AI backend:** Netlify Functions (`netlify/functions/analyze.js`,
  `netlify/functions/chat.js`) proxy to the Claude API using
  `@anthropic-ai/sdk`, so the Anthropic API key never reaches the browser.
- **File parsing:** done client-side before upload — `.pdf` via `pdfjs-dist`,
  `.docx` via `mammoth`, `.txt/.md/.csv/.json` read directly. Legacy `.doc`
  and images are attached as metadata only (no client-side way to extract
  their text); the "paste text directly" field is the fallback for those.
- **Persistence:** `localStorage`, same as the design prototype — no
  database. Candidates only exist in the browser that analyzed them.

## Local development

```bash
npm install

# Option A — full stack (functions + frontend), needs the Netlify CLI:
npx netlify dev

# Option B — frontend only, functions calls will 404 unless something
# else is serving them on :9000 (see the proxy in vite.config.js):
npm run dev
```

Set `ANTHROPIC_API_KEY` before running functions locally — copy
`.env.example` to `.env` (git-ignored) and fill in a real key, or export it
in your shell. `netlify dev` reads `.env` automatically.

## Deploying

This is a static Vite build plus two Netlify Functions — deploy it to
Netlify (or adapt the two functions to another serverless platform; they're
plain Fetch-API-style handlers with no Netlify-specific code beyond the
`export const config = { path: ... }` route declaration).

1. Push this repo (or just the `app/` directory) to Netlify.
2. Build command `npm run build`, publish directory `dist` — already set in
   `netlify.toml`.
3. In the Netlify site's **Environment variables**, set `ANTHROPIC_API_KEY`
   to a real Anthropic API key. Without it, `/api/analyze` and `/api/chat`
   return a clear "not configured" error instead of the AI running.

## What's different from the design prototype

The prototype ran inside Claude Design's preview, where `window.claude.complete(...)`
was a stand-in for a real model call and PDF/Word files couldn't be read at
all (two CDN attempts to load `pdf.js` were blocked by the preview sandbox).
This implementation:

- Replaces `window.claude.complete` with real Claude API calls through the
  two serverless functions above (`claude-opus-5`, structured JSON output
  for the evaluation, plain text for chat).
- Actually extracts text from `.pdf` and `.docx` files in the browser
  before sending it to the AI, instead of only accepting pasted text.
