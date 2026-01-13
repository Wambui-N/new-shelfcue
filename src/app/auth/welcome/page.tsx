"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GoogleConnectPrompt } from "@/components/GoogleConnectPrompt";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

export default function WelcomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    // Send welcome email and check Google connection
    const initializeUser = async () => {
      try {
        // Create trial subscription - CRITICAL: wait for success
        // First, get the professional plan ID
        const { data: planData, error: planError } = await supabase
          .from("subscription_plans")
          .select("id")
          .eq("name", "professional")
          .single<{ id: string }>();

        if (planError || !planData) {
          console.error("Could not find professional plan to start trial:", planError);
          // Still allow user to proceed, but they'll need to subscribe manually
        } else {
          // Create the trial and WAIT for it to complete
          try {
            const trialResponse = await fetch("/api/subscriptions/create-trial", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ planId: planData.id }),
            });

            const trialResult = await trialResponse.json();
            
            if (!trialResponse.ok) {
              console.error("Failed to create trial subscription:", trialResult.error);
              // User can still proceed, they'll need to subscribe manually
            } else {
              console.log("✅ Trial subscription created successfully for new user");
            }
          } catch (error) {
            console.error("Error creating trial subscription:", error);
            // User can still proceed, they'll need to subscribe manually
          }
        }

        // Send welcome email (fire and forget - don't block user flow)
        fetch("/api/auth/welcome-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user.id }),
        }).catch((error) => {
          console.error("Failed to send welcome email:", error);
        });

        // Check if Google is already connected
        const { data } = await (supabase as any)
          .from("user_google_tokens")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (data) {
          // Already connected, go to dashboard
          router.push("/dashboard");
        } else {
          setChecking(false);
        }
      } catch (_error) {
        setChecking(false);
      }
    };

    initializeUser();
  }, [user, router, supabase]);

  const handleConnect = () => {
    // Redirect to Google OAuth with return URL
    const returnUrl = encodeURIComponent("/dashboard");
    window.location.href = `/api/auth/google?returnUrl=${returnUrl}`;
  };

  const handleSkip = () => {
    router.push("/dashboard");
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return <GoogleConnectPrompt onConnect={handleConnect} onSkip={handleSkip} />;
}
