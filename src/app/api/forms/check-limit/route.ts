import { type NextRequest, NextResponse } from "next/server";
import { canPerformAction } from "@/lib/subscriptionLimits";
import { createClient } from "@/lib/supabase";

/**
 * API endpoint to check if user can create a new form
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

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
