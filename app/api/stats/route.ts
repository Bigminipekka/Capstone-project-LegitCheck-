import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Without this, a deployed build could cache the totals and never update them
export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabase.rpc("get_scan_stats");

  if (error || !data || data.length === 0) {
    if (error) console.error("Stats read error:", error.message);
    return NextResponse.json({
      jobCount: 0,
      emailCount: 0,
      jobAvgMs: 0,
      emailAvgMs: 0,
    });
  }

  const row = data[0];
  return NextResponse.json({
    jobCount: Number(row.job_count),
    emailCount: Number(row.email_count),
    jobAvgMs: Number(row.job_avg_ms),
    emailAvgMs: Number(row.email_avg_ms),
  });
}

export async function POST(req: NextRequest) {
  const { type, durationMs } = await req.json();

  if (type !== "job_posting" && type !== "email") {
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