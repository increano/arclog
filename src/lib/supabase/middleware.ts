import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

/**
 * Edge Middleware session refresh via `@supabase/ssr`.
 * Optimistic gate only — Server Actions/pages re-verify with `getUser()`.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  // Refresh session cookie; claim check is optimistic for redirects.
  const { data } = await supabase.auth.getClaims();
  const isAuthed = Boolean(data?.claims?.sub);

  const path = request.nextUrl.pathname;
  const isProtected = path === "/me" || path.startsWith("/me/");

  if (isProtected && !isAuthed) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (path === "/login" && isAuthed) {
    const url = request.nextUrl.clone();
    url.pathname = "/me";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
