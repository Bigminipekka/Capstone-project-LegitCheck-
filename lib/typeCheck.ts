// A rough check of whether pasted text looks like an email, a job posting or a
// text message. It only returns a guess when one side clearly dominates;
// otherwise null.
export type ContentKind = "job_posting" | "email" | "text_message";
 
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
 
// Text messages are short and usually have no paragraphs. These are the
// other things that mark one.
const textPatterns = [
  // A link or a web address with a path
  /https?:\/\/|\bwww\.|\b[a-z0-9-]+\.(com|net|org|top|xyz|info|click|link|help|co|cc|vip|live|shop|site|online|club|icu|cfd|sbs|cyou)\//,
  // Reply keywords and opt-out wording
  /\breply (stop|yes|no|y|n|c|1|2)\b|\bstop to (opt|unsubscribe|end|cancel)|\btext stop\b|msg ?& ?data|message and data rates/,
  // A sender name followed by a colon at the start, like "USPS: ..."
  /^\s*[a-z][\w .&'-]{1,30}:\s/,
];
 
function countMatches(patterns: RegExp[], text: string) {
  return patterns.filter((p) => p.test(text)).length;
}
 
export function guessContentType(text: string): ContentKind | null {
  const t = text.toLowerCase();
  const jobScore = countMatches(jobSignals, t);
  const emailScore = countMatches(emailSignals, t);
 
  // Short, no paragraphs, and some text-message wording, with no clear sign of
  // a job posting or an email
  const trimmed = text.trim();
  const isShort = trimmed.length <= 320 && !/\n\s*\n/.test(trimmed);
  const textScore = (isShort ? 1 : 0) + countMatches(textPatterns, t);
  if (isShort && textScore >= 3 && jobScore < 2 && emailScore < 2) {
    return "text_message";
  }
 
  // Job postings are asked about on two clear signals and a lead. Emails keep
  // the stricter test, since a friendly text can look a little like an email.
  if (jobScore >= 2 && jobScore >= emailScore + 1) return "job_posting";
  if (emailScore >= 3 && emailScore >= jobScore + 2) return "email";
  return null;
}
 