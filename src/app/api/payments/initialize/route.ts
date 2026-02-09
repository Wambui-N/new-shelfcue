import { NextResponse } from "next/server";
import { generatePaymentReference, getPaystackService } from "@/lib/paystack";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  console.log("🔵 Payment initialization started");

  // Get auth from cookies (parse manually since this is an API route)
  const supabaseAdmin = getSupabaseAdmin();
  const cookieHeader = request.headers.get("cookie");
  let user = null;

  if (cookieHeader) {
    const cookies = cookieHeader.split(";").reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split("=");
        acc[key] = value;
        return acc;
      },
      {} as Record<string, string>,
    );

    // Look for supabase auth token in cookies
    const authCookieKeys = Object.keys(cookies).filter((k) =>
      k.includes("auth-token"),
    );
    for (const key of authCookieKeys) {
      try {
        const token = cookies[key];
        if (token) {
          const {
            data: { user: cookieUser },
            error: cookieError,
          } = await supabaseAdmin.auth.getUser(token);
          if (!cookieError && cookieUser) {
            user = cookieUser;
            break;
          }
        }
      } catch {
        // Continue to next cookie
      }
    }
  }

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
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Payment initialization error:", error);
    return NextResponse.json(
      {
        error: "Failed to initialize payment",
        details: message,
      },
      { status: 500 },
    );
  }
}
