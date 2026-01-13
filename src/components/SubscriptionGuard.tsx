"use client";

import { AlertCircle, CreditCard, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";
import { FullPageLoader } from "@/components/skeletons/AppLoadingStates";

interface SubscriptionGuardProps {
  children: React.ReactNode;
  feature?: string;
}

export function SubscriptionGuard({
  children,
  feature = "this feature",
}: SubscriptionGuardProps) {
  const { hasAccess, loading, subscription } = useSubscription();

  if (loading) {
    return <FullPageLoader label="Checking your subscription…" />;
  }

  // If user has no subscription at all, show billing prompt
  if (!subscription) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 shadow-xl">
          <div className="text-center">
            {/* Icon */}
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-10 h-10 text-primary" />
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Complete Your Account Setup
            </h1>

            {/* Description */}
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              Add your payment details to start your{" "}
              <span className="font-semibold text-foreground">
                14-day free trial
              </span>{" "}
              and access {feature}.
            </p>

            {/* Features List */}
            <div className="bg-muted/30 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-3 mb-3">
                <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-left">
                  <span className="font-semibold">No charge today</span> - Your
                  card won't be charged until after your trial ends
                </p>
              </div>
              <div className="flex items-start gap-3 mb-3">
                <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-left">
                  <span className="font-semibold">Cancel anytime</span> - No
                  commitment, cancel before trial ends if not satisfied
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-left">
                  <span className="font-semibold">Full access</span> - Unlimited
                  forms and submissions during trial
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg"
              >
                <Link href="/dashboard/billing?trial=true">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Start Free Trial
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>

            {/* Security Note */}
            <p className="text-xs text-muted-foreground mt-6">
              🔒 Secure payment processing powered by Paystack
            </p>
          </div>
        </Card>
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
