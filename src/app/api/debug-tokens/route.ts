import { type NextRequest, NextResponse } from "next/server";
import { tokenStorage } from "@/lib/token-storage";

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

    console.log("🔍 Debug: Checking tokens for user:", userId);

    // Use the new token storage system for debugging
    const tokenResult = await tokenStorage.getTokens(userId);

    console.log("🔍 Debug: Token result:", {
      success: tokenResult.success,
      error: tokenResult.error,
      hasTokens: !!tokenResult.tokens,
    });

    if (!tokenResult.success) {
      return NextResponse.json({
        userId,
        hasTokens: false,
        tokenCount: 0,
        tokens: [],
        error: tokenResult.error,
      });
    }

    const hasTokens = !!tokenResult.tokens;
    const tokenCount = hasTokens ? 1 : 0;
    const tokens = hasTokens
      ? [
          {
            user_id: userId,
            hasAccessToken: !!tokenResult.tokens?.access_token,
            hasRefreshToken: !!tokenResult.tokens?.refresh_token,
            expires_at: tokenResult.tokens?.expires_at,
            expires_at_date: new Date(
              (tokenResult.tokens?.expires_at || 0) * 1000,
            ).toISOString(),
            is_expired:
              (tokenResult.tokens?.expires_at || 0) <
              Math.floor(Date.now() / 1000),
          },
        ]
      : [];

    return NextResponse.json({
      userId,
      hasTokens,
      tokenCount,
      tokens,
      error: null,
    });
  } catch (error: any) {
    console.error("Debug tokens error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
