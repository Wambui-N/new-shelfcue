import { type NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({
      cookies: (() => cookieStore) as unknown as () => ReturnType<typeof cookies>,
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Get user's current subscription(s) with plan details.
    // We may have multiple rows over time (e.g. old trial + new active), so we
    // load a few and pick the best match in code: prefer `active`, then `trial`,
    // then `expired`, then `cancelled`.
    const { data: rows, error } = await supabaseAdmin
      .from("user_subscriptions")
      .select(
        `
          *,
          plan:subscription_plans(*)
        `,
      )
      .eq("user_id", user.id)
      .in("status", ["trial", "active", "expired", "cancelled"])
      .order("updated_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching subscription:", error);
      return NextResponse.json(
        {
          subscription: null,
          usage: { forms_count: 0 },
          warning: "subscription_lookup_failed",
          details: error.message,
        },
        { status: 200 },
      );
    }

    let subscription = rows?.[0] ?? null;

    if (rows && rows.length > 0) {
      // Prefer an active subscription first, then trial, then expired, then cancelled
      const active = rows.find((r: any) => r.status === "active");
      const trial = rows.find((r: any) => r.status === "trial");
      const expired = rows.find((r: any) => r.status === "expired");
      const cancelled = rows.find((r: any) => r.status === "cancelled");

      subscription = (active || trial || expired || cancelled || rows[0]) as any;
    }

    // Get total forms count
    const { count: formsCount, error: formsError } = await supabaseAdmin
      .from("forms")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (formsError) {
      console.error("Error fetching forms count:", formsError);
      return NextResponse.json(
        {
          subscription: subscription || null,
          usage: { forms_count: 0 },
          warning: "forms_count_failed",
          details: formsError.message,
        },
        { status: 200 },
      );
    }

    return NextResponse.json({
      subscription: subscription || null,
      usage: {
        forms_count: formsCount || 0,
      },
    });
  } catch (error) {
    console.error("Unexpected error in /api/subscriptions/current:", error);
    return NextResponse.json(
      {
        subscription: null,
        usage: { forms_count: 0 },
        warning: "unexpected_error",
      },
      { status: 200 },
    );
  }
}
