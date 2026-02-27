/**
 * Subscription Limits — Free Plan
 *
 * ShelfCue is fully free. All limit checks return allowed: true.
 * Usage tracking (incrementUsage) is preserved for analytics.
 */

import { getSupabaseAdmin } from "./supabase/admin";

type LimitType = "forms" | "submissions_per_month" | "storage_mb" | "api_calls";

interface UsageData {
  forms_count: number;
  submissions_count: number;
  storage_used_mb: number;
  api_calls_count: number;
}

/**
 * Always returns unlimited limits — the app is free.
 */
export async function getUserLimits(_userId: string) {
  return {
    forms: -1,
    submissions_per_month: -1,
    storage_mb: -1,
    team_members: -1,
    analytics: "advanced",
    support: "standard",
    custom_branding: true,
    api_access: true,
  };
}

/**
 * Get user's current usage (for analytics only).
 */
export async function getUserUsage(userId: string): Promise<UsageData> {
  const supabase = getSupabaseAdmin();

  const { count: formsCount } = await supabase
    .from("forms")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const { data: usage } = await (supabase as any)
    .from("usage_tracking")
    .select("*")
    .eq("user_id", userId)
    .gte("period_start", periodStart.toISOString())
    .lt("period_end", periodEnd.toISOString())
    .maybeSingle();

  return {
    forms_count: formsCount || 0,
    submissions_count: (usage as any)?.submissions_count ?? 0,
    storage_used_mb: (usage as any)?.storage_used_mb ?? 0,
    api_calls_count: (usage as any)?.api_calls_count ?? 0,
  };
}

/**
 * Always allows the action — the app is free.
 */
export async function canPerformAction(
  _userId: string,
  _limitType: LimitType,
): Promise<{ allowed: boolean; message?: string; limit?: number; usage?: number }> {
  return { allowed: true };
}

/**
 * Increment usage counter for analytics tracking.
 */
export async function incrementUsage(
  userId: string,
  metric: "submissions" | "storage" | "api_calls",
  amount: number = 1,
): Promise<void> {
  const supabase = getSupabaseAdmin();

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const { data: existingUsage } = await supabase
    .from("usage_tracking")
    .select("*")
    .eq("user_id", userId)
    .gte("period_start", periodStart.toISOString())
    .lt("period_end", periodEnd.toISOString())
    .single();

  const columnName =
    metric === "submissions"
      ? "submissions_count"
      : metric === "storage"
        ? "storage_used_mb"
        : "api_calls_count";

  if (existingUsage) {
    await (supabase as any)
      .from("usage_tracking")
      .update({
        [columnName]: ((existingUsage as any)[columnName] || 0) + amount,
      })
      .eq("id", (existingUsage as any).id);
  } else {
    await (supabase as any).from("usage_tracking").insert({
      user_id: userId,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      [columnName]: amount,
    });
  }
}

/** Legacy helpers — always return free-plan values. */
export async function isTrialActive(_userId: string): Promise<boolean> {
  return false;
}

export async function getTrialDaysRemaining(_userId: string): Promise<number> {
  return 0;
}

export async function hasFeatureAccess(
  _userId: string,
  _feature: "custom_branding" | "api_access" | "advanced_analytics" | "priority_support",
): Promise<boolean> {
  return true;
}
