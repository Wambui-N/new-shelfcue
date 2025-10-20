"use client";

import React from "react";
import { FormField } from "@/types/form";
import { FormTheme } from "@/types/form-display";
import { cn } from "@/lib/utils";

interface FieldRendererProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  theme: FormTheme;
  isConversational?: boolean;
}

export function FieldRenderer({
  field,
  value,
  onChange,
  theme,
  isConversational = false
}: FieldRendererProps) {
  const baseClasses = cn(
    "w-full px-4 py-3 rounded-lg border border-gray-300",
    "focus:outline-none focus:ring-2 focus:ring-[var(--shelf-primary)] focus:border-transparent",
    "transition-colors duration-200",
    "text-gray-900 placeholder-gray-500"
  );

  const labelClasses = cn(
    "block text-sm font-medium text-gray-700 mb-2",
    isConversational && "text-lg font-semibold text-gray-900"
  );

  const renderField = () => {
    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={baseClasses}
          />
        );

      case "email_field":
        return (
          <input
            type="email"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={baseClasses}
          />
        );

      case "textarea":
        return (
          <textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            className={cn(baseClasses, "resize-none")}
          />
        );

      case "select":
        return (
          <select
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            className={baseClasses}
          >
            <option value="">{field.placeholder || "Select an option"}</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(e.target.value)}
                  required={field.required}
                  className="w-4 h-4 text-[var(--shelf-primary)] border-gray-300 focus:ring-[var(--shelf-primary)]"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case "checkbox":
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name={field.id}
                  value={option}
                  checked={Array.isArray(value) ? value.includes(option) : false}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      onChange([...currentValues, option]);
                    } else {
                      onChange(currentValues.filter((v: string) => v !== option));
                    }
                  }}
                  className="w-4 h-4 text-[var(--shelf-primary)] border-gray-300 rounded focus:ring-[var(--shelf-primary)]"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case "meeting":
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">Schedule a Meeting</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Select your preferred time slot below
              </p>
            </div>
            
            {/* Meeting time picker would go here */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"].map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => onChange(time)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg border transition-colors",
                    value === time
                      ? "bg-[var(--shelf-primary)] text-white border-[var(--shelf-primary)]"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  )}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        );

      case "phone":
        return (
          <input
            type="tel"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={baseClasses}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={baseClasses}
          />
        );

      case "date":
        return (
          <input
            type="date"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            className={baseClasses}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={baseClasses}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor={field.id} className={labelClasses}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
    </div>
  );
}
