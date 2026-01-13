"use client";

import { CheckCircle, Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { FullPageLoader } from "@/components/skeletons/AppLoadingStates";

function SuccessContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    checkSubscriptionStatus();
  }, [checkSubscriptionStatus]);

  async function checkSubscriptionStatus() {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      // Fetch current subscription
      const response = await fetch("/api/subscriptions/current", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.subscription?.status === "active") {
          setSubscriptionActive(true);
          setLoading(false);
        } else if (retryCount < 10) {
          // Retry after 2 seconds (webhook might be delayed)
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
            checkSubscriptionStatus();
          }, 2000);
        } else {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        {loading ? (
          <>
            <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Processing Payment
            </h2>
            <p className="text-muted-foreground">
              Please wait while we activate your subscription... ({retryCount}
              /10)
            </p>
          </>
        ) : subscriptionActive ? (
          <>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Subscription Active!
            </h2>
            <p className="text-muted-foreground mb-6">
              Thank you for subscribing to ShelfCue Professional. Your
              subscription is now active and you have access to all premium
              features.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => router.push("/dashboard/billing")}
                variant="outline"
                className="flex-1"
              >
                View Billing
              </Button>
              <Button
                onClick={() => router.push("/dashboard")}
                className="flex-1"
              >
                Go to Dashboard
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Payment Received
            </h2>
            <p className="text-muted-foreground mb-6">
              We've received your payment but are still processing your
              subscription. This usually takes a few minutes.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={checkSubscriptionStatus}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Check Again
              </Button>
              <Button
                onClick={() => router.push("/dashboard")}
                className="flex-1"
              >
                Go to Dashboard
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<FullPageLoader label="Confirming your payment…" />}>
      <SuccessContent />
    </Suspense>
  );
}
