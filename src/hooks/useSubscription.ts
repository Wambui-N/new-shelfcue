"use client";

/**
 * Free-plan subscription hook.
 * ShelfCue is fully free — every authenticated user has unlimited access.
 * This hook preserves the same public API so callers don't need changes.
 */
export function useSubscription() {
  const hasAccess = true;
  const isOnTrial = false;
  const isActive = true;
  const isExpired = false;
  const trialDaysRemaining = 0;
  const loading = false;

  const limits = {
    forms: -1,
    submissions_per_month: -1,
  };

  function canCreateForm(): boolean {
    return true;
  }

  function canReceiveSubmissions(): boolean {
    return true;
  }

  function hasFeature(_feature: string): boolean {
    return true;
  }

  function refresh() {}

  return {
    subscription: null,
    usage: null,
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
    refresh,
  };
}
