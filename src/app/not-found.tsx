import Link from "next/link";
import { BrandHeader } from "@/components/ui/brand-header";
import { Footer } from "@/components/ui/footer";

export const metadata = {
  title: "Page Not Found · Arclog",
};

export default function NotFound() {
  return (
    <>
      <BrandHeader />
      <main className="mx-auto flex w-full max-w-md flex-grow flex-col items-center justify-center px-margin-mobile pb-16 pt-32 text-center">
        <p className="mb-2 text-6xl font-bold text-primary">404</p>
        <h1 className="mb-3 text-2xl font-bold text-on-surface">
          Page not found
        </h1>
        <p className="mb-8 font-medium text-on-surface-variant">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-bold text-on-primary"
        >
          Back to Home
        </Link>
      </main>
      <Footer />
    </>
  );
}
