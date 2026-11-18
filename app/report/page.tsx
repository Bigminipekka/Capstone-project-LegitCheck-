import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
 
const LINK_CLASS = "text-blue-400 hover:underline";
 
function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
      {children}
    </a>
  );
}
 
export default function ReportScam() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">
      <SiteHeader active="report" />
 
      <div className="max-w-2xl w-full mx-auto mt-12 mb-16 px-4">
        <span className="text-xs text-blue-400 font-semibold tracking-wide">
          NEXT STEPS
        </span>
        <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-3">
          Report a Scam
        </h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          Found a scam, or fell for one? These are the official places to
          report it. LegitCheck does not send reports for you, and the links
          below leave this site.
        </p>
 
        <div className="space-y-8 text-gray-300 text-sm leading-relaxed">
          <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-2">
              If you already paid or shared information
            </h2>
            <p className="mb-3">
              Act quickly. The FTC says to contact the company you used to pay
              and ask them to reverse the payment or refund you, then report
              the scam at{" "}
              <Ext href="https://reportfraud.ftc.gov">ReportFraud.ftc.gov</Ext>.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong className="text-white">Credit or debit card:</strong>{" "}
                contact the card issuer or your bank right away, using the
                number on the back of your card, and ask for a refund.
              </li>
              <li>
                <strong className="text-white">Wire transfer:</strong> report
                it to the wire transfer company immediately and say you were
                tricked into sending money.
              </li>
              <li>
                <strong className="text-white">Gift card:</strong> contact the
                gift card company, tell them a scammer got the card number and
                PIN, and keep the card and receipt.
              </li>
              <li>
                <strong className="text-white">Cryptocurrency:</strong>{" "}
                contact the exchange or ATM operator right away. Recovery can
                be hard, because crypto has fewer protections than cards.
              </li>
              <li>
                <strong className="text-white">Payment app:</strong> report
                the payment to the app (Cash App, Venmo, PayPal and similar)
                and ask them to reverse it.
              </li>
            </ul>
          </section>
 
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              Where to report, by type of scam
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="font-semibold text-white mb-1">
                  Text messages
                </h3>
                <p>
                  Forward the text to <strong className="text-white">7726</strong>{" "}
                  (SPAM). The FCC says this reports it to your wireless
                  provider. If you were a victim, also alert your wireless
                  provider and your bank, and contact your local police or
                  sheriff.
                </p>
                <p className="mt-2">
                  Source:{" "}
                  <Ext href="https://www.fcc.gov/robotext-scams-rise">
                    FCC consumer alert on robotext scams
                  </Ext>
                </p>
              </div>
 
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="font-semibold text-white mb-1">
                  Emails and texts that claim to be the IRS
                </h3>
                <p>
                  Do not reply, click links or open attachments. Email{" "}
                  <strong className="text-white">phishing@irs.gov</strong>{" "}
                  (use &quot;IRS&quot; as the subject for an email, or
                  &quot;Text&quot; for a text message), then delete the
                  message. For a text, also forward it to 7726.
                </p>
                <p className="mt-2">
                  Source:{" "}
                  <Ext href="https://www.irs.gov/privacy-disclosure/report-phishing">
                    IRS: report fake IRS, Treasury or tax-related messages
                  </Ext>
                </p>
              </div>
 
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="font-semibold text-white mb-1">
                  Social Security scams
                </h3>
                <p>
                  Report them to the Social Security Administration&apos;s
                  Office of the Inspector General.
                </p>
                <p className="mt-2">
                  <Ext href="https://oig.ssa.gov/report/">
                    oig.ssa.gov/report
                  </Ext>
                </p>
              </div>
 
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="font-semibold text-white mb-1">
                  Job postings and any other scam
                </h3>
                <p>
                  Report the listing on the site where you found it, and file
                  a report with the FTC. You can also add it to the BBB Scam
                  Tracker, which helps warn other people.
                </p>
                <p className="mt-2 space-x-4">
                  <Ext href="https://reportfraud.ftc.gov">ReportFraud.ftc.gov</Ext>
                  <Ext href="https://www.bbb.org/scamtracker">BBB Scam Tracker</Ext>
                </p>
              </div>
 
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="font-semibold text-white mb-1">
                  Internet crime
                </h3>
                <p>
                  The FBI&apos;s Internet Crime Complaint Center (IC3) takes
                  complaints about crimes committed online, which is
                  especially useful if you lost money.
                </p>
                <p className="mt-2">
                  <Ext href="https://www.ic3.gov">ic3.gov</Ext>
                </p>
              </div>
            </div>
          </section>
 
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              Until you have reported it
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Do not reply, click any links, or call numbers in the message.</li>
              <li>
                Look up the company&apos;s real website or app yourself and
                check there, by typing the address in.
              </li>
              <li>
                Email: report it as phishing to your email provider, then
                delete it.
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
 