import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // This should contain the user ID

    console.log('🔍 Server OAuth callback received:', { hasCode: !!code, hasState: !!state });

    if (!code) {
      console.log('❌ No authorization code received');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback?error=no_code`);
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/google-server-callback`
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('✅ Got tokens from Google:', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiresIn: tokens.expiry_date
    });

    // If we have a state (user ID), store the tokens
    if (state) {
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
      } else {
        console.log('✅ Tokens stored successfully for user:', state);
      }
    }

    // Redirect to the app
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?google_connected=true`);
  } catch (error: any) {
    console.error("Error in server OAuth callback:", error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback?error=oauth_error`);
  }
}
