import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

/**
 * API endpoint to initiate Google reconnection
 * This forces a fresh OAuth flow to get new tokens
 */
export async function POST() {
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Generate OAuth URL for re-linking Google account
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      scopes:
        "openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets",
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent", // Force consent to get fresh tokens
      },
      skipBrowserRedirect: true, // Return URL instead of redirecting
    },
  });

  if (error) {
    console.error("Error generating OAuth URL:", error);
    return NextResponse.json(
      { error: "Failed to generate reconnection URL" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    url: data.url,
  });
}
