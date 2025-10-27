import { supabaseAdmin } from "./supabase/admin";

export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expires_at: number; // Unix timestamp in seconds
}

export interface TokenStorageResult {
  success: boolean;
  error?: string;
  tokens?: GoogleTokens;
}

/**
 * Robust token storage with validation and error handling
 */
export class TokenStorage {
  /**
   * Store Google tokens for a user with validation
   */
  async storeTokens(
    userId: string,
    tokens: Partial<GoogleTokens>,
  ): Promise<TokenStorageResult> {
    try {
      console.log("💾 Storing tokens for user:", userId);

      // Validate required fields
      if (!userId || !tokens.access_token) {
        const error = `Missing required fields: userId=${!!userId}, access_token=${!!tokens.access_token}`;
        console.error("❌ Token validation failed:", error);
        return { success: false, error };
      }

      // Calculate expiry time
      const expiresAt =
        tokens.expires_at || Math.floor(Date.now() / 1000) + 3600; // Default 1 hour

      const tokenData = {
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || "",
        expires_at: expiresAt,
      };

      console.log("🔍 Token data to store:", {
        user_id: userId,
        hasAccessToken: !!tokenData.access_token,
        hasRefreshToken: !!tokenData.refresh_token,
        expiresAt,
        expiresAtDate: new Date(expiresAt * 1000).toISOString(),
      });

      // Use upsert to handle both insert and update cases
      const { data, error } = await supabaseAdmin
        .from("user_google_tokens")
        .upsert(tokenData, {
          onConflict: "user_id",
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Database error storing tokens:", error);
        return { success: false, error: error.message };
      }

      console.log("✅ Tokens stored successfully:", {
        user_id: userId,
        expires_at: data?.expires_at,
        created: !!data?.created_at,
      });

      return {
        success: true,
        tokens: {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: data.expires_at,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("❌ Exception storing tokens:", error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Retrieve tokens for a user with validation
   */
  async getTokens(userId: string): Promise<TokenStorageResult> {
    try {
      console.log("🔍 Retrieving tokens for user:", userId);

      const { data, error } = await supabaseAdmin
        .from("user_google_tokens")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("❌ Error retrieving tokens:", error);
        return { success: false, error: error.message };
      }

      if (!data) {
        console.log("❌ No tokens found for user:", userId);
        return { success: false, error: "No tokens found" };
      }

      console.log("✅ Tokens retrieved:", {
        user_id: userId,
        hasAccessToken: !!data.access_token,
        hasRefreshToken: !!data.refresh_token,
        expiresAt: data.expires_at,
        isExpired: data.expires_at < Math.floor(Date.now() / 1000),
      });

      return {
        success: true,
        tokens: {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: data.expires_at,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("❌ Exception retrieving tokens:", error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Check if tokens are valid (not expired)
   */
  isTokenValid(tokens: GoogleTokens): boolean {
    const now = Math.floor(Date.now() / 1000);
    const isValid = tokens.expires_at > now;

    console.log("🔍 Token validation:", {
      expiresAt: tokens.expires_at,
      currentTime: now,
      isValid,
      timeUntilExpiry: tokens.expires_at - now,
    });

    return isValid;
  }

  /**
   * Delete tokens for a user
   */
  async deleteTokens(userId: string): Promise<TokenStorageResult> {
    try {
      console.log("🗑️ Deleting tokens for user:", userId);

      const { error } = await supabaseAdmin
        .from("user_google_tokens")
        .delete()
        .eq("user_id", userId);

      if (error) {
        console.error("❌ Error deleting tokens:", error);
        return { success: false, error: error.message };
      }

      console.log("✅ Tokens deleted successfully for user:", userId);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("❌ Exception deleting tokens:", error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Update tokens (for refresh scenarios)
   */
  async updateTokens(
    userId: string,
    updates: Partial<GoogleTokens>,
  ): Promise<TokenStorageResult> {
    try {
      console.log("🔄 Updating tokens for user:", userId);

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabaseAdmin
        .from("user_google_tokens")
        .update(updateData)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        console.error("❌ Error updating tokens:", error);
        return { success: false, error: error.message };
      }

      console.log("✅ Tokens updated successfully:", {
        user_id: userId,
        hasAccessToken: !!data?.access_token,
        expiresAt: data?.expires_at,
      });

      return {
        success: true,
        tokens: data
          ? {
              access_token: data.access_token,
              refresh_token: data.refresh_token,
              expires_at: data.expires_at,
            }
          : undefined,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("❌ Exception updating tokens:", error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}

// Singleton instance
export const tokenStorage = new TokenStorage();
