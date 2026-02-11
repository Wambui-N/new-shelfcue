"use client";

import type React from "react";
import posthog from "posthog-js";
import { cn } from "@/lib/utils";
import type { FormField } from "@/types/form";
import {
  type FormLayout,
  type FormTheme,
  layoutPresets,
} from "@/types/form-display";
import { FieldRenderer } from "./FieldRenderer";
import { ProgressIndicator } from "./ProgressIndicator";

interface FormContentProps {
  fields: FormField[];
  formData: Record<string, any>;
  onFieldChange: (fieldId: string, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  layout: FormLayout;
  theme: FormTheme;
  currentStep: number;
  onStepChange: (step: number) => void;
  isSubmitting: boolean;
  title?: string;
  description?: string;
  submitButtonText?: string;
  formId?: string;
  calendarId?: string;
  userId?: string;
  isEmbedded?: boolean;
  timeZone?: string;
  showWatermark?: boolean;
  fitPreview?: boolean;
}

export function FormContent({
  fields,
  formData,
  onFieldChange,
  onSubmit,
  layout,
  theme,
  currentStep,
  onStepChange,
  isSubmitting,
  title,
  description,
  submitButtonText = "Submit",
  formId,
  calendarId,
  userId,
  isEmbedded = false,
  timeZone,
  showWatermark = false,
  fitPreview = false,
}: FormContentProps) {
  const layoutConfig = layoutPresets[layout];
  const isConversational = layout === "conversational";

  // For conversational layout, split fields into steps
  const steps = isConversational ? splitFieldsIntoSteps(fields) : [fields];
  const currentFields = isConversational ? steps[currentStep] : fields;
  const totalSteps = steps.length;
  const isLastStep = currentStep === totalSteps - 1;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      // PostHog: Capture form step completion in conversational forms
      posthog.capture("form_step_completed", {
        form_id: formId,
        step_number: currentStep + 1,
        total_steps: totalSteps,
        layout: layout,
      });
      onStepChange(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (isConversational && !isLastStep) {
      e.preventDefault();
      handleNext();
    } else {
      // PostHog: Capture form submission attempt (client-side)
      posthog.capture("form_submitted_public", {
        form_id: formId,
        layout: layout,
        total_fields: fields.length,
        is_embedded: isEmbedded,
      });
      onSubmit(e);
    }
  };

  return (
    <div
      className={cn(
        "w-full max-w-full md:max-w-4xl mx-auto overflow-x-hidden min-h-full",
        fitPreview && "px-2 py-3",
        !fitPreview && isEmbedded && "px-3 sm:px-4 py-4 sm:py-6",
        !fitPreview &&
          !isEmbedded &&
          "px-3 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-12",
        !fitPreview &&
          !isEmbedded &&
          layoutConfig.spacing === "tight" &&
          "py-4 sm:py-6 md:py-8",
        !fitPreview &&
          !isEmbedded &&
          layoutConfig.spacing === "loose" &&
          "py-8 sm:py-12 md:py-16",
      )}
    >
      {/* Progress Indicator */}
      {layoutConfig.showProgress && (
        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={totalSteps}
          theme={theme}
        />
      )}

      {/* Form Container */}
      <div
        className={cn(
          fitPreview ? "p-2" : "p-3 sm:p-6 md:p-8",
          layout === "hero" && "md:max-w-2xl mx-auto",
          layout === "conversational" &&
            !fitPreview &&
            "min-h-[300px] sm:min-h-[400px] flex flex-col justify-center",
        )}
      >
        {/* Title/Description inside the form container */}
        {(title || description) && (
          <div className={cn(fitPreview ? "mb-2" : "mb-4 sm:mb-6")}>
            {title && (
              <h2
                className={cn(
                  "font-semibold",
                  fitPreview ? "text-base" : "text-lg sm:text-xl md:text-2xl",
                )}
                style={{ fontFamily: theme.fontFamily, color: theme.textColor }}
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                className={cn(
                  "mt-1",
                  fitPreview ? "text-xs" : "text-sm sm:text-base",
                )}
                style={{
                  fontFamily: theme.fontFamily,
                  color: theme.textColor,
                }}
              >
                {description}
              </p>
            )}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className={cn(fitPreview ? "space-y-2" : "space-y-4 sm:space-y-6")}
        >
          {/* Fields Grid */}
          <div
            className={cn(
              "grid",
              fitPreview ? "gap-2" : "gap-4 sm:gap-6",
              !fitPreview && layoutConfig.spacing === "tight" && "gap-3 sm:gap-4",
              !fitPreview && layoutConfig.spacing === "loose" && "gap-6 sm:gap-8",
              layoutConfig.columns === 1 && "grid-cols-1",
              layoutConfig.columns === 2 && "grid-cols-1 md:grid-cols-2",
            )}
          >
            {currentFields.map((field) => (
              <div
                key={field.id}
                className={cn(
                  layoutConfig.columns === 2 && "md:col-span-1",
                  isConversational &&
                    field.type === "meeting" &&
                    "col-span-full",
                )}
              >
                <FieldRenderer
                  field={field}
                  value={formData[field.id]}
                  onChange={(value) => onFieldChange(field.id, value)}
                  theme={theme}
                  isConversational={isConversational}
                  formId={formId}
                  calendarId={calendarId}
                  userId={userId}
                  isEmbedded={isEmbedded}
                  timeZone={timeZone}
                  compact={fitPreview}
                />
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div
            className={cn(
              "flex justify-between items-center",
              fitPreview ? "pt-2" : "pt-4 sm:pt-6",
              isConversational && "border-t border-gray-200",
            )}
          >
            {isConversational ? (
              <>
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className={cn(
                    fitPreview
                      ? "min-h-9 min-w-9 px-3 py-2 text-sm font-medium transition-colors"
                      : "min-h-[44px] min-w-[44px] px-4 sm:px-6 py-3 text-sm sm:text-base font-medium transition-colors",
                    currentStep === 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-100",
                  )}
                  style={{ borderRadius: "var(--shelf-radius)" }}
                >
                  Previous
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    fitPreview
                      ? "min-h-9 min-w-9 px-4 py-2 text-sm font-medium text-white transition-colors"
                      : "min-h-[44px] min-w-[44px] px-6 sm:px-8 py-3 text-sm sm:text-base font-medium text-white transition-colors",
                    "bg-[var(--shelf-primary)] hover:opacity-90",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                  )}
                  style={{ borderRadius: "var(--shelf-radius)" }}
                >
                  {isLastStep
                    ? isSubmitting
                      ? "Submitting..."
                      : submitButtonText
                    : "Next"}
                </button>
              </>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "w-full font-medium text-white transition-colors",
                  "bg-[var(--shelf-primary)] hover:opacity-90",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  fitPreview
                    ? "min-h-9 py-2 px-4 text-sm"
                    : "min-h-[44px] px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base",
                  layout === "hero" && !fitPreview && "sm:text-lg sm:py-5",
                )}
                style={{ borderRadius: "var(--shelf-radius)" }}
              >
                {isSubmitting ? "Submitting..." : submitButtonText}
              </button>
            )}
          </div>
        </form>

        {showWatermark && (
          <div
            className={cn(
              "w-full text-center border-t border-border",
              fitPreview ? "pt-2 mt-2" : "pt-6 mt-6",
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <img
                src="/1.png"
                alt="ShelfCue Logo"
                className={cn("w-auto opacity-70", fitPreview ? "h-3" : "h-4")}
              />
              <p className={cn("text-muted-foreground", fitPreview ? "text-[10px]" : "text-xs")}>
                Powered by{" "}
                <a
                  href="https://shelfcue.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
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

// Helper function to split fields into steps for conversational layout
function splitFieldsIntoSteps(fields: FormField[]): FormField[][] {
  const steps: FormField[][] = [];
  let currentStep: FormField[] = [];

  fields.forEach((field, index) => {
    currentStep.push(field);

    // Create a new step after every 2-3 fields, or if it's a meeting field
    if (
      currentStep.length >= 3 ||
      field.type === "meeting" ||
      index === fields.length - 1
    ) {
      steps.push([...currentStep]);
      currentStep = [];
    }
  });

  return steps;
}
