import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";

/**
 * Quick endpoint to manually create a trial subscription for current user
 * This is useful for existing users who don't have a subscription yet
 */
export async function POST(_request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Check if user already has a subscription
    const { data: existingSubscription } = await supabaseAdmin
      .from("user_subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (existingSubscription) {
      return NextResponse.json(
        {
          message: "You already have a subscription",
          subscription: existingSubscription,
        },
        { status: 200 },
      );
    }

    // Get the professional plan
    const { data: plan } = await supabaseAdmin
      .from("plans")
      .select("id")
      .eq("name", "professional")
      .single();

    if (!plan) {
      return NextResponse.json(
        { error: "Professional plan not found" },
        { status: 404 },
      );
    }

    // Create a 14-day trial subscription
    const trialStartDate = new Date();
    const trialEndDate = new Date(
      trialStartDate.getTime() + 14 * 24 * 60 * 60 * 1000,
    );

    const { data: newSubscription, error } = await supabaseAdmin
      .from("user_subscriptions")
      .insert({
        user_id: user.id,
        plan_id: plan.id,
        status: "trial",
        trial_start: trialStartDate.toISOString(),
        trial_end: trialEndDate.toISOString(),
        current_period_start: trialStartDate.toISOString(),
        current_period_end: trialEndDate.toISOString(),
        billing_cycle: "monthly",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating trial subscription:", error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message:
        "Trial created successfully! You now have 14 days of full access.",
      subscription: newSubscription,
      trialEnd: trialEndDate.toISOString(),
    });
  } catch (error) {
    console.error("Trial creation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create trial",
      },
      { status: 500 },
    );
  }
}
