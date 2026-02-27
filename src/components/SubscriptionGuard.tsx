"use client";

interface SubscriptionGuardProps {
  children: React.ReactNode;
  feature?: string;
}

/** ShelfCue is free — all authenticated users have full access. */
export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  return <>{children}</>;
}
