"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  limits: Record<string, unknown>;
}

interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  billing_cycle: string;
  trial_start: string;
  trial_end: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  plan: SubscriptionPlan;
}

interface UsageData {
  forms_count: number;
  submissions_count: number;
  storage_used_mb: number;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0);

  const fetchSubscription = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      const response = await fetch("/api/subscriptions/current", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
        setUsage(data.usage);

        // Calculate trial days remaining
        if (
          data.subscription?.status === "trial" &&
          data.subscription?.trial_end
        ) {
          const trialEnd = new Date(data.subscription.trial_end);
          const now = new Date();
          const days = Math.ceil(
            (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
          );
          setTrialDaysRemaining(Math.max(0, days));
        }
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const isOnTrial = subscription?.status === "trial" && trialDaysRemaining > 0;
  const isActive = subscription?.status === "active";
  const isExpired =
    subscription?.status === "expired" ||
    (subscription?.status === "trial" && trialDaysRemaining === 0);
  const hasAccess = isOnTrial || isActive;

  const limits = subscription?.plan?.limits || {
    forms: -1,
    submissions_per_month: -1,
  };

  function canCreateForm(): boolean {
    if (!hasAccess) return false;
    if ((limits as any).forms === -1) return true; // Unlimited
    return (usage?.forms_count || 0) < (limits as any).forms;
  }

  function canReceiveSubmissions(): boolean {
    if (!hasAccess) return false;
    if ((limits as any).submissions_per_month === -1) return true; // Unlimited
    return (usage?.submissions_count || 0) < (limits as any).submissions_per_month;
  }

  function hasFeature(feature: string): boolean {
    if (!hasAccess) return false;
    return limits[feature] === true;
  }

  return {
    subscription,
    usage,
    loading,
    isOnTrial,
    isActive,
    isExpired,
    hasAccess,
    trialDaysRemaining,
    limits,
    canCreateForm,
    canReceiveSubmissions,
    hasFeature,
    refresh: fetchSubscription,
  };
}
