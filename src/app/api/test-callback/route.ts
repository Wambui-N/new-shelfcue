import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    console.log("🧪 Test callback received:", {
      hasCode: !!code,
      hasState: !!state,
      state,
      error,
      url: request.url,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      hasCode: !!code,
      hasState: !!state,
      state,
      error,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Test callback error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
