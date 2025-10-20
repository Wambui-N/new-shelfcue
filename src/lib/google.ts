import { google } from "googleapis";
import { getSupabaseAdmin } from "./supabase/admin";
import { tokenStorage } from "./token-storage";

export class GoogleAPIClient {
  private oauth2Client: any;

  constructor(accessToken: string, refreshToken: string) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
    );

    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  // Get Google Sheets API client
  getSheets() {
    return google.sheets({ version: "v4", auth: this.oauth2Client });
  }

  // Get Google Calendar API client
  getCalendar() {
    return google.calendar({ version: "v3", auth: this.oauth2Client });
  }

  // Get Google Drive API client
  getDrive() {
    return google.drive({ version: "v3", auth: this.oauth2Client });
  }

  // Refresh access token if expired
  async refreshAccessToken() {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      return credentials;
    } catch (error) {
      console.error("Error refreshing access token:", error);
      throw error;
    }
  }
}

// Helper function to get Google client for a user
export async function getGoogleClient(
  userId: string,
): Promise<GoogleAPIClient | null> {
  try {
    console.log("🔍 Looking for Google tokens for user:", userId);
    const supabaseAdmin = getSupabaseAdmin();

    // Strategy 1: Check our custom token storage first
    const tokenResult = await tokenStorage.getTokens(userId);

    if (tokenResult.success && tokenResult.tokens) {
      console.log("✅ Found tokens in custom storage");
      const tokens = tokenResult.tokens;

      // Check if token is expired
      if (tokens.expires_at < Math.floor(Date.now() / 1000)) {
        console.log("🔄 Token expired, attempting to refresh...");

        try {
          const client = new GoogleAPIClient(
            tokens.access_token,
            tokens.refresh_token || "",
          );

          const newCredentials = await client.refreshAccessToken();

          // Update tokens in database
          const updateResult = await tokenStorage.updateTokens(userId, {
            access_token: newCredentials.access_token!,
            refresh_token: newCredentials.refresh_token || tokens.refresh_token,
            expires_at:
              Math.floor(Date.now() / 1000) +
              (newCredentials.expires_in || 3600),
          });

          if (updateResult.success) {
            console.log("✅ Tokens refreshed successfully");
            return new GoogleAPIClient(
              newCredentials.access_token!,
              newCredentials.refresh_token || tokens.refresh_token || "",
            );
          }
        } catch (refreshError) {
          console.error("❌ Failed to refresh token:", refreshError);
          // Token refresh failed, try to get fresh tokens from Supabase
        }
      } else {
        // Token is still valid
        return new GoogleAPIClient(
          tokens.access_token,
          tokens.refresh_token || "",
        );
      }
    }

    // Strategy 2: Try to get tokens from Supabase user data
    console.log("🔍 Trying to get tokens from Supabase user data...");
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.admin.getUserById(userId);

    if (userError) {
      console.error("❌ Error fetching user data:", userError);
      return null;
    }

    // Check if user has Google identity linked
    const googleIdentity = userData?.user?.identities?.find(
      (identity: any) => identity.provider === "google",
    );

    if (googleIdentity) {
      console.log("✅ Found Google identity for user");

      // Try to extract tokens from identity_data
      const identityData = googleIdentity.identity_data as any;

      // Supabase stores tokens in different places depending on the setup
      // Try multiple possible locations
      const possibleAccessToken =
        identityData?.provider_token ||
        identityData?.access_token ||
        userData.user?.app_metadata?.provider_token;

      const possibleRefreshToken =
        identityData?.provider_refresh_token ||
        identityData?.refresh_token ||
        userData.user?.app_metadata?.provider_refresh_token;

      if (possibleAccessToken) {
        console.log("✅ Found access token in Supabase data");

        // Store these tokens in our custom table for future use
        const storeResult = await tokenStorage.storeTokens(userId, {
          access_token: possibleAccessToken,
          refresh_token: possibleRefreshToken || "",
          expires_at: Math.floor(Date.now() / 1000) + 3600, // Default 1 hour
        });

        if (storeResult.success) {
          return new GoogleAPIClient(
            possibleAccessToken,
            possibleRefreshToken || "",
          );
        }
      }
    }

    console.error("❌ Could not find valid Google tokens for user:", userId);
    console.log("💡 User may need to reconnect their Google account");
    return null;
  } catch (error) {
    console.error("Error getting Google client:", error);
    return null;
  }
}
