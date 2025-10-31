"use client";

import { MeetingTimePicker } from "@/components/ui/meeting-time-picker";
import { cn } from "@/lib/utils";
import type { FormField } from "@/lib/types";
import { Textarea } from "../ui/textarea";
import type { SubmissionDataValue } from "@/app/api/submit/route";

interface FieldRendererProps {
  field: FormField;
  value: SubmissionDataValue;
  onChange: (value: SubmissionDataValue) => void;
}

export function FieldRenderer({
  field,
  value,
  onChange,
}: FieldRendererProps) {
  const baseClasses = cn(
    "w-full px-4 py-3 rounded-lg border border-gray-300",
    "focus:outline-none focus:ring-2 focus:ring-[var(--shelf-primary)] focus:border-transparent",
    "transition-colors duration-200",
    "text-gray-900 placeholder-gray-500",
  );

  const labelClasses = cn(
    "block text-sm font-medium text-gray-700 mb-2",
    isConversational && "text-lg font-semibold text-gray-900",
  );

  const commonProps = {
    id: field.id,
    placeholder: field.placeholder,
    required: field.required,
    className: baseClasses,
  };

  const renderField = () => {
    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            {...commonProps}
          />
        );

      case "email_field":
        return (
          <input
            type="email"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            {...commonProps}
          />
        );

      case "textarea":
        return (
          <Textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            {...commonProps}
            rows={4}
            className={cn(baseClasses, "resize-none")}
          />
        );

      case "select":
        return (
          <select
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            {...commonProps}
          >
            <option value="">{field.placeholder || "Select an option"}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <input
                  type="radio"
                  name={field.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  required={field.required}
                  className="w-4 h-4 text-[var(--shelf-primary)] border-gray-300 focus:ring-[var(--shelf-primary)]"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case "checkbox":
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  name={field.id}
                  value={option.value}
                  checked={
                    Array.isArray(value) ? value.includes(option.value) : false
                  }
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      onChange([...currentValues, option.value]);
                    } else {
                      onChange(
                        currentValues.filter((v: string) => v !== option.value),
                      );
                    }
                  }}
                  className="w-4 h-4 text-[var(--shelf-primary)] border-gray-300 rounded focus:ring-[var(--shelf-primary)]"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
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
          />
        );

      case "phone":
        return (
          <input
            type="tel"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            {...commonProps}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            {...commonProps}
          />
        );

      case "date":
        return (
          <input
            type="date"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            {...commonProps}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            {...commonProps}
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
