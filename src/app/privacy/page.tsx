import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/sections/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-foreground mb-8">
            Privacy Policy
          </h1>

          <p className="text-foreground-muted mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              1. Information We Collect
            </h2>

            <h3 className="text-xl font-semibold text-foreground mb-4">
              Personal Information:
            </h3>
            <ul className="list-disc pl-6 mb-6 text-foreground-muted space-y-2">
              <li>
                <strong>Account Information:</strong> Name, email address,
                business information
              </li>
              <li>
                <strong>Billing Information:</strong> Processed securely via
                Paystack (we never store payment details)
              </li>
              <li>
                <strong>Form Data:</strong> The forms you create and their
                configuration settings
              </li>
              <li>
                <strong>Submission Data:</strong> All data collected through
                your forms (names, emails, messages, files)
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-4">
              Technical Information:
            </h3>
            <ul className="list-disc pl-6 mb-6 text-foreground-muted space-y-2">
              <li>
                <strong>Usage Data:</strong> How you interact with our service,
                feature usage, timestamps
              </li>
              <li>
                <strong>Device Information:</strong> IP address, browser type,
                operating system
              </li>
              <li>
                <strong>Cookies:</strong> Essential cookies for service
                functionality
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              2. How We Use Your Information
            </h2>
            <p className="text-foreground-muted mb-4">
              We use your information to:
            </p>
            <ul className="list-disc pl-6 text-foreground-muted space-y-2">
              <li>Provide and maintain Shelfcue services</li>
              <li>Sync form submissions to your connected Google Sheets</li>
              <li>Process payments through Paystack</li>
              <li>Send service-related emails via Resend</li>
              <li>Improve our services and develop new features</li>
              <li>Comply with legal obligations (CCPA/Kenyan law)</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              3. Data Storage & Security
            </h2>
            <ul className="list-disc pl-6 text-foreground-muted space-y-2">
              <li>
                <strong>Storage Location:</strong> Google Cloud servers
              </li>
              <li>
                <strong>Retention Period:</strong> 12 months after account
                cancellation
              </li>
              <li>
                <strong>Security Measures:</strong> Encryption in transit and at
                rest, secure access controls
              </li>
              <li>
                <strong>Your Form Data:</strong> You own all data collected
                through your forms. We act as a processor.
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              4. Data Sharing & Disclosure
            </h2>
            <p className="text-foreground-muted mb-4">
              We never sell your data. We only share data with:
            </p>
            <ul className="list-disc pl-6 text-foreground-muted space-y-2">
              <li>
                <strong>Google Sheets:</strong> When you explicitly connect and
                sync forms
              </li>
              <li>
                <strong>Paystack:</strong> For payment processing only
              </li>
              <li>
                <strong>Resend:</strong> For transactional email delivery
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              5. Your Rights (CCPA & GDPR Compliance)
            </h2>
            <p className="text-foreground-muted mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-foreground-muted space-y-2">
              <li>Access and download your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and associated data</li>
              <li>Opt-out of marketing communications</li>
              <li>Data portability in machine-readable format</li>
            </ul>
            <p className="text-foreground-muted mt-4">
              <strong>Contact:</strong> wambui@madewithmake.com for data
              requests.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              6. International Data Transfers
            </h2>
            <p className="text-foreground-muted">
              By using Shelfcue, you acknowledge your data may be processed
              outside Kenya, including in the United States and other locations
              where our service providers operate.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
