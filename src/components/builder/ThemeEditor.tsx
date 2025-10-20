"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { availableFonts } from "@/lib/fonts";
import { useFormStore } from "@/store/formStore";

export function ThemeEditor() {
  const { formData, updateForm } = useFormStore();

  const handleThemeChange = (key: string, value: string | number) => {
    updateForm({
      theme: {
        ...formData.theme,
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

  return (
    <div className="space-y-6">
      {/* Colors */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Colors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

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
        </div>
      </Card>

      {/* Styling */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Styling</h3>
        <div className="space-y-4">
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
          </div>

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
              All theme changes are reflected in real-time on the live preview
              panel to the left. Try changing colors, fonts, or border radius to
              see instant updates.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
