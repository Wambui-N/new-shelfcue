"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormBuilder } from "@/components/builder/FormBuilder";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { FormEditSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useFormStore } from "@/store/formStore";

export default function NewFormEditorPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { resetForm, loadForm } = useFormStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const checkSubscription = async () => {
      try {
        // Check subscription status first
        const subscriptionResponse = await fetch("/api/subscriptions/current");
        if (subscriptionResponse.ok) {
          const subData = await subscriptionResponse.json();
          const subscription = subData.subscription;
          
          // Check if trial has expired
          if (
            subscription?.status === "trial" &&
            subscription?.trial_end
          ) {
            const trialEnd = new Date(subscription.trial_end);
            const now = new Date();
            if (trialEnd < now) {
              // Trial expired - redirect to billing
              alert("Your trial has expired. Please subscribe to create new forms.");
              router.push("/dashboard/billing");
              return;
            }
          }
          
          // Check if subscription is expired or cancelled
          if (
            subscription?.status === "expired" ||
            subscription?.status === "cancelled"
          ) {
            alert("Your subscription has expired. Please subscribe to create new forms.");
            router.push("/dashboard/billing");
            return;
          }

          // Check if user can create forms
          const limitResponse = await fetch("/api/forms/check-limit");
          if (limitResponse.ok) {
            const limitData = await limitResponse.json();
            if (!limitData.allowed) {
              alert(limitData.message || "You've reached your form limit. Please upgrade your plan to create more forms.");
              router.push("/dashboard/billing");
              return;
            }
          }
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [user, router]);

  useEffect(() => {
    if (!user || loading) return;

    // Reset form store for new form (in-memory only, no DB creation yet)
    resetForm();

    // Load a blank form into the store with defaults
    // The form will be created in the database on first save
    loadForm({
      id: "", // No ID yet - will be generated on first save
      title: "Untitled Form",
      header: "Untitled Form", // Auto-sync with title initially
      description: "",
      status: "draft",
      fields: [],
      theme: {
        primaryColor: "#151419", // SaaS primary color
        backgroundColor: "#fafafa", // SaaS background color
        textColor: "#151419",
        borderRadius: 8,
        fontFamily: "Satoshi", // SaaS default font
      },
      settings: {
        showTitle: true,
        showDescription: true,
        submitButtonText: "Submit",
        successMessage: "Thank you for your submission!",
        collectEmail: false,
        allowMultipleSubmissions: true,
        showWatermark: true,
        mode: "standalone",
        layout: "simple",
      },
      lastSaved: undefined,
    });
  }, [user, loading, resetForm, loadForm]);

  const handleBack = () => {
    router.push("/dashboard/forms");
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="fixed inset-0 bg-background">
          <FormEditSkeleton />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="fixed inset-0 bg-background">
        <FormBuilder onBack={handleBack} />
      </div>
    </ProtectedRoute>
  );
}
