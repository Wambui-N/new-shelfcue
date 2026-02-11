"use client";

import { MeetingTimePicker } from "@/components/ui/meeting-time-picker";
import { cn } from "@/lib/utils";
import type { FormField } from "@/types/form";
import type { FormTheme } from "@/types/form-display";

interface FieldRendererProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  theme: FormTheme;
  isConversational?: boolean;
  formId?: string;
  calendarId?: string;
  userId?: string;
  isEmbedded?: boolean;
  timeZone?: string;
  compact?: boolean;
}

export function FieldRenderer({
  field,
  value,
  onChange,
  theme,
  isConversational = false,
  formId,
  calendarId,
  userId,
  isEmbedded = false,
  timeZone,
  compact = false,
}: FieldRendererProps) {
  const baseClasses = cn(
    "w-full rounded-lg border border-gray-300",
    "focus:outline-none focus:ring-2 focus:ring-[var(--shelf-primary)] focus:border-transparent",
    "transition-colors duration-200",
    "text-gray-900 placeholder-gray-500",
    compact && "px-2 py-1.5 min-h-9 text-sm",
    isEmbedded && !compact && "px-3 py-2 min-h-[38px] text-xs sm:text-sm",
    !compact && !isEmbedded && "px-3 py-2 sm:px-4 sm:py-3 min-h-[44px] text-sm sm:text-base",
  );

  const labelClasses = cn(
    "font-medium text-gray-700",
    compact && "text-xs mb-0.5",
    isEmbedded && !compact && "text-[11px] mb-1",
    !compact && !isEmbedded && "block text-xs sm:text-sm mb-1.5 sm:mb-2",
    !compact && !isEmbedded && isConversational && "text-lg font-semibold text-gray-900",
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
            rows={compact ? 2 : 4}
            className={cn(
              baseClasses,
              "resize-none",
              compact ? "min-h-[60px] text-sm" : "min-h-[100px] text-base",
            )}
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
              <label
                key={index}
                className="flex items-center space-x-2 sm:space-x-3 cursor-pointer"
              >
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(e.target.value)}
                  required={field.required}
                  className="w-4 h-4 text-[var(--shelf-primary)] border-gray-300 focus:ring-[var(--shelf-primary)]"
                />
                <span className="text-xs sm:text-sm text-gray-700">
                  {option}
                </span>
              </label>
            ))}
          </div>
        );

      case "checkbox":
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label
                key={index}
                className="flex items-center space-x-2 sm:space-x-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  name={field.id}
                  value={option}
                  checked={
                    Array.isArray(value) ? value.includes(option) : false
                  }
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      onChange([...currentValues, option]);
                    } else {
                      onChange(
                        currentValues.filter((v: string) => v !== option),
                      );
                    }
                  }}
                  className="w-4 h-4 text-[var(--shelf-primary)] border-gray-300 rounded focus:ring-[var(--shelf-primary)]"
                />
                <span className="text-xs sm:text-sm text-gray-700">
                  {option}
                </span>
              </label>
            ))}
          </div>
        );

      case "meeting":
        return (
          <MeetingTimePicker
            value={value}
            onChange={onChange}
            duration={field.meetingSettings?.duration}
            bufferTime={field.meetingSettings?.bufferTime}
            placeholder={field.placeholder || "Select a date and time"}
            formId={formId}
            calendarId={calendarId}
            userId={userId}
            startHour={field.meetingSettings?.startHour ?? 9}
            endHour={field.meetingSettings?.endHour ?? 17}
            timeZone={timeZone}
            availableDays={field.meetingSettings?.availableDays}
          />
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
