"use client";

import Image from "next/image";
import { useState } from "react";
import type { FormField, FormLayout, FormTheme } from "@/lib/types";
import { FormContent } from "./FormContent";
import { StandaloneForm } from "./StandaloneForm";
import type { SubmissionDataValue } from "@/app/api/submit/route";

export interface FormDisplayProps {
  title: string;
  description?: string;
  fields: FormField[];
  mode: FormDisplayMode;
  layout: FormLayout;
  theme: FormTheme;
  onSubmit: (data: Record<string, SubmissionDataValue>) => Promise<void>;
  isSubmitting?: boolean;
}

export function FormDisplay({
  title,
  description,
  fields,
  mode,
  layout,
  theme,
  onSubmit,
  isSubmitting = false,
}: FormDisplayProps) {
  const [formData, setFormData] = useState<Record<string, SubmissionDataValue>>(
    {},
  );
  const [currentStep, setCurrentStep] = useState(0);

  const handleFieldChange = (fieldId: string, value: SubmissionDataValue) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
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
      title={title}
      description={description}
    />
  );

  if (mode === "embed") {
    return formContent;
  }

  return (
    <StandaloneForm theme={theme}>
      {/* Notion-style image header with logo bottom-left */}
      <div className="w-full relative">
        {theme.background?.image && (
          <div
            className="w-full h-40 sm:h-48 md:h-56 lg:h-64 rounded-t-[var(--shelf-radius)] bg-center bg-cover"
            style={{ backgroundImage: `url(${theme.background.image})` }}
          />
        )}
        {theme.logoUrl && (
          <div className="absolute left-4 bottom-2">
            <Image
              src={theme.logoUrl}
              alt="Logo"
              width={40}
              height={40}
              className="h-8 sm:h-10 w-auto rounded"
            />
          </div>
        )}
        {theme.logoUrl && (
          <div className="absolute right-4 bottom-2">
            <Image
              src={theme.logoUrl}
              alt="Logo"
              width={40}
              height={40}
              className="h-8 sm:h-10 w-auto rounded"
              key={theme.logoUrl}
            />
          </div>
        )}
      </div>
      {formContent}
    </StandaloneForm>
  );
}
