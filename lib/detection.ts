import { findAll, matchAny, Hit } from "@/lib/matching";

export interface RuleMatch {
  indicator: string;
  matched: boolean;
  hits: Hit[];
}

// Runs of extra spaces, ignoring the wide spacing around separators like " | "
function doubleSpaceRuns(text: string): Hit[] {
  const separators = findAll(/\s+[|•·]\s+/, text);
  return findAll(/ {2,}/, text).filter(
    (run) => !separators.some((s) => run.start >= s.start && run.end <= s.end)
  );
}

// Each check returns the matched phrases when the rule fires, or null when it
// does not. An empty list means it fired with no single phrase to point to.
export function checkRules(text: string): RuleMatch[] {
  const checks: { indicator: string; find: (t: string) => Hit[] | null }[] = [
    {
      indicator:
        'Requests upfront payment (training, equipment, background check, "processing fee")',
      find: (t) =>
        matchAny(
          [
            /(you (must|will need to|are required to) (pay|purchase|cover)|upfront (fee|payment|cost|deposit)|refundable.{0,15}deposit|(?<!direct )deposit (is|are) required|reimbursed (on|after) your first (check|paycheck))/i,
          ],
          t
        ),
    },
    {
      indicator: "Salary significantly above market rate for the role/location",
      find: (t) =>
        matchAny([/\$\s?[4-9][0-9](\.\d+)?\s?(\/|per)\s?(hour|hr)/i], t),
    },
    {
      indicator: "Asks for bank account/SSN before an offer or interview",
      find: (t) =>
        matchAny(
          [
            /(bank account|social security|ssn|routing number).{0,40}(verif|setup|submit|provide)/i,
            /submit (your )?(ssn|social security)/i,
          ],
          t
        ),
    },
    {
      indicator: "Involves depositing a check and wiring back excess funds",
      find: (t) =>
        matchAny(
          [/(deposit|cash).{0,30}check.{0,40}wire.{0,30}(back|excess|remaining)/i],
          t
        ),
    },
    {
      indicator:
        "Requests payment via gift cards, cryptocurrency, or wire transfer",
      find: (t) =>
        matchAny(
          [/(gift card|cryptocurrency|bitcoin|wire transfer|western union|zelle)/i],
          t
        ),
    },
    {
      indicator:
        "Recruiter uses a free personal email instead of a company domain",
      find: (t) =>
        matchAny([/[\w.+-]*@(gmail|yahoo|outlook|hotmail)\.com/i], t),
    },
    {
      indicator:
        "Entire process happens via text, WhatsApp, or Telegram with no phone or video call",
      find: (t) =>
        matchAny(
          [
            /\b(whatsapp|telegram)\b/i,
            /\b(interview|apply|application|contact|hiring|recruiter|onboarding)\b.{0,60}\b(via|by|through|over)\s+(text|sms)\b/i,
            /\b(text|sms)\s+(us|me|our|the)\s+(hiring|recruiter|manager|coordinator|team)/i,
          ],
          t
        ),
    },
    {
      indicator: "High pressure language urging an immediate decision or application",
      find: (t) =>
        matchAny(
          [
            /(immediate start|urgent hire|limited spots|act fast|start immediately|asap|apply within 24 hours|apply today or|only a few spots|hurry|don't wait|act now)/i,
          ],
          t
        ),
    },
    {
      indicator: "Task based jobs that later ask you to pay in",
      find: (t) =>
        matchAny(
          [/(rate videos|like posts|boost rankings|complete tasks).{0,60}(earn|payment)/i],
          t
        ),
    },
    {
      indicator:
        "Job involves reshipping or repackaging goods to another address",
      find: (t) =>
        matchAny([/(reship|repackag).{0,30}(address|package|item)/i], t),
    },
    {
      indicator: "Promises of getting rich without leaving your house",
      find: (t) =>
        matchAny(
          [
            /(work from home).{0,40}(easy money|get rich|no experience|high pay)/i,
            /no experience needed.{0,40}(high pay|\$[4-9][0-9])/i,
          ],
          t
        ),
    },
    {
      indicator: "Generic job title with vague duties",
      find: (t) => {
        const titleHits = findAll(
          /(personal assistant|administrative assistant|customer service rep)/i,
          t
        );
        if (titleHits.length === 0) return null;
        const hasDuties =
          /responsibilities include|duties include|you will|essential duties|essential functions|key responsibilities|job duties|what you'?ll do|the role|as a cook|requirements/i.test(
            t
          );
        return hasDuties ? null : titleHits;
      },
    },
    {
      indicator:
        "No interview required or on the spot offer with no formal process",
      find: (t) =>
        matchAny(
          [
            /(no interview required|no interview necessary|hired on the spot|offer.{0,20}immediately.{0,20}no interview|start right away.{0,20}no interview)/i,
          ],
          t
        ),
    },
    {
      indicator: "Asks you to pay to unlock or withdraw earnings already made",
      find: (t) =>
        matchAny(
          [/(pay|fee).{0,30}(unlock|withdraw|release).{0,20}(earnings|funds|payment)/i],
          t
        ),
    },
    {
      indicator: "Poor spelling and grammar in the posting or messages",
      find: (t) => {
        const hits: Hit[] = [];
        hits.push(
          ...findAll(
            /(recieve|beleive|occured|seperate|untill|definately|acheive|goverment|reccomend|neccessary)/i,
            t
          )
        );
        const spaceRuns = doubleSpaceRuns(t);
        if (spaceRuns.length > 3) hits.push(...spaceRuns);
        // A lowercase letter right after a period near the start of the text
        hits.push(...findAll(/\. [a-z]/, t.slice(0, 500)));
        return hits.length > 0 ? hits : null;
      },
    },
    {
      indicator: "Unsolicited contact where you did not apply first",
      find: (t) =>
        matchAny(
          [
            /(we found your resume|you (have been|were) selected|came across your profile|reaching out to you regarding|noticed your (profile|resume))/i,
          ],
          t
        ),
    },
    {
      indicator:
        "Vague company description with no contact info, headquarters, or verifiable details",
            find: (t) => {
        const hasEmail = /@[\w.-]+\.\w+/i.test(t);
        const hasWebsite = /(www\.|https?:\/\/)/i.test(t);
        const hasLegalEntity = /\b(inc|llc|corp|corporation|ltd)\b\.?/i.test(t);
        // A city and state, or a street address, counts as an identifying detail
        const hasLocation =
          /\b[A-Z][a-z]+(?: [A-Z][a-z]+)*, [A-Z]{2}\b/.test(t) ||
          /\b\d{1,5} [A-Za-z0-9.]+(?: [A-Za-z0-9.]+){0,3} (?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln|way|highway|hwy)\b/i.test(
            t
          );
        // Based on what is missing, so there is no phrase to point to
        return !hasEmail && !hasWebsite && !hasLegalEntity && !hasLocation
          ? []
          : null;
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