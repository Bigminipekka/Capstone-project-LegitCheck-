"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const [jobPosting, setJobPosting] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    setErrorMsg("");

    if (jobPosting.trim().length < 20) {
      setErrorMsg("Please paste a longer job posting to analyze.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: jobPosting }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // Save the result temporarily so the Results page can read it
      sessionStorage.setItem("legitcheck_result", JSON.stringify(data));
      router.push("/results");
    } catch (err) {
      setErrorMsg("Something went wrong. Please try again.");
      setLoading(false);
    }
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
          <span className="text-blue-400 font-medium">Scanner</span>
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

      {/* Hero */}
      <div className="text-center mt-12 px-4">
        <span className="text-xs text-blue-400 font-semibold tracking-wide">
          ANTI-SCAM INTELLIGENCE
        </span>
        <h1 className="text-4xl md:text-5xl font-bold mt-3">
          Detect Job Scams Instantly
        </h1>
        <p className="text-gray-400 mt-4 max-w-xl mx-auto">
          Paste a job posting below to check if it's likely a scam. Our
          algorithm analyzes salary claims, request channels, contact
          details, and grammatical patterns.
        </p>
      </div>

      {/* Input Card */}
      <div className="max-w-3xl w-full mx-auto mt-10 bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-gray-300">
            JOB DESCRIPTION / POSTING TEXT
          </span>
          <span className="text-xs text-gray-500">
            Support for pasted text, HTML, or raw links
          </span>
        </div>

        <textarea
          value={jobPosting}
          onChange={(e) => setJobPosting(e.target.value)}
          placeholder="Paste the job posting here..."
          className="w-full h-48 p-4 rounded-lg bg-gray-950 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
        />

        {errorMsg && (
          <p className="text-red-400 text-sm mt-2">{errorMsg}</p>
        )}

        <div className="flex justify-between items-center mt-4">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            🛡️ We do not save your personal job search data.
          </span>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            {loading ? "Analyzing..." : "Check This Posting →"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-3xl w-full mx-auto mt-10 mb-16 grid grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-2xl font-bold">482,912</p>
          <p className="text-xs text-gray-500 mt-1">Scams Flagged</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-2xl font-bold">99.4%</p>
          <p className="text-xs text-gray-500 mt-1">Detection Accuracy</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-2xl font-bold">Instant</p>
          <p className="text-xs text-gray-500 mt-1">Analysis Speed</p>
        </div>
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