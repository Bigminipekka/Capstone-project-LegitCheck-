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
  // Set when the address came from a shortened link: the short link as it
  // appeared in the text, and where it points (address only, never opened)
  shortLink?: string;
  destination?: string;
  // True when the address is a page on a free site-building service
  shared?: boolean;
}
 
const MAX_TEXT = 20000;
export const MAX_DOMAINS = 5;
const HOUR = 60 * 60 * 1000;
 
// Domains whose age tells us nothing about the sender: free email providers,
// link shorteners, big platforms, job boards, and scheduling tools
const SKIP_DOMAINS = new Set([
  // Free email providers
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
  // Link shorteners
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "rebrand.ly",
  // Placeholder domains
  "example.com",
  "example.org",
  "example.net",
  // Video and social platforms
  "youtube.com",
  "youtu.be",
  "facebook.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "tiktok.com",
  // Job boards
  "indeed.com",
  "linkedin.com",
  "glassdoor.com",
  "ziprecruiter.com",
  "monster.com",
  "simplyhired.com",
  "careerbuilder.com",
  "craigslist.org",
  // Google, forms, and scheduling tools
  "google.com",
  "forms.gle",
  "calendly.com",
  "zoom.us",
]);
 
// Free site-building and hosting services. Anyone can make a page on one, so
// the age of the service says nothing about the person who made the page.
const SHARED_HOSTS = [
  "wordpress.com",
  "blogspot.com",
  "weebly.com",
  "wixsite.com",
  "github.io",
  "netlify.app",
  "vercel.app",
  "pages.dev",
  "workers.dev",
  "web.app",
  "firebaseapp.com",
  "herokuapp.com",
  "onrender.com",
  "glitch.me",
  "webflow.io",
  "carrd.co",
  "godaddysites.com",
  "myshopify.com",
  "000webhostapp.com",
  "repl.co",
];
 
// The service name when the host is a page on one of those services
function sharedPlatform(host: string): string | null {
  const h = host.toLowerCase();
  for (const platform of SHARED_HOSTS) {
    if (h.endsWith("." + platform)) return platform;
  }
  return null;
}
 
function sharedReason(platform: string): string {
  return `This page is on ${platform}, a free site-building service. Anyone can make a page there, so the age of ${platform} says nothing about who made it.`;
}
 
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
 
// Government, school and military domains can only be registered by those
// organizations, so their age says nothing useful and only adds noise.
function isRestrictedDomain(domain: string): boolean {
  return (
    /(^|\.)(gov|edu|mil)(\.[a-z]{2})?$/.test(domain) ||
    /\.ac\.[a-z]{2}$/.test(domain)
  );
}
 
const BARE_ENDINGS =
  "com|net|org|io|co|info|biz|us|xyz|online|site|top|club|shop|app|dev|jobs|careers|link|click|live|vip|cc|icu|cfd|sbs|cyou|help|support";
 
export function extractDomains(text: string): {
  found: FoundDomain[];
  truncated: boolean;
} {
  const source = text.slice(0, MAX_TEXT);
  const byDomain = new Map<string, DomainHit[]>();
  const order: string[] = [];
 
  const add = (host: string, start: number, end: number) => {
    const cleaned = host.replace(/\.+$/, "").toLowerCase();
    // Keep the full address for pages on free hosting services
    const domain = sharedPlatform(cleaned)
      ? cleaned.replace(/^www\./, "")
      : registrable(cleaned);
    if (!validDomain(domain) || SKIP_DOMAINS.has(domain)) return;
    if (isRestrictedDomain(domain)) return;
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
    const before = source.slice(Math.max(0, at - 80), at);
    if (
      /(sent to|was sent|intended for|at email|to me at|addressed to|your email( address)?|registered (to|with)|associated with|unsubscribe)/i.test(
        before
      )
    )
      continue;
    // Skip addresses on a To:, Cc: or Bcc: line
    const lineStart = source.lastIndexOf("\n", at) + 1;
    if (/^\s*(to|cc|bcc)\s*:/i.test(source.slice(lineStart, at))) continue;
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
    // Domains inside an email address were already handled in step 1,
    // including the ones skipped because they are the recipient
    if (start > 0 && source[start - 1] === "@") continue;
    add(m[1], start, start + m[1].length);
  }
 
  const found = order.map((domain) => ({
    domain,
    hits: byDomain.get(domain)!,
  }));
 
  return {
    found: found.slice(0, MAX_DOMAINS),
    truncated: found.length > MAX_DOMAINS,
  };
}
 
