"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { GoogleConnectPrompt } from "@/components/GoogleConnectPrompt";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

export default function WelcomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const supabase = createClient();
  const [checking, setChecking] = useState(true);
  
  const createDraftAndOpenEditor = useCallback(async () => {
    const formId = crypto.randomUUID();

    const response = await fetch(`/api/forms/${formId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Untitled Form",
        description: "",
        fields: [],
        status: "draft",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message =
        errorData?.message ||
        errorData?.error ||
        "We couldn't start your new form. Please try again.";
      throw new Error(message);
    }

    router.replace(`/editor/${formId}`);
  }, [router]);

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
          console.error("❌ Could not find professional plan to start trial:", planError);
          
          // FALLBACK: Try using create-my-trial which doesn't need planId
          console.log("🔄 Attempting fallback trial creation...");
          try {
            const fallbackResponse = await fetch("/api/subscriptions/create-my-trial", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            });

            const fallbackResult = await fallbackResponse.json();
            
            if (fallbackResponse.ok) {
              console.log("✅ Trial created via fallback method");
            } else {
              console.error("❌ Fallback trial creation also failed:", fallbackResult.error);
            }
          } catch (fallbackError) {
            console.error("❌ Fallback trial creation error:", fallbackError);
          }
        } else {
          // Create the trial and WAIT for it to complete
          console.log("🔄 Creating trial subscription for new user...");
          try {
            const trialResponse = await fetch("/api/subscriptions/create-trial", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ planId: planData.id }),
            });

            const trialResult = await trialResponse.json();
            
            if (!trialResponse.ok) {
              console.error("❌ Failed to create trial subscription:", trialResult.error);
              
              // FALLBACK: Try the alternative endpoint
              console.log("🔄 Attempting fallback trial creation...");
              const fallbackResponse = await fetch("/api/subscriptions/create-my-trial", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
              });

              const fallbackResult = await fallbackResponse.json();
              
              if (fallbackResponse.ok) {
                console.log("✅ Trial created via fallback method");
              } else {
                console.error("❌ Fallback trial creation also failed:", fallbackResult.error);
              }
            } else {
              console.log("✅ Trial subscription created successfully for new user");
              console.log("📅 Trial ends:", trialResult.trialEnd || "Unknown");
            }
          } catch (error) {
            console.error("❌ Error creating trial subscription:", error);
            
            // FALLBACK: Try the alternative endpoint
            console.log("🔄 Attempting fallback trial creation...");
            try {
              const fallbackResponse = await fetch("/api/subscriptions/create-my-trial", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
              });

              const fallbackResult = await fallbackResponse.json();
              
              if (fallbackResponse.ok) {
                console.log("✅ Trial created via fallback method");
              } else {
                console.error("❌ Fallback trial creation also failed:", fallbackResult.error);
              }
            } catch (fallbackError) {
              console.error("❌ Fallback trial creation error:", fallbackError);
            }
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

        // Check if returning from Google OAuth
        const googleConnected = searchParams.get("google_connected");
        
        if (googleConnected) {
          console.log("✅ Returned from Google OAuth - tokens should be stored");
          await createDraftAndOpenEditor();
          return;
        }

        // Check if user has Google tokens (for users who signed up with Google)
        const { data: tokenData } = await (supabase as any)
          .from("user_google_tokens")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!tokenData) {
          console.log("🔑 No Google tokens found - initiating OAuth flow to get API tokens");
          
          // Get Google OAuth URL for API access with from_welcome flag
          const authResponse = await fetch(
            `/api/auth/google-connect?userId=${user.id}|from_welcome`
          );
          
          if (authResponse.ok) {
            const { authUrl } = await authResponse.json();
            console.log("🔗 Redirecting to Google OAuth for API token consent");
            // Redirect to Google OAuth to get API tokens
            window.location.href = authUrl;
            return;
          } else {
            console.warn("⚠️ Could not initiate Google OAuth, continuing without tokens");
          }
        }

        await createDraftAndOpenEditor();
        return;
      } catch (error) {
        console.error("Error finishing welcome setup:", error);
        setChecking(false);
      }
    };

    initializeUser();
  }, [user, router, supabase, createDraftAndOpenEditor]);

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
