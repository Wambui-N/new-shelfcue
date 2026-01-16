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
          .select("id, status, created_at")
          .eq("user_id", data.session.user.id)
          .maybeSingle();

        // Determine if new user: created within last 5 minutes OR no subscription
        const userCreatedAt = new Date(data.session.user.created_at);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const isNewUser = !subscription || userCreatedAt > fiveMinutesAgo;
        
        console.log("🔍 User status:", {
          userId: data.session.user.id,
          userCreatedAt: userCreatedAt.toISOString(),
          hasSubscription: !!subscription,
          isNewUser,
        });
        
        // For new users, check if they have Google API tokens (unless just stored)
        if (isNewUser && !googleTokensStored) {
          console.log("New user detected, checking for Google API tokens...");
          
          const { data: tokenData } = await supabase
            .from("user_google_tokens")
            .select("id")
            .eq("user_id", data.session.user.id)
            .maybeSingle();

          if (!tokenData) {
            // No API tokens - redirect to Google OAuth to get them
            console.log("No Google API tokens found, initiating OAuth flow...");
            
            try {
              const authResponse = await fetch(
                `/api/auth/google-connect?userId=${data.session.user.id}|from_signup`
              );
              
              if (authResponse.ok) {
                const { authUrl } = await authResponse.json();
                console.log("Redirecting to Google OAuth for API token consent");
                window.location.href = authUrl;
                return;
              } else {
                console.warn("Could not initiate Google OAuth, continuing with setup");
              }
            } catch (error) {
              console.error("Error initiating OAuth:", error);
            }
          } else {
            console.log("Google API tokens already exist");
          }
        } else if (googleTokensStored) {
          console.log("✅ Returned from OAuth - Google API tokens now stored");
        }

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
