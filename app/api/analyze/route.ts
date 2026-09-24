import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkRules } from "@/lib/detection";
import { checkEmailRules } from "@/lib/emailDetection";

const weightValues: Record<string, number> = {
  High: 3,
  "Medium-High": 2,
  Medium: 1,
};

export async function POST(req: NextRequest) {
  const { text, type } = await req.json();

  if (!text || text.trim().length < 20) {
    return NextResponse.json(
      { error: "Please paste a longer message to analyze." },
      { status: 400 }
    );
  }

  const contentType = type === "email" ? "email" : "job_posting";

  // Get only the rules matching this content type
  const { data: rules, error } = await supabase
    .from("rules")
    .select("*")
    .eq("content_type", contentType);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Run the correct detection logic based on type
  const matches =
    contentType === "email" ? checkEmailRules(text) : checkRules(text);

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
      };
    });

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