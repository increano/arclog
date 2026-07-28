import Link from "next/link";
import { ConfirmEmailForm } from "@/components/auth/confirm-email-form";
import { Icon } from "@/components/ui/icon";
import { safeInternalPath } from "@/lib/supabase/env";

export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<{
    code?: string;
    token_hash?: string;
    type?: string;
    next?: string;
    error?: string;
    error_code?: string;
    error_description?: string;
  }>;
}) {
  const params = await searchParams;
  const nextPath = safeInternalPath(
    params.next ?? "/onboarding/translation",
    "/onboarding/translation"
  );

  const expired =
    params.error_code === "otp_expired" ||
    params.error === "access_denied" ||
    Boolean(params.error_description?.includes("expired"));

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-background">
      <header className="flex h-16 w-full items-center justify-between px-margin-mobile md:px-10">
        <Link href="/" className="text-2xl font-bold text-primary">
          Arclog
        </Link>
        <Icon name="language" className="text-primary" />
      </header>
      <main className="flex w-full flex-grow flex-col items-center justify-center px-margin-mobile pb-16">
        {expired ? (
          <div className="mx-auto mb-6 max-w-md rounded-2xl border-2 border-outline-variant bg-white p-6 text-center">
            <p className="mb-4 text-sm font-medium text-error">
              That confirmation link is invalid or has expired.
            </p>
            <Link href="/onboarding/save" className="font-bold text-primary hover:underline">
              Request a new signup
            </Link>
            {" · "}
            <Link href="/login" className="font-bold text-primary hover:underline">
              Sign in
            </Link>
          </div>
        ) : (
          <ConfirmEmailForm
            code={params.code}
            tokenHash={params.token_hash}
            type={params.type}
            nextPath={nextPath}
          />
        )}
      </main>
    </div>
  );
}
