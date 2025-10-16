import { type NextRequest, NextResponse } from "next/server";
import { getGoogleClient } from "@/lib/google";
import { GoogleCalendarService } from "@/lib/googleCalendar";

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
      return NextResponse.json(
        { error: "Google authentication required. Please sign in with Google again." },
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
