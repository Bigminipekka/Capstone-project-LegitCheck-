import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Keep only real, non-empty strings and cap how many we return
function cleanList(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === "string" && item.trim().length > 0)
    .map((item) => String(item).trim())
    .slice(0, max);
}

export async function POST(req: NextRequest) {
  const { text, type } = await req.json();

  if (!text || text.trim().length < 20) {
    return NextResponse.json(
      { error: "Text too short to analyze." },
      { status: 400 }
    );
  }

  const contentLabel = type === "email" ? "email" : "job posting";

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 700,
      messages: [
        {
          role: "user",
          content: `You are a fraud detection assistant. Analyze the following ${contentLabel} for subtle manipulation tactics, psychological pressure, vague or evasive language, or other signs that suggest it could be a scam, even if it doesn't contain obvious red-flag keywords.

Respond in this exact JSON format only, with no other text:
{
  "concern_level": "Low" | "Medium" | "High",
  "summary": "A 1-2 sentence plain-language summary of your assessment",
  "observations": ["short observation 1", "short observation 2", "up to 4 total"],
  "recommended_actions": ["short action 1", "short action 2", "up to 3 total"]
}

For recommended_actions: give 2-3 steps the reader should take that are specific to the concerns you found in this ${contentLabel}. Each step must be one clear, single-action sentence. Do not repeat generic advice such as not sharing your SSN, reporting to the FTC, or reporting the ${contentLabel} to the job board or email provider, because that is covered separately. If your concern level is High, do not suggest proceeding after research; every step should protect the reader. When suggesting verifying a company, point to the state business registry (Secretary of State) or the Better Business Bureau, not the SEC. Do not tell the reader simply not to apply or reply, and do not mention reporting to the job board; both are covered separately. If a government agency is the right place to report this type of scam, name the agency. If your concern level is Low, return an empty array.

Here is the ${contentLabel} to analyze:

${text}`,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // The model sometimes wraps its JSON in markdown fences, so pull out the {...} block
    let parsed = {} as {
      concern_level?: string;
      summary?: string;
      observations?: unknown;
      recommended_actions?: unknown;
    };
    let parsedOk = false;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
      parsedOk = true;
    } catch {
      parsedOk = false;
    }

    if (!parsedOk) {
      return NextResponse.json({
        concern_level: "Unknown",
        summary: "AI analysis completed but response could not be parsed.",
        observations: [],
        recommended_actions: [],
      });
    }

    const validLevels = ["Low", "Medium", "High"];
    const concern =
      parsed.concern_level && validLevels.includes(parsed.concern_level)
        ? parsed.concern_level
        : "Unknown";

    return NextResponse.json({
      concern_level: concern,
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      observations: cleanList(parsed.observations, 4),
      recommended_actions: cleanList(parsed.recommended_actions, 3),
    });
  } catch (error) {
    console.error("AI analysis error:", error);
    return NextResponse.json(
      { error: "AI analysis is currently unavailable." },
      { status: 500 }
    );
  }
}