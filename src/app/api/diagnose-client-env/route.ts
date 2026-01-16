import { NextResponse } from "next/server";

/**
 * Diagnostic endpoint to check client-side env vars
 * Returns what env vars are available in the browser
 */
export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      ? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID.substring(0, 30) + "..."
      : "NOT AVAILABLE",
    hasClientId: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "NOT AVAILABLE",
    hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
    note: "These env vars should be available in both server and client",
  });
}
