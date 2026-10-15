// Finds website and email domains in text and looks up when each was registered.
export interface DomainHit {
  start: number;
  end: number;
}

export interface FoundDomain {
  domain: string;
  hits: DomainHit[];
}

export interface DomainResult {
  domain: string;
  status: "ok" | "not_found" | "unavailable";
  registered?: string;
  ageDays?: number;
  reason?: string;
  hits: DomainHit[];
}

const MAX_TEXT = 20000;
export const MAX_DOMAINS = 5;
const HOUR = 60 * 60 * 1000;

// Domains whose age tells us nothing, or that are not real sites
const SKIP_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "aol.com",
  "icloud.com",
  "live.com",
  "msn.com",
  "mail.com",
  "gmx.com",
  "proton.me",
  "protonmail.com",
  "yandex.com",
  "zoho.com",
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "rebrand.ly",
  "example.com",
  "example.org",
  "example.net",
]);

// Second-level names used under country endings, like co.uk
const SECOND_LEVEL = new Set([
  "co",
  "com",
  "org",
  "net",
  "gov",
  "edu",
  "ac",
  "or",
  "ne",
  "go",
]);

// A rough guess at the registrable part of a host name. There is no public
// suffix list here, so unusual endings can be wrong.
function registrable(host: string): string {
  const labels = host.toLowerCase().split(".");
  if (labels.length <= 2) return labels.join(".");
  const tld = labels[labels.length - 1];
  const second = labels[labels.length - 2];
  if (tld.length === 2 && SECOND_LEVEL.has(second)) {
    return labels.slice(-3).join(".");
  }
  return labels.slice(-2).join(".");
}

function validDomain(domain: string): boolean {
  if (domain.length > 253) return false;
  const labels = domain.split(".");
  if (labels.length < 2) return false;
  const labelOk = labels.every((label) =>
    /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label)
  );
  return labelOk && /^[a-z]{2,24}$/.test(labels[labels.length - 1]);
}

const BARE_ENDINGS =
  "com|net|org|io|co|info|biz|us|xyz|online|site|top|club|shop|app|dev|jobs|careers";

export function extractDomains(text: string): {
  found: FoundDomain[];
  truncated: boolean;
} {
  const source = text.slice(0, MAX_TEXT);
  const byDomain = new Map<string, DomainHit[]>();
  const order: string[] = [];

  const add = (host: string, start: number, end: number) => {
    const domain = registrable(host.replace(/\.+$/, ""));
    if (!validDomain(domain) || SKIP_DOMAINS.has(domain)) return;
    if (!byDomain.has(domain)) {
      byDomain.set(domain, []);
      order.push(domain);
    }
    byDomain.get(domain)!.push({ start, end });
  };

  // 1. Email addresses (skipping ones that are clearly the recipient)
  for (const m of source.matchAll(
    /[A-Za-z0-9._%+-]+@((?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,24})/g
  )) {
    const at = m.index ?? 0;
    const before = source.slice(Math.max(0, at - 30), at);
    if (/(sent to|at email|to me at|addressed to)/i.test(before)) continue;
    const end = at + m[0].length;
    add(m[1], end - m[1].length, end);
  }

  // 2. Links that start with http:// or https://
  for (const m of source.matchAll(
    /\bhttps?:\/\/((?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,24})/gi
  )) {
    const start = (m.index ?? 0) + m[0].length - m[1].length;
    add(m[1], start, start + m[1].length);
  }

  // 3. Links that start with www.
  for (const m of source.matchAll(
    /\bwww\.((?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,24})/gi
  )) {
    const start = (m.index ?? 0) + m[0].length - m[1].length;
    add(m[1], start, start + m[1].length);
  }

  // 4. Bare domains with a common ending, like apply-now-jobs.com
  for (const m of source.matchAll(
    new RegExp(`\\b((?:[A-Za-z0-9-]+\\.)+(?:${BARE_ENDINGS}))\\b`, "gi")
  )) {
    const start = m.index ?? 0;
    add(m[1], start, start + m[1].length);
  }

  const found = order.map((domain) => ({
    domain,
    hits: byDomain.get(domain)!,
  }));

  return { found: found.slice(0, MAX_DOMAINS), truncated: found.length > MAX_DOMAINS };
}

