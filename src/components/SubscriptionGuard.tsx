"use client";

import { AlertCircle, CreditCard } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";

interface SubscriptionGuardProps {
  children: React.ReactNode;
  feature?: string;
}

export function SubscriptionGuard({
  children,
  feature = "this feature",
}: SubscriptionGuardProps) {
  const { hasAccess, loading } = useSubscription();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If subscription exists but has no access (expired/cancelled), show resubscribe prompt
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-lg w-full p-8 shadow-xl border-destructive/50">
          <div className="text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-3">
              Subscription Required
            </h2>

            <p className="text-muted-foreground mb-6">
              Your trial has ended. Subscribe now to continue using {feature}.
            </p>

            <div className="flex flex-col gap-3">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-primary to-accent"
              >
                <Link href="/dashboard/billing">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Subscribe Now
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // User has active access - render children
  return <>{children}</>;
}
