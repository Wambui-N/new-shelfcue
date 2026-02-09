import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Prefer cookie-based session (same as payments/initialize) so we get a refreshed session
    const supabase = createServerClient();
    const {
      data: { user: cookieUser },
    } = await supabase.auth.getUser();

    let user = cookieUser;

    // Fallback: Authorization Bearer token (e.g. when client sends token explicitly)
    if (!user) {
      const authHeader = request.headers.get("authorization");
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        const {
          data: { user: tokenUser },
          error: authError,
        } = await supabaseAdmin.auth.getUser(token);
        if (!authError && tokenUser) user = tokenUser;
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's current subscription with plan details
    // Include "trial", "active", "expired", and "cancelled" to properly check trial expiration
    const { data: subscription, error } = await supabaseAdmin
      .from("user_subscriptions")
      .select(
        `
          *,
          plan:subscription_plans(*)
        `,
      )
      .eq("user_id", user.id)
      .in("status", ["trial", "active", "expired", "cancelled"])
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      // PGRST116 means no rows found, which is not an error here.
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
