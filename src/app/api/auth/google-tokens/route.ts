import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { userId, code } = await request.json();

    if (!userId || !code) {
      return NextResponse.json({ error: "User ID and code are required" }, { status: 400 });
    }

    console.log('🔍 Exchanging code for tokens for user:', userId);

    const oauth2Client = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
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
    
    const { error: tokenError } = await supabaseAdmin
      .from("user_google_tokens")
      .upsert({
        user_id: userId,
        access_token: tokens.access_token!,
        refresh_token: tokens.refresh_token || "",
        expires_at: expiresAtSeconds,
      });

    if (tokenError) {
      console.error('❌ Error storing tokens:', tokenError);
      return NextResponse.json({ error: "Failed to store tokens" }, { status: 500 });
    }

    console.log('✅ Tokens stored successfully for user:', userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error exchanging code for tokens:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
