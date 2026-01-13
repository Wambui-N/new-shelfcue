"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
  const [creating, setCreating] = useState(false);

  const initialForm = useMemo(
    () => ({
      id: "",
      title: "Untitled Form",
      header: "Untitled Form",
      description: "",
      status: "draft" as const,
      fields: [],
      theme: {
        primaryColor: "#151419",
        backgroundColor: "#fafafa",
        textColor: "#151419",
        borderRadius: 8,
        fontFamily: "Satoshi",
      },
      settings: {
        showTitle: true,
        showDescription: true,
        submitButtonText: "Submit",
        successMessage: "Thank you for your submission!",
        collectEmail: false,
        allowMultipleSubmissions: true,
        showWatermark: true,
        mode: "standalone" as const,
        layout: "simple" as const,
      },
      lastSaved: undefined,
    }),
    [],
  );

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

    const createDraftAndRedirect = async () => {
      setCreating(true);
      resetForm();
      loadForm(initialForm);

      try {
        const formId = crypto.randomUUID();
        const payload = { ...initialForm, id: formId };

        const response = await fetch(`/api/forms/${formId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Failed to create form");
        }

        const { data } = await response.json();
        loadForm(data ?? payload);

        // Single navigation to the fresh editor route
        router.replace(`/editor/${formId}`);
      } catch (error) {
        console.error("Error creating new form:", error);
        alert("We couldn't start your new form. Please try again.");
      } finally {
        setCreating(false);
        setLoading(false);
      }
    };

    checkSubscription().then(createDraftAndRedirect);
  }, [user, router, resetForm, loadForm, initialForm]);

  const handleBack = () => {
    router.push("/dashboard/forms");
  };

  if (loading || creating) {
    return (
      <ProtectedRoute>
        <div className="fixed inset-0 bg-background flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="relative flex flex-col items-center gap-4 px-6 py-8 rounded-2xl bg-card/80 border shadow-lg"
          >
            <div className="h-12 w-12 rounded-full border-2 border-primary/20 flex items-center justify-center">
              <div className="h-6 w-6 rounded-full bg-primary animate-ping" />
            </div>
            <div className="text-lg font-semibold text-foreground">
              Creating your form...
            </div>
            <div className="text-sm text-muted-foreground text-center">
              We’re setting things up. You’ll land in the editor as soon as it’s ready.
            </div>
          </motion.div>
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
