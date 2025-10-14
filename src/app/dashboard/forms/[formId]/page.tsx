"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle,
  Copy,
  Edit,
  ExternalLink,
  Eye,
  Settings,
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
import { supabase } from "@/lib/supabase";
import type { FormData } from "@/types/form";

interface FormViewPageProps {
  params: Promise<{ formId: string }>;
}

function FormViewPage({ params }: FormViewPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
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
        const { data, error } = await supabase
          .from("forms")
          .select("*")
          .eq("id", formId)
          .single();

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        if (!data) {
          throw new Error("Form not found");
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
        };

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
      } catch (error: any) {
        console.error("Error fetching form:", {
          message: error?.message,
          code: error?.code,
          details: error?.details,
          error,
        });
        setError("Form not found or an error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId, user]);

  const handleSubmit = async (submissionData: Record<string, any>) => {
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

  const copyFormUrl = () => {
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/forms")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Forms
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {formData.title}
              </h1>
              <div className="flex items-center gap-2 mt-1">
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

          <div className="flex items-center gap-2">
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

        {/* Form Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="p-6">
            <div className="max-w-2xl mx-auto">
              <FormPreview formData={formData} onSubmit={handleSubmit} />
            </div>
          </Card>
        </motion.div>

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