// ---- Looking up registration dates (RDAP) ----

async function fetchWithTimeout(url: string, ms: number, accept: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { Accept: accept },
      cache: "no-store",
    });
  } finally {
    clearTimeout(timer);
  }
}

let bootstrap = null as { at: number; servers: Map<string, string> } | null;
let inflight = null as Promise<Map<string, string> | null> | null;

// IANA publishes which lookup service handles each domain ending
async function loadServers(): Promise<Map<string, string> | null> {
  try {
    const res = await fetchWithTimeout(
      "https://data.iana.org/rdap/dns.json",
      4000,
      "application/json"
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { services?: [string[], string[]][] };
    const servers = new Map<string, string>();
    for (const [endings, urls] of json.services || []) {
      const base = urls.find((u) => u.startsWith("https://"));
      if (!base) continue;
      const normalized = base.endsWith("/") ? base : base + "/";
      for (const ending of endings) servers.set(ending.toLowerCase(), normalized);
    }
    bootstrap = { at: Date.now(), servers };
    return servers;
  } catch {
    return null;
  }
}

async function getServers(): Promise<Map<string, string> | null> {
  if (bootstrap && Date.now() - bootstrap.at < 24 * HOUR) {
    return bootstrap.servers;
  }
  if (!inflight) {
    inflight = loadServers().finally(() => {
      inflight = null;
    });
  }
  return inflight;
}

type Lookup = Omit<DomainResult, "hits">;

async function rdapLookup(domain: string): Promise<Lookup> {
  const servers = await getServers();
  if (!servers) {
    return {
      domain,
      status: "unavailable",
      reason: "The registry directory could not be reached.",
    };
  }

  const ending = domain.split(".").pop() || "";
  const base = servers.get(ending);
  if (!base) {
    return {
      domain,
      status: "unavailable",
      reason: "This kind of domain has no public lookup service.",
    };
  }

  try {
    const res = await fetchWithTimeout(
      `${base}domain/${encodeURIComponent(domain)}`,
      4000,
      "application/rdap+json"
    );
    if (res.status === 404) return { domain, status: "not_found" };
    if (res.status === 429) {
      return {
        domain,
        status: "unavailable",
        reason: "The lookup service is busy right now.",
      };
    }
    if (!res.ok) {
      return {
        domain,
        status: "unavailable",
        reason: "The lookup service did not answer.",
      };
    }

    const json = (await res.json()) as {
      events?: { eventAction?: string; eventDate?: string }[];
    };
    const registration = (json.events || []).find(
      (e) => e.eventAction === "registration"
    );
    const date = registration?.eventDate
      ? new Date(registration.eventDate)
      : null;
    if (!date || isNaN(date.getTime())) {
      return {
        domain,
        status: "unavailable",
        reason: "No registration date was published for this domain.",
      };
    }

    const ageDays = Math.max(
      0,
      Math.floor((Date.now() - date.getTime()) / 86400000)
    );
    return {
      domain,
      status: "ok",
      registered: date.toISOString(),
      ageDays,
    };
  } catch {
    return {
      domain,
      status: "unavailable",
      reason: "The lookup timed out or failed.",
    };
  }
}

const cache = new Map<string, { at: number; result: Lookup }>();

async function lookupOne(domain: string): Promise<Lookup> {
  const cached = cache.get(domain);
  if (cached && Date.now() - cached.at < HOUR) return cached.result;

  const result = await rdapLookup(domain);
  // Only remember real answers, not failures
  if (result.status !== "unavailable") {
    if (cache.size > 500) cache.clear();
    cache.set(domain, { at: Date.now(), result });
  }
  return result;
}

export async function checkDomains(
  text: string
): Promise<{ domains: DomainResult[]; truncated: boolean }> {
  const { found, truncated } = extractDomains(text);
  const domains = await Promise.all(
    found.map(async (item) => ({
      ...(await lookupOne(item.domain)),
      hits: item.hits,
    }))
  );
  return { domains, truncated };
}