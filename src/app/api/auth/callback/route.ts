import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Supabase OAuth redirect handler.
 *
 * Google redirects here with `?code=...` (PKCE). We exchange the code for a session
 * and set Supabase auth cookies, then send the user to the post-auth setup step.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const origin = url.origin;

  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");
  if (error) {
    const message = errorDescription
      ? decodeURIComponent(errorDescription.replace(/\+/g, " "))
      : error;
    return NextResponse.redirect(
      new URL(`/auth/signin?error=${encodeURIComponent(message)}`, origin),
    );
  }

  const code = url.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(
      new URL("/auth/signin?error=missing_oauth_code", origin),
    );
  }

  const supabase = createRouteHandlerClient({ cookies });
  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(
      new URL(
        `/auth/signin?error=${encodeURIComponent(exchangeError.message)}`,
        origin,
      ),
    );
  }

  return NextResponse.redirect(new URL("/auth/welcome", origin));
}
