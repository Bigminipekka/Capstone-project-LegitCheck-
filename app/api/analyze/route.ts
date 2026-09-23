import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkRules } from "@/lib/detection";

const weightValues: Record<string, number> = {
  High: 3,
  "Medium-High": 2,
  Medium: 1,
};

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!text || text.trim().length < 20) {
    return NextResponse.json(
      { error: "Please paste a longer job posting to analyze." },
      { status: 400 }
    );
  }

  // Get all rules from Supabase
  const { data: rules, error } = await supabase.from("rules").select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Run keyword detection against the submitted text
  const matches = checkRules(text);

  // Combine matches with their full rule data from Supabase
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

  // Calculate a total score based on matched rule weights
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
  });
}