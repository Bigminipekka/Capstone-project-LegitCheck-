import { findAll, findWithin, matchAny, Hit } from "./matching";
 
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
          const context = t.slice(Math.max(0, at - 80), at);
          // Skip if this email is clearly the recipient, not the sender
          if (
            /(sent to|was sent|intended for|at email|to me at|addressed to|your email( address)?|registered (to|with)|associated with|unsubscribe)/i.test(
              context
            )
          )
            continue;
          // Skip addresses on a To:, Cc: or Bcc: line
          const lineStart = t.lastIndexOf("\n", at) + 1;
          if (/^\s*(to|cc|bcc)\s*:/i.test(t.slice(lineStart, at))) continue;
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
            /\b(confirm(s|ing)?|provid(e|ing)|enter(ing)?|verify(ing)?|send(ing)?|reply with|shar(e|ing)|submit(ting)?)\b.{0,40}\b(password|social security|ssn|card number|credit card|debit card|account number|routing number|pin|date of birth|dob|cvv|login credentials)\b/i,
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
      indicator: "Claims a package delivery problem and asks you to pay or update details",
      find: (t) =>
        matchAny(
          [
            /\b(package|parcel|shipment|delivery)\b[\s\S]{0,80}\b(could not be|cannot be|can't be|couldn't be|unable to be|failed|on hold|undeliverable|incomplete address|unpaid|problem|issue)\b[\s\S]{0,150}\b(pay|fee|\$\s?\d|update (your )?(address|payment|billing)|confirm (your )?(address|details|information))/i,
          ],
          t
        ),
    },
    {
      indicator: "Claims an unpaid toll, ticket or fine and pushes you to pay online",
      find: (t) =>
        matchAny(
          [
            /\b(unpaid|outstanding|overdue|past[- ]due|owe)\b[\s\S]{0,40}\b(tolls?|traffic (ticket|fine|violation)|parking (ticket|violation)|citation)\b[\s\S]{0,150}\b(pay|link|click|tap|late fee|penalt\w+)/i,
            /\b(tolls?|traffic (ticket|fine|violation)|parking (ticket|violation))\b[\s\S]{0,60}\b(unpaid|outstanding|overdue|past[- ]due)\b[\s\S]{0,150}\b(pay|link|click|tap|late fee|penalt\w+)/i,
          ],
          t
        ),
    },
    {
      indicator: "Threatens arrest or legal action unless you pay or respond right away",
      find: (t) =>
        matchAny(
          [
            /\b(arrest(ed)?|warrant|jail|prison|lawsuit|legal action|prosecut\w+|deport\w*|seiz\w+)\b[\s\S]{0,120}\b(unless|if you (do not|don't|fail to)|until)\b[\s\S]{0,80}\b(pay|payment|fine|fee|call|respond)/i,
            /\b(pay|payment|fine|fee|call)\b[\s\S]{0,60}\b(immediately|today|now|within \d+ (hours|days))\b[\s\S]{0,60}\b(or|otherwise)\b[\s\S]{0,60}\b(arrest\w*|warrant|jail|legal action|lawsuit|prosecut\w+|deport\w*)/i,
          ],
          t
        ),
    },
    {
      indicator: "Says your Social Security number is suspended or linked to a crime",
      find: (t) =>
        matchAny(
          [
            /\b(social security( number)?|ssn)\b[\s\S]{0,40}\b(suspended|suspend|blocked|deactivated|linked to (a )?(crime|criminal|fraud|drug|money laundering))/i,
            /\b(suspend\w*|block\w*|deactivat\w*)\b[\s\S]{0,30}\byour (social security( number)?|ssn)\b/i,
          ],
          t
        ),
    },
    {
      indicator: "Government agency contacting you with a link to click",
      find: (t) =>
        matchAny(
          [
            /\b(irs|internal revenue service|social security administration|ssa)\b[\s\S]{0,200}\b(click|tap|follow|visit)\b[\s\S]{0,40}\b(link|here|below)\b/i,
            /\b(click|tap|follow|visit)\b[\s\S]{0,40}\b(link|here|below)\b[\s\S]{0,200}\b(irs|internal revenue service|social security administration|ssa)\b/i,
          ],
          t
        ),
    },
    {
      indicator: "Unexpected overdue invoice or bill with an attachment or link",
      find: (t) =>
        matchAny(
          [
            /\b(overdue|unpaid|outstanding|past[- ]due)\s+(invoice|bill)\b[\s\S]{0,200}\b(attach\w*|click|link|open|view|download)\b/i,
          ],
          t
        ),
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