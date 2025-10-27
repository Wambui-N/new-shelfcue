import { NextResponse } from "next/server";
import { generatePaymentReference, getPaystackService } from "@/lib/paystack";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  console.log("🔵 Payment initialization started");

  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log("❌ No authenticated user");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("👤 User:", user.email);

  try {
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

    const reference = generatePaymentReference(user.id);
    console.log("📝 Generated reference:", reference);

    const paystack = getPaystackService();
    // Paystack requires a minimum amount, so charge $0.50 for trials
    const chargeAmount = is_trial ? 50 : amount;

    if (!user.email) {
      return NextResponse.json({ error: "User has no email" }, { status: 400 });
    }

    console.log(
      "💳 Charge amount:",
      chargeAmount,
      is_trial ? "(trial)" : "(full)",
    );

    console.log("🚀 Initializing Paystack transaction...");
    const initResponse = await paystack.initializeTransaction({
      email: user.email,
      amount: chargeAmount,
      reference,
      plan: plan_code,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing/verify`,
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
      console.error("❌ Paystack initialization failed:", initResponse.message);
      return NextResponse.json(
        { error: initResponse.message || "Failed to initialize payment" },
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

    return NextResponse.json({
      authorization_url: initResponse.data.authorization_url,
      reference: initResponse.data.reference,
      access_code: initResponse.data.access_code,
    });
  } catch (error) {
    console.error("❌ Payment initialization error:", error);
    return NextResponse.json(
      {
        error: "Failed to initialize payment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
