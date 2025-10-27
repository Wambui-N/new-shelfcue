import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { tokenStorage } from "@/lib/token-storage";

interface DiagnosticCheck {
  success: boolean;
  error?: string;
  [key: string]: unknown;
}

interface Diagnostics {
  userId: string;
  timestamp: string;
  checks: Record<string, DiagnosticCheck>;
  summary?: {
    overallHealth: "HEALTHY" | "ISSUES_DETECTED";
    passedChecks: number;
    totalChecks: number;
    healthPercentage: number;
    recommendations: string[];
  };
}

/**
 * Comprehensive diagnostic endpoint for OAuth and token storage issues
 * Usage: GET /api/diagnose-oauth?userId=YOUR_USER_ID
 */
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

    console.log("🔍 Running OAuth diagnostics for user:", userId);

    const diagnostics: Diagnostics = {
      userId,
      timestamp: new Date().toISOString(),
      checks: {},
    };

    // 1. Check if user exists in Supabase Auth
    try {
      const { data: userData, error: userError } =
        await getSupabaseAdmin().auth.admin.getUserById(userId);
      diagnostics.checks.userExists = {
        success: !userError && !!userData,
        error: userError?.message,
        email: userData?.user?.email,
        provider: userData?.user?.app_metadata?.provider,
        hasProviderToken: !!userData?.user?.app_metadata?.provider_token,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      diagnostics.checks.userExists = {
        success: false,
        error: errorMessage,
      };
    }

    // 2. Check token storage using new system
    try {
      const tokenResult = await tokenStorage.getTokens(userId);
      diagnostics.checks.tokenStorage = {
        success: tokenResult.success,
        error: tokenResult.error,
        hasTokens: !!tokenResult.tokens,
        tokens: tokenResult.tokens
          ? {
              hasAccessToken: !!tokenResult.tokens.access_token,
              hasRefreshToken: !!tokenResult.tokens.refresh_token,
              expiresAt: tokenResult.tokens.expires_at,
              expiresAtDate: new Date(
                tokenResult.tokens.expires_at * 1000,
              ).toISOString(),
              isExpired:
                tokenResult.tokens.expires_at < Math.floor(Date.now() / 1000),
              timeUntilExpiry:
                tokenResult.tokens.expires_at - Math.floor(Date.now() / 1000),
            }
          : null,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      diagnostics.checks.tokenStorage = {
        success: false,
        error: errorMessage,
      };
    }

    // 3. Check database directly
    try {
      const { data: dbTokens, error: dbError } = await getSupabaseAdmin()
        .from("user_google_tokens")
        .select("*")
        .eq("user_id", userId);

      diagnostics.checks.databaseDirect = {
        success: !dbError,
        error: dbError?.message,
        hasRecords: dbTokens && dbTokens.length > 0,
        recordCount: dbTokens?.length || 0,
        records: dbTokens || [],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      diagnostics.checks.databaseDirect = {
        success: false,
        error: errorMessage,
      };
    }

    // 4. Test write permissions
    try {
      const testToken = {
        access_token: `test_diagnostic_${Date.now()}`,
        refresh_token: `test_refresh_${Date.now()}`,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      };

      const storeResult = await tokenStorage.storeTokens(userId, testToken);

      diagnostics.checks.writePermissions = {
        success: storeResult.success,
        error: storeResult.error,
        testWasStored: storeResult.success,
      };

      // Clean up test token if successful
      if (storeResult.success) {
        await tokenStorage.deleteTokens(userId);
        diagnostics.checks.writePermissions.testWasDeleted = true;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      diagnostics.checks.writePermissions = {
        success: false,
        error: errorMessage,
      };
    }

    // 5. Check environment variables
    diagnostics.checks.environment = {
      hasGoogleClientId: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || "not set",
      nodeEnv: process.env.NODE_ENV,
    };

    // 6. Overall status
    const allChecks = Object.values(diagnostics.checks);
    const passedChecks = allChecks.filter((check) => check.success).length;
    const totalChecks = allChecks.length;

    diagnostics.summary = {
      overallHealth:
        passedChecks === totalChecks ? "HEALTHY" : "ISSUES_DETECTED",
      passedChecks,
      totalChecks,
      healthPercentage: Math.round((passedChecks / totalChecks) * 100),
      recommendations: [],
    };

    // Add recommendations based on failures
    if (!diagnostics.checks.userExists?.success) {
      diagnostics.summary.recommendations.push(
        "User does not exist in Supabase Auth. Ensure user is properly signed up.",
      );
    }

    if (!diagnostics.checks.tokenStorage?.success) {
      diagnostics.summary.recommendations.push(
        "Token storage is failing. Check database schema and RLS policies.",
      );
    }

    if (!diagnostics.checks.writePermissions?.success) {
      diagnostics.summary.recommendations.push(
        "Cannot write tokens to database. Check RLS policies and service role key.",
      );
    }

    if (!diagnostics.checks.tokenStorage?.hasTokens) {
      diagnostics.summary.recommendations.push(
        "No tokens found for user. User needs to re-authenticate with Google.",
      );
    }

    if (diagnostics.checks.tokenStorage?.tokens?.isExpired) {
      diagnostics.summary.recommendations.push(
        "Tokens are expired. They should be automatically refreshed on next use.",
      );
    }

    return NextResponse.json(diagnostics, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    const errorStack = error instanceof Error && process.env.NODE_ENV === "development" ? error.stack : undefined;
    console.error("Diagnostic error:", error);
    return NextResponse.json(
      {
        error: "Diagnostic failed",
        message: errorMessage,
        stack: errorStack,
      },
      { status: 500 },
    );
  }
}
