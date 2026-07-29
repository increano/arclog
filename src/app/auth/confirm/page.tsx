import Link from "next/link";
import { ConfirmEmailForm } from "@/components/auth/confirm-email-form";
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
    <main className="mx-auto flex w-full max-w-md flex-grow flex-col items-center justify-center px-margin-mobile pb-16 pt-16">
      {expired ? (
        <div className="mb-6 rounded-2xl border-2 border-outline-variant bg-white p-6 text-center">
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
  );
}
