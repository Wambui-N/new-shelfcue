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
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { useFormStore } from "@/store/formStore";
import { FieldEditor } from "./FieldEditor";
import { FormPreview } from "./FormPreview";
import { FormSettings } from "./FormSettings";
import { MeetingConfigDialog } from "./MeetingConfigDialog";
import { PublishProgressDialog } from "./PublishProgressDialog";
import { ShareDialog } from "./ShareDialog";
import { ThemeEditor } from "./ThemeEditor";

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
  }, [formData, isDirty, user]);

  const handleSave = async () => {
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
      console.log("Fields count:", formData.fields?.length);

      const saveData = {
        id: formId,
        user_id: user.id,
        title: formData.title || "Untitled Form",
        description: formData.description || "",
        fields: formData.fields || [],
        status: formData.status || "draft",
        updated_at: new Date().toISOString(),
      };

      // Only include theme and settings if they exist in the database schema
      // Check if form exists first
      if (formData.id) {
      const { data: existingForm } = await (supabase as any)
        .from("forms")
          .select("theme, settings")
          .eq("id", formData.id)
          .single();

        // If the columns exist, include them
        if (
          existingForm &&
          ("theme" in existingForm || "settings" in existingForm)
        ) {
          Object.assign(saveData, {
            theme: formData.theme,
            settings: formData.settings,
          });
        }
      } else {
        // For new forms, always try to include theme and settings
        Object.assign(saveData, {
          theme: formData.theme,
          settings: formData.settings,
        });
      }

      console.log("📤 Upserting to Supabase...");
    const { data: savedForm, error } = await (supabase as any)
      .from("forms")
        .upsert(saveData)
        .select()
        .single();

      console.log("Upsert response:", { savedForm, error });

      if (error) {
        console.error("❌ Supabase error:", error);
        throw error;
      }

      if (!savedForm) {
        console.error("❌ No form data returned from upsert");
        throw new Error("No form data returned from database");
      }

      // Update formData with the saved form ID if it was created
      if (savedForm && savedForm.id && !formData.id) {
        updateForm({ id: savedForm.id });
        console.log("✅ Draft created with ID:", savedForm.id);

        // Update the URL to reflect the new draft ID
        router.replace(`/editor/${savedForm.id}`);
      }

      console.log("✅ Form saved successfully as", savedForm.status);
      setSaveStatus("saved");
      setDirty(false);
      lastSavedDataRef.current = JSON.stringify(formData);
      setTimeout(() => setSaveStatus("idle"), 2000);

      return savedForm;
    } catch (error: any) {
      console.error("Error saving form:", {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
      });
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setSaving(false);
    }
  };

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
      const { error } = await (supabase as any)
        .from("forms")
        .update({ default_calendar_id: calendarId })
          .eq("id", formData.id)
          .eq("user_id", user.id);

        if (error) {
          console.error("❌ Error saving calendar ID:", error);
        } else {
          console.log("✓ Calendar ID saved to form");
          // Update local state to reflect the change
          updateForm({ default_calendar_id: calendarId });
        }
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
        const savedForm = await handleSave();
        if (!savedForm || !savedForm.id) {
          throw new Error("Failed to create form ID during save");
        }
        formToPublish = { ...formData, id: savedForm.id };
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

      // STEP 1: Save the form
      console.log("Step 1: Saving form to database...");
      setPublishProgress((prev) => ({ ...prev, saving: "loading" }));

      const savedForm = await handleSave();

      if (!savedForm || !savedForm.id) {
        console.error("❌ Save failed - no form returned");
        throw new Error(
          "Failed to save form before publishing. Please try again.",
        );
      }

      console.log("✓ Form saved successfully with ID:", savedForm.id);
      setPublishProgress((prev) => ({ ...prev, saving: "completed" }));

      // Update formToPublish with the confirmed ID
      formToPublish = { ...formToPublish, id: savedForm.id };

      // STEP 2: Wait for database consistency
      console.log("Step 2: Waiting for database consistency...");
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // STEP 3: Create Google Sheet
      console.log("Step 3: Creating Google Sheet...");
      setPublishProgress((prev) => ({ ...prev, sheet: "loading" }));

      const publishResponse = await fetch("/api/forms/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId: savedForm.id, userId: user.id }),
      });

      if (!publishResponse.ok) {
        const errorData = await publishResponse.json();
        console.error("❌ Publish API error:", errorData);

        // Mark sheet creation as error
        setPublishProgress((prev) => ({ ...prev, sheet: "error" }));

        // Handle Google not connected
        if (errorData.code === "GOOGLE_NOT_CONNECTED") {
          // Close progress dialog
          setShowPublishProgress(false);

          const connectGoogle = confirm(
            "🔗 Connect Google Sheets\n\n" +
              "To publish your form, you need to connect Google Sheets.\n" +
              "All form submissions will automatically sync to your Google Sheets.\n\n" +
              "Click OK to connect Google now.",
          );

          if (connectGoogle) {
            // Redirect to Google auth
            window.location.href = "/api/auth/google";
            return;
          } else {
            throw new Error(
              "Publishing cancelled - Google Sheets connection required",
            );
          }
        }

        // Handle other errors
        if (errorData.code === "FORM_NOT_FOUND_AFTER_RETRIES") {
          throw new Error("Unable to publish: " + errorData.details);
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
      router.push(`/dashboard/forms/${savedForm.id}`);
    } catch (error: any) {
      console.error("Publish error:", error);
      setSaveStatus("error");
      setShowPublishProgress(false);
      alert(`Failed to publish form: ${error.message}`);
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

  const getAutosaveStatus = () => {
    if (saveStatus === "saving") return "Saving...";
    if (saveStatus === "saved") return "All changes saved";
    if (saveStatus === "error") return "Error saving";
    if (isDirty) return "Autosaving in 2s...";
    return "All changes saved";
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Compact Header with Breadcrumb */}
      <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Forms
              </Button>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-foreground">
                {formData.title || "Untitled Form"}
              </span>
              <div className="flex items-center gap-2 ml-2">
                <Badge
                  variant={
                    formData.status === "published" ? "default" : "secondary"
                  }
                  className="text-xs"
                >
                  {formData.status === "published" ? "Published" : "Draft"}
                </Badge>
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

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowShareDialog(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>

              <Button
                onClick={handleSave}
                disabled={isSaving || !isDirty}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                {getSaveButtonContent()}
              </Button>

              <Button
                onClick={handlePublish}
                disabled={isSaving || formData.fields.length === 0}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/80"
              >
                {formData.status === "published" ? "Published" : "Publish"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side - Preview (Larger Width) */}
        <div className="flex-1 border-r border-border overflow-y-auto bg-background-secondary/50">
          <div className="p-6 min-h-full">
            {/* Device Toggle */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                Live Preview
              </h3>
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <Button
                  variant={deviceView === "desktop" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setDeviceView("desktop")}
                  className="h-8 px-3"
                >
                  <Monitor className="w-4 h-4 mr-1" />
                  Desktop
                </Button>
                <Button
                  variant={deviceView === "mobile" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setDeviceView("mobile")}
                  className="h-8 px-3"
                >
                  <Smartphone className="w-4 h-4 mr-1" />
                  Mobile
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
                    deviceView === "mobile" ? "w-[375px]" : "w-full max-w-3xl"
                  }
                >
                  {deviceView === "mobile" && (
                    <div className="w-[375px] bg-background rounded-xl border border-border shadow-lg overflow-hidden">
                      <div className="p-4">
                        <FormPreview formData={formData} />
                      </div>
                    </div>
                  )}
                  {deviceView === "desktop" && (
                    <div className="bg-background rounded-xl border border-border shadow-lg p-4 max-w-full">
                      <FormPreview formData={formData} />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Side - Editor Tabs (Smaller Width) */}
        <div className="w-[420px] flex flex-col bg-background">
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
                onClick={() => setActiveTab("theme")}
                className={`flex items-center justify-center gap-2 h-12 text-sm font-medium transition-colors ${
                  activeTab === "theme"
                    ? "bg-background text-foreground border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">Theme</span>
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
            {activeTab === "theme" && <ThemeEditor />}
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
