/**
 * Subscription Limits Enforcement
 * Utilities to check and enforce subscription limits
 */

import { getSupabaseAdmin } from "./supabase";

type LimitType = "forms" | "submissions_per_month" | "storage_mb" | "api_calls";

interface SubscriptionLimits {
  forms: number;
  submissions_per_month: number;
  storage_mb: number;
  team_members: number;
  analytics: string;
  support: string;
  custom_branding?: boolean;
  api_access?: boolean;
}

interface UsageData {
  forms_count: number;
  submissions_count: number;
  storage_used_mb: number;
  api_calls_count: number;
}

/**
 * Get user's subscription limits
 */
export async function getUserLimits(
  userId: string,
): Promise<SubscriptionLimits> {
  const supabase = getSupabaseAdmin();

  // Get user's subscription with plan details
  const { data: subscription } = await (supabase as any)
    .from("user_subscriptions")
    .select(
      `
      *,
      plan:subscription_plans(*)
    `,
    )
    .eq("user_id", userId)
    .single();

  if ((subscription as any)?.plan) {
    // Check if trial has expired
    if (
      (subscription as any).status === "trial" &&
      (subscription as any).trial_end &&
      new Date((subscription as any).trial_end) < new Date()
    ) {
      // Trial expired - return no access
      return {
        forms: 0,
        submissions_per_month: 0,
        storage_mb: 0,
        team_members: 0,
        analytics: "none",
        support: "none",
      };
    }

    // Check if subscription is expired or cancelled
    if (
      (subscription as any).status === "expired" ||
      (subscription as any).status === "cancelled"
    ) {
      return {
        forms: 0,
        submissions_per_month: 0,
        storage_mb: 0,
        team_members: 0,
        analytics: "none",
        support: "none",
      };
    }

    return (subscription as any).plan.limits as SubscriptionLimits;
  }

  // No subscription found - deny access
  return {
    forms: 0,
    submissions_per_month: 0,
    storage_mb: 0,
    team_members: 0,
    analytics: "none",
    support: "none",
  };
}

/**
 * Get user's current usage
 */
export async function getUserUsage(userId: string): Promise<UsageData> {
  const supabase = getSupabaseAdmin();

  // Get forms count
  const { count: formsCount } = await supabase
    .from("forms")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  // Get current period usage
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const { data: usage } = await (supabase as any)
    .from("usage_tracking")
    .select("*")
    .eq("user_id", userId)
    .gte("period_start", periodStart.toISOString())
    .lt("period_end", periodEnd.toISOString())
    .single();

  return {
    forms_count: formsCount || 0,
    submissions_count: (usage as any)?.submissions_count || 0,
    storage_used_mb: (usage as any)?.storage_used_mb || 0,
    api_calls_count: (usage as any)?.api_calls_count || 0,
  };
}

/**
 * Check if user can perform an action based on their limits
 */
export async function canPerformAction(
  userId: string,
  limitType: LimitType,
): Promise<{
  allowed: boolean;
  message?: string;
  limit?: number;
  usage?: number;
}> {
  const limits = await getUserLimits(userId);
  const usage = await getUserUsage(userId);

  const limit = (limits as any)[limitType];
  const currentUsage =
    (usage as any)[`${limitType === "forms" ? "forms_count" : limitType}`];

  // -1 means unlimited
  if (limit === -1) {
    return { allowed: true };
  }

  const allowed = currentUsage < limit;

  if (!allowed) {
    const messages: Record<LimitType, string> = {
      forms: `You've reached your form limit (${limit} forms). Upgrade to create more forms.`,
      submissions_per_month: `You've reached your monthly submission limit (${limit} submissions). Upgrade for more capacity.`,
      storage_mb: `You've reached your storage limit (${limit} MB). Upgrade for more storage.`,
      api_calls: `You've reached your API call limit (${limit} calls). Upgrade for more API access.`,
    };

    return {
      allowed: false,
      message: messages[limitType],
      limit,
      usage: currentUsage,
    };
  }

  return { allowed: true, limit, usage: currentUsage };
}

/**
 * Increment usage counter for a specific metric
 */
export async function incrementUsage(
  userId: string,
  metric: "submissions" | "storage" | "api_calls",
  amount: number = 1,
): Promise<void> {
  const supabase = getSupabaseAdmin();

  // Get current period
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // Try to get existing usage record
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
    // Update existing record
    await (supabase as any)
      .from("usage_tracking")
      .update({
        [columnName]: ((existingUsage as any)[columnName] || 0) + amount,
      })
      .eq("id", (existingUsage as any).id);
  } else {
    // Create new record for this period
    await (supabase as any).from("usage_tracking").insert({
      user_id: userId,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      [columnName]: amount,
    });
  }
}

/**
 * Check if user's subscription is in trial
 */
export async function isTrialActive(userId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();

  const { data: subscription } = await (supabase as any)
    .from("user_subscriptions")
    .select("status, trial_end")
    .eq("user_id", userId)
    .single();

  if (!subscription) return false;

  if ((subscription as any).status === "trial" && (subscription as any).trial_end) {
    return new Date((subscription as any).trial_end) > new Date();
  }

  return false;
}

/**
 * Get days remaining in trial
 */
export async function getTrialDaysRemaining(userId: string): Promise<number> {
  const supabase = getSupabaseAdmin();

  const { data: subscription } = await (supabase as any)
    .from("user_subscriptions")
    .select("status, trial_end")
    .eq("user_id", userId)
    .single();

  if (
    !subscription ||
    (subscription as any).status !== "trial" ||
    !(subscription as any).trial_end
  ) {
    return 0;
  }

  const trialEnd = new Date((subscription as any).trial_end);
  const now = new Date();
  const daysRemaining = Math.ceil(
    (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  return Math.max(0, daysRemaining);
}

/**
 * Check if user has access to a premium feature
 */
export async function hasFeatureAccess(
  userId: string,
  feature:
    | "custom_branding"
    | "api_access"
    | "advanced_analytics"
    | "priority_support",
): Promise<boolean> {
  const limits = await getUserLimits(userId);

  switch (feature) {
    case "custom_branding":
      return limits.custom_branding === true;
    case "api_access":
      return limits.api_access === true;
    case "advanced_analytics":
      return limits.analytics === "advanced";
    case "priority_support":
      return limits.support === "priority";
    default:
      return false;
  }
}
