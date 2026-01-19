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

          try {
            const response = await fetch("/api/auth/check-user", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: data.session.user.email }),
            });

            if (!response.ok) {
              console.error(
                "Error checking user existence:",
                response.statusText,
              );
              router.push("/auth/signin?error=user_check_failed");
              return;
            }

            const result = (await response.json()) as { exists?: boolean };

            if (!result.exists) {
              console.log(
                "User not found in database, redirecting to signup with consent",
              );
              await supabase.auth.signOut();
              router.push("/auth/signup?consent=true");
              return;
            }
          } catch (error) {
            console.error("Error checking user existence:", error);
            router.push("/auth/signin?error=user_check_failed");
            return;
          }
        }

        // Store provider tokens (Calendar/Sheets) from the current session.
        // For returning users, Google may omit refresh_token; our storage layer preserves
        // the previously stored refresh token to avoid breaking existing connections.
        if (data.session.provider_token) {
          try {
            await fetch("/api/auth/store-google-tokens", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${data.session.access_token}`,
              },
              body: JSON.stringify({
                provider_token: data.session.provider_token,
                provider_refresh_token: data.session.provider_refresh_token,
                expires_at: data.session.expires_at,
              }),
            });
          } catch (tokenError) {
            console.warn("⚠️ Failed to store Google tokens:", tokenError);
          }
        }

        // Check if this is a new user (no subscription yet)
        const { data: subscription } = await supabase
          .from("user_subscriptions")
          .select("id")
          .eq("user_id", data.session.user.id)
          .maybeSingle();

        const isNewUser = !subscription;

        // Redirect new users to welcome page for setup
        if (isNewUser) {
          console.log("🆕 New user detected, redirecting to welcome page");
          router.push("/auth/welcome");
          return;
        }

        // For returning users, continue to dashboard
        console.log("✅ Returning user, redirecting to dashboard");
        router.push("/dashboard");
      } else {
        router.push("/auth/signin?error=no_session");
      }
    };

    handleAuthCallback();
  }, [router, searchParams, supabase]);

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
                role="img"
                aria-labelledby="auth-error-icon-title"
              >
                <title id="auth-error-icon-title">
                  Authentication error icon
                </title>
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
