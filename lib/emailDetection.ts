export interface RuleMatch {
  indicator: string;
  matched: boolean;
}

export function checkEmailRules(text: string): RuleMatch[] {
  const lower = text.toLowerCase();

  const checks: { indicator: string; test: (t: string) => boolean }[] = [
    {
      indicator:
        "Sent from a free/public email domain pretending to represent a company",
      test: (t) => {
        const matches = [
          ...t.matchAll(/@(gmail|yahoo|outlook|hotmail|aol)\.com/gi),
        ];
        return matches.some((match) => {
          const start = Math.max(0, (match.index || 0) - 30);
          const context = t.slice(start, match.index || 0);
          // Skip if this email is clearly the recipient, not the sender
          const isRecipient = /(sent to|at email|to me at|addressed to)/i.test(
            context
          );
          return !isRecipient;
        });
      },
    },
    {
      indicator:
        "Urgent or threatening language about account suspension or unauthorized activity",
      test: (t) =>
        /(account (has been|will be) (suspended|locked|closed)|unauthorized (activity|access|login)|verify your account immediately|action required)/i.test(
          t
        ),
    },
    {
      indicator:
        "Requests personal or financial information such as passwords, SSN, or card numbers",
      test: (t) =>
        /(confirm|provide|enter|verify).{0,30}(password|social security|ssn|card number|account number|pin)/i.test(
          t
        ),
    },
    {
      indicator:
        "Contains suspicious or shortened links asking you to verify or update account info",
      test: (t) =>
        /(bit\.ly|tinyurl|click here|verify now|update your (account|payment|information))/i.test(
          t
        ),
    },
    {
      indicator:
        "Contains unexpected attachments, especially ones asking to enable macros",
      test: (t) =>
        /(enable macros|open the attachment|download the attached|see attached file)/i.test(
          t
        ),
    },
    {
      indicator: "Uses a generic greeting instead of your actual name",
      test: (t) =>
        /(dear (customer|user|member|sir\/madam|valued customer))/i.test(t),
    },
    {
      indicator: "Contains a too good to be true offer, prize, or giveaway",
      test: (t) =>
        /(you('ve| have) won|claim your (prize|reward)|congratulations you|free (gift|prize|money))/i.test(
          t
        ),
    },
    {
      indicator: "Poor spelling and grammar throughout the message",
      test: (t) => {
        const commonMisspellings =
          /(recieve|beleive|occured|seperate|untill|definately|acheive|goverment|reccomend|neccessary)/i;
        return commonMisspellings.test(t);
      },
    },
    {
      indicator:
        "Threatens blackmail or claims to have compromising recordings or footage",
      test: (t) =>
        /(recorded you|hacked your camera|compromising (video|footage|photos)|pay (or|otherwise) i will)/i.test(
          t
        ),
    },
    {
      indicator:
        "Claims to be a government agency asking for payment via gift cards, wire, or crypto",
      test: (t) =>
        /(irs|social security administration|fbi|ftc|fema).{0,60}(gift card|wire transfer|cryptocurrency|bitcoin|payment)/i.test(
          t
        ),
    },
    {
      indicator:
        "You do not have an account with the company or do not know the sender",
      test: (t) =>
        /(we noticed you don't have an account|create an account to claim|you may not recognize this email)/i.test(
          t
        ),
    },
  ];

  return checks.map((check) => ({
    indicator: check.indicator,
    matched: check.test(lower),
  }));
}