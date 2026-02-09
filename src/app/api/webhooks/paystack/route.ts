import { type NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paystack";
import { EmailService } from "@/lib/resend";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Paystack Webhook Handler
 * Handles subscription lifecycle events from Paystack
 */
export async function POST(request: NextRequest) {
  try {
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
        const isTrial = metadata.is_trial === true;

        if (!userId) {
          console.error("No user_id in charge.success metadata");
          break;
        }

        // Update transaction
        await (supabase as any)
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
          await (supabase as any).from("payment_authorizations").upsert(
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

        // If this was a paid subscription (not trial), set subscription to active
        // so the user sees "active" even if they never hit the verify page
        if (!isTrial) {
          const now = new Date();
          const periodEnd = new Date(now);
          periodEnd.setMonth(periodEnd.getMonth() + 1);
          await (supabase as any)
            .from("user_subscriptions")
            .update({
              status: "active",
              current_period_start: now.toISOString(),
              current_period_end: periodEnd.toISOString(),
              paystack_customer_code: data.customer?.customer_code ?? undefined,
            })
            .eq("user_id", userId);
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
        await (supabase as any)
          .from("user_subscriptions")
          .update({
            paystack_subscription_code: data.subscription_code,
            paystack_email_token: data.email_token,
            status: "active",
          })
          .eq("user_id", userId);

        // Send confirmation email
        const { data: profile } = await (supabase as any)
          .from("profiles")
          .select("email, full_name")
          .eq("id", userId)
          .single();

        const { data: subscription } = await (supabase as any)
          .from("user_subscriptions")
          .select("plan:subscription_plans(*)")
          .eq("user_id", userId)
          .single();

        if ((profile as any)?.email && subscription) {
          const plan = (subscription as any).plan;
          await EmailService.sendSubscriptionConfirmation(
            (profile as any).email,
            {
              userName: (profile as any).full_name || "there",
              planName: plan?.name || "Premium",
              amount: `₦${(data.amount / 100).toLocaleString()}`,
              billingCycle: plan?.billing_interval || "monthly",
            },
          );
        }

        console.log(`✅ Subscription created for user ${userId}`);
        break;
      }

      case "subscription.disable": {
        // Subscription disabled/cancelled
        const data = event.data;

        // Get subscription details before updating
        const { data: subscriptionData } = await supabase
          .from("user_subscriptions")
          .select(`
            user_id,
            current_period_end,
            profiles!user_subscriptions_user_id_fkey(email, full_name),
            plan:subscription_plans(name)
          `)
          .eq("paystack_subscription_code", data.subscription_code)
          .single();

        await (supabase as any)
          .from("user_subscriptions")
          .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
          })
          .eq("paystack_subscription_code", data.subscription_code);

        // Send cancellation email
        if (subscriptionData) {
          const profile = (subscriptionData as any).profiles;
          const plan = (subscriptionData as any).plan;

          if (profile?.email) {
            await EmailService.sendSubscriptionCancelledNotification(
              profile.email,
              {
                userName: profile.full_name || "there",
                planName: plan?.name || "Premium",
                endDate: (subscriptionData as any).current_period_end,
              },
            );
          }
        }

        console.log(`🚫 Subscription disabled: ${data.subscription_code}`);
        break;
      }

      case "subscription.not_renew": {
        // Subscription set to not renew
        const data = event.data;

        await (supabase as any)
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
        const { data: subscription } = await (supabase as any)
          .from("user_subscriptions")
          .select("id")
          .eq(
            "paystack_subscription_code",
            data.subscription?.subscription_code,
          )
          .single();

        // Create invoice record
        const invoiceNumber = `INV-${data.id}`;
        await (supabase as any).from("invoices").insert({
          user_id: userId,
          subscription_id: (subscription as any)?.id,
          paystack_invoice_code: data.invoice_code,
          invoice_number: invoiceNumber,
          amount: data.amount / 100, // Convert from kobo to naira
          currency: data.currency,
          status: "pending",
          description: data.description,
          due_date: data.due_date,
        });

        // Send invoice email
        const { data: profile } = await (supabase as any)
          .from("profiles")
          .select("email, full_name")
          .eq("id", userId)
          .single();

        if ((profile as any)?.email) {
          await EmailService.sendInvoiceNotification((profile as any).email, {
            userName: (profile as any).full_name || "there",
            invoiceNumber,
            amount: `₦${(data.amount / 100).toLocaleString()}`,
            dueDate: data.due_date,
          });
        }

        console.log(`📄 Invoice created for user ${userId}`);
        break;
      }

      case "invoice.update": {
        // Invoice updated
        const data = event.data;

        await (supabase as any)
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

        // Get invoice details
        const { data: invoice } = await (supabase as any)
          .from("invoices")
          .select(`
            user_id,
            amount,
            profiles!invoices_user_id_fkey(email, full_name)
          `)
          .eq("paystack_invoice_code", data.invoice_code)
          .single();

        // Update invoice status
        await (supabase as any)
          .from("invoices")
          .update({
            status: "failed",
          })
          .eq("paystack_invoice_code", data.invoice_code);

        // Update subscription status to attention
        if (data.subscription?.subscription_code) {
          await (supabase as any)
            .from("user_subscriptions")
            .update({
              status: "attention",
            })
            .eq(
              "paystack_subscription_code",
              data.subscription.subscription_code,
            );
        }

        // Send payment failed email
        if (invoice) {
          const profile = (invoice as any).profiles;
          if (profile?.email) {
            await EmailService.sendPaymentFailedNotification(profile.email, {
              userName: profile.full_name || "there",
              amount: `₦${((invoice as any).amount).toLocaleString()}`,
              reason: data.gateway_response,
            });
          }
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
