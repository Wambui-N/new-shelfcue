import { google } from "googleapis";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Create OAuth2 client with proper scopes
    const redirectUri =
      process.env.NODE_ENV === "production"
        ? "https://www.shelfcue.com/api/auth/google-server-callback"
        : "http://localhost:3000/api/auth/google-server-callback";

    const oauth2Client = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri,
    );

    // Generate auth URL with required scopes
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/drive.file",
        "openid",
        "email",
        "profile",
      ],
      state: userId, // Pass user ID in state
      prompt: "consent", // Force consent screen
      redirect_uri: redirectUri,
    });

    return NextResponse.json({ authUrl });
  } catch (error: any) {
    console.error("Error generating auth URL:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
