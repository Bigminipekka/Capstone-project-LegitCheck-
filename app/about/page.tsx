import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
 
export default function About() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">
      <SiteHeader active="about" />
 
      <div className="max-w-2xl w-full mx-auto mt-12 mb-16 px-4">
        <span className="text-xs text-blue-400 font-semibold tracking-wide">
          ABOUT
        </span>
        <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-8">
          About LegitCheck
        </h1>
 
        <div className="space-y-8 text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              What it is
            </h2>
            <p>
              LegitCheck helps you decide whether a job posting, an email or a
              text message is likely a scam. You paste the text (or add a
              screenshot), and two separate systems review it: a rule-based
              engine and an AI review. The overall rating is whichever of the
              two is higher.
            </p>
          </section>
 
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              Why it was built
            </h2>
            <p>
              LegitCheck is an information science capstone project by Cliff
              Wetherbee. It started with job scams aimed at students and
              grew to cover scam emails and text messages, such as fake
              package and toll notices.
            </p>
          </section>
 
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              Where the rules come from
            </h2>
            <p>
              Every rule is based on public consumer protection guidance from
              the Federal Trade Commission, the Better Business Bureau Scam
              Tracker, the FBI&apos;s Internet Crime Complaint Center, the IRS
              and the Social Security Administration. Each rule lists its
              source on the{" "}
              <Link href="/database" className="text-blue-400 hover:underline">
                Rules page
              </Link>
              . LegitCheck is not affiliated with or endorsed by any of these
              organizations.
            </p>
          </section>
 
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              Links are never opened
            </h2>
            <p>
              If a message contains a link, LegitCheck checks only the
              address, such as how new the domain is. It follows known
              link-shortener services to find the real address, and never
              opens the page itself. The link check is shown for context and
              does not change the rating.
            </p>
          </section>
 
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              How it is built
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Next.js and TypeScript, hosted on Vercel</li>
              <li>A Supabase database that holds the rules</li>
              <li>Claude Haiku 4.5, through the Anthropic API, for the AI review</li>
              <li>Screenshots are read in your browser, using Tesseract.js</li>
            </ul>
          </section>
 
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              Your privacy
            </h2>
            <p>
              LegitCheck does not save what you paste. The AI review is
              handled by a third party. See the{" "}
              <Link href="/privacy" className="text-blue-400 hover:underline">
                Privacy Policy
              </Link>{" "}
              for details.
            </p>
          </section>
 
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              What it cannot do
            </h2>
            <p>
              No detection system is perfect. LegitCheck can miss scams and can
              flag legitimate messages, so use it as one input alongside your
              own judgment.{" "}
              <Link href="/how-it-works" className="text-blue-400 hover:underline">
                How It Works
              </Link>{" "}
              lists the known limitations. If you think you have been scammed,
              see{" "}
              <Link href="/report" className="text-blue-400 hover:underline">
                Report a Scam
              </Link>
              .
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
 