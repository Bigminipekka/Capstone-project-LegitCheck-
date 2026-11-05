import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkRules } from "@/lib/detection";
import { checkEmailRules } from "@/lib/emailDetection";
import { checkTextRules } from "@/lib/textDetection";
import { rateLimit, MAX_TEXT_CHARS } from "@/lib/rateLimit";
 
const weightValues: { [key: string]: number } = {
  High: 3,
  "Medium-High": 2,
  Medium: 1,
};
 
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "analyze", 30, 10 * 60 * 1000);
  if (limited) return limited;
 
  const { text, type } = await req.json();
 
  if (typeof text === "string" && text.length > MAX_TEXT_CHARS) {
    return NextResponse.json(
      {
        error: `That text is too long. The limit is ${MAX_TEXT_CHARS.toLocaleString()} characters.`,
      },
      { status: 400 }
    );
  }
 
  const minLength = type === "text_message" ? 10 : 20;
  if (!text || text.trim().length < minLength) {
    return NextResponse.json(
      { error: "Please paste a longer message to analyze." },
      { status: 400 }
    );
  }
 
  const contentType: "email" | "text_message" | "job_posting" =
    type === "email"
      ? "email"
      : type === "text_message"
      ? "text_message"
      : "job_posting";
 
  // Get only the rules matching this content type
  const { data: rules, error } = await supabase
    .from("rules")
    .select("*")
    .eq("content_type", contentType);
 
  if (error) {
    console.error("Rules read error:", error.message);
    return NextResponse.json(
      {
        error:
          "We're having trouble accessing our fraud database right now. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
 
  // Run the correct detection logic based on type
  const matches =
    contentType === "email"
      ? checkEmailRules(text)
      : contentType === "text_message"
      ? checkTextRules(text)
      : checkRules(text);
 
  const flaggedResults = matches
    .filter((m) => m.matched)
    .map((m) => {
      const rule = rules?.find((r) => r.indicator === m.indicator);
      return {
        indicator: m.indicator,
        weight: rule?.weight || "Medium",
        description: rule?.description || "",
        source: rule?.source || "",
        category: rule?.category || "",
        scam_type: rule?.scam_type || "general",
        hits: m.hits,
      };
    });
 
  // The score and rating do not use scam_type, so ratings are unchanged
  const totalScore = flaggedResults.reduce(
    (sum, r) => sum + (weightValues[r.weight] || 1),
    0
  );
 
  let riskLevel: "Low" | "Medium" | "High" = "Low";
  if (totalScore >= 6) riskLevel = "High";
  else if (totalScore >= 3) riskLevel = "Medium";
 
  return NextResponse.json({
    riskLevel,
    matchesFound: flaggedResults.length,
    totalScore,
    flaggedResults,
    contentType,
  });
}
 