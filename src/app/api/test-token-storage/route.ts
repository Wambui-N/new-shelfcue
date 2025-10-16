import { NextRequest, NextResponse } from "next/server";
import { tokenStorage } from "@/lib/token-storage";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const action = searchParams.get("action") || "get";

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    console.log('🧪 Testing token storage for user:', userId, 'action:', action);

    switch (action) {
      case "store":
        // Test storing tokens
        const testTokens = {
          access_token: "test_access_token_" + Date.now(),
          refresh_token: "test_refresh_token_" + Date.now(),
          expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
          scope: "test_scope"
        };

        const storeResult = await tokenStorage.storeTokens(userId, testTokens);
        return NextResponse.json({
          action: "store",
          userId,
          testTokens,
          result: storeResult
        });

      case "get":
        // Test retrieving tokens
        const getResult = await tokenStorage.getTokens(userId);
        return NextResponse.json({
          action: "get",
          userId,
          result: getResult
        });

      case "validate":
        // Test token validation
        const validateResult = await tokenStorage.getTokens(userId);
        if (validateResult.success && validateResult.tokens) {
          const isValid = tokenStorage.isTokenValid(validateResult.tokens);
          return NextResponse.json({
            action: "validate",
            userId,
            tokens: validateResult.tokens,
            isValid,
            timeUntilExpiry: validateResult.tokens.expires_at - Math.floor(Date.now() / 1000)
          });
        } else {
          return NextResponse.json({
            action: "validate",
            userId,
            error: "No tokens found to validate"
          });
        }

      case "delete":
        // Test deleting tokens
        const deleteResult = await tokenStorage.deleteTokens(userId);
        return NextResponse.json({
          action: "delete",
          userId,
          result: deleteResult
        });

      default:
        return NextResponse.json({
          error: "Invalid action. Use: store, get, validate, or delete"
        }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Test token storage error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
