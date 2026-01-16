"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { generateGoogleOAuthUrl } from "@/lib/google-oauth-url";

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

      // Check if returning from Google OAuth with tokens stored
      const googleTokensStored = searchParams.get("google_tokens_stored");

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

        // Check if user has Google API tokens
        const { data: existingTokens } = await supabase
          .from("user_google_tokens")
          .select("id")
          .eq("user_id", data.session.user.id)
          .maybeSingle();

        const needsOAuth = !existingTokens && !googleTokensStored;

        console.log("🔍 Token status:", {
          userId: data.session.user.id,
          hasTokens: !!existingTokens,
          googleTokensStored,
          needsOAuth,
        });

        // If user doesn't have tokens and we haven't just stored them, redirect to OAuth
        if (needsOAuth) {
          console.log(
            "No Google API tokens found, redirecting to OAuth consent...",
          );

          // Show a friendly message before redirecting
          setErrorMessage(
            "🔄 Setting up Google Calendar and Sheets access... You'll be redirected to grant permissions.",
          );

          // Wait a moment so user can see the message
          await new Promise((resolve) => setTimeout(resolve, 2000));

          try {
            // Generate OAuth URL directly
            const authUrl = generateGoogleOAuthUrl(
              data.session.user.id,
              "signup",
            );

            console.log("🔄 Redirecting to Google OAuth for API token consent");
            window.location.href = authUrl;
            return;
          } catch (error) {
            console.error("❌ Failed to generate OAuth URL:", error);
            setErrorMessage(
              "Failed to initialize Google integration. Please try again or contact support.",
            );
            setTimeout(() => {
              router.push("/dashboard");
            }, 3000);
            return;
          }
        }

        if (googleTokensStored) {
          console.log("✅ Returned from OAuth - Google API tokens now stored");
        } else if (existingTokens) {
          console.log("✅ User already has Google API tokens");
        }

        // Check if this is a new user (no subscription yet)
        const { data: subscription } = await supabase
          .from("user_subscriptions")
          .select("id")
          .eq("user_id", data.session.user.id)
          .maybeSingle();

        const isNewUser = !subscription;

        // Create trial subscription and first form for new users
        if (isNewUser) {
          // Send welcome email (fire and forget)
          fetch("/api/auth/welcome-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: data.session.user.id }),
          }).catch((error) => {
            console.error("Failed to send welcome email:", error);
          });

          // Create trial subscription for new user
          console.log("Creating trial subscription for new user...");
          try {
            const { data: { session: authSession } } = await supabase.auth.getSession();
            const trialResponse = await fetch(
              "/api/subscriptions/create-my-trial",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": authSession?.access_token ? `Bearer ${authSession.access_token}` : "",
                },
              },
            );

            if (trialResponse.ok) {
              console.log("✅ Trial subscription created successfully");
            } else {
              console.error("❌ Failed to create trial subscription");
            }
          } catch (error) {
            console.error("❌ Error creating trial:", error);
          }

          // Create first draft form and redirect to editor
          console.log("Creating first draft form for new user...");
          try {
            const formId = crypto.randomUUID();
            const { data: { session: formSession } } = await supabase.auth.getSession();
            
            const formResponse = await fetch(`/api/forms/${formId}`, {
              method: "PUT",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": formSession?.access_token ? `Bearer ${formSession.access_token}` : "",
              },
              body: JSON.stringify({
                title: "Untitled Form",
                description: "",
                fields: [],
                status: "draft",
              }),
            });

            if (formResponse.ok) {
              console.log("✅ First form created, redirecting to editor");
              router.replace(`/editor/${formId}`);
              return;
            } else {
              console.error("❌ Failed to create first form");
            }
          } catch (error) {
            console.error("❌ Error creating first form:", error);
          }
        }

        console.log("Redirecting to dashboard");
        router.replace("/dashboard");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
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
