"use client";

import React from "react";
import { FormField } from "@/types/form";
import { FormLayout, FormTheme } from "@/types/form-display";
import { layoutPresets } from "@/types/form-display";
import { cn } from "@/lib/utils";
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
  description
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
      onSubmit(e);
    }
  };

  return (
    <div className={cn(
      "w-full max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8",
      layoutConfig.spacing === "tight" && "py-3 sm:py-4",
      layoutConfig.spacing === "loose" && "py-6 sm:py-12"
    )}>
      {/* Progress Indicator */}
      {layoutConfig.showProgress && (
        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={totalSteps}
          theme={theme}
        />
      )}

      {/* Form Container */}
      <div className={cn(
        "bg-white shadow-lg p-4 sm:p-6 md:p-8",
        layout === "hero" && "max-w-2xl mx-auto",
        layout === "conversational" && "min-h-[300px] sm:min-h-[400px] flex flex-col justify-center"
      )} style={{ borderRadius: "var(--shelf-radius)" }}>
        {/* Title/Description inside the form container */}
        {(title || description) && (
          <div className="mb-4 sm:mb-6">
            {title && (
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900" style={{ fontFamily: theme.fontFamily }}>
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm sm:text-base text-gray-600" style={{ fontFamily: theme.fontFamily }}>
                {description}
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Fields Grid */}
          <div className={cn(
            "grid gap-4 sm:gap-6",
            layoutConfig.columns === 1 && "grid-cols-1",
            layoutConfig.columns === 2 && "grid-cols-1 md:grid-cols-2",
            layoutConfig.spacing === "tight" && "gap-3 sm:gap-4",
            layoutConfig.spacing === "loose" && "gap-6 sm:gap-8"
          )}>
            {currentFields.map((field) => (
              <div
                key={field.id}
                className={cn(
                  layoutConfig.columns === 2 && "md:col-span-1",
                  // For conversational, some fields might span full width
                  isConversational && field.type === "meeting" && "col-span-full"
                )}
              >
                <FieldRenderer
                  field={field}
                  value={formData[field.id]}
                  onChange={(value) => onFieldChange(field.id, value)}
                  theme={theme}
                  isConversational={isConversational}
                />
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className={cn(
            "flex justify-between items-center pt-4 sm:pt-6",
            isConversational && "border-t border-gray-200"
          )}>
            {isConversational ? (
              <>
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className={cn(
                    "px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium transition-colors",
                    currentStep === 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  )}
                  style={{ borderRadius: "var(--shelf-radius)" }}
                >
                  Previous
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-medium text-white transition-colors",
                    "bg-[var(--shelf-primary)] hover:opacity-90",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  style={{ borderRadius: "var(--shelf-radius)" }}
                >
                  {isLastStep ? (isSubmitting ? "Submitting..." : "Submit") : "Next"}
                </button>
              </>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "w-full px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-medium text-white transition-colors",
                  "bg-[var(--shelf-primary)] hover:opacity-90",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  layout === "hero" && "sm:text-lg sm:py-5"
                )}
                style={{ borderRadius: "var(--shelf-radius)" }}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            )}
          </div>
        </form>
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
