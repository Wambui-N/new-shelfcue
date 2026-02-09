import { type NextRequest, NextResponse } from "next/server";
import { EmailService } from "@/lib/resend";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const DASHBOARD_URL = `${APP_URL}/dashboard`;
const BILLING_URL = `${APP_URL}/dashboard/billing`;

/**
 * Cron endpoint: send trial reminder (day 7), trial ending soon (day 12), and trial expired emails.
 * Call daily (e.g. 01:00 UTC). Protect with CRON_SECRET.
 */
export async function GET(request: NextRequest) {
  return runTrialEmails(request);
}

export async function POST(request: NextRequest) {
  return runTrialEmails(request);
}

async function runTrialEmails(request: NextRequest) {
  try {
    const secret =
      request.headers.get("authorization")?.replace("Bearer ", "") ||
      request.headers.get("x-cron-secret") ||
      "";
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && secret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const now = new Date();
    const results = { trial_reminder: 0, trial_ending_soon: 0, trial_expired: 0 };

    // ---- Trial reminder: trial_end in ~7 days (6.5 to 7.5 days from now) ----
    const sevenDaysStart = new Date(now.getTime() + 6.5 * 24 * 60 * 60 * 1000);
    const sevenDaysEnd = new Date(now.getTime() + 7.5 * 24 * 60 * 60 * 1000);

    const { data: trialReminderSubs } = await (supabase as any)
      .from("user_subscriptions")
      .select("id, user_id, trial_end")
      .eq("status", "trial")
      .gte("trial_end", sevenDaysStart.toISOString())
      .lte("trial_end", sevenDaysEnd.toISOString());

    if (trialReminderSubs?.length) {
      for (const sub of trialReminderSubs) {
        const alreadySent = await alreadySentEmail(
          supabase,
          sub.user_id,
          "trial_reminder",
        );
        if (alreadySent) continue;

        const profile = await getProfile(supabase, sub.user_id);
        if (!profile?.email) continue;

        const result = await EmailService.sendTrialReminder(profile.email, {
          userName: profile.full_name || "there",
          trialEndDate: sub.trial_end,
          dashboardUrl: DASHBOARD_URL,
        });
        if (result.success) {
          await recordEmailSent(supabase, sub.user_id, "trial_reminder");
          results.trial_reminder++;
        }
      }
    }

    // ---- Trial ending soon: trial_end in ~2 days (1.5 to 2.5 days from now) ----
    const twoDaysStart = new Date(now.getTime() + 1.5 * 24 * 60 * 60 * 1000);
    const twoDaysEnd = new Date(now.getTime() + 2.5 * 24 * 60 * 60 * 1000);

    const { data: endingSoonSubs } = await (supabase as any)
      .from("user_subscriptions")
      .select("id, user_id, trial_end")
      .eq("status", "trial")
      .gte("trial_end", twoDaysStart.toISOString())
      .lte("trial_end", twoDaysEnd.toISOString());

    if (endingSoonSubs?.length) {
      for (const sub of endingSoonSubs) {
        const alreadySent = await alreadySentEmail(
          supabase,
          sub.user_id,
          "trial_ending_soon",
        );
        if (alreadySent) continue;

        const profile = await getProfile(supabase, sub.user_id);
        if (!profile?.email) continue;

        const result = await EmailService.sendTrialEndingSoon(profile.email, {
          userName: profile.full_name || "there",
          trialEndDate: sub.trial_end,
          billingUrl: BILLING_URL,
        });
        if (result.success) {
          await recordEmailSent(supabase, sub.user_id, "trial_ending_soon");
          results.trial_ending_soon++;
        }
      }
    }

    // ---- Trial expired: status=expired and updated in last 24h ----
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const { data: expiredSubs } = await (supabase as any)
      .from("user_subscriptions")
      .select("id, user_id")
      .eq("status", "expired")
      .gte("updated_at", oneDayAgo.toISOString());

    if (expiredSubs?.length) {
      for (const sub of expiredSubs) {
        const alreadySent = await alreadySentEmail(
          supabase,
          sub.user_id,
          "trial_expired",
        );
        if (alreadySent) continue;

        const profile = await getProfile(supabase, sub.user_id);
        if (!profile?.email) continue;

        const result = await EmailService.sendTrialExpired(profile.email, {
          userName: profile.full_name || "there",
          billingUrl: BILLING_URL,
        });
        if (result.success) {
          await recordEmailSent(supabase, sub.user_id, "trial_expired");
          results.trial_expired++;
        }
      }
    }

    return NextResponse.json({
      ok: true,
      sent: results,
    });
  } catch (error) {
    console.error("Trial emails cron error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Trial emails cron failed",
      },
      { status: 500 },
    );
  }
}

async function getProfile(
  supabase: any,
  userId: string,
): Promise<{ email: string; full_name?: string } | null> {
  const { data } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", userId)
    .single();
  return data ?? null;
}

async function alreadySentEmail(
  supabase: any,
  userId: string,
  emailType: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("trial_email_sent")
    .select("id")
    .eq("user_id", userId)
    .eq("email_type", emailType)
    .maybeSingle();
  return !!data;
}

async function recordEmailSent(
  supabase: any,
  userId: string,
  emailType: string,
): Promise<void> {
  await supabase.from("trial_email_sent").insert({
    user_id: userId,
    email_type: emailType,
  });
}
