import { type NextRequest, NextResponse } from "next/server";
import { getGoogleClient } from "@/lib/google";
import { GoogleCalendarService } from "@/lib/googleCalendar";
import { getSupabaseAdmin } from "@/lib/supabase";

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
      
      // Check if tokens exist in database
      const supabaseAdmin = getSupabaseAdmin();
      const { data: tokens } = await supabaseAdmin
        .from("user_google_tokens")
        .select("*")
        .eq("user_id", userId);
      
      console.log('🔍 Tokens in database:', tokens);
      
      return NextResponse.json(
        { 
          error: "Google authentication required. Please sign in with Google again.",
          debug: {
            userId,
            hasTokens: !!tokens && tokens.length > 0,
            tokenCount: tokens?.length || 0,
            tokens: tokens || []
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
