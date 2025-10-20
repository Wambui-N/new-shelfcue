import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/sections/Footer";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-foreground mb-8">
            Terms & Conditions
          </h1>

          <p className="text-foreground-muted mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              1. Acceptance of Terms
            </h2>
            <p className="text-foreground-muted">
              By accessing Shelfcue, you confirm you're at least 18 years old
              and agree to these terms. The service is operated from Kenya.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              2. Account Registration
            </h2>
            <ul className="list-disc pl-6 text-foreground-muted space-y-2">
              <li>You must provide accurate information</li>
              <li>You're responsible for account security</li>
              <li>One free trial per user/business</li>
              <li>No creating multiple accounts to abuse trials</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              3. Service Description
            </h2>
            <p className="text-foreground-muted mb-4">
              Shelfcue provides lead capture forms that sync to Google Sheets.
              We offer:
            </p>
            <ul className="list-disc pl-6 text-foreground-muted space-y-2">
              <li>14-day free trial</li>
              <li>Subscription plans after trial period</li>
              <li>
                "Unbreakable Pipeline" guarantee (best-effort lead backup)
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              4. Payment Terms
            </h2>
            <ul className="list-disc pl-6 text-foreground-muted space-y-2">
              <li>
                <strong>Processor:</strong> Paystack handles all payments
              </li>
              <li>
                <strong>Billing:</strong> Subscriptions auto-renew
                monthly/annually
              </li>
              <li>
                <strong>Refunds:</strong> No refunds for partial periods
              </li>
              <li>
                <strong>Price Changes:</strong> 30-day email notice for price
                increases
              </li>
              <li>
                <strong>Trial:</strong> Service automatically converts to paid
                after 14 days
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              5. Acceptable Use
            </h2>
            <p className="text-foreground-muted mb-4">You agree NOT to:</p>
            <ul className="list-disc pl-6 text-foreground-muted space-y-2">
              <li>Use Shelfcue for illegal, spam, or malicious activities</li>
              <li>Attempt to hack, reverse engineer, or disrupt our service</li>
              <li>
                Collect sensitive information (health, financial, SSN) without
                proper consent
              </li>
              <li>Abuse or overwhelm our infrastructure</li>
              <li>Violate others' privacy rights</li>
            </ul>
            <p className="text-foreground-muted mt-4">
              We may suspend accounts for: Misuse, non-payment, or terms
              violations.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              6. Data & Privacy
            </h2>
            <ul className="list-disc pl-6 text-foreground-muted space-y-2">
              <li>You own all form data and submissions</li>
              <li>
                You're responsible for complying with privacy laws (CCPA, GDPR,
                etc.)
              </li>
              <li>
                You must obtain proper consent from people filling your forms
              </li>
              <li>We may remove content violating these terms</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              7. Intellectual Property
            </h2>
            <p className="text-foreground-muted">
              Shelfcue owns the platform and software. You own your form data
              and content.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              8. Service Level
            </h2>
            <ul className="list-disc pl-6 text-foreground-muted space-y-2">
              <li>No guaranteed 100% uptime</li>
              <li>We may modify or discontinue features with notice</li>
              <li>We provide support on a best-effort basis</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              9. Limitation of Liability
            </h2>
            <p className="text-foreground-muted mb-4">
              To the extent permitted by Kenyan law:
            </p>
            <ul className="list-disc pl-6 text-foreground-muted space-y-2">
              <li>
                We're not liable for business losses from service interruptions
              </li>
              <li>
                Maximum liability limited to your last 3 months of payments
              </li>
              <li>
                We're not responsible for data loss between Shelfcue and Google
                Sheets
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              10. Termination
            </h2>
            <ul className="list-disc pl-6 text-foreground-muted space-y-2">
              <li>You can cancel anytime</li>
              <li>We may suspend for terms violations or non-payment</li>
              <li>Data will be deleted after 12 months of cancellation</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              11. Governing Law
            </h2>
            <p className="text-foreground-muted">
              These terms are governed by Kenyan law. Disputes will be resolved
              in Kenyan courts.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              12. Changes to Terms
            </h2>
            <p className="text-foreground-muted">
              We'll notify you of material changes via email 30 days before they
              take effect.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Contact</h2>
            <p className="text-foreground-muted">
              wambui@madewithmake.com for questions.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
