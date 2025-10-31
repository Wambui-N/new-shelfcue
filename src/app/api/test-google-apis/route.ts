import { type NextRequest, NextResponse } from "next/server";
import { getGoogleClient } from "@/lib/google";

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

    console.log("🧪 Testing Google APIs for user:", userId);

    // Get Google client
    const googleClient = await getGoogleClient(userId);
    if (!googleClient) {
      return NextResponse.json(
        { error: "Google authentication required" },
        { status: 401 },
      );
    }

    const results = {
      calendar: { success: false, error: null as string | null, count: 0 },
      sheets: { success: false, error: null as string | null, title: "" },
      drive: { success: false, error: null as string | null, count: 0 },
    };

    // Test Calendar API
    try {
      const calendar = googleClient.getCalendar();
      const calendarList = await calendar.calendarList.list();
      results.calendar = {
        success: true,
        error: null,
        count: calendarList.data.items?.length || 0,
      };
      console.log("✅ Calendar API working");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      results.calendar = { success: false, error: errorMessage, count: 0 };
      console.log("❌ Calendar API failed:", errorMessage);
    }

    // Test Sheets API
    try {
      const sheets = googleClient.getSheets();
      const response = await sheets.spreadsheets.get({
        spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms", // Public test sheet
      });
      results.sheets = {
        success: true,
        error: null,
        title: response.data.properties?.title || "",
      };
      console.log("✅ Sheets API working");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      results.sheets = { success: false, error: errorMessage, title: "" };
      console.log("❌ Sheets API failed:", errorMessage);
    }

    // Test Drive API
    try {
      const drive = googleClient.getDrive();
      const response = await drive.files.list({ pageSize: 1 });
      results.drive = {
        success: true,
        error: null,
        count: response.data.files?.length || 0,
      };
      console.log("✅ Drive API working");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      results.drive = { success: false, error: errorMessage, count: 0 };
      console.log("❌ Drive API failed:", errorMessage);
    }

    return NextResponse.json({
      userId,
      results,
      summary: {
        allWorking:
          results.calendar.success &&
          results.sheets.success &&
          results.drive.success,
        workingApis: Object.entries(results)
          .filter(([_, result]) => result.success)
          .map(([api]) => api),
      },
    });
  } catch (error: unknown) {
    console.error("Test Google APIs error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
