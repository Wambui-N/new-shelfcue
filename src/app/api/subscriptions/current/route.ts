import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user's current subscription with plan details
  const { data: subscription, error } = await supabase
    .from("user_subscriptions")
    .select(
      `
        *,
        plan:subscription_plans(*)
      `,
    )
    .eq("user_id", user.id)
    .in("status", ["trialing", "active"])
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 means no rows found, which is not an error here.
    console.error("Error fetching subscription:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get total forms count
  const { count: formsCount, error: formsError } = await supabase
    .from("forms")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (formsError) {
    console.error("Error fetching forms count:", formsError);
    return NextResponse.json({ error: formsError.message }, { status: 500 });
  }

  return NextResponse.json({
    subscription: subscription || null,
    usage: {
      forms_count: formsCount || 0,
    },
  });
}
