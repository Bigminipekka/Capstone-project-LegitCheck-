export interface RuleMatch {
  indicator: string;
  matched: boolean;
}

// Checks the submitted job posting text against keyword patterns
// for each rule that can realistically be detected from text alone.
export function checkRules(text: string): RuleMatch[] {
  const lower = text.toLowerCase();

  const checks: { indicator: string; test: (t: string) => boolean }[] = [
    {
      indicator:
        'Requests upfront payment (training, equipment, background check, "processing fee")',
      test: (t) =>
        /(pay|purchase|cover the cost|fee|reimburse).{0,40}(training|equipment|background check|processing|home office|starter kit)/i.test(
          t
        ),
    },
    {
      indicator: "Salary significantly above market rate for the role/location",
      test: (t) => /\$\s?[4-9][0-9](\.\d+)?\s?(\/|per)\s?(hour|hr)/i.test(t),
    },
    {
      indicator: "Asks for bank account/SSN before an offer or interview",
      test: (t) =>
        /(bank account|social security|ssn|routing number).{0,40}(verif|setup|submit|provide)/i.test(
          t
        ) || /submit (your )?(ssn|social security)/i.test(t),
    },
    {
      indicator: "Involves depositing a check and wiring back excess funds",
      test: (t) => /(deposit|cash).{0,30}check.{0,40}wire.{0,30}(back|excess|remaining)/i.test(t),
    },
    {
      indicator:
        "Requests payment via gift cards, cryptocurrency, or wire transfer",
      test: (t) =>
        /(gift card|cryptocurrency|bitcoin|wire transfer|western union|zelle)/i.test(
          t
        ),
    },
    {
      indicator:
        "Recruiter uses a free personal email instead of a company domain",
      test: (t) =>
        /@(gmail|yahoo|outlook|hotmail)\.com/i.test(t),
    },
    {
      indicator:
        "Entire process happens via text, WhatsApp, or Telegram with no phone or video call",
      test: (t) =>
        /(text|whatsapp|telegram).{0,30}(interview|apply|contact|message)/i.test(
          t
        ),
    },
    {
      indicator: "High pressure language urging an immediate decision or application",
      test: (t) =>
        /(immediate start|urgent|apply now|limited spots|act fast|start immediately|asap)/i.test(
          t
        ),
    },
    {
      indicator: "Task based jobs that later ask you to pay in",
      test: (t) =>
        /(rate videos|like posts|boost rankings|complete tasks).{0,60}(earn|payment)/i.test(
          t
        ),
    },
    {
      indicator:
        "Job involves reshipping or repackaging goods to another address",
      test: (t) => /(reship|repackag).{0,30}(address|package|item)/i.test(t),
    },
    {
      indicator: "Promises of getting rich without leaving your house",
      test: (t) =>
        /(work from home).{0,40}(easy money|get rich|no experience|high pay)/i.test(
          t
        ) || /no experience needed.{0,40}(high pay|\$[4-9][0-9])/i.test(t),
    },
    {
      indicator: "Generic job title with vague duties",
      test: (t) =>
        /(entry.level|personal assistant|administrative assistant|customer service rep)/i.test(
          t
        ) && !/responsibilities include|duties include|you will/i.test(t),
    },
    {
      indicator:
        "No interview required or on the spot offer with no formal process",
      test: (t) =>
        /(no interview|hired immediately|start right away|no experience required)/i.test(
          t
        ),
    },
    {
      indicator: "Asks you to pay to unlock or withdraw earnings already made",
      test: (t) =>
        /(pay|fee).{0,30}(unlock|withdraw|release).{0,20}(earnings|funds|payment)/i.test(
          t
        ),
    },
    {
      indicator: "Poor spelling and grammar in the posting or messages",
      test: (t) => {
        const commonMisspellings =
          /(recieve|beleive|occured|seperate|untill|definately|acheive|goverment|reccomend|neccessary)/i;
        const doubleSpaces = (t.match(/  +/g) || []).length;
        // Use original-case text for capitalization check, since 't' here is lowercased
        const missingCapitalization = /\. [a-z]/.test(text.slice(0, 500));
        return (
          commonMisspellings.test(t) ||
          doubleSpaces > 3 ||
          missingCapitalization
        );
      },
    },
    {
      indicator: "Unsolicited contact where you did not apply first",
      test: (t) =>
        /(we found your resume|you (have been|were) selected|came across your profile|reaching out to you regarding|noticed your (profile|resume))/i.test(
          t
        ),
    },
    {
      indicator:
        "Vague company description with no contact info, headquarters, or verifiable details",
      test: (t) => {
        const hasEmail = /@[\w.-]+\.\w+/i.test(t);
        const hasWebsite = /(www\.|https?:\/\/)/i.test(t);
        const hasLegalEntity = /(inc\.?|llc|corp\.?|corporation|ltd\.?)/i.test(
          t
        );
        return !hasEmail && !hasWebsite && !hasLegalEntity;
      },
    },
  ];

  return checks.map((check) => ({
    indicator: check.indicator,
    matched: check.test(lower),
  }));
}