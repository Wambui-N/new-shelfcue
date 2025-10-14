import { type NextRequest, NextResponse } from "next/server";
import { getGoogleClient } from "@/lib/google";
import { GoogleSheetsService } from "@/lib/googleSheets";

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

    // Get Google client
    const googleClient = await getGoogleClient(userId);
    if (!googleClient) {
      return NextResponse.json(
        { error: "Google authentication required" },
        { status: 401 },
      );
    }

    // Get user's spreadsheets
    const sheetsService = new GoogleSheetsService(googleClient);
    const sheets = await sheetsService.getSheets();

    return NextResponse.json({ sheets });
  } catch (error: any) {
    console.error("Error in spreadsheets API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch spreadsheets" },
      { status: 500 },
    );
  }
}
