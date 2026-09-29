import Link from "next/link";

export default function Terms() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            🛡️
          </div>
          <span className="font-bold text-lg">LegitCheck</span>
        </Link>
      </header>

      <div className="max-w-2xl w-full mx-auto mt-12 mb-16 px-4">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <p className="text-gray-500 text-sm mb-8">Last updated: September 2026</p>

        <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              What LegitCheck Does
            </h2>
            <p>
              LegitCheck analyzes text you submit against a rule-based set of
              fraud indicators sourced from public consumer protection
              guidance (FTC, BBB, FBI IC3). It returns a risk assessment
              based on how many known red flags were detected.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              No Guarantee of Accuracy
            </h2>
            <p>
              LegitCheck is a rule-based detection tool, not a guarantee.
              It may fail to detect scams that don't match its rule set, and
              it may occasionally flag legitimate content. Results should be
              used as one signal among several, not as a sole basis for
              deciding whether to trust a job posting or email.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              Not Professional Advice
            </h2>
            <p>
              LegitCheck does not provide legal, financial, or professional
              advice. If you believe you have been targeted by a scam,
              consider reporting it to the FTC, your local authorities, or
              the platform where you encountered it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              Academic Project
            </h2>
            <p>
              LegitCheck is a student-built capstone project created for
              educational purposes and is not a commercial service.
            </p>
          </section>
        </div>

        <Link
          href="/"
          className="inline-block mt-10 text-blue-400 hover:text-blue-300 text-sm"
        >
          ← Back to Scanner
        </Link>
      </div>
    </main>
  );
}