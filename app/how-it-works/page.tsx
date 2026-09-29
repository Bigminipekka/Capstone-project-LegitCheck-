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
              Rule-Based Detection
            </h2>
            <p>
              LegitCheck does not use artificial intelligence to read or
              understand your submission. Instead, it uses a rule-based
              system: your text is checked against a set of keyword and
              pattern matches tied to known fraud indicators. Each match is
              called a &quot;heuristic&quot; — a practical pattern that tends
              to correlate with scams, based on real-world research, rather
              than a guaranteed or provable detection.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              Where the Rules Come From
            </h2>
            <p>
              Every fraud indicator LegitCheck checks for is sourced from
              public consumer protection guidance, primarily the Federal
              Trade Commission (FTC), the Better Business Bureau (BBB) Scam
              Tracker, and the FBI&apos;s Internet Crime Complaint Center
              (IC3), along with published phishing research from
              organizations like Microsoft and Aura. You can view the full
              rule set, including sources, on the{" "}
              <Link href="/database" className="text-blue-400 hover:underline">
                Database
              </Link>{" "}
              page.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              How the Risk Score Is Calculated
            </h2>
            <p>
              Each rule is assigned a weight (Medium, Medium-High, or High)
              based on how strong an indicator it is. When you submit text,
              LegitCheck checks it against every applicable rule and adds up
              the weights of everything that matches. That total score
              determines the overall risk level: Low, Medium, or High.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              Known Limitations
            </h2>
            <p className="mb-2">
              LegitCheck is a capstone project built with a rule-based
              approach, and it has real limitations worth being upfront
              about:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Some fraud indicators (like whether a company can be
                independently verified, or whether an interviewer refuses to
                appear on camera) cannot be detected from submitted text
                alone, and are not currently checked automatically.
              </li>
              <li>
                Pattern matching can occasionally produce false positives on
                legitimate text, or miss scams that use unfamiliar phrasing
                not covered by the current rule set.
              </li>
              <li>
                LegitCheck is one signal to help you evaluate a job posting
                or email — not a guarantee. Always use your own judgment
                alongside these results.
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