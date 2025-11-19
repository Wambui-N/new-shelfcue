"use client";

import { Clock, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";

export function TrialBanner() {
  const { isOnTrial, isExpired, trialDaysRemaining, loading, subscription } =
    useSubscription();
  const { user } = useAuth();
  const router = useRouter();
  const [paymentLoading, setPaymentLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setPaymentLoading(true);

      if (!user?.email) {
        alert("Please sign in to subscribe");
        return;
      }

      // Fetch the professional plan
      const plansResponse = await fetch("/api/subscriptions/plans");
      if (!plansResponse.ok) {
        throw new Error("Failed to fetch plans");
      }

      const plansData = await plansResponse.json();
      const professionalPlan = plansData.plans.find(
        (p: any) => p.name === "professional",
      );

      if (!professionalPlan?.paystack_plan_code) {
        alert("Paystack plan code is not configured. Please contact support.");
        return;
      }

      // Initialize payment
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          amount: professionalPlan.price_monthly * 100,
          plan_code: professionalPlan.paystack_plan_code,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to initialize payment");
      }

      const data = await response.json();
      // Redirect to Paystack payment page
      window.location.href = data.authorization_url;
    } catch (error) {
      console.error("Error initiating payment:", error);
      alert("Failed to initiate payment. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading || (!isOnTrial && !isExpired)) {
    return null;
  }

  if (isExpired) {
    return (
      <div className="bg-red-600/20 text-white p-3 border-b border-red-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5" />
            <p className="text-sm font-medium">
              Your trial has expired. Subscribe now to regain access to all
              features.
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="bg-white text-red-600 hover:bg-gray-100"
            onClick={handleSubscribe}
            disabled={paymentLoading}
          >
            <Zap className="w-4 h-4 mr-1" />
            {paymentLoading ? "Loading..." : "Subscribe Now"}
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
            size="sm"
            variant={isUrgent ? "secondary" : "outline"}
            className={isUrgent ? "bg-white text-primary hover:bg-gray-100" : "border-blue-300 text-blue-900 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-100 dark:hover:bg-blue-900"}
            onClick={isUrgent ? handleSubscribe : () => router.push("/dashboard/billing")}
            disabled={paymentLoading}
          >
            <Zap className="w-4 h-4 mr-1" />
            {paymentLoading ? "Loading..." : isUrgent ? "Subscribe Now" : "View Plans"}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
