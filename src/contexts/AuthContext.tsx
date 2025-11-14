"use client";

import type { AuthError, Session, User } from "@supabase/supabase-js";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signUpWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    // Check if user exists in database to determine OAuth prompt
    const _checkUserExists = async (email: string) => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("id")
          .eq("email", email)
          .single();

        if (error && error.code !== "PGRST116") {
          // PGRST116 = no rows returned
          console.error("Error checking user existence:", error);
          return false;
        }

        return !!data;
      } catch (error) {
        console.error("Error checking user existence:", error);
        return false;
      }
    };

    // For sign-in, we need to check if user exists first
    // This is a bit tricky since we don't have the email yet
    // We'll use a different approach - check the callback URL parameter
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes:
          "openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive.file",
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback?mode=signin`,
        queryParams: {
          access_type: "offline",
          prompt: "select_account", // Default to select_account, will be overridden in callback if needed
        },
      },
    });

    if (error) {
      console.error("❌ OAuth Error:", error);
    }

    return { error };
  };

  const signUpWithGoogle = async () => {
    // For sign-up, we need to force consent to get all required permissions
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes:
          "openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive.file",
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent", // Force consent for new users
        },
      },
    });

    if (error) {
      console.error("❌ OAuth Error:", error);
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signUpWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
