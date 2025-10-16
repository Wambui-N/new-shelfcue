import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { tokenStorage } from "@/lib/token-storage";

export async function POST(request: NextRequest) {
  try {
    const { session } = await request.json();

    if (!session || !session.user || !session.provider_token) {
      return NextResponse.json(
        { error: "Invalid session data provided" },
        { status: 400 },
      );
    }

    // Create a server-side Supabase client to securely validate the user
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Ensure the user making the request is the same as the user in the session
    if (!user || user.id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      user: { id: userId },
      provider_token: accessToken,
      provider_refresh_token: refreshToken,
      expires_in: expiresIn,
    } = session;

    console.log("💾 [API] Storing Google tokens for user:", userId);

    const expiresAtSeconds = Math.floor(Date.now() / 1000) + (expiresIn || 3600);

    const storeResult = await tokenStorage.storeTokens(userId, {
      access_token: accessToken,
      refresh_token: refreshToken || "",
      expires_at: expiresAtSeconds,
    });

    if (storeResult.success) {
      console.log("✅ [API] Google tokens stored successfully");
      return NextResponse.json({ success: true });
    } else {
      console.error(
        "❌ [API] Error storing Google tokens:",
        storeResult.error,
      );
      return NextResponse.json(
        { error: "Failed to store tokens", details: storeResult.error },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("❌ [API] /store-tokens Exception:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
