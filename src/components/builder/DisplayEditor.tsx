"use client";

import { Monitor, Palette, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { availableFonts } from "@/lib/fonts";
import { useFormStore } from "@/store/formStore";
import { ImageUpload } from "./ImageUpload";

export function DisplayEditor() {
  const { formData, updateForm } = useFormStore();

  const [_customCSS, _setCustomCSS] = useState("");

  const handleThemeChange = (key: string, value: string | number) => {
    updateForm({
      theme: {
        ...formData.theme,
        [key]: value,
      },
    });
  };

  const handleSettingsChange = (key: string, value: string) => {
    updateForm({
      settings: {
        ...formData.settings,
        [key]: value,
      },
    });
  };

  // Load Google Font for preview
  useEffect(() => {
    if (formData.theme.fontFamily) {
      const font = availableFonts.find(
        (f) => f.value === formData.theme.fontFamily,
      );
      if (font?.type === "google") {
        const link = document.querySelector(
          `link[data-font="${formData.theme.fontFamily}"]`,
        );
        if (!link) {
          const newLink = document.createElement("link");
          newLink.href = `https://fonts.googleapis.com/css2?family=${formData.theme.fontFamily.replace(/\s+/g, "+")}:300,400,500,600,700&display=swap`;
          newLink.rel = "stylesheet";
          newLink.setAttribute("data-font", formData.theme.fontFamily);
          document.head.appendChild(newLink);
        }
      }
    }
  }, [formData.theme.fontFamily]);

  const _layoutOptions = [
    {
      value: "simple",
      label: "Simple",
      description: "One-column layout for contact forms",
    },
    {
      value: "compact",
      label: "Compact",
      description: "Two-column layout for applications",
    },
    {
      value: "conversational",
      label: "Conversational",
      description: "Typeform-style multi-step",
    },
    {
      value: "hero",
      label: "Hero",
      description: "Split-view for high conversion",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Branding & Colors */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Branding & Colors
          </h3>
        </div>
        <div className="space-y-4">
          {/* Primary Color */}
          <div className="space-y-2">
            <Label htmlFor="primary-color">Primary Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id="primary-color"
                type="color"
                value={formData.theme.primaryColor}
                onChange={(e) =>
                  handleThemeChange("primaryColor", e.target.value)
                }
                className="w-12 h-10 p-1 border rounded"
              />
              <Input
                value={formData.theme.primaryColor}
                onChange={(e) =>
                  handleThemeChange("primaryColor", e.target.value)
                }
                placeholder="#151419"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Used for buttons, links, and accents
            </p>
          </div>

          {/* Background Color */}
          <div className="space-y-2">
            <Label htmlFor="background-color">Background Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id="background-color"
                type="color"
                value={formData.theme.backgroundColor}
                onChange={(e) =>
                  handleThemeChange("backgroundColor", e.target.value)
                }
                className="w-12 h-10 p-1 border rounded"
              />
              <Input
                value={formData.theme.backgroundColor}
                onChange={(e) =>
                  handleThemeChange("backgroundColor", e.target.value)
                }
                placeholder="#fafafa"
                className="flex-1"
              />
            </div>
          </div>

          {/* Text Color */}
          <div className="space-y-2">
            <Label htmlFor="text-color">Text Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id="text-color"
                type="color"
                value={formData.theme.textColor}
                onChange={(e) => handleThemeChange("textColor", e.target.value)}
                className="w-12 h-10 p-1 border rounded"
              />
              <Input
                value={formData.theme.textColor}
                onChange={(e) => handleThemeChange("textColor", e.target.value)}
                placeholder="#151419"
                className="flex-1"
              />
            </div>
          </div>

          {/* Description Color */}
          <div className="space-y-2">
            <Label htmlFor="description-color">Branding Text Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id="description-color"
                type="color"
                value={
                  formData.theme.descriptionColor || formData.theme.textColor
                }
                onChange={(e) =>
                  handleThemeChange("descriptionColor", e.target.value)
                }
                className="w-12 h-10 p-1 border rounded"
              />
              <Input
                value={
                  formData.theme.descriptionColor || formData.theme.textColor
                }
                onChange={(e) =>
                  handleThemeChange("descriptionColor", e.target.value)
                }
                placeholder="#52525b"
                className="flex-1"
              />
            </div>
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label>Logo</Label>
            <ImageUpload
              value={formData.theme.logoUrl}
              onChange={(url) => handleThemeChange("logoUrl", url || "")}
              type="logo"
              label=""
            />
            <p className="text-xs text-muted-foreground">
              Upload your logo or enter a URL below
            </p>
            <Input
              id="logo-url"
              type="url"
              value={formData.theme.logoUrl || ""}
              onChange={(e) => handleThemeChange("logoUrl", e.target.value)}
              placeholder="https://example.com/logo.png"
              className="flex-1"
            />
          </div>

          {/* Background Info */}
          <div className="space-y-2">
            <Label>Background</Label>
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground">
                The background automatically uses a beautiful gradient from your
                accent color. It transitions from a very light tint at the top
                to the full accent color at the bottom, with a subtle swirl
                effect for visual interest.
              </p>
            </div>
          </div>

          {/* Background Image Upload */}
          <div className="space-y-2">
            <Label>Custom Background Image</Label>
            <ImageUpload
              value={formData.theme.backgroundImageUrl}
              onChange={(url) => {
                // Clear default background when uploading custom image
                if (url) {
                  handleThemeChange("defaultBackgroundId", "");
                }
                handleThemeChange("backgroundImageUrl", url || "");
              }}
              type="background"
              label=""
              aspectRatio="16/9"
            />
            <p className="text-xs text-muted-foreground">
              Upload a custom background image for the left section or enter a
              URL below
            </p>
            <Input
              id="background-image-url"
              type="url"
              value={formData.theme.backgroundImageUrl || ""}
              onChange={(e) => {
                // Clear default background when entering custom URL
                if (e.target.value) {
                  handleThemeChange("defaultBackgroundId", "");
                }
                handleThemeChange("backgroundImageUrl", e.target.value);
              }}
              placeholder="https://example.com/background.jpg"
              className="flex-1"
            />
          </div>
        </div>
      </Card>

      {/* Left Section Branding */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Left Section Branding
          </h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="left-headline">Headline</Label>
            <Input
              id="left-headline"
              value={formData.settings.leftSectionHeadline || ""}
              onChange={(e) =>
                handleSettingsChange("leftSectionHeadline", e.target.value)
              }
              placeholder="Add a headline or title..."
            />
            <p className="text-xs text-muted-foreground">
              A short title that appears at the top of the left branding
              section.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="left-description">Description</Label>
            <Textarea
              id="left-description"
              value={formData.settings.leftSectionDescription || ""}
              onChange={(e) =>
                handleSettingsChange("leftSectionDescription", e.target.value)
              }
              placeholder="Add a description for the left branding section..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              This text will appear below the headline on the left section.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="left-link">Link (Optional)</Label>
            <Input
              id="left-link"
              type="url"
              value={formData.settings.leftSectionLink || ""}
              onChange={(e) =>
                handleSettingsChange("leftSectionLink", e.target.value)
              }
              placeholder="https://example.com"
            />
            <p className="text-xs text-muted-foreground">
              Optional link/CTA to display in the left section
            </p>
          </div>
        </div>
      </Card>

      {/* Typography & Styling */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Typography & Styling
          </h3>
        </div>
        <div className="space-y-4">
          {/* Font Family */}
          <div className="space-y-2">
            <Label htmlFor="font-family">Font Family</Label>
            <select
              id="font-family"
              value={formData.theme.fontFamily}
              onChange={(e) => handleThemeChange("fontFamily", e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            >
              {availableFonts.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label} {font.value === "Satoshi" ? "(Default)" : ""}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              {availableFonts.find((f) => f.value === formData.theme.fontFamily)
                ?.type === "google"
                ? "✓ Loaded from Google Fonts"
                : availableFonts.find(
                      (f) => f.value === formData.theme.fontFamily,
                    )?.type === "local"
                  ? "✓ Custom font"
                  : "✓ System font"}
            </p>
          </div>

          {/* Border Radius */}
          <div className="space-y-2">
            <Label htmlFor="border-radius">Border Radius (px)</Label>
            <Input
              id="border-radius"
              type="number"
              min="0"
              max="50"
              value={formData.theme.borderRadius}
              onChange={(e) =>
                handleThemeChange(
                  "borderRadius",
                  parseInt(e.target.value, 10) || 0,
                )
              }
              placeholder="8"
            />
            <p className="text-xs text-muted-foreground">
              Controls the roundness of form elements (0 = sharp, 50 = pill)
            </p>
          </div>
        </div>
      </Card>

      {/* Info Card */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-lg">👁️</span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Live Preview</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All changes are reflected in real-time on the live preview panel
              to the left. Try adjusting colors, fonts, or layout to see instant
              updates.
            </p>
          </div>
        </div>
      </Card>

      {/* Display Mode */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Monitor className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Display Mode
          </h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="standalone-mode">Standalone Mode</Label>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.settings.mode === "standalone"
                  ? "Full form with header (for links/QR codes)"
                  : "Clean, minimal form (for embedding on a website)"}
              </p>
            </div>
            <Switch
              id="standalone-mode"
              checked={formData.settings.mode === "standalone"}
              onCheckedChange={(checked) =>
                handleSettingsChange("mode", checked ? "standalone" : "embed")
              }
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
