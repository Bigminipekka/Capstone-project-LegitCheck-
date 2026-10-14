"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Hit {
  start: number;
  end: number;
}

interface FlaggedResult {
  indicator: string;
  weight: string;
  description: string;
  source: string;
  category: string;
  hits?: Hit[];
}

interface AIAnalysis {
  concern_level: string;
  summary: string;
  observations: string[];
  recommended_actions?: string[];
  highlights?: Hit[];
}

interface AnalysisResult {
  riskLevel: "Low" | "Medium" | "High";
  matchesFound: number;
  totalScore: number;
  flaggedResults: FlaggedResult[];
  contentType?: string;
  aiAnalysis?: AIAnalysis | null;
  submittedText?: string;
}

type Mark = "High" | "Medium-High" | "Medium" | "AI";

interface Segment {
  text: string;
  mark: Mark | null;
}

const markStyles: { [key: string]: string } = {
  High: "bg-red-500/30 text-red-100",
  "Medium-High": "bg-orange-500/30 text-orange-100",
  Medium: "bg-yellow-500/30 text-yellow-100",
  AI: "bg-purple-500/30 text-purple-100",
};

const markStrength: { [key: string]: number } = {
  AI: 1,
  Medium: 2,
  "Medium-High": 3,
  High: 4,
};

// Split the submitted text into marked and unmarked pieces. Where marks
// overlap, the more severe one wins and rule matches beat AI quotes.
function buildSegments(
  text: string,
  flags: FlaggedResult[],
  aiHits: Hit[]
): Segment[] {
  const marks = new Array(text.length).fill(null) as (Mark | null)[];

  const paint = (hit: Hit, mark: Mark) => {
    const start = Math.max(0, hit.start);
    const end = Math.min(text.length, hit.end);
    for (let i = start; i < end; i++) {
      const current = marks[i];
      if (current === null || markStrength[mark] > markStrength[current]) {
        marks[i] = mark;
      }
    }
  };

  aiHits.forEach((hit) => paint(hit, "AI"));
  flags.forEach((flag) => {
    let mark: Mark = "Medium";
    if (flag.weight === "High") mark = "High";
    else if (flag.weight === "Medium-High") mark = "Medium-High";
    (flag.hits || []).forEach((hit) => paint(hit, mark));
  });

  const segments: Segment[] = [];
  let start = 0;
  for (let i = 1; i <= text.length; i++) {
    if (i === text.length || marks[i] !== marks[start]) {
      segments.push({ text: text.slice(start, i), mark: marks[start] });
      start = i;
    }
  }
  return segments;
}

