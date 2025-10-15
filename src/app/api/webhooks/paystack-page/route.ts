import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyWebhookSignature } from "@/lib/paystack";

/**
 * Webhook handler for Paystack payment page subscriptions
 */
export async function POST(request: NextRequest) {
	try {
		// Get raw body for signature verification
		const body = await request.text();
		const signature = request.headers.get("x-paystack-signature");

		if (!signature) {
			return NextResponse.json(
				{ error: "Missing signature" },
				{ status: 400 },
			);
		}

		// Verify webhook signature
		const isValid = verifyWebhookSignature(body, signature);
		if (!isValid) {
			console.error("Invalid webhook signature");
			return NextResponse.json(
				{ error: "Invalid signature" },
				{ status: 401 },
			);
		}

		const event = JSON.parse(body);
		const supabase = getSupabaseAdmin();

		console.log("📨 Paystack payment page webhook received:", event.event);

		// Handle subscription creation from payment page
		if (event.event === "subscription.create") {
			const data = event.data;
			
			// Find user by email
			const { data: users } = await supabase.auth.admin.listUsers();
			const user = (users as any)?.users?.find((u: any) => u.email === data.customer.email);

			if (!user) {
				console.error("User not found for email:", data.customer.email);
				return NextResponse.json({ received: true });
			}

			// Get professional plan
			const { data: plan } = await (supabase as any)
				.from("subscription_plans")
				.select("*")
				.eq("name", "professional")
				.single();

			if (!plan) {
				console.error("Professional plan not found");
				return NextResponse.json({ received: true });
			}

			// Update or create subscription
			const now = new Date();
			const periodEnd = new Date(now);
			periodEnd.setMonth(periodEnd.getMonth() + 1);

			await (supabase as any)
				.from("user_subscriptions")
				.upsert({
					user_id: user.id,
					plan_id: (plan as any).id,
					paystack_customer_code: data.customer.customer_code,
					paystack_subscription_code: data.subscription_code,
					paystack_email_token: data.email_token,
					status: "active",
					billing_cycle: "monthly",
					current_period_start: now.toISOString(),
					current_period_end: periodEnd.toISOString(),
				}, {
					onConflict: "user_id"
				});

			console.log(`✅ Subscription activated for user ${user.email}`);
		}

		// Handle successful payments
		if (event.event === "charge.success") {
			const data = event.data;
			
			// Find user by email
			const { data: users } = await supabase.auth.admin.listUsers();
			const user = (users as any)?.users?.find((u: any) => u.email === data.customer.email);

			if (user) {
				// Create transaction record
				await (supabase as any).from("payment_transactions").insert({
					user_id: user.id,
					paystack_reference: data.reference,
					amount: data.amount / 100, // Convert from kobo to naira
					currency: data.currency,
					status: "success",
					payment_method: data.channel,
					paid_at: data.paid_at,
					gateway_response: data.gateway_response,
				});

				// Store authorization if reusable
				if (data.authorization?.reusable) {
					await (supabase as any).from("payment_authorizations").upsert({
						user_id: user.id,
						paystack_authorization_code: data.authorization.authorization_code,
						paystack_customer_code: data.customer.customer_code,
						card_type: data.authorization.card_type,
						card_last4: data.authorization.last4,
						card_exp_month: data.authorization.exp_month,
						card_exp_year: data.authorization.exp_year,
						bank: data.authorization.bank,
						channel: data.authorization.channel,
						is_reusable: data.authorization.reusable,
						is_default: true,
					}, {
						onConflict: "paystack_authorization_code"
					});
				}

				console.log(`✅ Payment recorded for user ${user.email}`);
			}
		}

		return NextResponse.json({ received: true });
	} catch (error) {
		console.error("Webhook processing error:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Webhook processing failed",
			},
			{ status: 500 },
		);
	}
}
