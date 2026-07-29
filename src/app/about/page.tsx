export const metadata = {
  title: "About · Arclog",
  description: "About Arclog — learn the Bible one verse at a time.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-margin-mobile pb-16 pt-16">
      <h1 className="mb-4 text-3xl font-bold text-on-surface">About Arclog</h1>
      <p className="mb-8 font-medium leading-7 text-on-surface-variant">
        Arclog helps you learn the Bible one verse at a time through short,
        gamified lessons. We break Scripture into bite-sized steps — read,
        recall, and memorize — so that every session feels rewarding.
      </p>
    </main>
  );
}
