"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error);
        router.push("/auth/signin?error=auth_callback_error");
        return;
      }

      if (data.session) {
        // Store Google tokens if available
        if (data.session.provider_token) {
          await supabase.from("user_google_tokens").upsert({
            user_id: data.session.user.id,
            access_token: data.session.provider_token,
            refresh_token: data.session.provider_refresh_token || "",
            expires_at: Date.now() + (data.session.expires_in || 3600) * 1000,
          });
        }

        router.push("/dashboard");
      } else {
        router.push("/auth/signin?error=no_session");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-foreground text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Completing sign in...</p>
      </div>
    </div>
  );
}
