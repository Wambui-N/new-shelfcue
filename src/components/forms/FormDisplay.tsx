"use client";

import type React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { FormField } from "@/types/form";
import type {
  FormDisplayMode,
  FormLayout,
  FormTheme,
} from "@/types/form-display";
import { FormContent } from "./FormContent";
import { StandaloneForm } from "./StandaloneForm";
import { generateImageOverlay } from "@/lib/gradient-generator";

interface FormDisplayProps {
  formId: string;
  title: string;
  header?: string; // Form header (separate from title)
  description?: string;
  fields: FormField[];
  mode: FormDisplayMode;
  layout: FormLayout;
  theme: FormTheme | {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    borderRadius: number;
    fontFamily: string;
    logoUrl?: string;
    backgroundImageUrl?: string;
  };
  onSubmit: (data: Record<string, any>) => Promise<void>;
  isSubmitting?: boolean;
  leftSectionDescription?: string;
  leftSectionLink?: string;
  showWatermark?: boolean;
}

export function FormDisplay({
  formId,
  title,
  header,
  description,
  fields,
  mode,
  layout,
  theme,
  onSubmit,
  isSubmitting = false,
  leftSectionDescription,
  leftSectionLink,
  showWatermark = true,
}: FormDisplayProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(0);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  // Check if theme is simple theme object or FormTheme
  const isSimpleTheme = "primaryColor" in theme && !("background" in theme);
  
  // Convert simple theme to FormTheme if needed
  const displayTheme: FormTheme = isSimpleTheme
    ? {
        primaryColor: theme.primaryColor,
        fontFamily: theme.fontFamily,
        borderRadius: theme.borderRadius,
        logoUrl: theme.logoUrl,
        background: "backgroundImageUrl" in theme && theme.backgroundImageUrl
          ? {
              type: "image" as const,
              image: theme.backgroundImageUrl,
            }
          : undefined,
      }
    : theme;

  // Use header if provided, otherwise fall back to title
  const displayTitle = header || title;

  // Generate gradient overlay for background image
  const backgroundImageUrl = isSimpleTheme && "backgroundImageUrl" in theme
    ? theme.backgroundImageUrl
    : displayTheme.background?.image;
  const gradientOverlay = backgroundImageUrl
    ? generateImageOverlay(
        displayTheme.primaryColor,
        "backgroundColor" in theme ? theme.backgroundColor : "#fafafa",
        0.6,
      )
    : undefined;

  const formContent = (
    <FormContent
      fields={fields}
      formData={formData}
      onFieldChange={handleFieldChange}
      onSubmit={handleSubmit}
      layout={layout}
      theme={displayTheme}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      isSubmitting={isSubmitting}
      title={displayTitle}
      description={description}
    />
  );

  if (mode === "embed") {
    return (
      <>
        {formContent}
        {showWatermark && (
          <div className="w-full text-center py-4">
            <p className="text-xs text-muted-foreground">
              Powered by{" "}
              <a
                href="https://shelfcue.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                ShelfCue
              </a>
            </p>
          </div>
        )}
      </>
    );
  }

  return (
    <StandaloneForm theme={displayTheme}>
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Left Section - Branding */}
        <div
          className={cn(
            "relative w-full md:w-1/2 flex flex-col justify-between",
            "h-[250px] md:min-h-screen", // Shorter on mobile (250px), full height on desktop
            "p-4 md:p-12", // Reduced padding on mobile
          )}
        >
          {/* Background Image with Gradient Overlay */}
          {backgroundImageUrl && (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${backgroundImageUrl})`,
                }}
              />
              {gradientOverlay && (
                <div
                  className="absolute inset-0"
                  style={{
                    background: gradientOverlay,
                  }}
                />
              )}
            </>
          )}

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full">
            {/* Logo */}
            {displayTheme.logoUrl && (
              <div className="mb-4 md:mb-8">
                <img
                  src={displayTheme.logoUrl}
                  alt="Logo"
                  className="h-8 md:h-12 w-auto" // Smaller on mobile
                  style={{
                    maxHeight: "32px", // Reduced max height on mobile
                  }}
                />
              </div>
            )}

            {/* Description and Link */}
            <div className="flex-1 flex flex-col justify-end">
              {leftSectionDescription && (
                <p
                  className="text-white text-sm md:text-lg lg:text-xl mb-3 md:mb-6" // Smaller text on mobile
                  style={{
                    fontFamily: displayTheme.fontFamily,
                    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  }}
                >
                  {leftSectionDescription}
                </p>
              )}
              {leftSectionLink && (
                <a
                  href={leftSectionLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white text-sm md:text-base underline hover:no-underline inline-block" // Smaller text on mobile
                  style={{
                    fontFamily: displayTheme.fontFamily,
                    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  }}
                >
                  {leftSectionLink}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="w-full md:w-1/2 flex flex-col bg-white">
          <div className="flex-1 overflow-y-auto">
            {formContent}
          </div>

          {/* Watermark */}
          {showWatermark && (
            <div className="w-full text-center py-4 border-t border-border bg-white">
              <p className="text-xs text-muted-foreground">
                Powered by{" "}
                <a
                  href="https://shelfcue.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                  style={{ color: displayTheme.primaryColor }}
                >
                  ShelfCue
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </StandaloneForm>
  );
}
