export const metadata = {
  title: "Terms of Service · Arclog",
  description: "Terms of Service for Arclog.",
};

const LAST_UPDATED = "July 29, 2026";

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-margin-mobile pb-16 pt-16">
      <h1 className="mb-2 text-3xl font-bold text-on-surface">
        Terms of Service
      </h1>
      <p className="mb-10 text-sm font-medium text-on-surface-variant">
        Last updated: {LAST_UPDATED}
      </p>

      <Section title="1. Acceptance of Terms">
        By accessing or using Arclog, you agree to be bound by these Terms of
        Service. If you do not agree, please do not use the service.
      </Section>

      <Section title="2. Description of Service">
        Arclog is a Bible learning platform that helps you memorize and
        understand Scripture through short, gamified lessons. Features include
        progress tracking, daily streaks, bookmarks, notes, and multiple Bible
        translation support.
      </Section>

      <Section title="3. User Accounts">
        You may create an account using your email address or a third-party
        provider such as Google. You are responsible for maintaining the
        confidentiality of your credentials. Arclog reserves the right to
        suspend or terminate accounts that violate these terms.
      </Section>

      <Section title="4. User Content">
        Any content you create within Arclog — including notes, bookmarks, and
        learning progress — belongs to you. Arclog stores this data solely to
        provide and improve the service. You may request deletion of your data
        at any time by contacting us.
      </Section>

      <Section title="5. Bible Text &amp; Data">
        Scripture displayed in Arclog comes from public-domain and
        open-licensed Bible translations sourced via{" "}
        <a
          href="https://bible-api.com/"
          className="font-bold text-primary hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          bible-api.com
        </a>
        . Arclog does not claim ownership of any Bible text. See our{" "}
        <a href="/data-sources" className="font-bold text-primary hover:underline">
          Data Sources
        </a>{" "}
        page for details.
      </Section>

      <Section title="6. Acceptable Use">
        You agree not to: scrape, crawl, or automated-access the service
        beyond normal app usage; attempt to interfere with or disrupt the
        service; use Arclog for any unlawful purpose; or impersonate another
        person or entity.
      </Section>

      <Section title="7. Privacy">
        Your use of Arclog is also governed by our{" "}
        <a href="/policy" className="font-bold text-primary hover:underline">
          Privacy Policy
        </a>
        , which describes how we collect, use, and protect your information.
      </Section>

      <Section title="8. Disclaimers">
        Arclog is provided &ldquo;as is&rdquo; without warranties of any kind.
        We do not guarantee uninterrupted availability or permanent data
        retention. Bible text accuracy depends on the upstream open-source
        translations.
      </Section>

      <Section title="9. Modifications">
        Arclog may update these terms at any time. We will indicate the date of
        the latest revision at the top of this page. Continued use of the
        service after changes constitutes acceptance of the revised terms.
      </Section>

      <Section title="10. Contact">
        If you have any questions about these terms, please visit our{" "}
        <a href="/contact" className="font-bold text-primary hover:underline">
          Contact
        </a>{" "}
        page.
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
