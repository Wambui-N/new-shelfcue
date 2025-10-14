import { type NextRequest, NextResponse } from "next/server";
import { getPaystackService } from "@/lib/paystack";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
	try {
		console.log("🔵 Payment verification started");
		const supabase = getSupabaseAdmin();
		const searchParams = request.nextUrl.searchParams;
		const reference = searchParams.get("reference");

		console.log("📝 Reference:", reference);

		if (!reference) {
			console.log("❌ No reference provided");
			return NextResponse.json(
				{ error: "Payment reference is required" },
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

		console.log("👤 User:", user.email);

    // Verify transaction with Paystack
    const paystack = getPaystackService();
    const verification = await paystack.verifyTransaction(reference);

    if (!verification.status || verification.data.status !== "success") {
      // Update transaction as failed
      await supabase
        .from("payment_transactions")
        .update({
          status: "failed",
          gateway_response: verification.data.status,
        })
        .eq("paystack_reference", reference);

      return NextResponse.json(
        { error: "Payment verification failed", data: verification.data },
        { status: 400 },
      );
    }

    const txData = verification.data;

    // Get transaction metadata
    const { data: transaction } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("paystack_reference", reference)
      .single();

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );
    }

		// Update transaction record
		await supabase
			.from("payment_transactions")
			.update({
				status: "success",
				paystack_transaction_id: txData.id,
				authorization_code: txData.authorization.authorization_code,
				payment_method: txData.channel,
				paid_at: txData.paid_at,
				gateway_response: txData.status,
			})
			.eq("paystack_reference", reference);

		// Store authorization details
		await supabase.from("payment_authorizations").upsert(
			{
				user_id: user.id,
				paystack_authorization_code: txData.authorization.authorization_code,
				paystack_customer_code: txData.customer.customer_code,
				card_type: txData.authorization.card_type,
				card_last4: txData.authorization.last4,
				card_exp_month: txData.authorization.exp_month,
				card_exp_year: txData.authorization.exp_year,
				bank: txData.authorization.bank,
				channel: txData.authorization.channel,
				is_reusable: txData.authorization.reusable,
				is_default: true,
			} as any,
			{
				onConflict: "paystack_authorization_code",
			},
		);

		// Get professional plan
		const { data: plan } = await supabase
			.from("subscription_plans")
			.select("*")
			.eq("name", "professional")
			.single();

		if (!plan) {
			console.error("❌ Professional plan not found");
			return NextResponse.json(
				{ error: "Subscription plan not found" },
				{ status: 500 },
			);
		}

		// Activate subscription
		const now = new Date();
		const periodEnd = new Date(now);
		periodEnd.setMonth(periodEnd.getMonth() + 1);

		await supabase
			.from("user_subscriptions")
			.upsert({
				user_id: user.id,
				plan_id: plan.id,
				paystack_customer_code: txData.customer.customer_code,
				status: "active",
				billing_cycle: "monthly",
				current_period_start: now.toISOString(),
				current_period_end: periodEnd.toISOString(),
				cancel_at_period_end: false,
				cancelled_at: null,
			} as any, {
				onConflict: "user_id"
			});

		console.log("✅ Subscription activated for user:", user.email);

		// Create invoice
		const invoiceNumber = `INV-${Date.now()}-${user.id.substring(0, 8)}`;
		await supabase.from("invoices").insert({
			user_id: user.id,
			invoice_number: invoiceNumber,
			amount: txData.amount / 100, // Convert from cents to dollars
			currency: "USD",
			status: "paid",
			paid_at: txData.paid_at,
		} as any);

		// Update transaction with subscription ID
		const { data: newSubscription } = await supabase
			.from("user_subscriptions")
			.select("id")
			.eq("user_id", user.id)
			.single();

		if (newSubscription) {
			await supabase
				.from("payment_transactions")
				.update({ subscription_id: newSubscription.id })
				.eq("paystack_reference", reference);
		}

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      subscription: {
        status: "active",
        billing_cycle: "monthly",
        current_period_end: periodEnd.toISOString(),
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Payment verification failed",
      },
      { status: 500 },
    );
  }
}
