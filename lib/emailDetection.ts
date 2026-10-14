import { findAll, findWithin, matchAny, Hit } from "@/lib/matching";

export interface RuleMatch {
  indicator: string;
  matched: boolean;
  hits: Hit[];
}

export function checkEmailRules(text: string): RuleMatch[] {
  const checks: { indicator: string; find: (t: string) => Hit[] | null }[] = [
    {
      indicator:
        "Sent from a free/public email domain pretending to represent a company",
      find: (t) => {
        const hits: Hit[] = [];
        for (const match of t.matchAll(
          /@(gmail|yahoo|outlook|hotmail|aol)\.com/gi
        )) {
          const at = match.index ?? 0;
          const context = t.slice(Math.max(0, at - 30), at);
          // Skip if this email is clearly the recipient, not the sender
          if (/(sent to|at email|to me at|addressed to)/i.test(context)) continue;
          let start = at;
          while (start > 0 && /[\w.+-]/.test(t[start - 1])) start--;
          hits.push({ start, end: at + match[0].length });
        }
        return hits.length > 0 ? hits : null;
      },
    },
    {
      indicator:
        "Urgent or threatening language about account suspension or unauthorized activity",
      find: (t) =>
        matchAny(
          [
            /(account (has been|will be) (suspended|locked|closed)|unauthorized (activity|access|login)|verify your account immediately|action required)/i,
          ],
          t
        ),
    },
    {
      indicator:
        "Requests personal or financial information such as passwords, SSN, or card numbers",
      find: (t) =>
        matchAny(
          [
            /(confirm|provide|enter|verify).{0,30}(password|social security|ssn|card number|account number|pin)/i,
          ],
          t
        ),
    },
    {
      indicator:
        "Contains suspicious or shortened links asking you to verify or update account info",
      find: (t) =>
        matchAny(
          [
            /(bit\.ly|tinyurl|click here|verify now|update your (account|payment|information))/i,
          ],
          t
        ),
    },
    {
      indicator:
        "Contains unexpected attachments, especially ones asking to enable macros",
      find: (t) =>
        matchAny(
          [/(enable macros|open the attachment|download the attached|see attached file)/i],
          t
        ),
    },
    {
      indicator: "Uses a generic greeting instead of your actual name",
      find: (t) =>
        matchAny(
          [/(dear (customer|user|member|sir\/madam|valued customer))/i],
          t
        ),
    },
    {
      indicator: "Contains a too good to be true offer, prize, or giveaway",
      find: (t) =>
        matchAny(
          [
            /(you('ve| have) won|claim your (prize|reward)|congratulations you|free (gift|prize|money))/i,
          ],
          t
        ),
    },
    {
      indicator: "Poor spelling and grammar throughout the message",
      find: (t) =>
        matchAny(
          [
            /(recieve|beleive|occured|seperate|untill|definately|acheive|goverment|reccomend|neccessary)/i,
          ],
          t
        ),
    },
    {
      indicator:
        "Threatens blackmail or claims to have compromising recordings or footage",
      find: (t) =>
        matchAny(
          [
            /(recorded you|hacked your camera|compromising (video|footage|photos)|pay (or|otherwise) i will)/i,
          ],
          t
        ),
    },
    {
      indicator:
        "Claims to be a government agency asking for payment via gift cards, wire, or crypto",
      find: (t) => {
        const agency =
          /\b(irs|internal revenue service|social security administration|fbi|ftc|fema)\b/i;
        const method =
          /\b(gift cards?|wire transfers?|cryptocurrency|bitcoin|crypto)\b/i;
        const spans = matchAny(
          [
            /\b(irs|internal revenue service|social security administration|fbi|ftc|fema)\b[\s\S]{0,250}\b(gift cards?|wire transfers?|cryptocurrency|bitcoin|crypto)\b/i,
            /\b(gift cards?|wire transfers?|cryptocurrency|bitcoin|crypto)\b[\s\S]{0,250}\b(irs|internal revenue service|social security administration|fbi|ftc|fema)\b/i,
          ],
          t
        );
        if (spans === null) return null;
        // Mark just the agency name and the payment method inside the match
        return [...findWithin(spans, agency, t), ...findWithin(spans, method, t)];
      },
    },
    {
      indicator:
        "You do not have an account with the company or do not know the sender",
      find: (t) =>
        matchAny(
          [
            /(we noticed you don't have an account|create an account to claim|you may not recognize this email)/i,
          ],
          t
        ),
    },
  ];

  return checks.map((check) => {
    const hits = check.find(text);
    return {
      indicator: check.indicator,
      matched: hits !== null,
      hits: hits || [],
    };
  });
}