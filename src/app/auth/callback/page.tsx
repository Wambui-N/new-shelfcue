"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log("🔍 Auth Callback - Full URL:", window.location.href);
      console.log(
        "🔍 Search Params:",
        Object.fromEntries(searchParams.entries()),
      );

      // Check for OAuth errors in URL params
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");
      const errorCode = searchParams.get("error_code");

      if (error) {
        console.error("❌ OAuth error:", {
          error,
          errorDescription,
          errorCode,
        });
        const message = errorDescription
          ? decodeURIComponent(errorDescription.replace(/\+/g, " "))
          : error === "oauth_error"
            ? "OAuth authentication failed. Please try again."
            : "Authentication failed";
        setErrorMessage(message);

        // Redirect to signin with error after 3 seconds
        setTimeout(() => {
          router.push(`/auth/signin?error=${encodeURIComponent(message)}`);
        }, 3000);
        return;
      }

      const { data, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error getting session:", sessionError);
        router.push("/auth/signin?error=auth_callback_error");
        return;
      }

      if (data.session) {
        // Check if this is a sign-in attempt and if user exists in database
        const mode = searchParams.get("mode");
        const isSignIn = mode === "signin";

        if (isSignIn) {
          // Check if user exists in our database
          if (!data.session.user.email) {
            console.error("No email found in session");
            router.push("/auth/signin?error=no_email");
            return;
          }

          const { data: existingUser, error: userError } = await supabase
            .from("users")
            .select("id")
            .eq("email", data.session.user.email)
            .single();

          if (userError && userError.code !== "PGRST116") {
            console.error("Error checking user existence:", userError);
            router.push("/auth/signin?error=user_check_failed");
            return;
          }

          // If user doesn't exist in database, redirect to signup with consent
          if (!existingUser) {
            console.log(
              "User not found in database, redirecting to signup with consent",
            );
            // Sign out the current session
            await supabase.auth.signOut();
            // Redirect to signup with consent prompt
            router.push("/auth/signup?consent=true");
            return;
          }
        }

        // Store Google tokens if available
        console.log("🔍 Session data:", {
          hasProviderToken: !!data.session.provider_token,
          hasRefreshToken: !!data.session.provider_refresh_token,
          expiresIn: data.session.expires_in,
          userId: data.session.user.id,
          provider: data.session.user.app_metadata?.provider,
          providers: data.session.user.app_metadata?.providers,
        });

        // Check if we have Google tokens in the session
        if (data.session?.provider_token) {
          console.log(
            "💾 Storing Google tokens for user:",
            data.session.user.id,
          );

          // Securely send the session to our server-side API route to store tokens.
          // This avoids using the admin client on the browser.
          const response = await fetch("/api/auth/store-tokens", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session: data.session }),
          });

          if (response.ok) {
            console.log("✅ Google tokens stored successfully via API");
          } else {
            const result = await response.json();
            console.error(
              "❌ Error storing Google tokens via API:",
              result.error,
            );
          }
        } else {
          console.log("❌ No provider token available in session to store.");
          console.log(
            "🔍 Full session object:",
            JSON.stringify(data.session, null, 2),
          );

          // Try to get tokens from URL parameters (fallback)
          const urlParams = new URLSearchParams(window.location.search);
          const code = urlParams.get("code");
          console.log("🔍 URL parameters:", {
            hasCode: !!code,
            codeLength: code?.length || 0,
            allParams: Object.fromEntries(urlParams.entries()),
          });

          if (code) {
            console.log(
              "🔍 Found authorization code, exchanging for tokens...",
            );
            try {
              const response = await fetch("/api/auth/google-tokens", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: data.session.user.id, code }),
              });
              const result = await response.json();
              if (response.ok) {
                console.log("✅ Tokens exchanged and stored successfully");
              } else {
                console.error("❌ Failed to exchange code for tokens:", result);
              }
            } catch (error) {
              console.error("❌ Error exchanging code for tokens:", error);
            }
          } else {
            console.log("❌ No authorization code found in URL");
          }
        }

        // Check if user has a subscription
        const { data: subscription } = await supabase
          .from("user_subscriptions")
          .select("id, status")
          .eq("user_id", data.session.user.id)
          .maybeSingle();

        // If no subscription, redirect to billing to set up trial
        if (!subscription) {
          console.log(
            "No subscription found, redirecting to billing for trial setup",
          );
          router.push("/dashboard/billing?trial=true&new=true");
        } else {
          console.log("Subscription found, redirecting to dashboard");
          router.push("/dashboard");
        }
      } else {
        router.push("/auth/signin?error=no_session");
      }
    };

    handleAuthCallback();
  }, [
    router,
    searchParams,
    supabase.from,
    supabase.auth.getSession,
    supabase.auth.signOut,
  ]);

  return (
    <div className="bg-background flex items-center justify-center">
      <div className="text-foreground text-center max-w-md px-4">
        {errorMessage ? (
          <>
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-destructive mb-2">
              Authentication Error
            </h2>
            <p className="text-muted-foreground mb-4">{errorMessage}</p>
            <p className="text-sm text-muted-foreground">
              Redirecting to sign in...
            </p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Completing sign in...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-foreground text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
