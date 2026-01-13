import { type NextRequest, NextResponse } from "next/server";
import { getPaystackService } from "@/lib/paystack";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

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

    console.log("🔍 Paystack verification response:", {
      status: verification.status,
      dataStatus: verification.data?.status,
      message: verification.message,
    });

    if (!verification.status || verification.data.status !== "success") {
      console.log("❌ Payment verification failed:", verification);

      // Update transaction as failed
      await (supabase as any)
        .from("payment_transactions")
        .update({
          status: "failed",
          gateway_response: verification.data?.status || "unknown",
        })
        .eq("paystack_reference", reference);

      return NextResponse.json(
        {
          error: "Payment verification failed",
          details: verification.message,
          paystackStatus: verification.data?.status,
          data: verification.data,
        },
        { status: 400 },
      );
    }

    const txData = verification.data;

    // Get transaction metadata using the correct column name
    console.log(
      "🔍 Looking for transaction with paystack_reference:",
      reference,
    );

    const { data: transaction, error: txQueryError } = await (supabase as any)
      .from("payment_transactions")
      .select("*")
      .eq("paystack_reference", reference)
      .single();

    if (txQueryError) {
      console.error("❌ Error querying transaction:", txQueryError);
    }

    console.log("📊 Transaction query result:", {
      found: !!transaction,
      transaction: transaction,
      error: txQueryError,
    });

    if (!transaction) {
      console.error(
        "❌ Transaction not found in database for paystack_reference:",
        reference,
      );

      // Create the transaction record if it doesn't exist (payment was successful on Paystack)
      console.log("🔄 Creating transaction record from Paystack data...");
      const { data: newTransaction, error: createError } = await (
        supabase as any
      )
        .from("payment_transactions")
        .insert({
          user_id: user.id,
          paystack_reference: reference,
          paystack_transaction_id: txData.id,
          amount: txData.amount / 100, // Convert from kobo to dollars
          currency: txData.currency,
          status: "success",
          payment_method: txData.channel,
          authorization_code: txData.authorization.authorization_code,
          paid_at: txData.paid_at,
          gateway_response: txData.status,
          metadata: {
            user_id: user.id,
            subscription_type: "professional",
            is_trial: txData.metadata?.is_trial === true,
          },
        })
        .select()
        .single();

      if (createError) {
        console.error("❌ Error creating transaction record:", createError);
        return NextResponse.json(
          {
            error: "Transaction not found and could not be created",
            details: createError.message,
          },
          { status: 404 },
        );
      }

      console.log(
        "✅ Transaction record created from Paystack data:",
        newTransaction,
      );
      // Continue with the newly created transaction
    }

    // Update transaction record to success with Paystack details
    await (supabase as any)
      .from("payment_transactions")
      .update({
        status: "success",
        paystack_transaction_id: txData.id,
        payment_method: txData.channel,
        authorization_code: txData.authorization.authorization_code,
        paid_at: txData.paid_at,
        gateway_response: txData.status,
      })
      .eq("paystack_reference", reference);

    // Store authorization details
    await (supabase as any).from("payment_authorizations").upsert(
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
    const { data: plan } = await (supabase as any)
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

    // Check if this is a trial signup from Paystack metadata
    const isTrial = txData.metadata?.is_trial === true;

    // Activate subscription
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 14); // 14 days trial
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await (supabase as any).from("user_subscriptions").upsert(
      {
        user_id: user.id,
        plan_id: plan.id,
        paystack_customer_code: txData.customer.customer_code,
        status: isTrial ? "trial" : "active",
        billing_cycle: "monthly",
        trial_start: isTrial ? now.toISOString() : null,
        trial_end: isTrial ? trialEnd.toISOString() : null,
        current_period_start: now.toISOString(),
        current_period_end: isTrial
          ? trialEnd.toISOString()
          : periodEnd.toISOString(),
        cancel_at_period_end: false,
        cancelled_at: null,
      } as any,
      {
        onConflict: "user_id",
      },
    );

    console.log(
      `✅ Subscription ${isTrial ? "trial started" : "activated"} for user:`,
      user.email,
    );

    // Create invoice
    const invoiceNumber = `INV-${Date.now()}-${user.id.substring(0, 8)}`;
    await (supabase as any).from("invoices").insert({
      user_id: user.id,
      invoice_number: invoiceNumber,
      amount: txData.amount / 100, // Convert from cents to dollars
      currency: "USD",
      status: "paid",
      paid_at: txData.paid_at,
    } as any);

    // Update transaction with subscription ID
    const { data: newSubscription } = await (supabase as any)
      .from("user_subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (newSubscription) {
      await (supabase as any)
        .from("payment_transactions")
        .update({ subscription_id: (newSubscription as any).id })
        .eq("paystack_reference", reference);
    }

    return NextResponse.json({
      success: true,
      message: isTrial
        ? "Trial started successfully"
        : "Payment verified successfully",
      subscription: {
        status: isTrial ? "trial" : "active",
        billing_cycle: "monthly",
        trial_end: isTrial ? trialEnd.toISOString() : null,
        current_period_end: isTrial
          ? trialEnd.toISOString()
          : periodEnd.toISOString(),
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
