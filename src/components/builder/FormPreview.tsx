"use client";

import { FormDisplay } from "@/components/forms/FormDisplay";
import { useFormStore } from "@/store/formStore";

interface FormPreviewProps {
  className?: string;
  deviceView?: "desktop" | "mobile";
  fitPreview?: boolean;
}

export function FormPreview({ className, deviceView, fitPreview }: FormPreviewProps) {
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
        header={formData.header}
        description={formData.description}
        fields={formData.fields}
        mode={formData.settings.mode || "standalone"}
        layout={formData.settings.layout || "simple"}
        theme={formData.theme}
        onSubmit={handleSubmit}
        isSubmitting={false}
        leftSectionHeadline={formData.settings.leftSectionHeadline}
        leftSectionDescription={formData.settings.leftSectionDescription}
        leftSectionLink={formData.settings.leftSectionLink}
        showWatermark={formData.settings.showWatermark !== false}
        deviceView={deviceView}
        fitPreview={fitPreview}
      />
    </div>
  );
}
