import { NextRequest, NextResponse } from "next/server";
import { checkDomains } from "@/lib/domain";

// Without this, a deployed build could reuse old lookups
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body = {} as { text?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof body.text !== "string" || body.text.trim().length < 5) {
    return NextResponse.json({ domains: [], truncated: false });
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