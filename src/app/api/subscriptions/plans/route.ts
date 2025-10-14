import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(_request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();

    // Get all active plans
    const { data: plans, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("is_active", true)
      .order("price_monthly", { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch plans",
      },
      { status: 500 },
    );
  }
}
