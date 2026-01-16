import { google } from "googleapis";
import { type NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

/**
 * API endpoint to initiate Google reconnection
 * This forces a fresh OAuth flow to get new API tokens for Sheets/Calendar
 */
export async function POST(_request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🔄 Initiating Google reconnection for user:", user.id);

    // Create OAuth2 client with proper scopes for API access
    const redirectUri =
      process.env.NODE_ENV === "production"
        ? "https://www.shelfcue.com/api/auth/google-server-callback"
        : "http://localhost:3000/api/auth/google-server-callback";

    const oauth2Client = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri,
    );

    // Generate auth URL with required scopes for Sheets and Calendar
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/drive.file",
        "openid",
        "email",
        "profile",
      ],
      state: user.id, // Pass user ID in state
      prompt: "consent", // Force consent screen to get new refresh token
      redirect_uri: redirectUri,
    });

    console.log("✅ Generated reconnection URL for user:", user.id);

    return NextResponse.json({
      url: authUrl,
    });
  } catch (error: any) {
    console.error("❌ Error generating reconnection URL:", error);
    return NextResponse.json(
      { error: "Failed to generate reconnection URL", details: error.message },
      { status: 500 },
    );
  }
}
