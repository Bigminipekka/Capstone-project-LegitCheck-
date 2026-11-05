import { matchAny, Hit } from "./matching";
 
export interface RuleMatch {
  indicator: string;
  matched: boolean;
  hits: Hit[];
}
 
// Something in the text that looks like a link: a web address, or a bare
// domain followed by a path
const LINK =
  "(?:\\bhttps?:\\/\\/|\\bwww\\.|\\b[a-z0-9-]+(?:\\.[a-z0-9-]+)*\\.(?:com|net|org|top|xyz|info|click|link|help|me|co|cc|vip|live|shop|site|online|club|icu|cfd|sbs|cyou)\\/)";
 
// Each check returns the matched phrases when the rule fires, or null when it
// does not. These rules are for text messages (SMS, iMessage, WhatsApp).
export function checkTextRules(text: string): RuleMatch[] {
  const checks: { indicator: string; find: (t: string) => Hit[] | null }[] = [
    {
      indicator:
        "Claims a package delivery problem and asks you to click, pay or update details",
      find: (t) =>
        matchAny(
          [
            new RegExp(
              `\\b(package|parcel|shipment|delivery)\\b[\\s\\S]{0,100}\\b(could not be|cannot be|can't be|couldn't be|unable to be|failed|on hold|held|undeliverable|incomplete|incorrect address|unpaid|problem|issue|customs)\\b[\\s\\S]{0,150}(${LINK}|\\b(click|tap|pay|fee|reschedule|update|confirm|verify|redeliver\\w*)\\b|\\$\\s?\\d)`,
              "i"
            ),
          ],
          t
        ),
    },
    {
      indicator: "Claims an unpaid toll, ticket or fine and pushes you to pay by link",
      find: (t) =>
        matchAny(
          [
            new RegExp(
              `\\b(unpaid|outstanding|overdue|past[- ]due|owe|balance)\\b[\\s\\S]{0,40}\\b(tolls?|e-?z\\s?pass|sunpass|traffic (ticket|fine|violation)|parking (ticket|violation)|citation)\\b[\\s\\S]{0,150}(${LINK}|\\b(pay|link|click|tap|late fee|penalt\\w+)\\b)`,
              "i"
            ),
            new RegExp(
              `\\b(tolls?|e-?z\\s?pass|sunpass|traffic (ticket|fine|violation)|parking (ticket|violation))\\b[\\s\\S]{0,60}\\b(unpaid|outstanding|overdue|past[- ]due)\\b[\\s\\S]{0,150}(${LINK}|\\b(pay|link|click|tap|late fee|penalt\\w+)\\b)`,
              "i"
            ),
          ],
          t
        ),
    },
    {
      indicator:
        "Says your account is locked or suspended and asks you to verify or log in",
      find: (t) =>
        matchAny(
          [
            new RegExp(
              `\\b(account|card|access)\\b[\\s\\S]{0,30}\\b(has been|is|was|will be|have been)\\s+(locked|suspended|frozen|disabled|restricted|limited|deactivated|closed|compromised)\\b[\\s\\S]{0,150}(${LINK}|\\b(verify|confirm|restore|unlock|reactivate|click|tap|log ?in)\\b)`,
              "i"
            ),
          ],
          t
        ),
    },
    {
      indicator: "Fraud alert text that tells you to click a link or call a number",
      find: (t) =>
        matchAny(
          [
            new RegExp(
              `\\b(suspicious|unusual|unauthori[sz]ed|fraudulent|fraud)\\b[\\s\\S]{0,40}\\b(charge|purchase|transaction|activity|login|sign-?in|attempt|alert)\\b[\\s\\S]{0,150}(${LINK}|\\b(click|tap|call|verify|confirm|log ?in)\\b)`,
              "i"
            ),
          ],
          t
        ),
    },
    {
      indicator: "Looks like a wrong-number text that tries to start a conversation",
      find: (t) =>
        matchAny(
          [
            /\bwrong (number|person)\b/i,
            /\b(sorry|oops|apologies)\b[\s\S]{0,25}\b(mixed up|texted you by mistake|didn'?t mean to text you)\b/i,
            /\b(is this|did i (get|have|reach)) the right number\b/i,
          ],
          t
        ),
    },
    {
      indicator: "Unsolicited job or task offer that pays by the day or moves to WhatsApp or Telegram",
      find: (t) =>
        matchAny(
          [
            /\b(earn|make|paid|pay)\b[^.\n]{0,20}\$\s?\d[\d,]*\s?(\/|per|a|each)\s?(day|week)\b/i,
            /\b(complete|finish|do)\b[^.\n]{0,20}\btasks?\b[^.\n]{0,60}\b(earn|commission|paid|income|\$)/i,
            /\b(rate|review|like|boost|optimi[sz]e|rank)\b[^.\n]{0,20}\b(videos?|products?|apps?|hotels?|restaurants?|listings?|reviews?)\b[^.\n]{0,60}\b(earn|commission|paid|\$)/i,
            /\b(recruiter|hiring (manager|team)|hr|human resources|talent)\b[\s\S]{0,100}\b(whatsapp|telegram)\b/i,
          ],
          t
        ),
    },
    {
      indicator:
        "Claims to be the IRS, Social Security, Medicare or the DMV and asks you to act",
      find: (t) =>
        matchAny(
          [
            /\b(irs|internal revenue service|social security( administration)?|ssa|medicare|dmv|department of motor vehicles)\b[\s\S]{0,200}\b(refund|owe|owed|unpaid|suspended|suspend|warrant|arrest|verify|confirm|claim|click|link|benefits)\b/i,
          ],
          t
        ),
    },
    {
      indicator:
        "Threatens arrest, legal action or a suspended Social Security number",
      find: (t) =>
        matchAny(
          [
            /\b(arrest(ed)?|warrant|jail|prison|lawsuit|legal action|prosecut\w+|deport\w*|seiz\w+)\b[\s\S]{0,120}\b(unless|if you (do not|don't|fail to)|until)\b[\s\S]{0,80}\b(pay|payment|fine|fee|call|respond)/i,
            /\b(pay|payment|fine|fee|call)\b[\s\S]{0,60}\b(immediately|today|now|within \d+ (hours|days))\b[\s\S]{0,60}\b(or|otherwise)\b[\s\S]{0,60}\b(arrest\w*|warrant|jail|legal action|lawsuit|prosecut\w+|deport\w*)/i,
            /\b(social security( number)?|ssn)\b[\s\S]{0,40}\b(suspended|suspend|blocked|deactivated|linked to (a )?(crime|criminal|fraud|drug|money laundering))/i,
          ],
          t
        ),
    },
    {
      indicator: "A link combined with urgent pressure or a deadline",
      find: (t) => {
        if (!new RegExp(LINK, "i").test(t)) return null;
        return matchAny(
          [
            /\b(within \d+ (hours?|minutes?|days?)|immediately|urgent(ly)?|final notice|last chance|act now|expires (today|soon)|avoid (a )?(late fee|penalty|penalties|suspension|closure|legal action))\b/i,
          ],
          t
        );
      },
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
 