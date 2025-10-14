import { google } from "googleapis";
import { getSupabaseAdmin } from "./supabase";

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
    // Use admin client to bypass RLS
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("user_google_tokens")
      .select("access_token, refresh_token, expires_at")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      console.error("No Google tokens found for user:", userId);
      return null;
    }

    // Check if token is expired (expires_at is stored as Unix timestamp in seconds)
    const now = Math.floor(Date.now() / 1000); // Convert to seconds
    if ((data as any).expires_at && (data as any).expires_at < now) {
      // Token expired, need to refresh
      const client = new GoogleAPIClient(
        (data as any).access_token,
        (data as any).refresh_token,
      );
      const newCredentials = await client.refreshAccessToken();

      // Update tokens in database (expires_at in seconds) using admin client
      await (supabaseAdmin as any)
        .from("user_google_tokens")
        .update({
          access_token: newCredentials.access_token,
          refresh_token:
            newCredentials.refresh_token || (data as any).refresh_token,
          expires_at: now + (newCredentials.expires_in || 3600),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      return new GoogleAPIClient(
        newCredentials.access_token!,
        newCredentials.refresh_token || (data as any).refresh_token,
      );
    }

    return new GoogleAPIClient(
      (data as any).access_token,
      (data as any).refresh_token,
    );
  } catch (error) {
    console.error("Error getting Google client:", error);
    return null;
  }
}
