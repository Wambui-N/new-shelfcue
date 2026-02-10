import { type NextRequest, NextResponse } from "next/server";
import { tokenStorage } from "@/lib/token-storage";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getPostHogClient } from "@/lib/posthog-server";

/**
 * Store Google tokens from Supabase session
 * This endpoint accepts provider tokens and stores them in user_google_tokens table
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7);
    const supabaseAdmin = getSupabaseAdmin();

    // Verify the token and get user
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 },
      );
    }

    // Get request body
    const body = await request.json();
    const { provider_token, provider_refresh_token, expires_at } = body;

    if (!provider_token) {
      return NextResponse.json(
        { error: "Missing provider_token" },
        { status: 400 },
      );
    }

    console.log("📝 Storing Google tokens from Supabase session:", {
      userId: user.id,
      hasAccessToken: !!provider_token,
      hasRefreshToken: !!provider_refresh_token,
      expiresAt: expires_at,
    });

    // Store tokens using our token storage system
    const result = await tokenStorage.storeTokens(user.id, {
      access_token: provider_token,
      refresh_token: provider_refresh_token || "",
      expires_at: expires_at || Math.floor(Date.now() / 1000) + 3600,
    });

    if (!result.success) {
      console.error("❌ Failed to store tokens:", result.error);
      return NextResponse.json(
        { error: result.error || "Failed to store tokens" },
        { status: 500 },
      );
    }

    console.log("✅ Successfully stored Google tokens for user:", user.id);

    // PostHog: Capture google_connected event (server-side)
    try {
      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: user.id,
        event: "google_connected",
        properties: {
          has_refresh_token: !!provider_refresh_token,
          email: user.email,
        },
      });
      await posthog.shutdown();
    } catch (posthogError) {
      console.warn("PostHog capture failed:", posthogError);
    }

    return NextResponse.json({
      success: true,
      message: "Tokens stored successfully",
    });
  } catch (error: any) {
    console.error("❌ Error in store-google-tokens:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
