import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getPostHogClient } from "@/lib/posthog-server";

/**
 * Create a trial subscription for a new user
 */
export async function POST(request: NextRequest) {
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

    const { planId } = await request.json();

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 },
      );
    }

    // Check if user already has a subscription
    const { data: existingSubscription } = await supabaseAdmin
      .from("user_subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingSubscription) {
      return NextResponse.json(
        { message: "User already has a subscription" },
        { status: 200 },
      );
    }

    // Create a 14-day trial subscription
    const trialStartDate = new Date();
    const trialEndDate = new Date(
      trialStartDate.getTime() + 14 * 24 * 60 * 60 * 1000,
    );

    const { error } = await supabaseAdmin.from("user_subscriptions").insert({
      user_id: user.id,
      plan_id: planId,
      status: "trial",
      trial_start: trialStartDate.toISOString(),
      trial_end: trialEndDate.toISOString(),
      current_period_start: trialStartDate.toISOString(),
      current_period_end: trialEndDate.toISOString(),
      billing_cycle: "monthly",
    });

    if (error) {
      console.error("Error creating trial subscription:", error);
      throw error;
    }

    // PostHog: Capture trial_started event (server-side)
    try {
      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: user.id,
        event: "trial_started",
        properties: {
          plan_id: planId,
          trial_days: 14,
          trial_start: trialStartDate.toISOString(),
          trial_end: trialEndDate.toISOString(),
          email: user.email,
        },
      });
      posthog.identify({
        distinctId: user.id,
        properties: {
          email: user.email,
          subscription_status: "trial",
        },
      });
      await posthog.shutdown();
    } catch (posthogError) {
      console.warn("PostHog capture failed:", posthogError);
    }

    return NextResponse.json({ success: true, message: "Trial created" });
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
