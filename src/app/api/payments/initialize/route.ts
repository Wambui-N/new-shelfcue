import { type NextRequest, NextResponse } from "next/server";
import {
  generatePaymentReference,
  getPaystackService,
  nairaToKobo,
} from "@/lib/paystack";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    console.log("🔵 Payment initialization started");
    const supabase = getSupabaseAdmin();
    const body = await request.json();

    console.log("📝 Request body:", body);
    const { email, amount = 2900 } = body; // Default to $29.00 in cents

    if (!email) {
      console.log("❌ No email provided");
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 },
      );
    }

    // Get authenticated user
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate unique reference
    const reference = generatePaymentReference(user.id);

    // Get Paystack service
    const paystack = getPaystackService();

    // Initialize transaction (following official Paystack docs)
    const initResponse = await paystack.initializeTransaction({
      email: user.email || "",
      amount: amount, // Amount in cents
      reference,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing/verify`,
      metadata: {
        user_id: user.id,
        subscription_type: "professional",
        custom_fields: [
          {
            display_name: "User ID",
            variable_name: "user_id",
            value: user.id,
          },
          {
            display_name: "Subscription",
            variable_name: "subscription",
            value: "Professional Plan",
          },
        ],
      },
    });

    console.log("📤 Paystack response:", initResponse);

    if (!initResponse.status) {
      console.error("❌ Paystack initialization failed:", initResponse.message);
      return NextResponse.json(
        { error: initResponse.message || "Failed to initialize payment" },
        { status: 500 },
      );
    }

    // Store transaction record
    await supabase.from("payment_transactions").insert({
      user_id: user.id,
      paystack_reference: reference,
      amount: amount / 100, // Convert from cents to dollars for storage
      currency: "USD",
      status: "pending",
      metadata: {
        subscription_type: "professional",
      },
    } as any);

    console.log("✅ Transaction initialized successfully");

    return NextResponse.json({
      authorization_url: initResponse.data.authorization_url,
      reference: initResponse.data.reference,
      access_code: initResponse.data.access_code,
    });
  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to initialize payment",
      },
      { status: 500 },
    );
  }
}
