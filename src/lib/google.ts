import { google } from "googleapis";
import { getSupabaseAdmin } from "./supabase";
import { tokenStorage, GoogleTokens } from "./token-storage";

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
    console.log('🔍 Looking for Google tokens for user:', userId);
    
    // Use the new token storage system
    const tokenResult = await tokenStorage.getTokens(userId);
    
    if (!tokenResult.success || !tokenResult.tokens) {
      console.error("❌ No Google tokens found for user:", userId, "Error:", tokenResult.error);
      
      // Try to get tokens from Supabase's built-in token storage as fallback
      console.log('🔍 Trying to get tokens from Supabase session...');
      const supabaseAdmin = getSupabaseAdmin();
      const { data: sessionData } = await supabaseAdmin.auth.admin.getUserById(userId);
      
      if (sessionData?.user?.app_metadata?.provider_token) {
        console.log('✅ Found provider token in Supabase metadata');
        
        // Store the token using our new system
        const storeResult = await tokenStorage.storeTokens(userId, {
          access_token: sessionData.user.app_metadata.provider_token,
          refresh_token: sessionData.user.app_metadata.provider_refresh_token || "",
          expires_at: Math.floor(Date.now() / 1000) + 3600,
        });
        
        if (storeResult.success) {
          return new GoogleAPIClient(
            sessionData.user.app_metadata.provider_token,
            sessionData.user.app_metadata.provider_refresh_token || ""
          );
        }
      }
      
      return null;
    }
    
    console.log('✅ Found Google tokens for user:', userId);
    const tokens = tokenResult.tokens;

    // Check if token is expired
    if (!tokenStorage.isTokenValid(tokens)) {
      console.log('🔄 Token expired, attempting to refresh...');
      
      try {
        // Token expired, need to refresh
        const client = new GoogleAPIClient(
          tokens.access_token,
          tokens.refresh_token || "",
        );
        
        const newCredentials = await client.refreshAccessToken();
        
        // Update tokens in database using our new system
        const updateResult = await tokenStorage.updateTokens(userId, {
          access_token: newCredentials.access_token!,
          refresh_token: newCredentials.refresh_token || tokens.refresh_token,
          expires_at: Math.floor(Date.now() / 1000) + (newCredentials.expires_in || 3600),
        });
        
        if (updateResult.success) {
          console.log('✅ Tokens refreshed successfully');
          return new GoogleAPIClient(
            newCredentials.access_token!,
            newCredentials.refresh_token || tokens.refresh_token || "",
          );
        } else {
          console.error('❌ Failed to update refreshed tokens:', updateResult.error);
        }
        
      } catch (refreshError) {
        console.error('❌ Failed to refresh token:', refreshError);
        // Return the expired client anyway - it might still work for some requests
      }
    }

    return new GoogleAPIClient(
      tokens.access_token,
      tokens.refresh_token || "",
    );
  } catch (error) {
    console.error("Error getting Google client:", error);
    return null;
  }
}
