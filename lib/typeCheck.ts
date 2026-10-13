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

  if (jobScore >= 3 && jobScore >= emailScore + 2) return "job_posting";
  if (emailScore >= 3 && emailScore >= jobScore + 2) return "email";
  return null;
}