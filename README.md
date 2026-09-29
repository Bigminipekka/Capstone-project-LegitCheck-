# Capstone-project-LegitCheck-
# LegitCheck

LegitCheck is a website that helps students and job seekers determine whether a job posting or email is likely a scam before they apply or respond. Users paste in a job posting or suspicious email, and LegitCheck analyzes it against a research-backed set of fraud indicators, returning a clear risk score along with a breakdown of exactly which red flags were detected and why they matter.

Built as a information science capstone project, LegitCheck is designed to be transparent about its detection logic — every rule it checks for is sourced from established consumer protection guidance (FTC, BBB, FBI IC3), and users can browse the full rule set on the site's Database page.

## Features
Job Posting Scanner — paste a job posting and receive a risk score (Low/Medium/High) with a detailed breakdown of matched red flags
Email Scanner — same analysis applied to suspicious emails, with its own dedicated set of phishing-specific fraud indicators
Transparent Rule Database — a public page listing every fraud indicator LegitCheck checks for, along with its source and why it matters
Weighted risk scoring — red flags are weighted (Medium, Medium-High, High) based on how strong an indicator they are of fraud

## Tech Stack

Frontend/Backend: [Next.js](https://nextjs.org/) (App Router) with TypeScript
Styling: Tailwind CSS
Database: [Supabase](https://supabase.com/) (PostgreSQL) — stores the fraud indicator rule set
Design: Figma (initial mockups)
Planned hosting: Vercel

3. Create a `.env.local` file in the project root with your Supabase credentials:
