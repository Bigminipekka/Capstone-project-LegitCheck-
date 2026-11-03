import { NextRequest, NextResponse } from "next/server";

// A simple limit on how often one visitor can call an API route, and on how
// much text one request may contain. The counts live in server memory, so on
// a host that runs several copies of the server each copy keeps its own count.
// That is good enough to stop casual abuse. The spending limit set in the
// Anthropic Console is the hard backstop.

export const MAX_TEXT_CHARS = 15000;

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

// Returns a 429 response when the visitor is over the limit, otherwise null.
// The limit is skipped in development so your own testing is not blocked.
export function rateLimit(
  req: NextRequest,
  route: string,
  limit: number,
  windowMs: number
): NextResponse | null {
  if (process.env.NODE_ENV !== "production") return null;

  const now = Date.now();
  const key = `${route}:${clientIp(req)}`;

  // Clear out old entries now and then so the map does not grow forever
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) {
      if (b.resetAt <= now) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return NextResponse.json(
      {
        error:
          "Too many scans in a short time. Please wait a few minutes and try again.",
      },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }
  return null;
}