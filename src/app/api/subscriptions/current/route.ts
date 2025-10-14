import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();

    // Get authenticated user
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's current subscription with plan details
    const { data: subscription, error: subError } = await supabase
      .from("user_subscriptions")
      .select(
        `
        *,
        plan:subscription_plans(*)
      `,
      )
      .eq("user_id", user.id)
      .single();

    if (subError) {
      // No subscription found, return null
      return NextResponse.json({ subscription: null });
    }

    // Get usage statistics for current period
    const { data: usage } = await supabase
      .from("usage_tracking")
      .select("*")
      .eq("user_id", user.id)
      .gte("period_end", new Date().toISOString())
      .single();

    // Get total forms count
    const { count: formsCount } = await supabase
      .from("forms")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    return NextResponse.json({
      subscription,
      usage: {
        forms_count: formsCount || 0,
        submissions_count: usage?.submissions_count || 0,
        storage_used_mb: usage?.storage_used_mb || 0,
        period_start: usage?.period_start,
        period_end: usage?.period_end,
      },
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch subscription",
      },
      { status: 500 },
    );
  }
}
