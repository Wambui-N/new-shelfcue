"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useFormStore } from "@/store/formStore";
import { GoogleIntegrationPanel } from "./GoogleIntegrationPanel";

export function FormSettings() {
  const { formData, updateForm } = useFormStore();

  return (
    <div className="space-y-6">
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
              onChange={(e) => updateForm({ title: e.target.value })}
              placeholder="Enter form title"
            />
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

          <div className="space-y-2">
            <Label htmlFor="redirect-url">Redirect URL (Optional)</Label>
            <Input
              id="redirect-url"
              value={formData.settings.redirectUrl || ""}
              onChange={(e) =>
                updateForm({
                  settings: {
                    ...formData.settings,
                    redirectUrl: e.target.value,
                  },
                })
              }
              placeholder="https://example.com/thank-you"
            />
            <p className="text-xs text-muted-foreground">
              Users will be redirected to this URL after successful submission
            </p>
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
              <Label htmlFor="collect-email">Collect Email</Label>
              <p className="text-sm text-muted-foreground">
                Automatically collect submitter's email
              </p>
            </div>
            <Switch
              id="collect-email"
              checked={formData.settings.collectEmail}
              onCheckedChange={(checked) =>
                updateForm({
                  settings: { ...formData.settings, collectEmail: checked },
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allow-multiple">Allow Multiple Submissions</Label>
              <p className="text-sm text-muted-foreground">
                Allow users to submit the form multiple times
              </p>
            </div>
            <Switch
              id="allow-multiple"
              checked={formData.settings.allowMultipleSubmissions}
              onCheckedChange={(checked) =>
                updateForm({
                  settings: {
                    ...formData.settings,
                    allowMultipleSubmissions: checked,
                  },
                })
              }
            />
          </div>
        </div>
      </Card>

      {/* Google Integrations */}
      {formData.id && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Google Integrations
          </h3>
          <GoogleIntegrationPanel
            formId={formData.id}
            formFields={formData.fields.map((f) => ({
              id: f.id,
              label: f.label,
              type: f.type,
            }))}
          />
        </div>
      )}
    </div>
  );
}
