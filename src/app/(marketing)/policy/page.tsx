export const metadata = {
  title: "Privacy Policy · Arclog",
  description: "Privacy Policy for Arclog.",
};

const LAST_UPDATED = "July 29, 2026";

export default function PolicyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-margin-mobile pb-16 pt-16">
      <h1 className="mb-2 text-3xl font-bold text-on-surface">
        Privacy Policy
      </h1>
      <p className="mb-10 text-sm font-medium text-on-surface-variant">
        Last updated: {LAST_UPDATED}
      </p>

      <Section title="1. Information We Collect">
        <strong className="text-on-surface">Account data:</strong> When you
        sign up, we collect your email address and, if provided, your first
        name. If you sign in with Google, we receive your name and email from
        your Google profile.
        <br /><br />
        <strong className="text-on-surface">Learning data:</strong> We store
        your lesson progress, step attempts, streaks, bookmarks, notes, and
        preferred Bible translation to provide and personalize the service.
        <br /><br />
        <strong className="text-on-surface">Guest data:</strong> If you use
        Arclog without an account, we assign a temporary guest identifier
        stored in a cookie. Guest progress is claimed to your account upon
        signup.
        <br /><br />
        <strong className="text-on-surface">Technical data:</strong> We may
        collect basic usage information such as browser type, device type, and
        pages visited to maintain and improve the service.
      </Section>

      <Section title="2. How We Use Your Information">
        We use your data to:
        <br />
        — Provide and operate the Arclog service
        <br />
        — Track your learning progress, streaks, and achievements
        <br />
        — Personalize your experience (e.g. preferred Bible translation)
        <br />
        — Communicate with you about your account or the service
        <br />
        — Improve and develop new features
      </Section>

      <Section title="3. Data Storage &amp; Security">
        Your data is stored securely on{" "}
        <a
          href="https://supabase.com/"
          className="font-bold text-primary hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          Supabase
        </a>{" "}
        infrastructure with row-level security policies enforced at the
        database level. We use HTTPS for all data transmission. While we take
        reasonable measures to protect your data, no system is completely
        secure.
      </Section>

      <Section title="4. Cookies">
        Arclog uses a minimal set of cookies:
        <br />
        — <strong className="text-on-surface">Authentication cookies</strong>{" "}
        to keep you signed in
        <br />
        — <strong className="text-on-surface">Guest ID cookie</strong> to
        preserve progress before signup
        <br />
        — <strong className="text-on-surface">Onboarding draft cookie</strong>{" "}
        to remember your choices during onboarding
        <br /><br />
        We do not use advertising or third-party tracking cookies.
      </Section>

      <Section title="5. Third-Party Services">
        Arclog relies on the following third-party services:
        <br />
        — <strong className="text-on-surface">Supabase</strong> for
        authentication, database, and storage
        <br />
        — <strong className="text-on-surface">Google OAuth</strong> for
        optional sign-in (subject to Google&apos;s privacy policy)
        <br />
        — <strong className="text-on-surface">bible-api.com</strong> as the
        source of Bible text data
        <br /><br />
        We do not sell or share your personal data with third parties for
        marketing purposes.
      </Section>

      <Section title="6. Data Retention">
        We retain your account and learning data for as long as your account is
        active. Guest data that is not claimed to an account may be
        periodically purged. You may request deletion of your data at any time
        by contacting us.
      </Section>

      <Section title="7. Your Rights">
        You have the right to:
        <br />
        — Access the personal data we hold about you
        <br />
        — Request correction of inaccurate data
        <br />
        — Request deletion of your data
        <br />
        — Export your data in a portable format
        <br /><br />
        To exercise any of these rights, please visit our{" "}
        <a href="/contact" className="font-bold text-primary hover:underline">
          Contact
        </a>{" "}
        page.
      </Section>

      <Section title="8. Children&apos;s Privacy">
        Arclog is not directed at children under 13. We do not knowingly
        collect personal information from children. If you believe a child has
        provided us with personal data, please contact us and we will promptly
        delete it.
      </Section>

      <Section title="9. Changes to This Policy">
        We may update this Privacy Policy from time to time. The latest
        revision date will be indicated at the top of this page. Continued use
        of Arclog after changes constitutes acceptance of the updated policy.
      </Section>

      <Section title="10. Contact">
        If you have questions about this Privacy Policy, please visit our{" "}
        <a href="/contact" className="font-bold text-primary hover:underline">
          Contact
        </a>{" "}
        page or email us at{" "}
        <a
          href="mailto:contact@arclog.co"
          className="font-bold text-primary hover:underline"
        >
          contact@arclog.co
        </a>
        .
      </Section>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-2 text-lg font-bold text-on-surface">{title}</h2>
      <p className="font-medium leading-7 text-on-surface-variant">{children}</p>
    </section>
  );
}
