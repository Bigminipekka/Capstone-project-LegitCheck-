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
        <p className="text-gray-500 text-sm mb-8">Last updated: October 2026</p>

        <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              What LegitCheck Does
            </h2>
            <p>
              LegitCheck analyzes text you submit in two independent ways: a
              rule-based check against fraud indicators sourced from public
              consumer protection guidance (FTC, BBB, FBI IC3), and an AI
              review that looks for manipulation tactics and other warning
              signs. The overall risk level shown is the higher of the two
              ratings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              No Guarantee of Accuracy
            </h2>
            <p>
              Neither layer is a guarantee. The rule-based check may miss
              scams that do not match its rules, and may occasionally flag
              legitimate content. The AI review can also be wrong, and its
              wording and rating can vary from one scan to the next. Results
              should be used as one signal among several, not as the sole
              basis for deciding whether to trust a job posting or email.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              Your Submissions
            </h2>
            <p>
              Text you submit is processed as described in the{" "}
              <Link href="/privacy" className="text-blue-400 hover:underline">
                Privacy Policy
              </Link>
              , including being sent to a third-party AI service for the AI
              review. Please do not submit sensitive personal information.
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