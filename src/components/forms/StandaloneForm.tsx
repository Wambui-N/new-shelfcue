"use client";

import type React from "react";
import { cn } from "@/lib/utils";
import { getFontFamily } from "@/lib/fonts";
import type { FormTheme } from "@/types/form-display";

interface StandaloneFormProps {
  children: React.ReactNode;
  theme: FormTheme;
  className?: string;
}

export function StandaloneForm({
  children,
  theme,
  className,
}: StandaloneFormProps) {
  const backgroundStyle = getBackgroundStyle(theme);

  return (
    <div
      className={cn("min-h-screen w-full", "flex flex-col", className)}
      style={
        {
          ...backgroundStyle,
          fontFamily: getFontFamily(theme.fontFamily),
          "--shelf-primary": theme.primaryColor,
          "--shelf-radius": `${theme.borderRadius}px`,
          "--shelf-shadow":
            theme.shadows?.medium || "0 4px 12px rgba(0, 0, 0, 0.1)",
          ...(theme.customCSS ? {} : {}),
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

function getBackgroundStyle(theme: FormTheme): React.CSSProperties {
  if (!theme.background) {
    return { backgroundColor: "#ffffff" };
  }

  const { type, color, gradient, image, overlay } = theme.background;

  switch (type) {
    case "solid":
      return { backgroundColor: color || "#ffffff" };

    case "gradient":
      return {
        background:
          gradient ||
          `linear-gradient(135deg, ${theme.primaryColor} 0%, #ffffff 100%)`,
      };

    case "image":
      return {
        backgroundImage: image ? `url(${image})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
      };

    case "animated":
      return {
        background: `linear-gradient(-45deg, ${theme.primaryColor}, #ffffff, ${theme.primaryColor}40, #ffffff)`,
        backgroundSize: "400% 400%",
        animation: "gradientShift 15s ease infinite",
      };

    default:
      return { backgroundColor: "#ffffff" };
  }
}
