import { type NextRequest, NextResponse } from "next/server";
import { getPaystackService } from "@/lib/paystack";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subscriptionId } = await request.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Get the subscription to find the paystack subscription code
    const { data: subscription, error: subError } = await supabaseAdmin
      .from("user_subscriptions")
      .select("paystack_subscription_code, status")
      .eq("id", subscriptionId)
      .eq("user_id", user.id)
      .single();

    if (subError || !subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      );
    }

    if (
      subscription.status === "cancelled" ||
      subscription.status === "non-renewing"
    ) {
      return NextResponse.json(
        { error: "Subscription is already set to cancel" },
        { status: 400 },
      );
    }

    const paystack = getPaystackService();

    // Disable the subscription on Paystack
    await paystack.disableSubscription(subscription.paystack_subscription_code);

    // Update the subscription in the database
    const { error: updateError } = await supabaseAdmin
      .from("user_subscriptions")
      .update({
        status: "non-renewing",
        cancel_at_period_end: true,
      })
      .eq("id", subscriptionId);

    if (updateError) {
      // Re-enable on Paystack if db update fails to keep things in sync
      await paystack.enableSubscription(subscription.paystack_subscription_code);
      throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
