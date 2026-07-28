import { LoginForm } from "@/components/login-form";
import { safeInternalPath } from "@/lib/supabase/env";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safeInternalPath(params.next ?? "/me");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
      <p className="text-sm text-zinc-600">
        Auth runs in Server Actions with `@supabase/ssr` cookie sessions — no
        browser Supabase client.
      </p>
      <LoginForm nextPath={nextPath} />
    </main>
  );
}
