"use client";

import { Calendar, FileSpreadsheet, Shield } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithGoogle } = useAuth();

  // Check for error in URL params
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      setError(decodeURIComponent(urlError));
    }
  }, [searchParams]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");

    const { error } = await signInWithGoogle();

    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
    // For OAuth, the loading state will be handled by the callback page
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Welcome Back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in with Google to access your forms
        </p>
      </div>

      {/* Why Google Required */}
      <div className="bg-muted/30 rounded-lg p-4 space-y-3">
        <p className="text-xs font-semibold text-foreground mb-2">Google account required for:</p>
        <div className="flex items-start gap-2">
          <FileSpreadsheet className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Syncing form submissions to Google Sheets
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Creating calendar events from bookings
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Secure access to your account
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Google Sign In Button */}
      <Button
        type="button"
        className="w-full bg-white text-gray-900 hover:bg-gray-50 border-2 border-gray-200 font-semibold py-6"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {isLoading ? "Connecting to Google..." : "Sign in with Google"}
      </Button>

      {/* Security Note */}
      <p className="text-xs text-center text-muted-foreground">
        🔒 We use Google OAuth for secure authentication and don't store your password
      </p>

      {/* Don't have account */}
      <div className="text-center pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <a
            href="/auth/signup"
            className="text-primary hover:underline font-medium"
          >
            Start free trial
          </a>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="text-center">Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
