import { NextResponse } from "next/server";
import {
  generatePaymentReference,
  getPaystackService,
} from "@/lib/paystack";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { amount = 2900, is_trial = false } = body; // Default to $29.00 in cents

    const reference = generatePaymentReference(user.id);
    const paystack = getPaystackService();
    const chargeAmount = is_trial ? 50 : amount;

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

    if (!initResponse.status || !initResponse.data) {
      console.error("Paystack initialization failed:", initResponse.message);
      return NextResponse.json(
        { error: initResponse.message || "Failed to initialize payment" },
        { status: 500 },
      );
    }

    // Since this is initialization, we don't store a transaction record yet.
    // We wait for the webhook or verification callback.

    return NextResponse.json({
      authorization_url: initResponse.data.authorization_url,
      reference: initResponse.data.reference,
      access_code: initResponse.data.access_code,
    });
  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 },
    );
  }
}
