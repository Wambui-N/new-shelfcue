"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { AuthError } from "@supabase/supabase-js";

export default function AuthTestPage() {
  const [error, setError] = useState<AuthError | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    // Using the simplest possible OAuth call
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // We add all scopes here to ensure the consent screen is correct
        scopes: 'openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets',
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (error) {
      console.error("Auth Test Error:", error);
      setError(error);
    } else {
      console.log("Auth Test Success:", data);
      setResult(data);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">OAuth Test Page</h1>
        <p className="text-gray-600 mb-6">
          This page uses a minimal setup to test the Google Sign-In flow.
        </p>
        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? "Redirecting..." : "Test Google Sign In"}
        </button>

        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-md text-left">
            <h3 className="font-bold">An Error Occurred</h3>
            <pre className="text-sm whitespace-pre-wrap break-all">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}

        {result && (
          <div className="mt-6 p-4 bg-green-100 text-green-700 rounded-md text-left">
            <h3 className="font-bold">Success!</h3>
            <p>OAuth flow initiated successfully. Check the redirect.</p>
            <pre className="text-sm whitespace-pre-wrap break-all">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
