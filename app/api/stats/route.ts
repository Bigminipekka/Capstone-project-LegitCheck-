import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Without this, a deployed build could cache the totals and never update them
export const dynamic = "force-dynamic";

export async function GET() {
  // Job and email totals come from one function, text message totals from another
  const [main, text] = await Promise.all([
    supabase.rpc("get_scan_stats"),
    supabase.rpc("get_text_scan_stats"),
  ]);

  if (main.error) console.error("Stats read error:", main.error.message);
  if (text.error) console.error("Text stats read error:", text.error.message);

  const row = main.data && main.data.length > 0 ? main.data[0] : null;
  const textRow = text.data && text.data.length > 0 ? text.data[0] : null;

  return NextResponse.json({
    jobCount: row ? Number(row.job_count) : 0,
    emailCount: row ? Number(row.email_count) : 0,
    jobAvgMs: row ? Number(row.job_avg_ms) : 0,
    emailAvgMs: row ? Number(row.email_avg_ms) : 0,
    textCount: textRow ? Number(textRow.text_count) : 0,
    textAvgMs: textRow ? Number(textRow.text_avg_ms) : 0,
  });
}

export async function POST(req: NextRequest) {
  const { type, durationMs } = await req.json();

  if (type !== "job_posting" && type !== "email" && type !== "text_message") {
    return NextResponse.json({ error: "Invalid type." }, { status: 400 });
  }
  if (typeof durationMs !== "number" || durationMs < 0 || durationMs > 120000) {
    return NextResponse.json({ error: "Invalid duration." }, { status: 400 });
  }

  const { error } = await supabase.from("scan_stats").insert({
    content_type: type,
    duration_ms: Math.round(durationMs),
  });

  if (error) {
    console.error("Stats insert error:", error.message);
    return NextResponse.json({ error: "Could not record scan." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}