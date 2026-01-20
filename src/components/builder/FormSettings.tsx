"use client";

import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useFormStore } from "@/store/formStore";

export function FormSettings() {
  const { formData, updateForm } = useFormStore();
  const titleManuallyChangedRef = useRef(false);
  const previousTitleRef = useRef(formData.title);

  // Auto-sync header with title initially, unless title was manually changed
  useEffect(() => {
    // If title changed and it wasn't from our auto-sync, mark as manually changed
    if (previousTitleRef.current !== formData.title) {
      // Check if this was a manual change (not from header sync)
      if (!titleManuallyChangedRef.current) {
        titleManuallyChangedRef.current = true;
      }
      previousTitleRef.current = formData.title;
    }

    // If header is empty or matches previous title, and title wasn't manually changed, sync it
    if (
      !titleManuallyChangedRef.current &&
      (!formData.header || formData.header === previousTitleRef.current)
    ) {
      if (formData.title && formData.title !== formData.header) {
        updateForm({ header: formData.title });
      }
    }
  }, [formData.title, formData.header, updateForm]);

  return (
    <div className="space-y-6 pb-4">
      {/* Basic Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Basic Settings
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Form Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => {
                titleManuallyChangedRef.current = true;
                updateForm({ title: e.target.value });
              }}
              placeholder="Enter form title"
            />
            <p className="text-xs text-muted-foreground">
              This is the internal title for your form
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="header">Form Header</Label>
            <Input
              id="header"
              value={formData.header || formData.title || ""}
              onChange={(e) => updateForm({ header: e.target.value })}
              placeholder="Enter form header (shown to users)"
            />
            <p className="text-xs text-muted-foreground">
              This is displayed to users. Initially syncs with title, but can be
              customized independently.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => updateForm({ description: e.target.value })}
              placeholder="Enter form description"
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Display Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Display Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-title">Show Title</Label>
              <p className="text-sm text-muted-foreground">
                Display the form title to users
              </p>
            </div>
            <Switch
              id="show-title"
              checked={formData.settings.showTitle}
              onCheckedChange={(checked) =>
                updateForm({
                  settings: { ...formData.settings, showTitle: checked },
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-description">Show Description</Label>
              <p className="text-sm text-muted-foreground">
                Display the form description to users
              </p>
            </div>
            <Switch
              id="show-description"
              checked={formData.settings.showDescription}
              onCheckedChange={(checked) =>
                updateForm({
                  settings: { ...formData.settings, showDescription: checked },
                })
              }
            />
          </div>
        </div>
      </Card>

      {/* Submit Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Submit Settings
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="submit-text">Submit Button Text</Label>
            <Input
              id="submit-text"
              value={formData.settings.submitButtonText}
              onChange={(e) =>
                updateForm({
                  settings: {
                    ...formData.settings,
                    submitButtonText: e.target.value,
                  },
                })
              }
              placeholder="Submit"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="success-message">Success Message</Label>
            <Textarea
              id="success-message"
              value={formData.settings.successMessage}
              onChange={(e) =>
                updateForm({
                  settings: {
                    ...formData.settings,
                    successMessage: e.target.value,
                  },
                })
              }
              placeholder="Thank you for your submission!"
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Advanced Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Advanced Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-watermark">Show ShelfCue Watermark</Label>
              <p className="text-sm text-muted-foreground">
                Display "Powered by ShelfCue" at the bottom of the form
              </p>
            </div>
            <Switch
              id="show-watermark"
              checked={formData.settings.showWatermark !== false}
              onCheckedChange={(checked) =>
                updateForm({
                  settings: {
                    ...formData.settings,
                    showWatermark: checked,
                  },
                })
              }
            />
          </div>
        </div>
      </Card>

    </div>
  );
}
