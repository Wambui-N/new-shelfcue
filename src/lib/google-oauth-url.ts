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
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const redirectUri = `${baseUrl}/api/auth/google-server-callback`;

  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope:
      "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive.file openid email profile",
    access_type: "offline",
    prompt: "consent",
    state: `${userId}|from_${context}`,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