// ---- Short links ----
 
// Link shorteners we are willing to contact. We ask only these services where
// a short link points, and never contact the destination itself.
const SHORTENERS = [
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "rebrand.ly",
  "cutt.ly",
  "shorturl.at",
  "tiny.cc",
  "rb.gy",
  "t.ly",
  "v.gd",
  "bit.do",
];
const SHORTENER_SET = new Set(SHORTENERS);
const MAX_SHORT_LINKS = 3;
const MAX_HOPS = 4;
 
export interface ShortLink {
  url: string; // what we will request, always https
  label: string; // how it looked in the text, like bit.ly/3xYz
  hits: DomainHit[];
}
 
// Short links that have a path, like bit.ly/3xYz. A bare "bit.ly" is not a link.
export function extractShortLinks(text: string): ShortLink[] {
  const source = text.slice(0, MAX_TEXT);
  const hosts = SHORTENERS.map((h) => h.replace(/\./g, "\\.")).join("|");
  const pattern = new RegExp(
    `\\b(?:https?:\\/\\/)?(?:www\\.)?(${hosts})\\/([A-Za-z0-9_-]{2,40})`,
    "gi"
  );
  const seen = new Set<string>();
  const out: ShortLink[] = [];
  for (const m of source.matchAll(pattern)) {
    const host = m[1].toLowerCase();
    const label = `${host}/${m[2]}`;
    const start = m.index ?? 0;
    const hit = { start, end: start + m[0].length };
    const key = label.toLowerCase();
    if (seen.has(key)) {
      out.find((o) => o.label.toLowerCase() === key)!.hits.push(hit);
      continue;
    }
    seen.add(key);
    out.push({ url: `https://${label}`, label, hits: [hit] });
    if (out.length >= MAX_SHORT_LINKS) break;
  }
  return out;
}
 
export type Expansion =
  | { status: "ok"; host: string; destination: string }
  | { status: "unavailable"; reason: string };
 
type FetchFn = (
  url: string,
  init: {
    method: string;
    redirect: "manual";
    signal: AbortSignal;
    headers: Record<string, string>;
    cache: "no-store";
  }
) => Promise<{
  status: number;
  headers: { get(name: string): string | null };
  body?: { cancel(): unknown } | null;
}>;
 
const expansionCache = new Map<string, { at: number; result: Expansion }>();
 
