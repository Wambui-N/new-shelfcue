"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormBuilder } from "@/components/builder/FormBuilder";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { FormEditSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { useFormStore } from "@/store/formStore";
import type { FormData } from "@/types/form";

interface EditorPageProps {
  params: Promise<{ formId: string }>;
}

function EditorPage({ params }: EditorPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  const { loadForm } = useFormStore();
  const [loading, setLoading] = useState(true);
  const [formId, setFormId] = useState<string>("");

  useEffect(() => {
    const getFormId = async () => {
      const resolvedParams = await params;
      setFormId(resolvedParams.formId);
    };
    getFormId();
  }, [params]);

  useEffect(() => {
    if (!formId || !user) return;

    const fetchForm = async () => {
      setLoading(true);
      try {
        // Get session token
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token) {
          console.error("No session token available");
          router.push("/login");
          return;
        }

        // Check subscription status first
        const subscriptionResponse = await fetch("/api/subscriptions/current", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (subscriptionResponse.ok) {
          const subData = await subscriptionResponse.json();
          const subscription = subData.subscription;

          // Check if trial has expired
          if (subscription?.status === "trial" && subscription?.trial_end) {
            const trialEnd = new Date(subscription.trial_end);
            const now = new Date();
            if (trialEnd < now) {
              // Trial expired - redirect to billing
              alert(
                "Your trial has expired. Please subscribe to continue using the editor.",
              );
              router.push("/dashboard/billing");
              return;
            }
          }

          // Check if subscription is expired or cancelled
          if (
            subscription?.status === "expired" ||
            subscription?.status === "cancelled"
          ) {
            alert(
              "Your subscription has expired. Please subscribe to continue using the editor.",
            );
            router.push("/dashboard/billing");
            return;
          }
        }

        const { data, error } = await (supabase as any)
          .from("forms")
          .select("*")
          .eq("id", formId)
          .maybeSingle();

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        if (!data) {
          console.error("Form not found or has been deleted");
          alert("Form not found. It may have been deleted.");
          router.push("/dashboard/forms");
          return;
        }

        // Check if user owns this form
        if (data.user_id !== user.id) {
          console.error("Unauthorized access to form");
          router.push("/dashboard/forms");
          return;
        }

        // Ensure fields have stable unique ids
        const normalizedFields = Array.isArray(data.fields)
          ? data.fields.map((f: any, idx: number) => ({
              ...f,
              id:
                f?.id && typeof f.id === "string"
                  ? f.id
                  : `field_${Date.now()}_${idx}`,
            }))
          : [];

        // Default theme
        const defaultTheme = {
          primaryColor: "#151419", // SaaS primary color
          backgroundColor: "#fafafa", // SaaS background color
          textColor: "#151419",
          borderRadius: 8,
          fontFamily: "Satoshi", // SaaS default font
        };

        // Default settings
        const defaultSettings = {
          showTitle: true,
          showDescription: true,
          submitButtonText: "Submit",
          successMessage: "Thank you for your submission!",
          collectEmail: false,
          allowMultipleSubmissions: true,
          showWatermark: true,
          mode: "standalone",
          layout: "simple",
        };

        // Load form data with proper structure
        loadForm({
          id: formId,
          title: data.title || "Untitled Form",
          header: data.header || data.title || "Untitled Form", // Use header if exists, else sync with title
          description: data.description || "",
          status: data.status || "draft",
          fields: normalizedFields,
          theme: data.theme ? { ...defaultTheme, ...data.theme } : defaultTheme,
          settings: data.settings
            ? { ...defaultSettings, ...data.settings }
            : defaultSettings,
          default_calendar_id: data.default_calendar_id || undefined,
          lastSaved: new Date(),
        } as FormData);
      } catch (error: any) {
        console.error("Error fetching form:", {
          message: error?.message,
          code: error?.code,
          details: error?.details,
          hint: error?.hint,
          error,
        });
        alert(`Error loading form: ${error?.message || "Unknown error"}`);
        router.push("/dashboard/forms");
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId, user, loadForm, router, supabase]);

  const handleBack = () => {
    router.push("/dashboard/forms");
  };

  if (loading) {
    return <FormEditSkeleton />;
  }

  return (
    <div className="fixed inset-0 bg-background">
      <FormBuilder onBack={handleBack} />
    </div>
  );
}

// Wrap with ProtectedRoute
export default function ProtectedEditorPage(props: EditorPageProps) {
  return (
    <ProtectedRoute>
      <EditorPage {...props} />
    </ProtectedRoute>
  );
}
