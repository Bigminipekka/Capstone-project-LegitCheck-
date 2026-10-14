// Shared helpers for finding where a rule matched in the original text.
export interface Hit {
  start: number;
  end: number;
}

// Every match of a pattern, as character ranges in the original text
export function findAll(pattern: RegExp, text: string): Hit[] {
  const flags = pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g";
  const globalPattern = new RegExp(pattern.source, flags);
  const hits: Hit[] = [];
  for (const match of text.matchAll(globalPattern)) {
    if (match[0].length === 0) continue;
    const start = match.index ?? 0;
    hits.push({ start, end: start + match[0].length });
  }
  return hits;
}

// Matches for any of the patterns. Returns null when none of them match.
export function matchAny(patterns: RegExp[], text: string): Hit[] | null {
  const hits: Hit[] = [];
  for (const pattern of patterns) {
    hits.push(...findAll(pattern, text));
  }
  return hits.length > 0 ? hits : null;
}

// Find a pattern only inside the given stretches of text
export function findWithin(spans: Hit[], pattern: RegExp, text: string): Hit[] {
  const hits: Hit[] = [];
  for (const span of spans) {
    for (const hit of findAll(pattern, text.slice(span.start, span.end))) {
      hits.push({ start: span.start + hit.start, end: span.start + hit.end });
    }
  }
  return hits;
}