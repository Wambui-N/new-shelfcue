import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { Subscription } from "@/hooks/useSubscription";

export async function GET() {
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Calculate days since account creation
  const accountCreatedAt = new Date(user.created_at);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - accountCreatedAt.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const trialDaysRemaining = Math.max(0, 15 - diffDays); // Use 15 to include the last day
  const isInInitialTrial = diffDays <= 14;

  // Get user's current subscription with plan details (if exists)
  const { data: subscription, error } = await supabase
    .from("user_subscriptions")
    .select(
      `
        *,
        plan:plans(*)
      `,
    )
    .eq("user_id", user.id)
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

  // If user is in their initial 14-day trial and has no subscription record yet,
  // create a virtual trial subscription for the frontend
  let finalSubscription: Subscription | null = subscription;
  if (isInInitialTrial && !subscription) {
    finalSubscription = {
      id: "initial-trial",
      user_id: user.id,
      plan_id: null,
      status: "trial",
      trial_start: accountCreatedAt.toISOString(),
      trial_end: new Date(
        accountCreatedAt.getTime() + 14 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      current_period_start: accountCreatedAt.toISOString(),
      current_period_end: new Date(
        accountCreatedAt.getTime() + 14 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      billing_cycle: "monthly",
      cancel_at_period_end: false,
      plan: {
        id: "trial",
        name: "trial",
        display_name: "Free Trial",
        limits: {
          forms: -1, // unlimited
          submissions_per_month: -1, // unlimited
          storage_mb: 1000,
          team_members: 1,
          analytics: "basic",
          support: "email",
        },
      },
    } as Subscription;
  }

  return NextResponse.json({
    subscription: finalSubscription || null,
    usage: {
      forms_count: formsCount || 0,
    },
    account_created_at: user.created_at,
    trial_days_remaining: trialDaysRemaining,
  });
}
