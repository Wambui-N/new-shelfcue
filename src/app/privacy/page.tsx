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
            Last updated: November 19, 2025
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
              4. Google Services Integration
            </h2>
            <p className="text-foreground-muted mb-4">
              When you connect your Google account, Shelfcue integrates with Google
              Sheets and Google Calendar to provide core functionality:
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-4 mt-6">
              Google Sheets:
            </h3>
            <ul className="list-disc pl-6 mb-6 text-foreground-muted space-y-2">
              <li>
                <strong>What We Create:</strong> When you publish a form, we
                automatically create a new Google Sheet in your Google Drive named
                &quot;[Form Title] - Responses&quot;. This sheet is owned by you and
                stored in your Google Drive.
              </li>
              <li>
                <strong>What We Write:</strong> Each time someone submits your form,
                we append a new row to your sheet containing:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>A timestamp of when the submission was received</li>
                  <li>All form field values (names, emails, messages, etc.)</li>
                  <li>Meeting date/time (if your form includes meeting scheduling)</li>
                  <li>Calendar event link (if a meeting was created)</li>
                </ul>
              </li>
              <li>
                <strong>What We Don&apos;t Do:</strong> We do not read, modify, or
                delete existing Google Sheets that we did not create. We do not access
                other files in your Google Drive. We do not share your sheets with
                anyone.
              </li>
              <li>
                <strong>Your Control:</strong> You own and fully control all Google
                Sheets created by Shelfcue. You can view, edit, delete, or share them
                at any time through Google Drive. You can revoke our access at any time
                from your Google Account settings.
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-4 mt-6">
              Google Calendar:
            </h3>
            <ul className="list-disc pl-6 mb-6 text-foreground-muted space-y-2">
              <li>
                <strong>What We Create:</strong> If your form includes meeting
                scheduling, we create calendar events in your Google Calendar when
                someone books a meeting through your form.
              </li>
              <li>
                <strong>Your Control:</strong> You own and control all calendar events
                created by Shelfcue. You can view, edit, or delete them at any time
                through Google Calendar.
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-4 mt-6">
              Permissions We Request:
            </h3>
            <ul className="list-disc pl-6 text-foreground-muted space-y-2">
              <li>
                <strong>Create and manage Google Drive files:</strong> Required to
                create new Google Sheets and write form submission data. This scope
                only allows access to files that Shelfcue creates, not your existing
                files.
              </li>
              <li>
                <strong>View and manage Google Calendar:</strong> Required to create
                calendar events for meeting bookings
              </li>
            </ul>
            <p className="text-foreground-muted mt-4">
              You can revoke these permissions at any time from your{" "}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Google Account settings
              </a>
              . Revoking access will prevent new form submissions from syncing to
              Google Sheets, but existing sheets and data will remain in your Google
              Drive.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              5. Data Sharing & Disclosure
            </h2>
            <p className="text-foreground-muted mb-4">
              We never sell your data. We only share data with:
            </p>
            <ul className="list-disc pl-6 text-foreground-muted space-y-2">
              <li>
                <strong>Google Services:</strong> As described in Section 4 above,
                when you connect your Google account
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
              6. Supabase Authentication
            </h2>
            <p className="text-foreground-muted mb-4">
              We use Supabase to securely manage user authentication and data storage.
            </p>
            <p className="text-foreground-muted">
              During Google Sign-In, you may briefly be redirected to a Supabase
              domain (ending in <code>.supabase.co</code>) for verification. This process
              is secure and required for login functionality. Supabase does not have
              access to your personal data beyond what is necessary to authenticate
              your account.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              7. Your Rights (CCPA & GDPR Compliance)
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
              8. International Data Transfers
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
