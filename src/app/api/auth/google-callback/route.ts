import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // This contains the user ID

    if (!code || !state) {
      return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
    }

    console.log('🔍 Exchanging code for tokens for user:', state);

    const oauth2Client = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/google-callback`
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    console.log('✅ Got tokens from Google:', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiresIn: tokens.expiry_date
    });

    // Store tokens in database
    const supabaseAdmin = getSupabaseAdmin();
    const expiresAtSeconds = Math.floor((tokens.expiry_date || Date.now() + 3600000) / 1000);
    
    const { error: tokenError } = await (supabaseAdmin as any)
      .from("user_google_tokens")
      .upsert({
        user_id: state,
        access_token: tokens.access_token!,
        refresh_token: tokens.refresh_token || "",
        expires_at: expiresAtSeconds,
      });

    if (tokenError) {
      console.error('❌ Error storing tokens:', tokenError);
      return NextResponse.json({ error: "Failed to store tokens" }, { status: 500 });
    }

    console.log('✅ Tokens stored successfully for user:', state);

    // Redirect back to the app
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?google_connected=true`);
  } catch (error: any) {
    console.error("Error exchanging code for tokens:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
