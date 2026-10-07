"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Rule {
  id: number;
  indicator: string;
  source: string;
  weight: string;
  description: string;
  category: string;
  content_type: string;
}

export default function Database() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"job_posting" | "email" | "ai">(
    "job_posting"
  );

  useEffect(() => {
    const fetchRules = async () => {
      const { data, error } = await supabase
        .from("rules")
        .select("*")
        .order("category", { ascending: true });

      if (!error && data) {
        setRules(data);
      }
      setLoading(false);
    };

    fetchRules();
  }, []);

  const filteredRules =
    mode === "ai" ? [] : rules.filter((r) => r.content_type === mode);

  const grouped = filteredRules.reduce((acc: Record<string, Rule[]>, rule) => {
    if (!acc[rule.category]) acc[rule.category] = [];
    acc[rule.category].push(rule);
    return acc;
  }, {});

  const weightColor: Record<string, string> = {
    High: "text-red-400 border-red-800 bg-red-950/30",
    "Medium-High": "text-orange-400 border-orange-800 bg-orange-950/30",
    Medium: "text-yellow-400 border-yellow-800 bg-yellow-950/30",
  };

  const tabClass = (active: boolean) =>
    `px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
      active
        ? "bg-blue-600 text-white"
        : "bg-gray-800 text-gray-400 hover:text-white"
    }`;

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
          <span className="text-blue-400 font-medium">Database</span>
          <Link
            href="/how-it-works"
            className="hover:text-blue-400 transition-colors"
          >
            How It Works
          </Link>
          <span>About API</span>
        </nav>

        <span className="flex items-center gap-1 text-xs text-green-400 border border-green-700 rounded-full px-3 py-1">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          SYSTEM ACTIVE
        </span>
      </header>

      {/* Hero */}
      <div className="text-center mt-12 px-4">
        <span className="text-xs text-blue-400 font-semibold tracking-wide">
          FULL TRANSPARENCY
        </span>
        <h1 className="text-4xl md:text-5xl font-bold mt-3">The Rule Set</h1>
        <p className="text-gray-400 mt-4 max-w-xl mx-auto">
          LegitCheck uses two independent layers. The rule-based engine checks
          for the sourced red flags listed here. The AI review has no fixed
          rule list, so its tab shows exactly how it is instructed.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2 mt-8 px-4 flex-wrap">
        <button
          onClick={() => setMode("job_posting")}
          className={tabClass(mode === "job_posting")}
        >
          Job Posting Rules
        </button>
        <button
          onClick={() => setMode("email")}
          className={tabClass(mode === "email")}
        >
          Email Rules
        </button>
        <button onClick={() => setMode("ai")} className={tabClass(mode === "ai")}>
          AI Review
        </button>
      </div>

      <div className="max-w-4xl w-full mx-auto mt-10 mb-16 px-4">
        {/* AI Review tab */}
        {mode === "ai" && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-purple-900 rounded-xl p-6">
              <p className="text-xs text-purple-400 font-semibold">
                AI REVIEW
              </p>
              <h2 className="text-xl font-bold mt-1 mb-3">
                How the AI Layer Is Instructed
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed mb-4">
                The AI layer does not use the rules on the other tabs. It
                never sees them, and it never sees the rule-based results. It
                reads the submitted text on its own, using this instruction:
              </p>
              <blockquote className="border-l-4 border-purple-700 bg-purple-950/20 rounded-r-lg p-4 text-sm text-gray-300 leading-relaxed">
                Analyze the following job posting or email for subtle
                manipulation tactics, psychological pressure, vague or evasive
                language, or other signs that suggest it could be a scam, even
                if it does not contain obvious red-flag keywords.
              </blockquote>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3">What It Returns</h3>
              <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
                <li>A concern level: Low, Medium, or High</li>
                <li>A one to two sentence plain-language summary</li>
                <li>Up to four specific observations about the text</li>
              </ul>
              <p className="text-xs text-gray-500 mt-4">
                Model: Claude Haiku 4.5, accessed through the Anthropic API.
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3">
                How It Differs From the Rule-Based Engine
              </h3>
              <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
                <li>
                  The rules are fixed, sourced from the FTC, BBB, and FBI IC3,
                  and give the same result every time. The AI has no source
                  list, and its wording or concern level can vary between runs.
                </li>
                <li>
                  The rules match specific patterns. The AI reads for meaning,
                  so it can catch disguised scams that use no obvious trigger
                  words.
                </li>
                <li>
                  The AI can also be wrong. It may overlook a scam or raise
                  concern about something legitimate.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Rule tabs */}
        {mode !== "ai" && (
          <>
            {loading && (
              <p className="text-gray-500 text-center">Loading rule set...</p>
            )}

            {!loading && filteredRules.length === 0 && (
              <p className="text-gray-500 text-center">
                No rules found for this content type.
              </p>
            )}

            {!loading &&
              Object.entries(grouped).map(([category, categoryRules]) => (
                <div key={category} className="mb-8">
                  <h2 className="text-lg font-bold mb-3 text-blue-400">
                    {category}
                  </h2>
                  <div className="space-y-3">
                    {categoryRules.map((rule) => (
                      <div
                        key={rule.id}
                        className={`border rounded-lg p-4 ${
                          weightColor[rule.weight] ||
                          "text-gray-300 border-gray-800 bg-gray-900"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <p className="font-semibold">{rule.indicator}</p>
                          <span className="text-xs whitespace-nowrap opacity-80">
                            {rule.weight}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          {rule.description}
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                          Source: {rule.source}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 px-8 flex justify-between text-xs text-gray-500">
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