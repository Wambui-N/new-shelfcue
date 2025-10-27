import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

interface Recommendation {
  issue: string;
  solution: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  note?: string;
}

interface Diagnostics {
  timestamp: string;
  environment: Record<string, unknown>;
  supabase: Record<string, unknown>;
  google: Record<string, unknown>;
  commonIssues?: Record<string, unknown>;
  recommendations: Recommendation[];
  overallHealth?: "CRITICAL" | "WARNING" | "HEALTHY";
}

/**
 * Check Supabase configuration and Google OAuth settings
 * This helps diagnose oauth_error issues
 */
export async function GET(_request: NextRequest) {
  try {
    const diagnostics: Diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {},
      supabase: {},
      google: {},
    };

    // 1. Environment Variables Check
    diagnostics.environment = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT SET",
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || "NOT SET",
      nodeEnv: process.env.NODE_ENV,
    };

    // 2. Google OAuth Configuration
    diagnostics.google = {
      hasClientId: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
        ? `${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID.substring(0, 20)}...`
        : "NOT SET",
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      expectedRedirectUris: [
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback`,
        `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google-server-callback`,
      ],
    };

    // 3. Supabase Connection Test
    try {
      const supabaseAdmin = getSupabaseAdmin();

      // Try a simple query to verify connection
      const { error } = await supabaseAdmin
        .from("user_google_tokens")
        .select("count")
        .limit(1);

      diagnostics.supabase = {
        connectionStatus: error ? "FAILED" : "SUCCESS",
        connectionError: error?.message,
        canQueryDatabase: !error,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      diagnostics.supabase = {
        connectionStatus: "FAILED",
        connectionError: errorMessage,
        canQueryDatabase: false,
      };
    }

    // 4. Check for common OAuth issues
    diagnostics.commonIssues = {
      missingAppUrl: !process.env.NEXT_PUBLIC_APP_URL,
      missingGoogleCredentials:
        !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
        !process.env.GOOGLE_CLIENT_SECRET,
      supabaseConnectionFailed:
        diagnostics.supabase.connectionStatus === "FAILED",
    };

    // 5. Recommendations
    diagnostics.recommendations = [];

    if (diagnostics.commonIssues.missingAppUrl) {
      diagnostics.recommendations.push({
        issue: "NEXT_PUBLIC_APP_URL is not set",
        solution:
          "Set NEXT_PUBLIC_APP_URL to your production URL (https://www.shelfcue.com) in Vercel environment variables",
        priority: "HIGH",
      });
    }

    if (diagnostics.commonIssues.missingGoogleCredentials) {
      diagnostics.recommendations.push({
        issue: "Google OAuth credentials are missing",
        solution:
          "Ensure NEXT_PUBLIC_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in environment variables",
        priority: "HIGH",
      });
    }

    if (diagnostics.commonIssues.supabaseConnectionFailed) {
      diagnostics.recommendations.push({
        issue: "Cannot connect to Supabase",
        solution:
          "Check SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL are correct",
        priority: "CRITICAL",
      });
    }

    // Check for redirect URI issues
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

    if (appUrl && supabaseUrl) {
      diagnostics.recommendations.push({
        issue: "OAuth Redirect URIs",
        solution: `Ensure these URIs are in your Google Cloud Console:\n1. ${supabaseUrl}/auth/v1/callback\n2. ${appUrl}/api/auth/google-server-callback`,
        priority: "HIGH",
        note: `Also ensure Supabase Site URL is set to: ${appUrl}`,
      });
    }

    // 6. Overall Health
    const criticalIssues = diagnostics.recommendations.filter(
      (r) => r.priority === "CRITICAL",
    ).length;
    const highIssues = diagnostics.recommendations.filter(
      (r) => r.priority === "HIGH",
    ).length;

    diagnostics.overallHealth =
      criticalIssues > 0 ? "CRITICAL" : highIssues > 0 ? "WARNING" : "HEALTHY";

    return NextResponse.json(diagnostics, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    const errorStack = error instanceof Error && process.env.NODE_ENV === "development" ? error.stack : undefined;
    console.error("Configuration check error:", error);
    return NextResponse.json(
      {
        error: "Configuration check failed",
        message: errorMessage,
        stack: errorStack,
      },
      { status: 500 },
    );
  }
}
