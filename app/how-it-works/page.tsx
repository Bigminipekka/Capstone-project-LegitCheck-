import Link from "next/link";

export default function HowItWorks() {
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
          <span className="text-blue-400 font-medium">How It Works</span>
        </nav>
      </header>

      <div className="max-w-2xl w-full mx-auto mt-12 mb-16 px-4">
        <span className="text-xs text-blue-400 font-semibold tracking-wide">
          METHODOLOGY
        </span>
        <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-8">
          How LegitCheck Works
        </h1>

        <div className="space-y-8 text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              Two Independent Layers
            </h2>
            <p>
              Every submission is analyzed twice, by two separate systems that
              do not see each other&apos;s work: a rule-based engine and an AI
              review. Both results are shown side by side so you can see where
              they agree and where they differ.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              Layer 1: Rule-Based Detection
            </h2>
            <p className="mb-3">
              Your text is checked against a set of keyword and pattern
              matches tied to known fraud indicators. Each match is a
              &quot;heuristic&quot;: a practical pattern that tends to
              correlate with scams, rather than a guaranteed or provable
              detection.
            </p>
            <p className="mb-3">
              Every rule is sourced from public consumer protection guidance,
              primarily the Federal Trade Commission (FTC), the Better
              Business Bureau (BBB) Scam Tracker, and the FBI&apos;s Internet
              Crime Complaint Center (IC3), along with published phishing
              research from organizations like Microsoft and Aura. Job
              postings and emails each have their own rule set. You can view
              all of them on the{" "}
              <Link href="/database" className="text-blue-400 hover:underline">
                Database
              </Link>{" "}
              page.
            </p>
            <p>
              Each rule has a weight (Medium, Medium-High, or High). The
              weights of every matched rule are added up, and the total sets
              the overall risk level: Low, Medium, or High. The risk badge and
              confidence percentage on the Results page come from this layer
              only.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              Layer 2: AI Review
            </h2>
            <p className="mb-3">
              Your text is also sent to an AI model (Claude Haiku 4.5, through
              the Anthropic API) with an instruction to look for subtle
              manipulation tactics, psychological pressure, and vague or
              evasive language. It returns a concern level, a short summary,
              and a few specific observations.
            </p>
            <p>
              The AI does not use the rules above and never sees the
              rule-based results. That independence is deliberate: it can
              catch disguised scams that use no obvious trigger words, which
              keyword rules cannot. The{" "}
              <Link href="/database" className="text-blue-400 hover:underline">
                AI Review tab
              </Link>{" "}
              on the Database page shows exactly how it is instructed.
            </p>
          </section>

                    <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              How the Two Layers Are Combined
            </h2>
            <p>
              The overall risk level is whichever layer rates the submission
              highest. If the rule-based engine says Low but the AI review
              says High, the overall result is High. Both layers&apos;
              individual ratings are always shown, along with which one set
              the overall result. The confidence percentage comes only from
              the rule-based score, so it is hidden when the AI review sets
              the result. If the AI service is unavailable, the result comes
              from the rule-based engine alone.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              Where Your Text Goes
            </h2>
            <p>
              Submitted text is sent to LegitCheck&apos;s server for the rule
              check and to Anthropic&apos;s API for the AI review. LegitCheck
              does not save your submission in its own database. Anthropic
              handles API data under its own policies. For details, see the{" "}
              <Link href="/privacy" className="text-blue-400 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              Known Limitations
            </h2>
            <p className="mb-2">
              LegitCheck is a capstone project, and it has real limitations
              worth being upfront about:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Some fraud indicators, like whether a company can be
                independently verified or whether an interviewer refuses to
                appear on camera, cannot be detected from text alone and are
                not checked automatically.
              </li>
              <li>
                Pattern matching can produce false positives on legitimate
                text, or miss scams that use unfamiliar phrasing.
              </li>
              <li>
                The AI layer can also be wrong. It may overlook a scam, raise
                concern about something legitimate, or word its assessment
                differently from one run to the next.
              </li>
              <li>
                A clean result from both layers lowers risk but does not
                guarantee a posting or email is legitimate. Always use your
                own judgment alongside these results.
              </li>
            </ul>
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