export default function Results() {
  const router = useRouter();
  const [result, setResult] = useState(null as AnalysisResult | null);

  useEffect(() => {
    const stored = sessionStorage.getItem("legitcheck_result");
    if (stored) {
      setResult(JSON.parse(stored));
    }
  }, []);

  if (!result) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
        <p className="text-gray-400 mb-4">
          No analysis found. Please submit a job posting first.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
        >
          Go to Scanner
        </button>
      </main>
    );
  }

  // ---- Combine the two layers: the higher rating becomes the headline ----
  const rank: { [key: string]: number } = { Low: 0, Medium: 1, High: 2 };
  const levels = ["Low", "Medium", "High"] as const;

  const ruleLevel = result.riskLevel;
  const aiLevel =
    result.aiAnalysis && rank[result.aiAnalysis.concern_level] !== undefined
      ? result.aiAnalysis.concern_level
      : null;

  const overallRank = Math.max(rank[ruleLevel], aiLevel ? rank[aiLevel] : 0);
  const overallLevel = levels[overallRank];

  let drivenBy = "rules";
  if (aiLevel && rank[aiLevel] > rank[ruleLevel]) drivenBy = "ai";
  else if (aiLevel && rank[aiLevel] === rank[ruleLevel]) drivenBy = "both";

  // The layer with the higher rating is shown first. Ties keep rules on top.
  const aiFirst = drivenBy === "ai";

  const drivenByText =
    drivenBy === "ai"
      ? "Set by the AI review, which rated this higher than the rule-based engine."
      : drivenBy === "both"
      ? "Both layers agree on this rating."
      : aiLevel
      ? "Set by the rule-based engine, which rated this at least as high as the AI review."
      : "Set by the rule-based engine. The AI review was unavailable for this scan.";

  const riskColors = {
    High: {
      border: "border-red-800",
      bg: "bg-red-950/40",
      text: "text-red-500",
      label: "text-red-400",
      sub: "text-red-300",
      advice: "We strongly advise against applying or sharing any financial/personal info.",
    },
    Medium: {
      border: "border-yellow-800",
      bg: "bg-yellow-950/40",
      text: "text-yellow-500",
      label: "text-yellow-400",
      sub: "text-yellow-300",
      advice: "Proceed with caution and verify the company independently before applying.",
    },
    Low: {
      border: "border-green-800",
      bg: "bg-green-950/40",
      text: "text-green-500",
      label: "text-green-400",
      sub: "text-green-300",
      advice: "No major red flags detected, but always use good judgment.",
    },
  };

  const colors = riskColors[overallLevel];

  const levelText: { [key: string]: string } = {
    High: "text-red-400",
    Medium: "text-yellow-400",
    Low: "text-green-400",
  };

  // The confidence number comes from the rule-based score, so it is only
  // shown when the rule-based engine agrees with the overall rating.
  const showConfidence = drivenBy !== "ai";
  const confidence =
    ruleLevel === "Low"
      ? Math.max(85, 100 - result.totalScore * 5)
      : Math.min(98, 70 + result.totalScore * 5);
  const confidenceLabel =
    overallLevel === "Low" ? "Clean Scan Confidence" : "Scam Confidence";

  // ---- Recommended actions: fixed baseline + AI-suggested specifics ----
  const isEmail = result.contentType === "email";

  const baselineActions = isEmail
    ? [
        "Never click links or share passwords, SSNs, or card numbers from an unexpected email.",
        "If you already shared information or paid, report it at reportfraud.ftc.gov.",
      ]
    : [
        "Never send money or share your SSN or banking details to get a job.",
        "If you already shared information or paid, report it at reportfraud.ftc.gov.",
      ];

  const reportAction = isEmail
    ? "Report the email as phishing to your email provider, then delete it."
    : "Report this listing on the site where you found it.";

  const stopAction = isEmail
    ? "Do not reply, click any links, or open attachments."
    : "Do not apply, reply, or share personal information with this poster.";

  const standardActions =
    overallLevel === "Low"
      ? baselineActions
      : overallLevel === "High"
      ? [stopAction, reportAction, ...baselineActions]
      : [reportAction, ...baselineActions];

  // AI actions are only shown when the AI itself raised a concern
  const aiActions =
    aiLevel &&
    aiLevel !== "Low" &&
    result.aiAnalysis &&
    result.aiAnalysis.recommended_actions
      ? result.aiAnalysis.recommended_actions
      : [];

  const weightStyles: {
    [key: string]: { border: string; bg: string; text: string; badge: string };
  } = {
    High: {
      border: "border-red-800",
      bg: "bg-red-950/30",
      text: "text-red-400",
      badge: "bg-red-600",
    },
    "Medium-High": {
      border: "border-orange-800",
      bg: "bg-orange-950/30",
      text: "text-orange-400",
      badge: "bg-orange-600",
    },
    Medium: {
      border: "border-yellow-800",
      bg: "bg-yellow-950/30",
      text: "text-yellow-400",
      badge: "bg-yellow-600",
    },
  };

  // ---- Highlighting: where in the submitted text each flag was found ----
  const submitted = result.submittedText || "";

  const aiHighlights =
    result.aiAnalysis && result.aiAnalysis.highlights
      ? result.aiAnalysis.highlights
      : [];

  const segments = submitted
    ? buildSegments(submitted, result.flaggedResults, aiHighlights)
    : [];
  const anyMarked = segments.some((segment) => segment.mark !== null);

  // The phrases that triggered one flag, shortened and without repeats
  const snippetsFor = (flag: FlaggedResult) => {
    const seen: string[] = [];
    const out: string[] = [];
    (flag.hits || []).forEach((hit) => {
      const phrase = submitted
        .slice(hit.start, hit.end)
        .replace(/\s+/g, " ")
        .trim();
      if (phrase && !seen.includes(phrase.toLowerCase())) {
        seen.push(phrase.toLowerCase());
        out.push(phrase);
      }
    });
    return out;
  };

  // ---- The result cards, built separately so their order can change ----
  const rulesCard = (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <p className="text-xs text-blue-400 font-semibold">DIAGNOSTIC REPORT</p>
      <h2 className="text-xl font-bold mt-1">Detailed Rules Match</h2>
      <p className="text-xs text-gray-400 mb-4">
        Rule-based rating:{" "}
        <span className={`font-semibold ${levelText[ruleLevel]}`}>
          {ruleLevel}
        </span>
      </p>

      {result.flaggedResults.length === 0 ? (
        <p className="text-gray-400 text-sm">
          No red flags were detected in this posting based on our current rule set.
        </p>
      ) : (
        <div className="space-y-3">
          {result.flaggedResults.map((flag, i) => {
            const style = weightStyles[flag.weight] || weightStyles.Medium;
            const snippets = snippetsFor(flag);
            const hasHits = !!flag.hits && flag.hits.length > 0;

            return (
              <div
                key={i}
                className={`border rounded-lg p-4 ${style.border} ${style.bg}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${style.badge}`}
                  >
                    ✕
                  </span>
                  <div className="min-w-0">
                    <p className={`font-semibold ${style.text}`}>
                      {flag.indicator}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {flag.description}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Source: {flag.source} • Weight: {flag.weight}
                    </p>

                    {submitted && (
                      <div className="mt-2">
                        {snippets.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {snippets.slice(0, 3).map((phrase, j) => (
                              <span
                                key={j}
                                className="inline-block max-w-full break-words rounded border border-gray-700 bg-gray-950/60 px-2 py-0.5 text-xs text-gray-200"
                              >
                                &ldquo;
                                {phrase.length > 90
                                  ? phrase.slice(0, 87) + "…"
                                  : phrase}
                                &rdquo;
                              </span>
                            ))}
                            {snippets.length > 3 && (
                              <span className="self-center text-xs text-gray-400">
                                +{snippets.length - 3} more
                              </span>
                            )}
                          </div>
                        ) : hasHits ? (
                          <p className="text-xs text-gray-400">
                            Marked in your text below (spacing).
                          </p>
                        ) : (
                          <p className="text-xs text-gray-400">
                            Based on what is missing or on the text as a
                            whole, so there is no single phrase to point to.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const aiCard = result.aiAnalysis ? (
    <div className="bg-gray-900 border border-purple-900 rounded-xl p-6">
      <p className="text-xs text-purple-400 font-semibold">AI ANALYSIS</p>
      <h2 className="text-xl font-bold mt-1 mb-1">Language & Intent Review</h2>
      <p className="text-xs text-gray-500 mb-4">
        Beyond keyword matching — an AI review for subtle manipulation tactics
      </p>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm text-gray-400">Concern Level:</span>
        <span
          className={`text-sm font-semibold ${
            levelText[result.aiAnalysis.concern_level] || "text-gray-400"
          }`}
        >
          {result.aiAnalysis.concern_level}
        </span>
      </div>

      <p className="text-sm text-gray-300 mb-4">{result.aiAnalysis.summary}</p>

      {result.aiAnalysis.observations &&
        result.aiAnalysis.observations.length > 0 && (
          <ul className="text-sm text-gray-400 space-y-1.5 list-disc list-inside">
            {result.aiAnalysis.observations.map((obs, i) => (
              <li key={i}>{obs}</li>
            ))}
          </ul>
        )}
    </div>
  ) : null;

  const highlightCard = submitted ? (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <p className="text-xs text-blue-400 font-semibold">WHERE WE FOUND IT</p>
      <h2 className="text-xl font-bold mt-1 mb-1">
        Your text, with flags marked
      </h2>
      <p className="text-xs text-gray-400 mb-3 leading-relaxed">
        Marks show where a rule matched or where the AI quoted your text. They
        explain why something was flagged and are not proof of a scam. Flags
        based on something missing have nothing to mark.
      </p>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-xs text-gray-300">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-red-500/40"></span>
          High-weight rule
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-orange-500/40"></span>
          Medium-High rule
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-yellow-500/40"></span>
          Medium rule
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-purple-500/40"></span>
          Quoted by the AI review
        </span>
      </div>

      <div className="whitespace-pre-wrap break-words text-sm text-gray-300 leading-relaxed bg-gray-950 border border-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
        {segments.map((segment, i) =>
          segment.mark ? (
            <mark
              key={i}
              className={`rounded px-0.5 ${markStyles[segment.mark]}`}
            >
              {segment.text}
            </mark>
          ) : (
            <span key={i}>{segment.text}</span>
          )
        )}
      </div>

      {!anyMarked && (
        <p className="text-xs text-gray-400 mt-3">
          Nothing in this text could be marked. That is expected when no flags
          were raised or when the flags come from something missing.
        </p>
      )}
    </div>
  ) : null;

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            🛡️
          </div>
          <span className="font-bold text-lg">LegitCheck</span>
        </Link>

        <nav className="hidden md:flex gap-6 text-sm text-gray-300">
          <Link href="/" className="hover:text-blue-400 transition-colors">
            Scanner
          </Link>
          <Link href="/database" className="hover:text-blue-400 transition-colors">
            Database
          </Link>
          <Link href="/how-it-works" className="hover:text-blue-400 transition-colors">
            How It Works
          </Link>
          <span>About API</span>
        </nav>

        <span className="flex items-center gap-1 text-xs text-green-400 border border-green-700 rounded-full px-3 py-1">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          SYSTEM ACTIVE
        </span>
      </header>

      {/* Content */}
      <div className="max-w-6xl w-full mx-auto mt-10 px-4 grid md:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-xs text-gray-500 font-semibold">DIAGNOSTIC RESULT</p>
            <h2 className="text-xl font-bold mt-1 mb-4">Analysis Finished</h2>

            <div className={`border ${colors.border} ${colors.bg} rounded-lg p-4 text-center`}>
              <p className={`text-xs ${colors.label} font-semibold tracking-wide`}>
                OVERALL RISK EVALUATION
              </p>
              <p className={`text-3xl font-bold ${colors.text} mt-1`}>
                {overallLevel} Risk
              </p>
              <p className={`text-xs ${colors.sub} mt-2`}>{colors.advice}</p>
            </div>

            <p className="text-xs text-gray-300 mt-3 leading-relaxed">
              {drivenByText}
            </p>

            <div className="mt-4 pt-3 border-t border-gray-800 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Rule-based engine</span>
                <span className={`font-semibold ${levelText[ruleLevel]}`}>
                  {ruleLevel} ({result.matchesFound}{" "}
                  {result.matchesFound === 1 ? "flag" : "flags"})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">AI review</span>
                <span
                  className={`font-semibold ${
                    aiLevel ? levelText[aiLevel] : "text-gray-500"
                  }`}
                >
                  {aiLevel ? aiLevel : "Unavailable"}
                </span>
              </div>
              {showConfidence && (
                <div className="flex justify-between">
                  <span className="text-gray-400">{confidenceLabel}</span>
                  <span className="font-semibold">{confidence}%</span>
                </div>
              )}
            </div>

            {overallLevel === "Low" && result.matchesFound > 0 && (
              <p className="text-xs text-gray-300 mt-3 leading-relaxed">
                {result.matchesFound === 1
                  ? "One minor signal was"
                  : `${result.matchesFound} minor signals were`}{" "}
                detected, but weren&apos;t strong or numerous enough to raise
                the overall risk level. Individual weak matches don&apos;t
                necessarily indicate a scam on their own.
              </p>
            )}

            <p className="text-xs text-gray-300 mt-4 pt-3 border-t border-gray-800 leading-relaxed">
              LegitCheck combines rule-based and AI analysis to catch as much
              as possible, but no detection system is perfect. A clean
              result from both systems reduces risk — it does not guarantee
              legitimacy. Always use independent judgment.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="font-semibold mb-3">Recommended Safety Actions</p>

            {overallLevel === "Low" && (
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                {isEmail
                  ? "No major concerns were found, but still verify the sender independently before clicking links or replying."
                  : "No major concerns were found, but still verify the company independently before sharing personal information."}
              </p>
            )}

            {aiActions.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-purple-400 font-semibold mb-2">
                  AI-SUGGESTED, SPECIFIC TO THIS SCAN
                </p>
                <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
                  {aiActions.map((action, i) => (
                    <li key={i}>{action}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-gray-400 font-semibold mb-2">
              STANDARD ADVICE
            </p>
            <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
              {standardActions.map((action, i) => (
                <li key={i}>{action}</li>
              ))}
            </ul>

            <button
              onClick={() =>
                router.push(`/?mode=${result.contentType || "job_posting"}`)
              }
              className="w-full mt-4 py-2 border border-blue-600 text-blue-400 rounded-lg text-sm font-semibold hover:bg-blue-950 transition-colors"
            >
              Scan Another {isEmail ? "Email" : "Job Posting"}
            </button>
          </div>
        </div>

        {/* Right column: the higher-rated layer goes first */}
        <div className="md:col-span-2 space-y-6">
          {aiFirst ? aiCard : rulesCard}
          {aiFirst ? rulesCard : aiCard}
        </div>
      </div>

      {/* Highlighted text */}
      {highlightCard && (
        <div className="max-w-6xl w-full mx-auto mt-6 px-4">{highlightCard}</div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 px-8 mt-10 flex justify-between text-xs text-gray-500">
        <span>© 2026 LegitCheck. Rule-based and AI-assisted fraud detection.</span>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-gray-300 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-gray-300 transition-colors">
            Terms of Service
          </Link>
          <span>🔒 SSL Encrypted</span>
        </div>
      </footer>
    </main>
  );
}