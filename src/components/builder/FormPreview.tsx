"use client";

import { FormDisplay } from "@/components/forms/FormDisplay";
import { useFormStore } from "@/store/formStore";

interface FormPreviewProps {
  className?: string;
}

export function FormPreview({ className }: FormPreviewProps) {
  const { formData } = useFormStore();

  const handleSubmit = async (data: Record<string, any>) => {
    console.log("Form submitted (preview mode):", data);
    // This is a preview, so we don't actually submit
  };

  return (
    <div className={className}>
      <FormDisplay
        formId={formData.id || "preview"}
        title={formData.title || "Untitled Form"}
        description={formData.description}
        fields={formData.fields}
        mode={formData.settings.mode || "standalone"}
        layout={formData.settings.layout || "simple"}
        theme={formData.theme}
        onSubmit={handleSubmit}
        isSubmitting={false}
      />
      </div>
  );
}
