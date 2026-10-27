// Scam types shown on the results page. Each rule in Supabase carries one of
// these ids in its scam_type column ("general" means no specific scam type).
 
export type ContentKind = "job_posting" | "email";
 
export interface ScamTypeInfo {
  id: string;
  label: string;
  appliesTo: ContentKind;
  summary: string;
  howItWorks: string;
  whatToDo: string;
}
 
export const SCAM_TYPES: { [id: string]: ScamTypeInfo } = {
  // ---------- Job postings ----------
  advance_fee: {
    id: "advance_fee",
    label: "Advance-fee job scam",
    appliesTo: "job_posting",
    summary:
      "The job asks you to pay money up front, for example for training, equipment, a background check or a fee.",
    howItWorks:
      "Real employers do not charge you to start work. In this scam you pay first, often by gift card, crypto or wire, and the job never starts or more fees appear.",
    whatToDo:
      "Do not pay anything. Payments by gift card, crypto or wire are very hard to get back.",
  },
  fake_check: {
    id: "fake_check",
    label: "Fake check (overpayment) scam",
    appliesTo: "job_posting",
    summary:
      "You are asked to deposit a check and send part of the money somewhere else.",
    howItWorks:
      "The check looks real and the funds may show in your account, but it later bounces. The money you sent out is yours to repay.",
    whatToDo:
      "Do not deposit the check or send any money from it. If you already did, contact your bank right away.",
  },
  task_scam: {
    id: "task_scam",
    label: "Task or \"pay to earn\" scam",
    appliesTo: "job_posting",
    summary:
      "You are offered simple online tasks, then asked to pay in or pay a fee to unlock or withdraw your earnings.",
    howItWorks:
      "Early tasks may seem to pay. Later you are told to deposit money to continue or to release your balance, and the money is not returned.",
    whatToDo:
      "Stop and do not deposit more. A real job does not ask you to pay to get paid.",
  },
  money_mule: {
    id: "money_mule",
    label: "Money mule or reshipping scam",
    appliesTo: "job_posting",
    summary:
      "The job has you receive and forward goods or money for someone else.",
    howItWorks:
      "The packages or funds are often stolen or bought with stolen cards. You can be held responsible even if you did not know.",
    whatToDo:
      "Do not accept or forward packages or money. If you already did, stop and report it at reportfraud.ftc.gov.",
  },
  identity_theft: {
    id: "identity_theft",
    label: "Identity theft through a fake job",
    appliesTo: "job_posting",
    summary:
      "The posting asks for your SSN or bank details before there is a real offer.",
    howItWorks:
      "The \"hiring process\" is a way to collect personal details that can be used to open accounts or take over yours.",
    whatToDo:
      "Do not send them. Employers only need these after a written offer, through official paperwork. If you shared them, consider a credit freeze at identitytheft.gov.",
  },
  fake_recruiter: {
    id: "fake_recruiter",
    label: "Fake recruiter",
    appliesTo: "job_posting",
    summary:
      "The contact pattern looks like someone posing as a recruiter, such as a free email address, a chat-only process or no real interview.",
    howItWorks:
      "Scammers pose as recruiters to build trust, then move to a payment request or to collecting your personal information.",
    whatToDo:
      "Find the company's own careers page and contact them through it to confirm the recruiter and the job exist.",
  },
 
  // ---------- Emails ----------
  phishing: {
    id: "phishing",
    label: "Phishing",
    appliesTo: "email",
    summary:
      "The email tries to get you to click a link, open a file or hand over login or financial details.",
    howItWorks:
      "The message copies a trusted sender and pushes you to a look-alike page or attachment that steals passwords or installs malware.",
    whatToDo:
      "Do not click or open anything. If you think the message is real, go to the company's website by typing the address yourself.",
  },
  impersonation: {
    id: "impersonation",
    label: "Impersonation",
    appliesTo: "email",
    summary:
      "The email claims to come from a company or agency, but the sender details do not fit.",
    howItWorks:
      "Scammers pose as banks, businesses or government agencies, often demanding payment in gift cards, wire or crypto, which real agencies do not do.",
    whatToDo:
      "Contact the organization using a phone number or website you find yourself, not the one in the email.",
  },
  extortion: {
    id: "extortion",
    label: "Extortion (sextortion or blackmail)",
    appliesTo: "email",
    summary:
      "The email threatens to release embarrassing material unless you pay.",
    howItWorks:
      "These messages are mass-sent and usually bluff. Some quote an old password from a data breach to seem credible.",
    whatToDo:
      "Do not pay or reply. Change any password mentioned, and report it at reportfraud.ftc.gov or ic3.gov.",
  },
  prize_scam: {
    id: "prize_scam",
    label: "Prize or giveaway scam",
    appliesTo: "email",
    summary:
      "The email says you won something or qualify for an unusually good offer.",
    howItWorks:
      "To claim the prize you are asked for a fee, card details or personal information, and no prize arrives.",
    whatToDo:
      "Do not pay fees or share details to claim a prize. Real prizes do not require payment.",
  },
};
 
// Ids the AI is allowed to return for each kind of content
export function aiTypeIds(kind: ContentKind): string[] {
  return Object.values(SCAM_TYPES)
    .filter((t) => t.appliesTo === kind)
    .map((t) => t.id);
}
 
const WEIGHT_POINTS: { [weight: string]: number } = {
  High: 3,
  "Medium-High": 2,
  Medium: 1,
};
 
// Choose the scam type that the matched rules point to most strongly.
// "general" rules never produce a type. Returns null when nothing specific.
export function pickRuleScamType(
  flags: { scam_type?: string; weight: string }[]
): string | null {
  const points: { [id: string]: number } = {};
  const counts: { [id: string]: number } = {};
  for (const flag of flags) {
    const id = flag.scam_type;
    if (!id || !SCAM_TYPES[id]) continue;
    points[id] = (points[id] || 0) + (WEIGHT_POINTS[flag.weight] || 1);
    counts[id] = (counts[id] || 0) + 1;
  }
  let best: string | null = null;
  for (const id of Object.keys(points)) {
    if (
      best === null ||
      points[id] > points[best] ||
      (points[id] === points[best] && counts[id] > counts[best])
    ) {
      best = id;
    }
  }
  return best;
}