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
import {
  generateImageOverlay,
  generateAutoGradient,
} from "@/lib/gradient-generator";
import { useFormStore } from "@/store/formStore";

interface FormDisplayProps {
  formId: string;
  title: string;
  header?: string; // Form header (separate from title)
  description?: string;
  fields: FormField[];
  mode: FormDisplayMode;
  layout: FormLayout;
  theme:
    | FormTheme
    | {
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
  leftSectionHeadline?: string;
  leftSectionDescription?: string;
  leftSectionLink?: string;
  showWatermark?: boolean;
  deviceView?: "desktop" | "mobile";
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
  leftSectionHeadline,
  leftSectionDescription,
  leftSectionLink,
  showWatermark = true,
  deviceView = "desktop",
}: FormDisplayProps) {
  const settings = useFormStore((state) => state.formData.settings);
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
        textColor: theme.textColor,
        descriptionColor:
          "descriptionColor" in theme
            ? theme.descriptionColor
            : theme.textColor,
        fontFamily: theme.fontFamily,
        borderRadius: theme.borderRadius,
        logoUrl: theme.logoUrl,
        background:
          "backgroundImageUrl" in theme && theme.backgroundImageUrl
            ? {
                type: "image" as const,
                image: theme.backgroundImageUrl,
              }
            : undefined,
      }
    : theme;

  // Use header if provided, otherwise fall back to title
  const displayTitle = header || title;

  // Get background color and accent color from theme
  const backgroundColor =
    isSimpleTheme && "backgroundColor" in theme
      ? theme.backgroundColor
      : "#fafafa";
  const accentColor = displayTheme.primaryColor;

  // Check for custom background image
  const backgroundImageUrl =
    isSimpleTheme && "backgroundImageUrl" in theme
      ? theme.backgroundImageUrl
      : displayTheme.background?.image;

  // Generate automatic gradient background (if no custom image)
  // This creates a beautiful gradient from very light accent to full accent color with swirl
  const autoGradient = !backgroundImageUrl
    ? generateAutoGradient(accentColor, backgroundColor)
    : undefined;

  // Optional gradient overlay for background image (disabled to let custom images display true colors)
  const gradientOverlay = undefined;

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
      title={settings.showTitle ? displayTitle : undefined}
      description={settings.showDescription ? description : undefined}
      submitButtonText={settings.submitButtonText}
    />
  );

  if (mode === "embed") {
    return (
      <>
        {formContent}
        {showWatermark && (
          <div className="w-full text-center py-4">
            <div className="flex items-center justify-center gap-2">
              <img
                src="/1.png"
                alt="ShelfCue Logo"
                className="h-4 w-auto opacity-70"
              />
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
          </div>
        )}
      </>
    );
  }

  return (
    <StandaloneForm theme={displayTheme}>
      <div
        className={cn(
          "min-h-screen flex flex-col overflow-x-hidden w-full",
          deviceView === "desktop" && "md:flex-row",
        )}
      >
        {/* Left Section - Branding */}
        <div
          className={cn(
            "relative w-full flex flex-col justify-between flex-shrink-0 overflow-hidden",
            deviceView === "desktop" ? "md:w-1/2 md:min-h-screen" : "w-full",
            "h-[250px]", // Shorter on mobile (250px), full height on desktop
            "p-4 md:p-12", // Reduced padding on mobile
          )}
          style={
            autoGradient
              ? {
                  background: autoGradient,
                  backgroundBlendMode: "normal",
                }
              : undefined
          }
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

            {/* Headline, Description and Link */}
            <div className="flex-1 flex flex-col justify-end items-start">
              {leftSectionHeadline && (
                <p
                  className="text-white text-sm sm:text-base md:text-lg font-semibold mb-2 text-left"
                  style={{
                    fontFamily: displayTheme.fontFamily,
                    color:
                      displayTheme.descriptionColor ||
                      "rgba(255, 255, 255, 0.95)",
                    textShadow: "0 2px 4px rgba(0,0,0,0.25)",
                  }}
                >
                  {leftSectionHeadline}
                </p>
              )}
              {leftSectionDescription && (
                <p
                  className="text-white text-xs md:text-sm mb-2 md:mb-3 text-left" // Smaller text, left-aligned
                  style={{
                    fontFamily: displayTheme.fontFamily,
                    color:
                      displayTheme.descriptionColor ||
                      "rgba(255, 255, 255, 0.95)",
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
                  className="text-white text-xs md:text-sm underline hover:no-underline text-left" // Smaller text, left-aligned
                  style={{
                    fontFamily: displayTheme.fontFamily,
                    color:
                      displayTheme.descriptionColor ||
                      "rgba(255, 255, 255, 0.95)",
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
        <div
          className={cn(
            "w-full flex flex-col flex-shrink-0 overflow-x-hidden",
            deviceView === "desktop" && "md:w-1/2",
          )}
          style={{
            backgroundColor:
              "backgroundColor" in theme ? theme.backgroundColor : "#ffffff",
          }}
        >
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {formContent}
          </div>

          {/* Watermark */}
          {showWatermark && (
            <div
              className="w-full text-center py-4 border-t border-border"
              style={{
                backgroundColor:
                  "backgroundColor" in theme
                    ? theme.backgroundColor
                    : "#ffffff",
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <img
                  src="/1.png"
                  alt="ShelfCue Logo"
                  className="h-4 w-auto opacity-70"
                />
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
            </div>
          )}
        </div>
      </div>
    </StandaloneForm>
  );
}
