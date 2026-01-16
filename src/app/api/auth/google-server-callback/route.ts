import { google } from "googleapis";
import { type NextRequest, NextResponse } from "next/server";
import { tokenStorage } from "@/lib/token-storage";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // This should contain the user ID
    const error = searchParams.get("error");

    console.log("🔍 Server OAuth callback received:", {
      hasCode: !!code,
      hasState: !!state,
      state,
      error,
      url: request.url,
    });

    if (error) {
      console.log("❌ OAuth error received:", error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback?error=${error}`,
      );
    }

    if (!code) {
      console.log("❌ No authorization code received");
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback?error=no_code`,
      );
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/google-server-callback`,
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    console.log("✅ Got tokens from Google:", {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiresIn: tokens.expiry_date,
    });

    // Extract user ID from state (may include flags like |from_welcome)
    const userId = state?.includes('|') ? state.split('|')[0] : state;
    
    // If we have a user ID, store the tokens using our robust system
    if (userId) {
      console.log("💾 Storing tokens for user:", userId);

      const expiresAtSeconds = Math.floor(
        (tokens.expiry_date || Date.now() + 3600000) / 1000,
      );

      console.log("🔍 Token data:", {
        user_id: userId,
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
        expiresAtSeconds,
        expiresAtDate: new Date(expiresAtSeconds * 1000).toISOString(),
      });

      const storeResult = await tokenStorage.storeTokens(userId, {
        access_token: tokens.access_token!,
        refresh_token: tokens.refresh_token || "",
        expires_at: expiresAtSeconds,
      });

      if (storeResult.success) {
        console.log("✅ Tokens stored successfully for user:", state);
      } else {
        console.error("❌ Error storing tokens:", storeResult.error);
        // Don't fail the entire flow, just log the error
      }
    } else {
      console.log("❌ No state (user ID) provided, cannot store tokens");
    }

    // Redirect to the app
    // If from_welcome is in the state, redirect back to welcome to continue onboarding
    const isFromWelcome = state?.includes('|from_welcome');
    const userId = isFromWelcome ? state.split('|')[0] : state;
    
    const redirectUrl =
      process.env.NODE_ENV === "production"
        ? isFromWelcome
          ? "https://www.shelfcue.com/auth/welcome?google_connected=true"
          : "https://www.shelfcue.com/dashboard?google_connected=true"
        : isFromWelcome
          ? "http://localhost:3000/auth/welcome?google_connected=true"
          : "http://localhost:3000/dashboard?google_connected=true";

    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    console.error("Error in server OAuth callback:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback?error=oauth_error`,
    );
  }
}
