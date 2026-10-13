import Link from "next/link";

export default function Privacy() {
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
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-8">Last updated: October 2026</p>

        <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              What Happens to Your Submission
            </h2>
            <p>
              When you submit a job posting or email, the text is sent to
              LegitCheck&apos;s server and analyzed in two ways: a
              rule-based check against our fraud indicator rule set, and an
              AI review. LegitCheck does not save your submitted text in its
              own database.
            </p>
          </section>

                    <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              Screenshots
            </h2>
            <p>
              If you add a screenshot, the text in it is read inside your
              browser. The image itself is not uploaded to LegitCheck. Only
              the text that appears in the box when you click scan is sent
              for analysis, the same as text you paste. The first time you
              use this feature, your browser downloads the text-reading
              software and English language data from a public content
              delivery network.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              Third-Party AI Service
            </h2>
            <p>
              For the AI review, your submitted text is sent to
              Anthropic&apos;s API, which runs the Claude AI model. Anthropic
              handles that data under its own terms and privacy policy, not
              this one. Please do not submit text that contains sensitive
              personal information, such as your own Social Security number,
              bank details, or passwords. If you are unsure, remove those
              details before submitting.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              Anonymous Usage Counts
            </h2>
            <p>
              Each time a scan is completed, LegitCheck records only the type
              of scan (job posting or email), how long it took, and the time
              it happened. This powers the scan counts and average scan times
              shown on the homepage. It does not include your text, your
              results, or anything that identifies you.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              How Results Are Handled
            </h2>
            <p>
              Your analysis results are temporarily stored in your own
              browser (using session storage) so you can view them on the
              Results page. This data stays on your device and is cleared
              when you close your browser tab or session.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              No Accounts, No Tracking
            </h2>
            <p>
              LegitCheck does not require you to create an account, and we do
              not use tracking cookies or analytics to monitor individual
              user behavior. Like most websites, the hosting provider may
              keep routine technical logs of requests to the site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              Academic Project Disclaimer
            </h2>
            <p>
              LegitCheck is a student capstone project built for educational
              purposes. It is not a commercial product, and this policy
              reflects the actual data practices of the project as built, not
              a legal document reviewed by an attorney.
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