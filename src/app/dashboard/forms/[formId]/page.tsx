"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  Edit,
  ExternalLink,
  Share2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormPreview } from "@/components/builder/FormPreview";
import { ShareDialog } from "@/components/builder/ShareDialog";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { FormViewSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { useFormStore } from "@/store/formStore";
import type { FormData } from "@/types/form";

interface FormViewPageProps {
  params: Promise<{ formId: string }>;
}

function FormViewPage({ params }: FormViewPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [_copied, setCopied] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [formId, setFormId] = useState<string>("");
  const [_activeTab, _setActiveTab] = useState("submissions");
  const { loadForm } = useFormStore();

  useEffect(() => {
    const getFormId = async () => {
      const resolvedParams = await params;
      setFormId(resolvedParams.formId);
    };
    getFormId();
  }, [params]);

  useEffect(() => {
    if (!formId || !user) return;

    let cancelled = false; // Add cancellation flag

    const fetchForm = async () => {
      setLoading(true);
      try {
        const { data, error } = await (supabase as any)
          .from("forms")
          .select("*")
          .eq("id", formId)
          .maybeSingle();

        if (cancelled) return; // Check if cancelled

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        if (!data) {
          setError("Form not found. It may have been deleted.");
          return;
        }

        console.log("Fetched form:", data);

        // Check if user owns this form
        if (data.user_id !== user.id) {
          setError("You don't have permission to view this form.");
          return;
        }

        const defaultTheme = {
          primaryColor: "#151419",
          backgroundColor: "#fafafa",
          textColor: "#151419",
          borderRadius: 8,
          fontFamily: "Satoshi",
        };

        const defaultSettings = {
          showTitle: true,
          showDescription: true,
          submitButtonText: "Submit",
          successMessage: "Thank you for your submission!",
          collectEmail: false,
          allowMultipleSubmissions: true,
          showWatermark: true,
        };

        if (cancelled) return; // Check if cancelled before state updates

        setFormData({
          id: formId,
          title: data.title || "Untitled Form",
          description: data.description || "",
          status: data.status || "draft",
          fields: data.fields || [],
          theme: data.theme ? { ...defaultTheme, ...data.theme } : defaultTheme,
          settings: data.settings
            ? { ...defaultSettings, ...data.settings }
            : defaultSettings,
        } as FormData);
        loadForm({
          id: formId,
          title: data.title || "Untitled Form",
          description: data.description || "",
          status: data.status || "draft",
          fields: data.fields || [],
          theme: data.theme ? { ...defaultTheme, ...data.theme } : defaultTheme,
          settings: data.settings
            ? { ...defaultSettings, ...data.settings }
            : defaultSettings,
        });
      } catch (error: any) {
        if (cancelled) return; // Check if cancelled
        console.error("Error fetching form:", {
          message: error?.message,
          code: error?.code,
          details: error?.details,
          error,
        });
        setError("Form not found or an error occurred.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchForm();

    return () => {
      cancelled = true; // Cleanup: mark as cancelled
    };
  }, [formId, user]); // Remove supabase and loadForm from dependencies

  const _handleSubmit = async (submissionData: Record<string, any>) => {
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId: formId, data: submissionData }),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error || "Failed to submit the form.");
      }

      setSuccess(true);

      // Dispatch event to refresh sidebar counts
      window.dispatchEvent(new CustomEvent("submissionReceived"));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const _copyFormUrl = () => {
    const formUrl = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(formUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFormUrl = () => {
    return `${window.location.origin}/form/${formId}`;
  };

  if (loading) {
    return <FormViewSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/forms")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Forms
          </Button>
        </div>

        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 text-center">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExternalLink className="w-6 h-6 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-destructive mb-4">
              Form Error
            </h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => router.push("/dashboard/forms")}>
              Go to Forms
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/forms")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Forms
          </Button>
        </div>

        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              Thank You!
            </h2>
            <p className="text-muted-foreground mb-6">
              Your submission has been received successfully.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setSuccess(false)}>
                Submit Another Response
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/forms")}
              >
                Back to Forms
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (formData) {
    return (
      <div className="space-y-6 min-w-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 min-w-0">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/forms")}
              className="flex items-center gap-2 w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Forms
            </Button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                {formData.title}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge
                  variant={
                    formData.status === "published" ? "default" : "secondary"
                  }
                >
                  {formData.status === "published" ? "Published" : "Draft"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {formData.fields.length} field
                  {formData.fields.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/editor/${formId}`)}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Button>
            <Button
              onClick={() => setShowShareDialog(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Share2 className="w-4 h-4" />
              Share & Embed
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(getFormUrl(), "_blank")}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open
            </Button>
          </div>
        </div>

        {/* Form Preview - 16:9 on large screens, fit content no scroll */}
        <div className="flex items-center justify-center overflow-hidden py-8 px-4 min-h-[calc(100vh-200px)] max-h-[calc(100vh-180px)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-2xl min-w-0 lg:aspect-[21/9] lg:max-h-[calc(100vh-220px)] lg:w-auto lg:max-w-full lg:min-w-[920px]"
          >
            <Card className="p-6 lg:p-0 lg:h-full lg:overflow-hidden lg:flex lg:flex-col min-h-0">
              <div className="lg:flex-1 lg:min-h-0 lg:overflow-hidden lg:p-4">
                <FormPreview fitPreview />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Share Dialog */}
        <ShareDialog
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
          formId={formId}
          formTitle={formData.title}
          formStatus={formData.status}
        />
      </div>
    );
  }

  return null;
}

// Wrap with ProtectedRoute
export default function ProtectedFormViewPage(props: any) {
  return (
    <ProtectedRoute>
      <FormViewPage {...props} />
    </ProtectedRoute>
  );
}
