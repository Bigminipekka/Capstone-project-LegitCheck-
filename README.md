# LegitCheck

LegitCheck scans job postings and emails for signs of a scam. Paste text or upload a screenshot, and two layers review it: a rule engine built from FTC, BBB and IC3 guidance, and an AI review. The site shows one overall risk rating, which is the higher of the two layers, with an explanation and recommended safety actions.

Capstone project, CYBR 498, Christopher Newport University. Author: Cliff Wetherbee.

## Features

- Job posting and email scanning
- Rule engine with 31 sourced rules (19 job, 12 email) stored in Supabase
- AI review using Claude Haiku through the Anthropic API
- Overall risk is the higher of the two layers
- Screenshot upload and clipboard paste, read with in-browser OCR (Tesseract.js)
- Suspicious phrases marked in the user's own text
- Domain age check using RDAP lookups
- Wrong-mode notice when a job posting is pasted in email mode, or the reverse
- Live scan counts and average scan times
- Public Database page listing every rule and its source
- How It Works, Privacy and Terms pages

## Tech stack

Next.js (App Router), TypeScript, Tailwind CSS, Supabase (Postgres), Anthropic API, Tesseract.js. Deployment to Vercel is planned.

## Folder map

- `app/` : pages and API routes
  - `app/page.tsx` : scanner page
  - `app/results/` : results page
  - `app/database/` : public rules database
  - `app/how-it-works/`, `app/privacy/`, `app/terms/` : information pages
  - `app/api/analyze/` : rule engine route
  - `app/api/ai-analyze/` : AI review route
  - `app/api/domain-check/` : domain age lookup route
  - `app/api/stats/` : scan counts and average times
- `lib/` : shared code
  - `detection.ts`, `emailDetection.ts` : job and email rule matching
  - `matching.ts` : phrase matching helpers
  - `typeCheck.ts` : wrong-mode detection
  - `domain.ts` : domain extraction and RDAP lookups
  - `supabase.ts` : database client
- `public/` : static files

## Running it locally

1. Install dependencies: `npm install`
2. Create a `.env.local` file in the project root (never commit it):
