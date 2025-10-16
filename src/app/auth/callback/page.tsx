"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check for OAuth errors in URL params
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      
      if (error) {
        console.error("OAuth error:", error, errorDescription);
        const message = errorDescription 
          ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
          : 'Authentication failed';
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
        // Store Google tokens if available
        console.log('🔍 Session data:', {
          hasProviderToken: !!data.session.provider_token,
          hasRefreshToken: !!data.session.provider_refresh_token,
          expiresIn: data.session.expires_in,
          userId: data.session.user.id
        });
        
        if (data.session.provider_token) {
          console.log('💾 Storing Google tokens for user:', data.session.user.id);
          // Store expiry as seconds since epoch to match server utilities
          const expiresAtSeconds = Math.floor(Date.now() / 1000) + (data.session.expires_in || 3600);
          const { error: tokenError } = await supabase.from("user_google_tokens").upsert({
            user_id: data.session.user.id,
            access_token: data.session.provider_token,
            refresh_token: data.session.provider_refresh_token || "",
            expires_at: expiresAtSeconds,
          });
          if (tokenError) {
            console.error('❌ Error storing Google tokens:', tokenError);
          } else {
            console.log('✅ Google tokens stored successfully');
          }
        } else {
          console.log('❌ No provider token available in session');
        }

        // Check if user has a subscription
        const { data: subscription } = await supabase
          .from("user_subscriptions")
          .select("id, status")
          .eq("user_id", data.session.user.id)
          .maybeSingle();

        // If no subscription, redirect to billing to set up trial
        if (!subscription) {
          console.log('No subscription found, redirecting to billing for trial setup');
          router.push("/dashboard/billing?trial=true&new=true");
        } else {
          console.log('Subscription found, redirecting to dashboard');
          router.push("/dashboard");
        }
      } else {
        router.push("/auth/signin?error=no_session");
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-foreground text-center max-w-md px-4">
        {errorMessage ? (
          <>
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-destructive mb-2">Authentication Error</h2>
            <p className="text-muted-foreground mb-4">{errorMessage}</p>
            <p className="text-sm text-muted-foreground">Redirecting to sign in...</p>
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
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
