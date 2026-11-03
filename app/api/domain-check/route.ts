import { NextRequest, NextResponse } from "next/server";
import { checkDomains } from "@/lib/domain";
import { rateLimit, MAX_TEXT_CHARS } from "@/lib/rateLimit";

// Without this, a deployed build could reuse old lookups
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "domain-check", 30, 10 * 60 * 1000);
  if (limited) return limited;

  let body = {} as { text?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof body.text !== "string" || body.text.trim().length < 5) {
    return NextResponse.json({ domains: [], truncated: false });
  }

  if (body.text.length > MAX_TEXT_CHARS) {
    return NextResponse.json(
      {
        error: `That text is too long. The limit is ${MAX_TEXT_CHARS.toLocaleString()} characters.`,
      },
      { status: 400 }
    );
  }

  try {
    const result = await checkDomains(body.text);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Domain check error:", error);
    return NextResponse.json(
      { error: "Domain check is currently unavailable." },
      { status: 500 }
    );
  }
}