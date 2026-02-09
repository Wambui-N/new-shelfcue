import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { generateGoogleOAuthUrl } from "@/lib/google-oauth-url";

/**
 * Initiate Google OAuth to (re)connect Calendar/Sheets for an authenticated user.
 *
 * Used by in-app flows (e.g. publishing a form) when tokens are missing/expired.
 */
export async function GET(_request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({
    cookies: (() => cookieStore) as unknown as () => ReturnType<typeof cookies>,
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const origin = new URL(_request.url).origin;
    return NextResponse.redirect(
      new URL("/auth/signin?error=not_authenticated", origin),
    );
  }

  const authUrl = generateGoogleOAuthUrl(user.id, "reconnect");
  return NextResponse.redirect(authUrl);
}