// Follows a short link one hop at a time. A hop is only requested when the
// current address is a known shortener, so the destination site is never
// contacted. Returns where the link points.
export async function expandShortLink(
  startUrl: string,
  fetchImpl: FetchFn = fetch as unknown as FetchFn
): Promise<Expansion> {
  const cached = expansionCache.get(startUrl.toLowerCase());
  if (cached && Date.now() - cached.at < HOUR) return cached.result;
 
  const failed = (reason: string): Expansion => ({ status: "unavailable", reason });
  let result: Expansion = failed("The short link could not be expanded.");
 
  try {
    let current = new URL(startUrl);
    for (let hop = 0; hop < MAX_HOPS; hop++) {
      const host = current.hostname.toLowerCase().replace(/^www\./, "");
      if (current.protocol !== "https:" && current.protocol !== "http:") {
        result = failed("The short link points somewhere that is not a website.");
        break;
      }
      if (!SHORTENER_SET.has(host)) {
        // The destination. We stop here and do not contact it.
        const path = current.pathname === "/" ? "" : current.pathname;
        const destination = (current.hostname + path).slice(0, 80);
        result = { status: "ok", host: current.hostname.toLowerCase(), destination };
        break;
      }
 
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);
      let res;
      try {
        res = await fetchImpl(current.toString(), {
          method: "GET",
          redirect: "manual",
          signal: controller.signal,
          headers: { "User-Agent": "LegitCheck-link-check", Accept: "*/*" },
          cache: "no-store",
        });
      } finally {
        clearTimeout(timer);
      }
      // We only want the redirect header, never the page
      try {
        await res.body?.cancel();
      } catch {}
 
      const location = res.headers.get("location");
      if (res.status >= 300 && res.status < 400 && location) {
        current = new URL(location, current);
        if (hop === MAX_HOPS - 1) {
          result = failed("The short link redirects too many times to follow.");
        }
        continue;
      }
      result = failed(
        res.status === 404
          ? "The short link no longer exists or was removed."
          : "The short link service did not give a destination."
      );
      break;
    }
  } catch {
    result = failed("The short link could not be expanded.");
  }
 
  if (result.status === "ok") {
    if (expansionCache.size > 500) expansionCache.clear();
    expansionCache.set(startUrl.toLowerCase(), { at: Date.now(), result });
  }
  return result;
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
  const domains: DomainResult[] = await Promise.all(
    found.map(async (item): Promise<DomainResult> => {
      const platform = sharedPlatform(item.domain);
      if (platform) {
        return {
          domain: item.domain,
          status: "unavailable",
          reason: sharedReason(platform),
          shared: true,
          hits: item.hits,
        };
      }
      return { ...(await lookupOne(item.domain)), hits: item.hits };
    })
  );
 
  // Short links: find where each one points, then look up that address
  const shorts = extractShortLinks(text);
  const expanded = await Promise.all(
    shorts.map(async (s) => ({ short: s, expansion: await expandShortLink(s.url) }))
  );
  for (const { short, expansion } of expanded) {
    if (expansion.status !== "ok") {
      domains.push({
        domain: short.label,
        status: "unavailable",
        reason: expansion.reason + " The link hides where it goes, so be careful.",
        hits: short.hits,
        shortLink: short.label,
      });
      continue;
    }
    const cleanedHost = expansion.host.replace(/\.+$/, "").toLowerCase();
    const platform = sharedPlatform(cleanedHost);
    const domain = platform
      ? cleanedHost.replace(/^www\./, "")
      : registrable(cleanedHost);
    const note =
      "A short link hides its real address. This one points to " +
      expansion.destination +
      ".";
    if (!validDomain(domain)) {
      domains.push({
        domain: short.label,
        status: "unavailable",
        reason: note + " The address could not be checked.",
        hits: short.hits,
        shortLink: short.label,
        destination: expansion.destination,
      });
      continue;
    }
    if (platform) {
      const existingShared = domains.find((d) => d.domain === domain);
      if (existingShared) {
        existingShared.hits.push(...short.hits);
        existingShared.shortLink = existingShared.shortLink || short.label;
        existingShared.destination =
          existingShared.destination || expansion.destination;
        continue;
      }
      domains.push({
        domain,
        status: "unavailable",
        reason: sharedReason(platform),
        shared: true,
        hits: short.hits,
        shortLink: short.label,
        destination: expansion.destination,
      });
      continue;
    }
    if (SKIP_DOMAINS.has(domain) || isRestrictedDomain(domain)) {
      domains.push({
        domain,
        status: "unavailable",
        reason: note + " This is a well-known site, so its age is not checked.",
        hits: short.hits,
        shortLink: short.label,
        destination: expansion.destination,
      });
      continue;
    }
    const existing = domains.find((d) => d.domain === domain);
    if (existing) {
      existing.hits.push(...short.hits);
      existing.shortLink = existing.shortLink || short.label;
      existing.destination = existing.destination || expansion.destination;
      continue;
    }
    domains.push({
      ...(await lookupOne(domain)),
      hits: short.hits,
      shortLink: short.label,
      destination: expansion.destination,
    });
  }
 
  return { domains, truncated };
}