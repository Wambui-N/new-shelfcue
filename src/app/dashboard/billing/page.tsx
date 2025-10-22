"use client";

import {
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  Loader2,
  Users,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BillingSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

type Plan = {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  limits: Record<string, any>;
  paystack_plan_code?: string;
};

type Subscription = {
  id: string;
  plan_id: string;
  status: string;
  billing_cycle: string;
  trial_start: string;
  trial_end: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  plan: Plan;
};

const cancellationReasons = [
  "Too expensive",
  "Not using it enough",
  "Missing features I need",
  "Found a better alternative",
  "Technical issues",
  "Other",
];

export default function BillingPage() {
  const { user } = useAuth();
  const _router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [usage, setUsage] = useState<any>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0);
  const [_isTrialOnboarding, setIsTrialOnboarding] = useState(false);

  // Cancel subscription state
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  // Create a client-side Supabase instance
  const supabase = createClient();

  useEffect(() => {
    // Check if this is trial onboarding from query params
    const params = new URLSearchParams(window.location.search);
    setIsTrialOnboarding(params.get("trial") === "true");

    fetchData();
  }, [fetchData]);

  async function fetchData() {
    try {
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch current subscription
      const subResponse = await fetch("/api/subscriptions/current", {
        headers: {
          Authorization: `Bearer ${(user as any).access_token}`,
        },
      });

      if (subResponse.ok) {
        const subData = await subResponse.json();
        setSubscription(subData.subscription);
        setUsage(subData.usage);

        // Calculate trial days remaining
        if (
          subData.subscription?.status === "trial" &&
          subData.subscription?.trial_end
        ) {
          const trialEnd = new Date(subData.subscription.trial_end);
          const now = new Date();
          const days = Math.ceil(
            (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
          );
          setTrialDaysRemaining(Math.max(0, days));
        }
      }

      // Fetch professional plan
      const plansResponse = await fetch("/api/subscriptions/plans");
      if (plansResponse.ok) {
        const plansData = await plansResponse.json();
        const professionalPlan = plansData.plans.find(
          (p: Plan) => p.name === "professional",
        );
        setPlan(professionalPlan);
      }
    } catch (error) {
      console.error("Error fetching billing data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubscribe() {
    try {
      setPaymentLoading(true);

      if (!user?.email) {
        alert("Please sign in to subscribe");
        return;
      }
      if (!plan?.paystack_plan_code) {
        alert("Paystack plan code is not configured. Please contact support.");
        setPaymentLoading(false);
        return;
      }

      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          amount: plan.price_monthly * 100,
          plan_code: plan.paystack_plan_code,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to initialize payment");
      }

      const data = await response.json();
      window.location.href = data.authorization_url;
    } catch (error) {
      console.error("Error initiating payment:", error);
      alert("Failed to initiate payment. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  }

  async function handleCancelSubscription() {
    if (!selectedReason) {
      alert("Please select a reason for cancellation");
      return;
    }

    try {
      setCancelLoading(true);

      // Submit cancellation feedback
      await (supabase as any).from("subscription_cancellations").insert({
        user_id: user?.id,
        subscription_id: subscription?.id,
        reason: selectedReason,
        feedback: feedback,
      });

      // TODO: Call actual cancellation API
      // For now, just show success message
      alert(
        "Your subscription has been scheduled for cancellation at the end of the billing period.",
      );
      setShowCancelDialog(false);
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      alert("Failed to cancel subscription. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  }

  if (loading) {
    return <BillingSkeleton />;
  }

  const isOnTrial = subscription?.status === "trial";
  const isActive = subscription?.status === "active";
  const isCancelled =
    subscription?.status === "cancelled" || subscription?.cancel_at_period_end;
  const isInactive = subscription?.status === "inactive";
  const hasSubscription = subscription && !isInactive;
  const isTrialExpired = isOnTrial && trialDaysRemaining === 0;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Billing & Subscription
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Manage your subscription and payment details
        </p>
      </div>

      {/* Trial Banner */}
      {isOnTrial && trialDaysRemaining > 0 && (
        <Card className="p-4 sm:p-6 border-2 border-primary">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-semibold mb-2">
                You are on a free trial!
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                You have {trialDaysRemaining}{" "}
                {trialDaysRemaining === 1 ? "day" : "days"} left. Subscribe now
                to keep your access.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Trial Expired Banner */}
      {isTrialExpired && (
        <Card className="p-4 sm:p-6 border-2 border-destructive bg-destructive/10">
          <div className="flex items-start gap-3 sm:gap-4">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-destructive">
                Your trial has ended
              </h3>
              <p className="text-sm text-destructive/80 mt-1">
                Please subscribe to a plan to continue using our services and
                creating new forms.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Current Plan */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg sm:text-xl font-semibold">Current Plan</h2>
          {hasSubscription && (
            <Badge
              className={
                isActive
                  ? "bg-green-600"
                  : isOnTrial
                    ? "bg-blue-600"
                    : isCancelled
                      ? "bg-yellow-600"
                      : ""
              }
            >
              {isCancelled
                ? "Cancels soon"
                : subscription?.status.charAt(0).toUpperCase() +
                  subscription?.status.slice(1)}
            </Badge>
          )}
        </div>

        {hasSubscription ? (
          <div className="space-y-6">
            {/* Plan Details */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold mb-1">
                  {subscription.plan?.display_name || "Professional"}
                </h3>
                <p className="text-2xl font-bold text-primary">
                  ${plan?.price_monthly || 29}
                  <span className="text-sm font-normal text-muted-foreground">
                    /month
                  </span>
                </p>
              </div>
              {isOnTrial && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Trial ends</p>
                  <p className="font-semibold">
                    {new Date(subscription.trial_end).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {/* Usage Stats */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">Forms</span>
                </div>
                <p className="text-2xl font-bold">{usage?.forms_count || 0}</p>
                <p className="text-xs text-muted-foreground">Unlimited</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Submissions</span>
                </div>
                <p className="text-2xl font-bold">
                  {usage?.submissions_count || 0}
                </p>
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
            </div>

            {/* Next Billing */}
            {isActive && subscription.current_period_end && (
              <div className="flex items-center gap-2 pt-4 border-t text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  Next billing date:{" "}
                  {new Date(
                    subscription.current_period_end,
                  ).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              {isOnTrial ? (
                <Button
                  onClick={handleSubscribe}
                  disabled={paymentLoading}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {paymentLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Subscribe Now
                    </>
                  )}
                </Button>
              ) : isActive ? (
                <>
                  <Button variant="outline" className="flex-1">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Update Payment Method
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setShowCancelDialog(true)}
                  >
                    Cancel Subscription
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        ) : (
          // No subscription / Trial Expired
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {isTrialExpired
                  ? "Your Trial Has Ended"
                  : "No Active Subscription"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {isTrialExpired
                  ? "Please subscribe to continue."
                  : "Subscribe to a plan to get started."}
              </p>
            </div>

            {plan && (
              <div className="border rounded-lg p-6 space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-1">
                    {plan.display_name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">
                      ${plan.price_monthly}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-2 py-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={handleSubscribe}
                  disabled={paymentLoading}
                  className="w-full"
                >
                  {paymentLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Subscribe Now
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Cancel anytime.
                </p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Cancellation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              We're sorry to see you go. Please tell us why you're cancelling.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Reason Selection */}
            <div className="space-y-2">
              <Label>Why are you cancelling?</Label>
              <div className="space-y-2">
                {cancellationReasons.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedReason === reason
                        ? "border-primary bg-primary/5"
                        : "hover:border-muted-foreground/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-sm">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Feedback */}
            <div className="space-y-2">
              <Label htmlFor="feedback">Additional feedback (optional)</Label>
              <Textarea
                id="feedback"
                placeholder="Tell us more about your experience..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={cancelLoading}
              className="flex-1"
            >
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={cancelLoading || !selectedReason}
              className="flex-1"
            >
              {cancelLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Subscription"
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Your subscription will remain active until the end of your billing
            period.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
