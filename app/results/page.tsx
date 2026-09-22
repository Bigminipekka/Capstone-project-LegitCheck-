export default function Results() {
  const redFlags = [
    {
      status: "flag",
      title: "Vague job description with no specific duties",
      description:
        "Postings that are extremely short, unclear, or rely solely on generic buzzwords like 'fast-paced environment' with zero task lists are highly typical of recruitment traps.",
    },
    {
      status: "flag",
      title: "No company name or verifiable contact info provided",
      description:
        "Genuine operations always specify who they are. The absence of a registered business domain, official corporate profile, or representative identity is a major threat indicator.",
    },
    {
      status: "flag",
      title: "Promises unusually high salary for entry-level tasks",
      description:
        "Offering $45-60/hour for basic personal assistance or administrative entry-level duties is used exclusively to entice victims into financial compromise.",
    },
    {
      status: "flag",
      title: "Requires upfront payment or personal financial info",
      description:
        "Explicit mentions of purchasing home office gear with immediate wire reimbursement, purchasing courses, or entering bank account setups upfront.",
    },
    {
      status: "safe",
      title: "Has a verifiable company website",
      description:
        "Our web spiders successfully matched the listed keywords to an active, long-standing registered organization with associated physical headquarters.",
    },
    {
      status: "safe",
      title: "Posted on a reputable job board",
      description:
        "This posting metadata aligns with authorized integration signals directly mapped from primary certified employment syndicates.",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            🛡️
          </div>
          <span className="font-bold text-lg">LegitCheck</span>
        </div>

        <nav className="hidden md:flex gap-6 text-sm text-gray-300">
          <span className="text-blue-400 font-medium">Scanner</span>
          <span>Database</span>
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

            <div className="border border-red-800 bg-red-950/40 rounded-lg p-4 text-center">
              <p className="text-xs text-red-400 font-semibold tracking-wide">
                RISK EVALUATION
              </p>
              <p className="text-3xl font-bold text-red-500 mt-1">High Risk</p>
              <p className="text-xs text-red-300 mt-2">
                We strongly advise against applying or sharing any
                financial/personal info.
              </p>
            </div>

            <div className="flex justify-between text-sm mt-4">
              <span className="text-gray-400">Matches Found</span>
              <span className="text-red-400 font-semibold">4 Flagged Elements</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-400">Heuristics Confidence</span>
              <span className="font-semibold">98%</span>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="font-semibold mb-3">Recommended Safety Actions</p>
            <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
              <li>Do not provide social security number or passport data.</li>
              <li>Report this listing on the host platform where you found it.</li>
              <li>Block the sender if they reach out via SMS or personal WhatsApp.</li>
            </ul>

            <button className="w-full mt-4 py-2 border border-blue-600 text-blue-400 rounded-lg text-sm font-semibold hover:bg-blue-950 transition-colors">
              Scan Another Job Posting
            </button>
          </div>
        </div>

        {/* Right column */}
        <div className="md:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-xs text-blue-400 font-semibold">DIAGNOSTIC REPORT</p>
          <h2 className="text-xl font-bold mt-1 mb-4">Detailed Rules Match</h2>

          <div className="space-y-3">
            {redFlags.map((flag, i) => (
              <div
                key={i}
                className={`border rounded-lg p-4 ${
                  flag.status === "flag"
                    ? "border-red-800 bg-red-950/30"
                    : "border-green-800 bg-green-950/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                      flag.status === "flag"
                        ? "bg-red-600"
                        : "bg-green-600"
                    }`}
                  >
                    {flag.status === "flag" ? "✕" : "✓"}
                  </span>
                  <div>
                    <p
                      className={`font-semibold ${
                        flag.status === "flag" ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {flag.title}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">{flag.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
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