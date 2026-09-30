import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: `You are a fraud detection assistant. Analyze the following ${contentLabel} for subtle manipulation tactics, psychological pressure, vague or evasive language, or other signs that suggest it could be a scam — even if it doesn't contain obvious red-flag keywords.

Respond in this exact JSON format only, with no other text:
{
  "concern_level": "Low" | "Medium" | "High",
  "summary": "A 1-2 sentence plain-language summary of your assessment",
  "observations": ["short observation 1", "short observation 2", "up to 4 total"]
}

Here is the ${contentLabel} to analyze:

${text}`,
        },
      ],
    });

        const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    console.log("Raw AI response:", responseText);

    // Try to parse the AI's JSON response, stripping any markdown code fences
    // or extra text the model might have added around the JSON
    let parsed;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = jsonMatch
        ? JSON.parse(jsonMatch[0])
        : JSON.parse(responseText);
    } catch {
      parsed = {
        concern_level: "Unknown",
        summary: "AI analysis completed but response could not be parsed.",
        observations: [],
      };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("AI analysis error:", error);
    return NextResponse.json(
      { error: "AI analysis is currently unavailable." },
      { status: 500 }
    );
  }
}