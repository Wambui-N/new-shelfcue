import { NextResponse } from "next/server";
import {
  generatePaymentReference,
  getPaystackService,
} from "@/lib/paystack";
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
    const { amount = 2900, is_trial = false } = body; // Default to $29.00 in cents

    console.log("💰 Payment details:", { amount, is_trial });

    const reference = generatePaymentReference(user.id);
    console.log("📝 Generated reference:", reference);
    
    const paystack = getPaystackService();
    const chargeAmount = is_trial ? 0 : amount;
    
    console.log("💳 Charge amount:", chargeAmount);

    console.log("🚀 Initializing Paystack transaction...");
    const initResponse = await paystack.initializeTransaction({
      email: user.email!,
      amount: chargeAmount,
      reference,
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
      hasData: !!initResponse.data
    });

    if (!initResponse.status || !initResponse.data) {
      console.error("❌ Paystack initialization failed:", initResponse.message);
      return NextResponse.json(
        { error: initResponse.message || "Failed to initialize payment" },
        { status: 500 },
      );
    }

    // Create a pending transaction record
    console.log("💾 Creating transaction record...");
    const { error: transactionError } = await supabase
      .from("payment_transactions")
      .insert({
        user_id: user.id,
        paystack_reference: reference,
        amount: chargeAmount / 100, // Convert from cents to dollars
        currency: "USD",
        status: "pending",
        payment_method: "card",
        metadata: {
          user_id: user.id,
          subscription_type: "professional",
          is_trial,
        },
      } as any);

    if (transactionError) {
      console.error("❌ Error creating transaction record:", transactionError);
      // Don't fail the initialization, just log the error
    } else {
      console.log("✅ Transaction record created successfully");
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
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 },
    );
  }
}
