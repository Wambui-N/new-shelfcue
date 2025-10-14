import { type NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paystack";
import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * Paystack Webhook Handler
 * Handles subscription lifecycle events from Paystack
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: IP whitelisting for additional security
    const clientIP = request.headers.get("x-forwarded-for") || 
                    request.headers.get("x-real-ip") || 
                    "unknown";
    
    const allowedIPs = [
      "52.31.139.75",
      "52.49.173.169", 
      "52.214.14.220"
    ];
    
    // Skip IP check in development
    if (process.env.NODE_ENV === "production" && !allowedIPs.includes(clientIP)) {
      console.error("❌ Webhook request from unauthorized IP:", clientIP);
      return NextResponse.json({ error: "Unauthorized IP" }, { status: 403 });
    }

    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature);
    if (!isValid) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);
    const supabase = getSupabaseAdmin();

    console.log("📨 Paystack webhook received:", event.event);

    // Handle different webhook events
    switch (event.event) {
      case "charge.success": {
        // Payment successful
        const data = event.data;
        const metadata = data.metadata || {};
        const userId = metadata.user_id;

        if (!userId) {
          console.error("No user_id in charge.success metadata");
          break;
        }

        // Update transaction
        await supabase
          .from("payment_transactions")
          .update({
            status: "success",
            paystack_transaction_id: data.id,
            authorization_code: data.authorization?.authorization_code,
            payment_method: data.channel,
            paid_at: data.paid_at,
            gateway_response: data.gateway_response,
          })
          .eq("paystack_reference", data.reference);

        // Store/update authorization if reusable
        if (data.authorization?.reusable) {
          await supabase.from("payment_authorizations").upsert(
            {
              user_id: userId,
              paystack_authorization_code:
                data.authorization.authorization_code,
              paystack_customer_code: data.customer.customer_code,
              card_type: data.authorization.card_type,
              card_last4: data.authorization.last4,
              card_exp_month: data.authorization.exp_month,
              card_exp_year: data.authorization.exp_year,
              bank: data.authorization.bank,
              channel: data.authorization.channel,
              is_reusable: data.authorization.reusable,
            },
            {
              onConflict: "paystack_authorization_code",
            },
          );
        }

        console.log(`✅ Charge successful for user ${userId}`);
        break;
      }

      case "subscription.create": {
        // Subscription created
        const data = event.data;
        const userId = data.customer.metadata?.user_id;

        if (!userId) {
          console.error("No user_id in subscription.create metadata");
          break;
        }

        // Update subscription with Paystack codes
        await supabase
          .from("user_subscriptions")
          .update({
            paystack_subscription_code: data.subscription_code,
            paystack_email_token: data.email_token,
            status: "active",
          })
          .eq("user_id", userId);

        console.log(`✅ Subscription created for user ${userId}`);
        break;
      }

      case "subscription.disable": {
        // Subscription disabled/cancelled
        const data = event.data;

        await supabase
          .from("user_subscriptions")
          .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
          })
          .eq("paystack_subscription_code", data.subscription_code);

        console.log(`🚫 Subscription disabled: ${data.subscription_code}`);
        break;
      }

      case "subscription.not_renew": {
        // Subscription set to not renew
        const data = event.data;

        await supabase
          .from("user_subscriptions")
          .update({
            status: "non-renewing",
            cancel_at_period_end: true,
          })
          .eq("paystack_subscription_code", data.subscription_code);

        console.log(`⏸️ Subscription not renewing: ${data.subscription_code}`);
        break;
      }

      case "invoice.create": {
        // New invoice created
        const data = event.data;
        const userId = data.customer?.metadata?.user_id;

        if (!userId) {
          console.error("No user_id in invoice.create metadata");
          break;
        }

        // Get subscription
        const { data: subscription } = await supabase
          .from("user_subscriptions")
          .select("id")
          .eq(
            "paystack_subscription_code",
            data.subscription?.subscription_code,
          )
          .single();

        // Create invoice record
        await supabase.from("invoices").insert({
          user_id: userId,
          subscription_id: subscription?.id,
          paystack_invoice_code: data.invoice_code,
          invoice_number: `INV-${data.id}`,
          amount: data.amount / 100, // Convert from kobo to naira
          currency: data.currency,
          status: "pending",
          description: data.description,
          due_date: data.due_date,
        });

        console.log(`📄 Invoice created for user ${userId}`);
        break;
      }

      case "invoice.update": {
        // Invoice updated
        const data = event.data;

        await supabase
          .from("invoices")
          .update({
            status: data.status === "success" ? "paid" : data.status,
            paid_at: data.paid_at,
          })
          .eq("paystack_invoice_code", data.invoice_code);

        console.log(`📝 Invoice updated: ${data.invoice_code}`);
        break;
      }

      case "invoice.payment_failed": {
        // Invoice payment failed
        const data = event.data;

        // Update invoice status
        await supabase
          .from("invoices")
          .update({
            status: "failed",
          })
          .eq("paystack_invoice_code", data.invoice_code);

        // Update subscription status to attention
        if (data.subscription?.subscription_code) {
          await supabase
            .from("user_subscriptions")
            .update({
              status: "attention",
            })
            .eq(
              "paystack_subscription_code",
              data.subscription.subscription_code,
            );
        }

        console.log(`❌ Invoice payment failed: ${data.invoice_code}`);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled webhook event: ${event.event}`);
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
