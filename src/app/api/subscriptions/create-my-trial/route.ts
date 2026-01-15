import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Quick endpoint to manually create a trial subscription for current user
 * This is useful for existing users who don't have a subscription yet
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

    // Check if user already has a subscription
    const { data: existingSubscription } = await supabaseAdmin
      .from("user_subscriptions")
      .select("id, status, trial_end")
      .eq("user_id", user.id)
      .maybeSingle();

    // If subscription exists and is inactive or has null trial_end, fix it
    if (existingSubscription) {
      const status = (existingSubscription as any).status;
      const trialEnd = (existingSubscription as any).trial_end;

      // Fix broken subscription: inactive or missing trial_end
      if (status === "inactive" || !trialEnd) {
        console.log("🔧 Fixing broken subscription for user:", user.id);
        
        const trialStartDate = new Date();
        const trialEndDate = new Date(
          trialStartDate.getTime() + 14 * 24 * 60 * 60 * 1000,
        );

        const { data: fixedSubscription, error: updateError } = await supabaseAdmin
          .from("user_subscriptions")
          .update({
            status: "trial",
            trial_start: trialStartDate.toISOString(),
            trial_end: trialEndDate.toISOString(),
            current_period_start: trialStartDate.toISOString(),
            current_period_end: trialEndDate.toISOString(),
          })
          .eq("id", (existingSubscription as any).id)
          .select()
          .single();

        if (updateError) {
          console.error("Error fixing subscription:", updateError);
          throw updateError;
        }

        return NextResponse.json({
          success: true,
          message: "Your trial has been activated! You now have 14 days of full access.",
          subscription: fixedSubscription,
          trialEnd: trialEndDate.toISOString(),
          fixed: true,
        });
      }

      // Already has a valid subscription
      return NextResponse.json(
        { message: "You already have an active subscription", subscription: existingSubscription },
        { status: 200 },
      );
    }

    // Get the professional plan
    const { data: plan } = await (supabaseAdmin as any)
      .from("subscription_plans")
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
      message: "Trial created successfully! You now have 14 days of full access.",
      subscription: newSubscription,
      trialEnd: trialEndDate.toISOString(),
    });
  } catch (error) {
    console.error("Trial creation error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create trial",
      },
      { status: 500 },
    );
  }
}

