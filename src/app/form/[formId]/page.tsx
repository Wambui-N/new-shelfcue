"use client";

import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { FontLoader } from "@/components/FontLoader";
import { FormDisplay } from "@/components/forms/FormDisplay";
import { createThemeFromBrand } from "@/lib/theme-generator";
import type { FormData } from "@/types/form";
import type {
  FormDisplayMode,
  FormLayout,
  FormTheme,
} from "@/types/form-display";

interface PublicFormPageProps {
  params: Promise<{ formId: string }>;
}

export default function PublicFormPage({ params }: PublicFormPageProps) {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formId, setFormId] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [displayMode, setDisplayMode] = useState<FormDisplayMode>("standalone");
  const [layout, setLayout] = useState<FormLayout>("simple");
  const [displayTheme, setDisplayTheme] = useState<FormTheme | null>(null);

  useEffect(() => {
    const getFormId = async () => {
      const resolvedParams = await params;
      setFormId(resolvedParams.formId);
    };
    getFormId();
  }, [params]);

  useEffect(() => {
    if (!formId) return;

    const fetchForm = async () => {
      setLoading(true);
      try {
        // Fetch public form data via API to bypass RLS
        const response = await fetch(`/api/forms/${formId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Form not found");
        }

        const data = await response.json();

        if (!data || data.status !== "published") {
          setError("Form not found or not published.");
          return;
        }

        console.log("Fetched public form:", data);

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

        // Create display theme from form theme
        const theme = data.theme
          ? { ...defaultTheme, ...data.theme }
          : defaultTheme;
        const newDisplayTheme = createThemeFromBrand(
          theme.primaryColor,
          theme.fontFamily,
        );

        setFormData({
          id: formId,
          title: data.title || "Form",
          header: data.header || data.title || "Form",
          description: data.description || "",
          status: data.status || "published",
          fields: data.fields || [],
          theme: theme,
          settings: data.settings
            ? { ...defaultSettings, ...data.settings }
            : defaultSettings,
        } as FormData);

        // Set display settings
        setDisplayMode(data.displayMode || "standalone");
        setLayout(data.layout || "simple");
        setDisplayTheme(newDisplayTheme);
      } catch (error: any) {
        console.error("Error fetching form:", {
          message: error?.message,
          code: error?.code,
          details: error?.details,
          hint: error?.hint,
          error,
        });
        setError("Form not found or an error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId]);

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

      // Dispatch event to refresh dashboard counts
      window.dispatchEvent(new CustomEvent("submissionReceived"));
      setIsSubmitted(true);
      
      // Handle redirect if URL is provided
      if (formData?.settings?.redirectUrl) {
        window.location.href = formData.settings.redirectUrl;
      }

    } catch (err: any) {
      console.error("Error submitting form:", err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Form Not Available
          </h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    const theme = formData?.theme || {
      primaryColor: "#151419",
      backgroundColor: "#fafafa",
      textColor: "#151419",
      borderRadius: 8,
      fontFamily: "Satoshi",
    };

    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: theme.backgroundColor,
          fontFamily: theme.fontFamily,
        }}
      >
        <div className="text-center max-w-md mx-auto px-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{
              backgroundColor: `${theme.primaryColor}20`,
            }}
          >
            <CheckCircle
              className="w-8 h-8"
              style={{ color: theme.primaryColor }}
            />
          </div>
          <h2
            className="text-2xl font-bold mb-2"
            style={{ color: theme.textColor }}
          >
            Submission Received!
          </h2>
          <p style={{ color: theme.textColor, opacity: 0.8 }}>
            {formData?.settings?.successMessage ||
              "Thank you for your submission."}
          </p>

          {/* Watermark */}
          {formData?.settings?.showWatermark !== false && (
            <div className="mt-12 pt-6 border-t" style={{ borderColor: `${theme.primaryColor}20` }}>
              <div className="flex items-center justify-center gap-2">
                <img
                  src="/1.png"
                  alt="ShelfCue Logo"
                  className="h-4 w-auto opacity-70"
                />
                <p className="text-xs" style={{ color: theme.textColor, opacity: 0.6 }}>
                  Powered by{" "}
                  <a
                    href="https://shelfcue.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                    style={{ color: theme.primaryColor }}
                  >
                    ShelfCue
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (formData && displayTheme) {
    return (
      <>
        <FontLoader fontFamily={displayTheme.fontFamily} />
        <FormDisplay
          formId={formData.id || "public-form"}
          title={formData.title}
          header={formData.header}
          description={formData.description}
          fields={formData.fields}
          mode={displayMode}
          layout={layout}
          theme={formData.theme}
          onSubmit={handleSubmit}
          isSubmitting={false}
          leftSectionDescription={formData.settings.leftSectionDescription}
          leftSectionLink={formData.settings.leftSectionLink}
          showWatermark={formData.settings.showWatermark !== false}
        />
      </>
    );
  }

  return null;
}
