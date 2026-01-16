/**
 * Utility to generate Google OAuth URLs for different contexts
 */

export type OAuthContext = "signup" | "reconnect";

/**
 * Generate a Google OAuth URL for requesting Calendar and Drive API access
 * @param userId - The user's ID to include in the state parameter
 * @param context - Whether this is for signup or reconnection
 * @returns Complete OAuth URL to redirect user to
 */
export function generateGoogleOAuthUrl(
  userId: string,
  context: OAuthContext,
): string {
  // Get client ID - must be available
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  
  if (!clientId) {
    console.error("❌ NEXT_PUBLIC_GOOGLE_CLIENT_ID is not defined!");
    throw new Error("Google Client ID is not configured");
  }

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const redirectUri = `${baseUrl}/api/auth/google-server-callback`;

  console.log("🔍 Generating OAuth URL:", {
    clientId: clientId.substring(0, 20) + "...",
    redirectUri,
    userId: userId.substring(0, 8) + "...",
    context,
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope:
      "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive.file openid email profile",
    access_type: "offline",
    prompt: "consent",
    state: `${userId}|from_${context}`,
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  
  console.log("✅ Generated OAuth URL:", authUrl.substring(0, 100) + "...");
  
  return authUrl;
}
