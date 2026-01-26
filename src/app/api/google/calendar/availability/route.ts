import { type NextRequest, NextResponse } from "next/server";
import { getGoogleClient } from "@/lib/google";
import { GoogleCalendarService } from "@/lib/googleCalendar";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const calendarId = searchParams.get("calendarId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const duration = searchParams.get("duration");
    const bufferTime = searchParams.get("bufferTime");
    const startHour = searchParams.get("startHour");
    const endHour = searchParams.get("endHour");
    const timeZone = searchParams.get("timeZone");

    // Validate required parameters
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    if (!calendarId) {
      return NextResponse.json(
        { error: "Calendar ID is required" },
        { status: 400 },
      );
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 },
      );
    }

    console.log("📅 Checking calendar availability:", {
      userId,
      calendarId,
      startDate,
      endDate,
      duration,
      bufferTime,
      startHour,
      endHour,
      timeZone,
    });

    // Get Google client
    const googleClient = await getGoogleClient(userId);
    if (!googleClient) {
      console.log("❌ No Google client found for user:", userId);
      return NextResponse.json(
        {
          error:
            "Google authentication required. Please sign in with Google again.",
        },
        { status: 401 },
      );
    }

    console.log("✅ Google client found for user:", userId);

    // Get available time slots
    const calendarService = new GoogleCalendarService(googleClient);
    const availableSlots = await calendarService.checkAvailability(
      calendarId,
      new Date(startDate),
      new Date(endDate),
      duration ? parseInt(duration) : 60,
      bufferTime ? parseInt(bufferTime) : 0,
      startHour ? parseInt(startHour) : 9,
      endHour ? parseInt(endHour) : 17,
      timeZone || undefined,
    );

    return NextResponse.json({ availableSlots });
  } catch (error: any) {
    console.error("❌ Error in calendar availability API:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to check calendar availability",
        details: error.toString(),
      },
      { status: 500 },
    );
  }
}
