"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  Loader2,
  Monitor,
  Palette,
  Plus,
  Save,
  Settings,
  Share2,
  Smartphone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { useFormStore } from "@/store/formStore";
import { DisplayEditor } from "./DisplayEditor";
import { FieldEditor } from "./FieldEditor";
import { FormPreview } from "./FormPreview";
import { FormSettings } from "./FormSettings";
import { MeetingConfigDialog } from "./MeetingConfigDialog";
import { PublishProgressDialog } from "./PublishProgressDialog";
import { ShareDialog } from "./ShareDialog";

interface FormBuilderProps {
  onBack: () => void;
}

export function FormBuilder({ onBack }: FormBuilderProps) {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  const { formData, isDirty, isSaving, updateForm, setDirty, setSaving } =
    useFormStore();
  const [activeTab, setActiveTab] = useState("fields");
  const [deviceView, setDeviceView] = useState<"desktop" | "mobile">("desktop");
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showMeetingConfigDialog, setShowMeetingConfigDialog] = useState(false);
  const [showPublishProgress, setShowPublishProgress] = useState(false);
  const [pendingPublish, setPendingPublish] = useState(false);
  const [publishProgress, setPublishProgress] = useState<{
    saving?: "pending" | "loading" | "completed" | "error";
    sheet?: "pending" | "loading" | "completed" | "error";
    meeting?: "pending" | "loading" | "completed" | "error";
  }>({});
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>("");

  // Ensure email field exists if a meeting field is present
  useEffect(() => {
    const hasMeetingField = formData.fields.some((f) => f.type === "meeting");
    const hasEmailField = formData.fields.some((f) => f.type === "email_field");

    if (hasMeetingField && !hasEmailField) {
      // This is a failsafe. The main logic is in formStore.ts.
      // This handles loading existing forms that might be in an invalid state.
      console.warn("Form has meeting field but no email field. Adding one.");
      useFormStore.getState().addField({
        id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: "email_field",
        label: "Email Address",
        required: true,
        placeholder: "Enter your email address...",
      });
    }
  }, [formData.fields]);

  // Autosave functionality
  const handleSave = useCallback(
    async (status?: "draft" | "published") => {
      console.log("handleSave called");
      console.log("User:", user ? user.id : "not authenticated");
      console.log("Form ID:", formData.id);

      if (!user) {
        console.error("❌ Cannot save: user not authenticated");
        return null;
      }

      setSaving(true);
      setSaveStatus("saving");

      try {
        // Generate new ID if this is a new form without one
        const formId = formData.id || crypto.randomUUID();

        console.log(
          "💾 Saving form:",
          formId,
          formData.id ? "(existing)" : "(new draft)",
        );
        console.log("Form title:", formData.title);

        const { error } = await supabase.from("forms").upsert({
          id: formId,
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          fields: formData.fields,
          settings: formData.settings,
          theme: formData.theme,
          status: status || "draft",
        } as any);

        if (error) {
          console.error("❌ Error saving form:", error);
          setSaveStatus("error");
          return null;
        }

        console.log("✓ Form saved successfully");
        setSaveStatus("saved");
        setDirty(false);
        return formId;
      } catch (error) {
        console.error("❌ Error saving form:", error);
        setSaveStatus("error");
        return null;
      } finally {
        setSaving(false);
      }
    },
    [formData, user, setSaving, setDirty, supabase.from],
  );

  useEffect(() => {
    if (!user || !isDirty) return;

    // Clear existing timeout
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    // Set new timeout for autosave (2 seconds after last change)
    autosaveTimeoutRef.current = setTimeout(() => {
      const currentData = JSON.stringify(formData);

      // Only save if data actually changed
      if (currentData !== lastSavedDataRef.current) {
        handleSave();
        lastSavedDataRef.current = currentData;
      }
    }, 2000);

    // Cleanup
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, [formData, isDirty, user, handleSave]);

  const handlePublish = async () => {
    console.log("🔵 Publish button clicked");

    if (!user) {
      console.error("Cannot publish: user not authenticated");
      alert("You must be logged in to publish forms.");
      return;
    }

    console.log("✓ User authenticated:", user.id);
    console.log("✓ Form data:", {
      id: formData.id,
      title: formData.title,
      fieldsCount: formData.fields.length,
    });

    // Check if form has meeting fields without calendar configured
    const meetingFields = formData.fields.filter((f) => f.type === "meeting");
    console.log("📅 Meeting fields found:", meetingFields.length);

    const hasMeetingWithoutCalendar = meetingFields.some(
      (f) => !f.meetingSettings?.calendarId,
    );
    console.log("📅 Has meeting without calendar?", hasMeetingWithoutCalendar);

    if (hasMeetingWithoutCalendar) {
      // Show meeting config dialog first
      console.log("📅 Showing meeting config dialog...");
      console.log(
        "📅 Setting state - pendingPublish: true, showMeetingConfigDialog: true",
      );
      setPendingPublish(true);
      setShowMeetingConfigDialog(true);
      console.log("📅 State set, dialog should appear now");
      return;
    }

    console.log("🚀 Proceeding with publish...");
    // Continue with normal publish flow
    await executePublish();
  };

  const handleMeetingCalendarSelected = async (calendarId: string) => {
    console.log("📅 Calendar selected:", calendarId);

    // Update all meeting fields with the selected calendar
    const updatedFields = formData.fields.map((field) => {
      if (field.type === "meeting") {
        return {
          ...field,
          meetingSettings: {
            ...field.meetingSettings,
            calendarId,
          },
        };
      }
      return field;
    });

    console.log("📅 Updating form fields with calendar...");
    updateForm({ fields: updatedFields });

    // IMPORTANT: Save the calendar ID to the form's default_calendar_id
    console.log("📅 Saving default_calendar_id to form...");
    if (formData.id && user) {
      try {
        // const { error } = await supabase
        //   .from("forms")
        //   .update({
        //     default_calendar_id: calendarId,
        //   } as any)
        //   .eq("id", formData.id)
        //   .eq("user_id", user.id);
        // if (error) {
        //   console.error("❌ Error saving calendar ID:", error);
        // } else {
        //   console.log("✓ Calendar ID saved to form");
        //   // Update local state to reflect the change
        //   updateForm({ default_calendar_id: calendarId });
        // }
      } catch (error) {
        console.error("❌ Exception saving calendar ID:", error);
      }
    }

    // Now proceed with publish
    if (pendingPublish) {
      console.log("📅 Pending publish is true, will execute publish...");
      setPendingPublish(false);
      // Execute publish after a short delay to ensure state is updated
      setTimeout(() => {
        console.log("📅 Executing publish after calendar selection...");
        executePublish();
      }, 100);
    } else {
      console.log("⚠️ Pending publish is false, not executing");
    }
  };

  const executePublish = async () => {
    if (!user) {
      console.error("Cannot publish: user not authenticated");
      return;
    }

    // Determine which steps will be needed
    const hasMeetingFields = formData.fields.some((f) => f.type === "meeting");

    // Initialize progress state
    const initialProgress: typeof publishProgress = {
      saving: "pending",
      sheet: "pending",
      ...(hasMeetingFields && { meeting: "pending" }),
    };
    setPublishProgress(initialProgress);
    setShowPublishProgress(true);

    let formToPublish = formData;

    if (!formData.id) {
      console.error("Cannot publish: form has no ID, saving first...");
      // Try to save the form first to get an ID
      try {
        const savedFormId = await handleSave();
        if (!savedFormId) {
          throw new Error("Failed to create form ID during save");
        }
        formToPublish = { ...formData, id: savedFormId };
      } catch (error) {
        console.error("Failed to save form before publishing:", error);
        setShowPublishProgress(false);
        alert("Failed to save form. Please try again.");
        return;
      }
    }

    setSaving(true);
    setSaveStatus("saving");

    try {
      console.log("Publishing form:", formToPublish.id || "new form");

      // STEP 1: Saving form to database...
      setPublishProgress((prev) => ({ ...prev, saving: "loading" }));

      const savedFormId = await handleSave("published");

      if (!savedFormId) {
        console.error("❌ Save failed - no form returned");
        throw new Error(
          "Failed to save form before publishing. Please try again.",
        );
      }

      console.log("✓ Form saved successfully with ID:", savedFormId);
      setPublishProgress((prev) => ({ ...prev, saving: "completed" }));

      // Update formToPublish with the confirmed ID
      formToPublish = { ...formToPublish, id: savedFormId };

      // STEP 2: Wait for database consistency
      console.log("Step 2: Waiting for database consistency...");
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // STEP 3: Create Google Sheet
      console.log("Step 3: Creating Google Sheet...");
      setPublishProgress((prev) => ({ ...prev, sheet: "loading" }));

      const publishResponse = await fetch("/api/forms/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId: savedFormId, userId: user.id }),
      });

      if (!publishResponse.ok) {
        const errorData = await publishResponse.json();
        console.error("❌ Publish API error:", errorData);

        // Mark sheet creation as error
        setPublishProgress((prev) => ({ ...prev, sheet: "error" }));

        // Handle Google not connected, tokens missing, or auth failed
        if (
          errorData.code === "GOOGLE_NOT_CONNECTED" ||
          errorData.code === "GOOGLE_TOKENS_MISSING" ||
          errorData.code === "GOOGLE_AUTH_FAILED" ||
          errorData.action === "reconnect_google"
        ) {
          // Close progress dialog
          setShowPublishProgress(false);

          const message =
            errorData.code === "GOOGLE_TOKENS_MISSING" ||
            errorData.code === "GOOGLE_AUTH_FAILED"
              ? "🔄 Reconnect Google Account\n\n" +
                "Your Google authentication has expired or is invalid.\n" +
                "Please reconnect your Google account to continue publishing forms.\n\n" +
                "Click OK to reconnect Google now."
              : "🔗 Connect Google Sheets\n\n" +
                "To publish your form, you need to connect Google Sheets.\n" +
                "All form submissions will automatically sync to your Google Sheets.\n\n" +
                "Click OK to connect Google now.";

          const connectGoogle = confirm(message);

          if (connectGoogle) {
            // Redirect to Google auth with consent prompt to force new tokens
            const needsReconnect =
              errorData.code === "GOOGLE_TOKENS_MISSING" ||
              errorData.code === "GOOGLE_AUTH_FAILED";
            const authUrl = needsReconnect
              ? "/api/auth/reconnect-google"
              : "/api/auth/google";

            // For reconnect, we need to fetch the URL first
            if (needsReconnect) {
              try {
                const response = await fetch("/api/auth/reconnect-google", {
                  method: "POST",
                });
                const data = await response.json();
                if (data.url) {
                  window.location.href = data.url;
                } else {
                  throw new Error("Failed to get reconnection URL");
                }
              } catch (error) {
                console.error("Error initiating reconnection:", error);
                alert(
                  "Failed to initiate Google reconnection. Please try again.",
                );
              }
            } else {
              window.location.href = authUrl;
            }
            return;
          } else {
            throw new Error(
              "Publishing cancelled - Google Sheets connection required",
            );
          }
        }

        // Handle other errors
        if (errorData.code === "FORM_NOT_FOUND_AFTER_RETRIES") {
          throw new Error(`Unable to publish: ${errorData.details}`);
        }

        throw new Error(
          errorData.details || errorData.error || "Failed to publish form",
        );
      }

      const publishResult = await publishResponse.json();
      console.log(
        "✅ Form published successfully with integrations:",
        publishResult,
      );

      // Mark sheet creation as completed
      setPublishProgress((prev) => ({ ...prev, sheet: "completed" }));

      // Mark meeting configuration as completed if it exists
      const hasMeetingFields = formToPublish.fields.some(
        (f) => f.type === "meeting",
      );
      if (hasMeetingFields) {
        setPublishProgress((prev) => ({ ...prev, meeting: "completed" }));
      }

      setSaveStatus("saved");
      setDirty(false);
      updateForm({ status: "published" });

      // Wait a moment to show all completed before redirecting
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirect to form view page after successful publish
      router.push(`/dashboard/forms/${savedFormId}`);
    } catch (error: unknown) {
      console.error("Publish error:", error);
      setSaveStatus("error");
      setShowPublishProgress(false);
      const message =
        (error as { message?: string })?.message || "Unknown error";
      alert(`Failed to publish form: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  const getSaveButtonContent = () => {
    switch (saveStatus) {
      case "saving":
        return (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        );
      case "saved":
        return (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Saved
          </>
        );
      case "error":
        return (
          <>
            <AlertCircle className="w-4 h-4 mr-2" />
            Retry
          </>
        );
      default:
        return (
          <>
            <Save className="w-4 h-4 mr-2" />
            {isDirty ? "Save Now" : "Saved"}
          </>
        );
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Compact Header with Breadcrumb */}
      <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-3 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Forms</span>
              </Button>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium text-foreground truncate">
                {formData.title || "Untitled Form"}
              </span>
              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                <Badge
                  variant={
                    formData.status === "published" ? "default" : "secondary"
                  }
                  className="text-xs"
                >
                  {formData.status === "published" ? "Published" : "Draft"}
                </Badge>
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                  {saveStatus === "saving" && (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Saving...</span>
                    </>
                  )}
                  {saveStatus === "saved" && (
                    <>
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span className="text-green-600">Saved</span>
                    </>
                  )}
                  {saveStatus === "error" && (
                    <>
                      <AlertCircle className="w-3 h-3 text-destructive" />
                      <span className="text-destructive">Error</span>
                    </>
                  )}
                  {saveStatus === "idle" && isDirty && (
                    <>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                      <span className="text-orange-600">Unsaved</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowShareDialog(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>

              <Button
                onClick={() => handleSave()}
                disabled={isSaving || !isDirty}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                {getSaveButtonContent()}
              </Button>

              <Button
                onClick={handlePublish}
                disabled={isSaving || formData.fields.length === 0}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/80 text-xs sm:text-sm"
              >
                {formData.status === "published" ? "Published" : "Publish"}
              </Button>
            </div>
          </div>

          {/* Mobile Save Status */}
          <div className="sm:hidden mt-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {saveStatus === "saving" && (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Saving...</span>
                </>
              )}
              {saveStatus === "saved" && (
                <>
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  <span className="text-green-600">Saved</span>
                </>
              )}
              {saveStatus === "error" && (
                <>
                  <AlertCircle className="w-3 h-3 text-destructive" />
                  <span className="text-destructive">Error</span>
                </>
              )}
              {saveStatus === "idle" && isDirty && (
                <>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  <span className="text-orange-600">Unsaved</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Left Side - Preview (Larger Width) */}
        <div className="flex-1 border-r border-border overflow-y-auto bg-background-secondary/50">
          <div className="p-3 sm:p-6 min-h-full">
            {/* Device Toggle */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">
                Live Preview
              </h3>
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <Button
                  variant={deviceView === "desktop" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setDeviceView("desktop")}
                  className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
                >
                  <Monitor className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden sm:inline">Desktop</span>
                </Button>
                <Button
                  variant={deviceView === "mobile" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setDeviceView("mobile")}
                  className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
                >
                  <Smartphone className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden sm:inline">Mobile</span>
                </Button>
              </div>
            </div>

            {/* Preview Container */}
            <div className="flex justify-center items-start">
              <AnimatePresence mode="wait">
                <motion.div
                  key={deviceView}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={
                    deviceView === "mobile"
                      ? "w-[320px] sm:w-[375px]"
                      : "w-full max-w-3xl"
                  }
                >
                  {deviceView === "mobile" && (
                    <div className="w-[320px] sm:w-[375px] bg-background rounded-xl border border-border shadow-lg overflow-hidden">
                      <div className="p-3 sm:p-4">
                        <FormPreview formData={formData} />
                      </div>
                    </div>
                  )}
                  {deviceView === "desktop" && (
                    <div className="bg-background rounded-xl border border-border shadow-lg p-3 sm:p-4 max-w-full">
                      <FormPreview formData={formData} />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Side - Editor Tabs (Smaller Width) */}
        <div className="w-full lg:w-[420px] flex flex-col bg-background border-t lg:border-t-0 lg:border-l border-border">
          {/* Tab Headers */}
          <div className="flex-shrink-0 bg-background border-b border-border">
            <div className="grid grid-cols-3">
              <button
                onClick={() => setActiveTab("fields")}
                className={`flex items-center justify-center gap-2 h-12 text-sm font-medium transition-colors ${
                  activeTab === "fields"
                    ? "bg-background text-foreground border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Fields</span>
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`flex items-center justify-center gap-2 h-12 text-sm font-medium transition-colors ${
                  activeTab === "settings"
                    ? "bg-background text-foreground border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </button>
              <button
                onClick={() => setActiveTab("display")}
                className={`flex items-center justify-center gap-2 h-12 text-sm font-medium transition-colors ${
                  activeTab === "display"
                    ? "bg-background text-foreground border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">Display</span>
              </button>
            </div>
          </div>

          {/* Tab Content - Scrollable */}
          <div
            className="flex-1 p-4"
            style={{ overflowY: "scroll", maxHeight: "100%" }}
          >
            {activeTab === "fields" && <FieldEditor />}
            {activeTab === "settings" && <FormSettings />}
            {activeTab === "display" && <DisplayEditor />}
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        formId={formData.id || ""}
        formTitle={formData.title || "Untitled Form"}
        formStatus={formData.status}
      />

      <MeetingConfigDialog
        open={showMeetingConfigDialog}
        onOpenChange={setShowMeetingConfigDialog}
        onConfirm={handleMeetingCalendarSelected}
        userId={user?.id || ""}
      />

      <PublishProgressDialog
        open={showPublishProgress}
        onOpenChange={setShowPublishProgress}
        steps={publishProgress}
      />
    </div>
  );
}
