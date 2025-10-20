"use client";

import React from "react";
import { FormTheme, FormHeaderConfig } from "@/types/form-display";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface FormHeaderProps {
  title: string;
  description?: string;
  theme: FormTheme;
  showLogo?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  config?: Partial<FormHeaderConfig>;
}

export function FormHeader({
  title,
  description,
  theme,
  showLogo = true,
  showTitle = true,
  showDescription = true,
  config = {}
}: FormHeaderProps) {
  const {
    logoUrl,
    logoHeight = 40,
    titleAlignment = "center"
  } = config;

  return (
    <header className={cn(
      "w-full py-8 px-4",
      "border-b border-gray-200 bg-white/80 backdrop-blur-sm"
    )}>
      <div className="max-w-4xl mx-auto">
        <div className={cn(
          "flex flex-col items-center space-y-4",
          titleAlignment === "left" && "items-start",
          titleAlignment === "right" && "items-end"
        )}>
          {/* Logo */}
          {showLogo && logoUrl && (
            <div className="flex-shrink-0">
              <Image
                src={logoUrl}
                alt="Logo"
                width={logoHeight * 2}
                height={logoHeight}
                className="object-contain"
              />
            </div>
          )}

          {/* Title */}
          {showTitle && (
            <h1 className={cn(
              "text-3xl font-bold text-gray-900",
              "sm:text-4xl lg:text-5xl",
              "text-center",
              titleAlignment === "left" && "text-left",
              titleAlignment === "right" && "text-right"
            )}>
              {title}
            </h1>
          )}

          {/* Description */}
          {showDescription && description && (
            <p className={cn(
              "text-lg text-gray-600 max-w-2xl",
              "text-center",
              titleAlignment === "left" && "text-left",
              titleAlignment === "right" && "text-right"
            )}>
              {description}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
