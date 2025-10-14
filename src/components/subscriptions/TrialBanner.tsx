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

  if (isOnTrial && trialDaysRemaining <= 7) {
    return (
      <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground p-3 border-b border-primary/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5" />
            <p className="text-sm font-medium">
              {trialDaysRemaining} {trialDaysRemaining === 1 ? "day" : "days"}{" "}
              left in your trial. Subscribe to continue using all features.
            </p>
          </div>
          <Button
            asChild
            size="sm"
            variant="secondary"
            className="bg-white text-primary hover:bg-gray-100"
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

  return null;
}
