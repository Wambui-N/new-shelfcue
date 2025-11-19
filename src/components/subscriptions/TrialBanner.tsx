"use client";

import { Clock, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";

export function TrialBanner() {
  const { isOnTrial, isExpired, trialDaysRemaining, loading } =
    useSubscription();

  if (loading || (!isOnTrial && !isExpired)) {
    return null;
  }

  if (isExpired) {
    return (
      <div className="bg-red-600 text-white p-3 border-b border-red-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5" />
            <p className="text-sm font-medium">
              Your trial has expired. Subscribe now to regain access to all
              features.
            </p>
          </div>
          <Button
            asChild
            size="sm"
            variant="secondary"
            className="bg-white text-red-600 hover:bg-gray-100"
          >
            <Link href="/dashboard/billing">
              <Zap className="w-4 h-4 mr-1" />
              Subscribe Now
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Show banner for entire trial period, with different styling based on days remaining
  if (isOnTrial && trialDaysRemaining > 0) {
    const isUrgent = trialDaysRemaining <= 7;
    
    return (
      <div className={`${isUrgent ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground' : 'bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100'} p-3 border-b ${isUrgent ? 'border-primary/20' : 'border-blue-200 dark:border-blue-800'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5" />
            <p className="text-sm font-medium">
              {isUrgent ? (
                <>
                  {trialDaysRemaining} {trialDaysRemaining === 1 ? "day" : "days"}{" "}
                  left in your trial. Subscribe to continue using all features.
                </>
              ) : (
                <>
                  You're on a <strong>14-day free trial</strong>. {trialDaysRemaining} {trialDaysRemaining === 1 ? "day" : "days"} remaining.
                </>
              )}
            </p>
          </div>
          <Button
            asChild
            size="sm"
            variant={isUrgent ? "secondary" : "outline"}
            className={isUrgent ? "bg-white text-primary hover:bg-gray-100" : "border-blue-300 text-blue-900 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-100 dark:hover:bg-blue-900"}
          >
            <Link href="/dashboard/billing">
              <Zap className="w-4 h-4 mr-1" />
              {isUrgent ? "Subscribe Now" : "View Plans"}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
