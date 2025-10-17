import { type NextRequest, NextResponse } from "next/server";
import { getGoogleClient } from "@/lib/google";
import { GoogleCalendarService } from "@/lib/googleCalendar";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { tokenStorage } from "@/lib/token-storage";

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

    console.log('🔍 Checking Google tokens for user:', userId);
    
    // Get Google client
    const googleClient = await getGoogleClient(userId);
    if (!googleClient) {
      console.log('❌ No Google client found for user:', userId);
      
      // Check if tokens exist using the new token storage system
      const tokenResult = await tokenStorage.getTokens(userId);
      
      console.log('🔍 Token storage result:', { 
        success: tokenResult.success, 
        error: tokenResult.error,
        hasTokens: !!tokenResult.tokens 
      });
      
      return NextResponse.json(
        { 
          error: "Google authentication required. Please sign in with Google again.",
          debug: {
            userId,
            hasTokens: tokenResult.success && !!tokenResult.tokens,
            tokenCount: tokenResult.success && tokenResult.tokens ? 1 : 0,
            tokens: tokenResult.success && tokenResult.tokens ? [{
              user_id: userId,
              hasAccessToken: !!tokenResult.tokens.access_token,
              hasRefreshToken: !!tokenResult.tokens.refresh_token,
              expires_at: tokenResult.tokens.expires_at,
              is_expired: tokenResult.tokens.expires_at < Math.floor(Date.now() / 1000)
            }] : [],
            storageError: tokenResult.error
          }
        },
        { status: 401 },
      );
    }
    
    console.log('✅ Google client found for user:', userId);

    // Get user's calendars
    const calendarService = new GoogleCalendarService(googleClient);
    const calendars = await calendarService.getUserCalendars();

    return NextResponse.json({ calendars });
  } catch (error: any) {
    console.error("Error in calendars API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch calendars" },
      { status: 500 },
    );
  }
}
