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
}

export default function Database() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

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

  const grouped = rules.reduce((acc: Record<string, Rule[]>, rule) => {
    if (!acc[rule.category]) acc[rule.category] = [];
    acc[rule.category].push(rule);
    return acc;
  }, {});

  const weightColor: Record<string, string> = {
    High: "text-red-400 border-red-800 bg-red-950/30",
    "Medium-High": "text-orange-400 border-orange-800 bg-orange-950/30",
    Medium: "text-yellow-400 border-yellow-800 bg-yellow-950/30",
  };

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
          <span>Extension</span>
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
        <h1 className="text-4xl md:text-5xl font-bold mt-3">
          The Rule Set
        </h1>
        <p className="text-gray-400 mt-4 max-w-xl mx-auto">
          Every red flag LegitCheck checks for, sourced from the FTC, BBB,
          and FBI IC3, so you know exactly how your results are calculated.
        </p>
      </div>

      {/* Rules */}
      <div className="max-w-4xl w-full mx-auto mt-10 mb-16 px-4">
        {loading && (
          <p className="text-gray-500 text-center">Loading rule set...</p>
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
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 px-8 flex justify-between text-xs text-gray-500">
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