"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Stats {
  jobCount: number;
  emailCount: number;
  jobAvgMs: number;
  emailAvgMs: number;
}

// Shows "—" when there are no scans of that type yet
function formatSeconds(ms: number) {
  return ms > 0 ? (ms / 1000).toFixed(1) + "s" : "—";
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

function HomeContent() {
  const searchParams = useSearchParams();
  const initialMode =
    searchParams.get("mode") === "email" ? "email" : "job_posting";

  const [jobPosting, setJobPosting] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [mode, setMode] = useState<"job_posting" | "email">(initialMode);
  const [stats, setStats] = useState(null as Stats | null);
  const [ocrBusy, setOcrBusy] = useState(false);
  const [ocrStatus, setOcrStatus] = useState("");
  const fileInputRef = useRef(null as HTMLInputElement | null);
  const router = useRouter();

  // Load the live scan totals each time the homepage opens
  useEffect(() => {
    fetch("/api/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => {});
  }, []);

  // Read text out of one or more screenshots and add it to the text box
  const readImages = async (files: File[]) => {
    setErrorMsg("");

    const images = files.filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) {
      setErrorMsg("Please choose an image file (PNG, JPG, or WebP).");
      return;
    }
    if (images.some((f) => f.size > MAX_IMAGE_BYTES)) {
      setErrorMsg("Each image must be under 10 MB.");
      return;
    }

    setOcrBusy(true);
    try {
      const { createWorker } = await import("tesseract.js");
      let currentImage = 1;

      const worker = await createWorker("eng", 1, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") {
            setOcrStatus(
              `Reading image ${currentImage} of ${images.length}... ${Math.round(
                m.progress * 100
              )}%`
            );
          } else {
            setOcrStatus("Loading the text reader (first time only)...");
          }
        },
      });

      const pieces: string[] = [];
      try {
        for (let i = 0; i < images.length; i++) {
          currentImage = i + 1;
          const { data } = await worker.recognize(images[i]);
          const cleaned = data.text.trim();
          if (cleaned) pieces.push(cleaned);
        }
      } finally {
        await worker.terminate();
      }

      if (pieces.length === 0) {
        setErrorMsg(
          "No readable text was found in the image. Try a clearer or larger screenshot, or paste the text instead."
        );
        return;
      }

      setJobPosting(
        (prev) =>
          (prev.trim() ? prev.trimEnd() + "\n\n" : "") + pieces.join("\n\n")
      );
    } catch (err) {
      console.error("OCR error:", err);
      setErrorMsg("Could not read the image. Try again or paste the text instead.");
    } finally {
      setOcrBusy(false);
      setOcrStatus("");
    }
  };

  // Returns true if the clipboard held an image (so normal pasting is skipped)
  const handleClipboard = (clipboard: DataTransfer): boolean => {
    const imageFiles: File[] = [];
    for (const item of Array.from(clipboard.items)) {
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) imageFiles.push(file);
      }
    }
    if (imageFiles.length === 0) return false;
    readImages(imageFiles);
    return true;
  };

  const handleSubmit = async () => {
    setErrorMsg("");

    if (jobPosting.trim().length < 20) {
      setErrorMsg("Please paste a longer message to analyze.");
      return;
    }

    setLoading(true);
    const startTime = performance.now();

    try {
      // Run the rule-based engine and the AI layer at the same time
      const [ruleRes, aiRes] = await Promise.all([
        fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: jobPosting, type: mode }),
        }),
        fetch("/api/ai-analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: jobPosting, type: mode }),
        }),
      ]);

      const ruleData = await ruleRes.json();

      if (!ruleRes.ok) {
        setErrorMsg(ruleData.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // AI layer is a bonus — if it fails, we still show the core results
      let aiData = null;
      if (aiRes.ok) {
        aiData = await aiRes.json();
      }

      const combined = { ...ruleData, aiAnalysis: aiData };

      // Record the scan count and timing (no text is sent). If this fails,
      // the scan itself is unaffected.
      fetch("/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: mode,
          durationMs: Math.round(performance.now() - startTime),
        }),
        keepalive: true,
      }).catch(() => {});

      sessionStorage.setItem("legitcheck_result", JSON.stringify(combined));
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

      {/* Hero */}
      <div className="text-center mt-12 px-4">
        <span className="text-xs text-blue-400 font-semibold tracking-wide">
          ANTI-SCAM INTELLIGENCE
        </span>
        <h1 className="text-4xl md:text-5xl font-bold mt-3">
          Detect Job Scams Fast
        </h1>
        <p className="text-gray-400 mt-4 max-w-xl mx-auto">
          Paste a job posting or suspicious email, or add a screenshot of
          one, to check if it's likely a scam. Our algorithm analyzes salary
          claims, request channels, contact details, and grammatical
          patterns.
        </p>
      </div>

      {/* Input Card */}
      <div className="max-w-3xl w-full mx-auto mt-10 bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode("job_posting")}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              mode === "job_posting"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            Job Posting
          </button>
          <button
            onClick={() => setMode("email")}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              mode === "email"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            Email
          </button>
        </div>

        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-gray-300">
            {mode === "email" ? "EMAIL CONTENT" : "JOB DESCRIPTION / POSTING TEXT"}
          </span>
          <span className="text-xs text-gray-500">
            Paste text, or paste or upload a screenshot
          </span>
        </div>

        <textarea
          value={jobPosting}
          onChange={(e) => setJobPosting(e.target.value)}
          onPaste={(e) => {
            if (handleClipboard(e.clipboardData)) e.preventDefault();
          }}
          placeholder={
            mode === "email"
              ? "Paste the email content here, or paste a screenshot..."
              : "Paste the job posting here, or paste a screenshot..."
          }
          className="w-full h-48 p-4 rounded-lg bg-gray-950 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
        />

        {/* Screenshot upload */}
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              e.target.value = "";
              if (files.length > 0) readImages(files);
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={ocrBusy || loading}
            className="px-4 py-1.5 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 disabled:opacity-50 rounded-lg text-sm font-semibold transition-colors"
          >
            📷 Add screenshot
          </button>
          {ocrBusy && (
            <span className="text-xs text-purple-300">
              {ocrStatus || "Reading image..."}
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
          Screenshots are read in your browser, and the extracted text appears
          above so you can check it before scanning.
          {mode === "job_posting"
            ? " Job postings are often longer than one screen, so add more than one screenshot, in order, to capture the whole posting."
            : ""}
        </p>

        {errorMsg && <p className="text-red-400 text-sm mt-2">{errorMsg}</p>}

        <div className="flex justify-between items-center mt-4">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            🛡️ Your text is not saved. The AI review is processed by a third
            party.{" "}
            <Link href="/privacy" className="text-blue-400 hover:underline">
              Details
            </Link>
          </span>

          <button
            onClick={handleSubmit}
            disabled={loading || ocrBusy}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Analyzing...
              </>
            ) : (
              `Check This ${mode === "email" ? "Email" : "Posting"} →`
            )}
          </button>
        </div>
      </div>

      {/* Live stats */}
      <div className="max-w-3xl w-full mx-auto mt-10 mb-16 grid grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-2xl font-bold">
            {stats ? stats.jobCount.toLocaleString() : "—"}
          </p>
          <p className="text-xs text-gray-500 mt-1">Job postings scanned</p>
          <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-800">
            Average scan time:{" "}
            <span className="font-semibold text-white">
              {formatSeconds(stats ? stats.jobAvgMs : 0)}
            </span>
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-2xl font-bold">
            {stats ? stats.emailCount.toLocaleString() : "—"}
          </p>
          <p className="text-xs text-gray-500 mt-1">Emails scanned</p>
          <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-800">
            Average scan time:{" "}
            <span className="font-semibold text-white">
              {formatSeconds(stats ? stats.emailAvgMs : 0)}
            </span>
          </p>
        </div>
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

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}