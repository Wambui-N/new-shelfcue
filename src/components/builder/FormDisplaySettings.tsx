"use client";

import React, { useState } from "react";
import { FormTheme, FormLayout, FormDisplayMode, defaultTheme, layoutPresets } from "@/types/form-display";
import { createThemeFromBrand, generateCSSVariables } from "@/lib/theme-generator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Using native select to avoid runtime vendor chunk issues on Windows
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface FormDisplaySettingsProps {
  mode: FormDisplayMode;
  layout: FormLayout;
  theme: FormTheme;
  onModeChange: (mode: FormDisplayMode) => void;
  onLayoutChange: (layout: FormLayout) => void;
  onThemeChange: (theme: FormTheme) => void;
}

export function FormDisplaySettings({
  mode,
  layout,
  theme,
  onModeChange,
  onLayoutChange,
  onThemeChange
}: FormDisplaySettingsProps) {
  const [customCSS, setCustomCSS] = useState(theme.customCSS || "");

  const handlePrimaryColorChange = (color: string) => {
    const newTheme = createThemeFromBrand(color, theme.fontFamily);
    onThemeChange({
      ...theme,
      ...newTheme,
      customCSS
    });
  };

  const handleFontFamilyChange = (fontFamily: string) => {
    onThemeChange({
      ...theme,
      fontFamily,
      typography: {
        ...theme.typography,
        headingFont: fontFamily,
        bodyFont: fontFamily
      }
    });
  };

  const handleCustomCSSChange = (css: string) => {
    setCustomCSS(css);
    onThemeChange({
      ...theme,
      customCSS: css
    });
  };

  const layoutOptions = [
    { value: "simple", label: "Simple", description: "One-column layout for contact forms" },
    { value: "compact", label: "Compact", description: "Two-column layout for applications" },
    { value: "conversational", label: "Conversational", description: "Typeform-style multi-step" },
    { value: "hero", label: "Hero", description: "Split-view for high conversion" }
  ];

  return (
    <div className="space-y-6">
      {/* Display Mode Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Display Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="standalone-mode"
                checked={mode === "standalone"}
                onCheckedChange={(checked) => onModeChange(checked ? "standalone" : "embed")}
              />
              <Label htmlFor="standalone-mode">Standalone Mode</Label>
            </div>
            <p className="text-sm text-gray-500">
              {mode === "standalone" 
                ? "Full form with header and footer (for links/QR codes)"
                : "Clean, minimal form (for embedding in websites)"
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Layout Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Layout Preset</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {layoutOptions.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "p-4 border rounded-lg cursor-pointer transition-colors",
                  layout === option.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
                onClick={() => onLayoutChange(option.value as FormLayout)}
              >
                <h3 className="font-medium text-gray-900">{option.label}</h3>
                <p className="text-sm text-gray-500 mt-1">{option.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Theme & Branding</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="quick" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="quick">Quick Branding</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Control</TabsTrigger>
            </TabsList>
            
            <TabsContent value="quick" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      id="primary-color"
                      type="color"
                      value={theme.primaryColor}
                      onChange={(e) => handlePrimaryColorChange(e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={theme.primaryColor}
                      onChange={(e) => handlePrimaryColorChange(e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="font-family">Font Family</Label>
                  <select
                    id="font-family"
                    value={theme.fontFamily}
                    onChange={(e) => handleFontFamilyChange(e.target.value)}
                    className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="Inter, system-ui, sans-serif">Inter</option>
                    <option value="Poppins, system-ui, sans-serif">Poppins</option>
                    <option value="Lato, system-ui, sans-serif">Lato</option>
                    <option value="Montserrat, system-ui, sans-serif">Montserrat</option>
                    <option value="Manrope, system-ui, sans-serif">Manrope</option>
                    <option value="Merriweather, serif">Merriweather</option>
                    <option value="'Playfair Display', serif">Playfair Display</option>
                    <option value="Rubik, system-ui, sans-serif">Rubik</option>
                    <option value="Raleway, system-ui, sans-serif">Raleway</option>
                    <option value="Nunito, system-ui, sans-serif">Nunito</option>
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="border-radius">Border Radius</Label>
                <Input
                  id="border-radius"
                  type="number"
                  min="0"
                  max="50"
                  value={theme.borderRadius}
                  onChange={(e) => onThemeChange({
                    ...theme,
                    borderRadius: parseInt(e.target.value) || 0
                  })}
                  className="mt-1"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4">
              <div>
                <Label htmlFor="custom-css">Custom CSS Variables</Label>
                <textarea
                  id="custom-css"
                  value={customCSS}
                  onChange={(e) => handleCustomCSSChange(e.target.value)}
                  placeholder="/* Add your custom CSS variables here */"
                  className="w-full h-32 p-3 border rounded-lg font-mono text-sm mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use CSS variables like --shelf-primary, --shelf-radius, etc.
                </p>
              </div>
              
              <div>
                <Label>Generated CSS Variables</Label>
                <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-x-auto mt-1">
                  {generateCSSVariables(theme)}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="text-sm text-gray-600 mb-2">
              Mode: <span className="font-medium">{mode}</span> | 
              Layout: <span className="font-medium">{layout}</span>
            </div>
            <div 
              className="w-full h-32 rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500"
              style={{
                backgroundColor: theme.background?.color || '#ffffff',
                borderRadius: `${theme.borderRadius}px`
              }}
            >
              Form Preview
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
