export const metadata = {
  title: "Data Sources · Arclog",
  description: "Where Arclog's Bible text comes from.",
};

export default function DataSourcesPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-margin-mobile pb-16 pt-16">
      <h1 className="mb-4 text-3xl font-bold text-on-surface">Data Sources</h1>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-bold text-on-surface">Bible text</h2>
        <p className="font-medium leading-7 text-on-surface-variant">
          Scripture in Arclog comes from public-domain and open Bible
          translations distributed via{" "}
          <a
            href="https://bible-api.com/"
            className="font-bold text-primary hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            bible-api.com
          </a>
          , created by{" "}
          <strong className="text-on-surface">Tim Morgan</strong>. The API
          source and open data live on GitHub at{" "}
          <a
            href="https://github.com/seven1m/bible_api"
            className="font-bold text-primary hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            seven1m/bible_api
          </a>
          , with translation XML in the{" "}
          <a
            href="https://github.com/seven1m/open-bibles"
            className="font-bold text-primary hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            open-bibles
          </a>{" "}
          collection.
        </p>
        <p className="font-medium leading-7 text-on-surface-variant">
          Our database currently includes English editions (for example KJV,
          ASV, WEB, Darby, Douay-Rheims, YLT, and Open English Bible
          variants). Those files were imported into Supabase for offline
          reading inside Arclog.
        </p>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-bold text-on-surface">
          French translations?
        </h2>
        <p className="font-medium leading-7 text-on-surface-variant">
          <strong className="text-on-surface">No.</strong> Neither{" "}
          <a
            href="https://bible-api.com/"
            className="font-bold text-primary hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            bible-api.com
          </a>{" "}
          nor our loaded corpus currently ships a French translation. Available
          languages there include English, Latin, Portuguese, Romanian,
          Russian, Chinese, Czech, and Cherokee — but not French.
        </p>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-bold text-on-surface">License note</h2>
        <p className="font-medium leading-7 text-on-surface-variant">
          Please respect each translation&apos;s public-domain / open license.
          bible-api.com asks that you do not bulk-download the live API; use
          the open source data instead when seeding your own copy.
        </p>
      </section>
    </main>
  );
}
