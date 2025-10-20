"use client";

import React from "react";
import { useFormStore } from "@/store/formStore";
import { FormDisplay } from "@/components/forms/FormDisplay";
import type { FormData } from "@/types/form";
import type { FormDisplayMode, FormLayout, FormTheme } from "@/types/form-display";

interface FormPreviewProps {
  className?: string;
  // Legacy props for backward compatibility
  formData?: FormData;
  onSubmit?: (data: Record<string, any>) => Promise<void>;
}

export function FormPreview({ 
  className, 
  formData: propFormData, 
  onSubmit: propOnSubmit 
}: FormPreviewProps) {
  const store = useFormStore();
  const { 
    formData: storeFormData, 
    displayMode, 
    layout
  } = store;

  // Use prop data if provided, otherwise use store data
  const formData = propFormData || storeFormData;
  const displayModeToUse: FormDisplayMode = propFormData ? "standalone" : formData.settings.mode || "standalone";
  const layoutToUse: FormLayout = propFormData ? "simple" : formData.settings.layout || "simple";
  
  // Theme comes directly from the form's theme so editor changes reflect instantly
  const themeToUse: FormTheme = propFormData 
    ? (propFormData.theme as FormTheme)
    : (storeFormData.theme as FormTheme);

  const handleSubmit = async (data: Record<string, any>) => {
    if (propOnSubmit) {
      await propOnSubmit(data);
                    } else {
      console.log("Form submitted:", data);
      // In a real implementation, this would submit to your API
    }
  };

  return (
    <div className={className}>
      <FormDisplay
        formId={formData.id || "preview"}
        title={formData.title || "Untitled Form"}
        description={formData.description}
        fields={formData.fields}
        mode={displayModeToUse}
        layout={layoutToUse}
        theme={themeToUse}
        onSubmit={handleSubmit}
        isSubmitting={false}
      />
      </div>
  );
}