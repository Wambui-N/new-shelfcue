"use client";

import React from "react";
import { FormTheme } from "@/types/form-display";
import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  theme: FormTheme;
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  theme
}: ProgressIndicatorProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full mb-8">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-[var(--shelf-primary)] h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Numbers */}
      <div className="flex justify-between items-center">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                index <= currentStep
                  ? "bg-[var(--shelf-primary)] text-white"
                  : "bg-gray-200 text-gray-500"
              )}
            >
              {index + 1}
            </div>
            <span className="text-xs text-gray-500 mt-1">
              Step {index + 1}
            </span>
          </div>
        ))}
      </div>

      {/* Progress Text */}
      <div className="text-center mt-4">
        <span className="text-sm text-gray-600">
          {currentStep + 1} of {totalSteps} steps completed
        </span>
      </div>
    </div>
  );
}
