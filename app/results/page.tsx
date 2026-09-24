"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FlaggedResult {
  indicator: string;
  weight: string;
  description: string;
  source: string;
  category: string;
}

interface AnalysisResult {
  riskLevel: "Low" | "Medium" | "High";
  matchesFound: number;
  totalScore: number;
  flaggedResults: FlaggedResult[];
}

export default function Results() {
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);

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

  const colors = riskColors[result.riskLevel];
  const confidence = Math.min(98, 70 + result.matchesFound * 5);

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
          <span>Extension</span>
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
                RISK EVALUATION
              </p>
              <p className={`text-3xl font-bold ${colors.text} mt-1`}>
                {result.riskLevel} Risk
              </p>
              <p className={`text-xs ${colors.sub} mt-2`}>{colors.advice}</p>
            </div>

            <div className="flex justify-between text-sm mt-4">
              <span className="text-gray-400">Matches Found</span>
              <span className={`${colors.label} font-semibold`}>
                {result.matchesFound} Flagged Elements
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-400">Heuristics Confidence</span>
              <span className="font-semibold">{confidence}%</span>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="font-semibold mb-3">Recommended Safety Actions</p>
            <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
              <li>Do not provide social security number or passport data.</li>
              <li>Report this listing on the host platform where you found it.</li>
              <li>Block the sender if they reach out via SMS or personal WhatsApp.</li>
            </ul>

            <button
              onClick={() => router.push("/")}
              className="w-full mt-4 py-2 border border-blue-600 text-blue-400 rounded-lg text-sm font-semibold hover:bg-blue-950 transition-colors"
            >
              Scan Another Job Posting
            </button>
          </div>
        </div>

        {/* Right column */}
        <div className="md:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-xs text-blue-400 font-semibold">DIAGNOSTIC REPORT</p>
          <h2 className="text-xl font-bold mt-1 mb-4">Detailed Rules Match</h2>

          {result.flaggedResults.length === 0 ? (
            <p className="text-gray-400 text-sm">
              No red flags were detected in this posting based on our current rule set.
            </p>
          ) : (
            <div className="space-y-3">
              {result.flaggedResults.map((flag, i) => (
                <div
                  key={i}
                  className="border rounded-lg p-4 border-red-800 bg-red-950/30"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 bg-red-600">
                      ✕
                    </span>
                    <div>
                      <p className="font-semibold text-red-400">{flag.indicator}</p>
                      <p className="text-sm text-gray-400 mt-1">{flag.description}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Source: {flag.source} • Weight: {flag.weight}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 px-8 mt-10 flex justify-between text-xs text-gray-500">
        <span>© 2026 LegitCheck Technology Inc. Real-time NLP threat detection.</span>
        <div className="flex gap-4">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>🔒 SSL Encrypted</span>
        </div>
      </footer>
    </main>
  );
}