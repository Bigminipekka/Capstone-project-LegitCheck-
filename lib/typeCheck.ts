// A rough check of whether pasted text looks like an email or a job posting.
// It only returns a guess when one side clearly dominates; otherwise null.
export type ContentKind = "job_posting" | "email";
 
const jobSignals = [
  /responsibilities/,
  /qualifications/,
  /requirements:|minimum requirements/,
  /job description|job details|job type/,
  /full[- ]time|part[- ]time/,
  /per hour|an hour|\/hr|\/hour|salary/,
  /benefits/,
  /how to apply|apply (now|today|online)/,
  /equal opportunity/,
  /experience (required|preferred)/,
  // Wording common in scam postings and job-offer messages
  /\bresume\b|\bcv\b/,
  /work from home|remote (position|role|job|work)/,
  /no experience/,
  /\b(we are|now|currently) hiring\b|\bhiring (manager|team)\b/,
  /(earn|make|paid|pay)\b[^.\n]{0,15}\$\s?\d[\d,]*\s?(\/|per|a)\s?(day|week|hour|hr)/,
  /\b(job|position) (offer|opening)\b/,
];
 
const emailSignals = [
  /^\s*(subject|from|to|cc):/m,
  /\b(dear|hi|hello)\b[^\n]{0,40},/,
  /unsubscribe/,
  /(sincerely|regards|thank you|thanks)[,.]?\s*\n/,
  /this (email|message) was sent to/,
  /do not reply|no-reply|noreply/,
  /view (this )?(email )?in (your )?browser/,
  // Signs of a copied email header
  /<[^<>\s]+@[^<>\s]+>/,
  /^\s*to me\b/m,
  /^\s*inbox\s*$/m,
];
 
function countMatches(patterns: RegExp[], text: string) {
  return patterns.filter((p) => p.test(text)).length;
}
 
export function guessContentType(text: string): ContentKind | null {
  const t = text.toLowerCase();
  const jobScore = countMatches(jobSignals, t);
  const emailScore = countMatches(emailSignals, t);
 
  // Job postings are asked about on two clear signals and a lead. Emails keep
  // the stricter test, since a friendly text can look a little like an email.
  if (jobScore >= 2 && jobScore >= emailScore + 1) return "job_posting";
  if (emailScore >= 3 && emailScore >= jobScore + 2) return "email";
  return null;
}
 