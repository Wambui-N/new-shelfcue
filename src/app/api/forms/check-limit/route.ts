import { type NextRequest, NextResponse } from "next/server";
import { canPerformAction } from "@/lib/subscriptionLimits";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * API endpoint to check if user can create a new form
 */
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Get auth token from header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user can create more forms
    const limitCheck = await canPerformAction(user.id, "forms");

    return NextResponse.json({
      allowed: limitCheck.allowed,
      message: limitCheck.message,
      limit: limitCheck.limit,
      usage: limitCheck.usage,
    });
  } catch (error) {
    console.error("Error checking form limit:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to check limit",
      },
      { status: 500 },
    );
  }
}
