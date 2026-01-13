"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FullPageLoader } from "@/components/skeletons/AppLoadingStates";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin");
    }
  }, [user, loading, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return <FullPageLoader label="Confirming your session…" />;
  }

  // Redirect to sign-in if not authenticated
  if (!user) {
    return null;
  }

  // Render children if authenticated
  return <>{children}</>;
}
