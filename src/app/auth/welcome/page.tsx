"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function WelcomePage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const supabase = createClient();

  useEffect(() => {
    const runSetup = async () => {
      try {
        console.log("🚀 Starting welcome setup...");

        // Get current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          console.error("❌ No session found:", sessionError);
          router.push("/auth/signin?error=not_authenticated");
          return;
        }

        console.log("✅ Session found for user:", session.user.id);

        // Step 1: Store Google tokens from Supabase session
        if (session.provider_token) {
          console.log("📝 Storing Google tokens from session...");

          try {
            const tokenResponse = await fetch("/api/auth/store-google-tokens", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                provider_token: session.provider_token,
                provider_refresh_token: session.provider_refresh_token,
                expires_at: session.expires_at,
              }),
            });

            if (tokenResponse.ok) {
              console.log("✅ Google tokens stored successfully");
            } else {
              console.warn(
                "⚠️ Failed to store tokens:",
                await tokenResponse.text(),
              );
              // Continue anyway - tokens might not be critical for initial setup
            }
          } catch (tokenError) {
            console.error("❌ Error storing tokens:", tokenError);
            // Continue anyway
          }
        } else {
          console.warn("⚠️ No provider_token in session");
        }

        // Step 2: Ensure trial subscription exists (create if missing)
        console.log("📝 Ensuring trial subscription exists...");

        const { data: existingSubscription, error: subReadError } =
          await supabase
            .from("user_subscriptions")
            .select("id")
            .eq("user_id", session.user.id)
            .maybeSingle();

        if (subReadError) {
          console.warn(
            "⚠️ Failed reading subscription (will attempt create):",
            subReadError,
          );
        }

        if (!existingSubscription) {
          const trialResponse = await fetch(
            "/api/subscriptions/create-my-trial",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
            },
          );

          if (!trialResponse.ok) {
            const errorText = await trialResponse.text();
            console.error("❌ Failed to create trial:", errorText);
            throw new Error("Failed to create trial subscription");
          }

          console.log("✅ Trial subscription created");
        } else {
          console.log("✅ Subscription already exists, skipping trial create");
        }

        setStatus("success");

        // Wait a moment then redirect
        setTimeout(() => {
          console.log("🔄 Redirecting to dashboard...");
          router.push("/dashboard");
        }, 1500);
      } catch (error: any) {
        console.error("❌ Setup error:", error);
        setStatus("error");
        setErrorMessage(
          error.message || "Failed to complete setup. Please try again.",
        );
      }
    };

    runSetup();
  }, [router, supabase]);

  const handleContinue = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          {/* Logo or Brand */}
          <div className="flex justify-center mb-8">
            <div className="text-4xl font-bold text-primary">ShelfCue</div>
          </div>

          {/* Welcome Message */}
          <h1 className="text-3xl font-bold text-foreground">
            Welcome to ShelfCue!
          </h1>

          {status === "loading" && (
            <>
              <p className="text-muted-foreground text-lg">
                We're setting up your dashboard and trial access...
              </p>
              <div className="flex justify-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <p className="text-muted-foreground text-lg">
                Your account is ready! Redirecting you to the dashboard...
              </p>
              <div className="flex justify-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 my-4">
                <p className="text-destructive text-sm">{errorMessage}</p>
              </div>
              <p className="text-muted-foreground text-sm">
                Don't worry, you can still continue to your dashboard.
              </p>
              <Button onClick={handleContinue} className="mt-4" size="lg">
                Continue to Dashboard
              </Button>
            </>
          )}
        </div>

        {status === "loading" && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              This will only take a moment...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
