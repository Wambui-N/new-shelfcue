"use client";

import React, { useState } from "react";
import { FormField } from "@/types/form";
import { FormDisplayMode, FormLayout, FormTheme } from "@/types/form-display";
import { StandaloneForm } from "./StandaloneForm";
import { FormContent } from "./FormContent";
import { FormHeader } from "./FormHeader";

interface FormDisplayProps {
  formId: string;
  title: string;
  description?: string;
  fields: FormField[];
  mode: FormDisplayMode;
  layout: FormLayout;
  theme: FormTheme;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  isSubmitting?: boolean;
}

export function FormDisplay({
  formId,
  title,
  description,
  fields,
  mode,
  layout,
  theme,
  onSubmit,
  isSubmitting = false,
}: FormDisplayProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(0);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const formContent = (
    <FormContent
      fields={fields}
      formData={formData}
      onFieldChange={handleFieldChange}
      onSubmit={handleSubmit}
      layout={layout}
      theme={theme}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      isSubmitting={isSubmitting}
    />
  );

  if (mode === "embed") {
    return formContent;
  }

  return (
    <StandaloneForm theme={theme}>
      <FormHeader
        title={title}
        description={description}
        theme={theme}
        showLogo={true}
        showTitle={true}
      />
      {formContent}
    </StandaloneForm>
  );
}
