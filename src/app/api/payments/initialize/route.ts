import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { generatePaymentReference, getPaystackService } from "@/lib/paystack";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST(request: Request) {
  console.log("🔵 Payment initialization started");

  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({
      cookies: (() => cookieStore) as unknown as () => ReturnType<typeof cookies>,
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("❌ No authenticated user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("👤 User:", user.email);
    const body = await request.json();
    const { amount, is_trial = false, plan_code } = body;

    console.log("💰 Payment details:", { amount, is_trial, plan_code });

    if (!plan_code) {
      console.error("❌ Plan code not provided in request body");
      return NextResponse.json(
        { error: "Plan code is required for payment initialization" },
        { status: 400 },
      );
    }

    // Validate Paystack configuration early so we can return a clear error
    if (!process.env.PAYSTACK_SECRET_KEY) {
      console.error("❌ PAYSTACK_SECRET_KEY is not set");
      return NextResponse.json(
        {
          error: "Payment provider not configured",
          details: "PAYSTACK_SECRET_KEY is not set in environment variables",
        },
        { status: 500 },
      );
    }

    const reference = generatePaymentReference(user.id);
    console.log("📝 Generated reference:", reference);

    const paystack = getPaystackService();
    // Paystack requires a minimum amount, so charge $0.50 for trials
    const chargeAmount = is_trial ? 50 : amount;

    console.log(
      "💳 Charge amount:",
      chargeAmount,
      is_trial ? "(trial)" : "(full)",
    );

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const callbackUrl = `${baseUrl}/dashboard/billing/verify`;

    console.log("🚀 Initializing Paystack transaction...");
    const initResponse = await paystack.initializeTransaction({
      email: user.email!,
      amount: chargeAmount,
      reference,
      plan: plan_code,
      currency: "USD",
      callback_url: callbackUrl,
      metadata: {
        user_id: user.id,
        subscription_type: "professional",
        is_trial,
      },
    });

    console.log("📡 Paystack response:", {
      status: initResponse.status,
      message: initResponse.message,
      hasData: !!initResponse.data,
    });

    if (!initResponse.status || !initResponse.data) {
      const paystackMessage =
        initResponse.message || "Failed to initialize payment";
      console.error("❌ Paystack initialization failed:", paystackMessage);
      return NextResponse.json(
        {
          error: paystackMessage,
          details: paystackMessage,
        },
        { status: 500 },
      );
    }

    // Create a pending transaction record using the actual database schema
    console.log("💾 Creating transaction record...");
    console.log("📝 Transaction details:", {
      user_id: user.id,
      paystack_reference: reference,
      amount: chargeAmount / 100,
      currency: "USD",
      status: "pending",
    });

    const supabaseAdmin = getSupabaseAdmin();

    const { data: transactionData, error: transactionError } =
      await supabaseAdmin
        .from("payment_transactions")
        .insert({
          user_id: user.id,
          paystack_reference: reference,
          amount: chargeAmount / 100, // Convert from cents to dollars
          currency: "USD",
          status: "pending",
          metadata: {
            user_id: user.id,
            subscription_type: "professional",
            is_trial,
          },
        })
        .select()
        .single();

    if (transactionError) {
      console.error("❌ Error creating transaction record:", transactionError);
      console.error("Transaction error details:", {
        message: transactionError.message,
        details: transactionError.details,
        hint: transactionError.hint,
        code: transactionError.code,
      });
      // Don't fail the initialization, just log the error
      // We'll continue with Paystack initialization even if DB insert fails
    } else {
      console.log(
        "✅ Transaction record created successfully:",
        transactionData,
      );
    }

    // PostHog: Capture payment_initiated event (server-side)
    try {
      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: user.id,
        event: "payment_initiated",
        properties: {
          reference,
          amount_cents: chargeAmount,
          currency: "USD",
          is_trial,
          plan_code,
          email: user.email,
        },
      });
      await posthog.shutdown();
    } catch (posthogError) {
      console.warn("PostHog capture failed:", posthogError);
    }

    return NextResponse.json({
      authorization_url: initResponse.data.authorization_url,
      reference: initResponse.data.reference,
      access_code: initResponse.data.access_code,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);
    console.error("❌ Payment initialization error:", error);
    return NextResponse.json(
      {
        error: "Failed to initialize payment",
        details: message || "Unknown error",
      },
      { status: 500 },
    );
  }
}
