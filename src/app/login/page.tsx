import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { Icon } from "@/components/ui/icon";
import { safeInternalPath } from "@/lib/supabase/env";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safeInternalPath(params.next ?? "/me");
  const error = params.error?.trim();

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-background">
      <header className="flex h-16 w-full items-center justify-between px-margin-mobile md:px-10">
        <Link href="/" className="text-2xl font-bold text-primary">
          Arclog
        </Link>
        <Icon name="language" className="text-primary" />
      </header>
      <main className="flex w-full flex-grow flex-col items-center justify-center px-margin-mobile pb-16">
        {error ? (
          <p className="mb-4 max-w-md text-center text-sm font-medium text-error">
            {error}
          </p>
        ) : null}
        <LoginForm nextPath={nextPath} />
      </main>
      <div className="pointer-events-none fixed top-[-10%] right-[-5%] h-[400px] w-[400px] rounded-full bg-secondary-container opacity-10 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-[-10%] left-[-5%] h-[400px] w-[400px] rounded-full bg-tertiary-fixed opacity-10 blur-[120px]" />
    </div>
  );
}
