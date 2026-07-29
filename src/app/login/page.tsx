import { LoginForm } from "@/components/login-form";
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
    <main className="mx-auto flex w-full max-w-md flex-grow flex-col items-center justify-center px-margin-mobile pb-16 pt-16">
      {error ? (
        <p className="mb-4 max-w-md text-center text-sm font-medium text-error">
          {error}
        </p>
      ) : null}
      <LoginForm nextPath={nextPath} />

      <div className="pointer-events-none fixed top-[-10%] right-[-5%] h-[400px] w-[400px] rounded-full bg-secondary-container opacity-10 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-[-10%] left-[-5%] h-[400px] w-[400px] rounded-full bg-tertiary-fixed opacity-10 blur-[120px]" />
    </main>
  );
}
