"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  CheckSquare,
  Clock,
  Copy,
  FileText,
  Globe,
  GripVertical,
  Hash,
  Link,
  List,
  Mail,
  MoreVertical,
  Phone,
  Plus,
  Radio,
  Star,
  Text,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useFormStore } from "@/store/formStore";
import type { FormField } from "@/types/form";

const fieldTypes = [
  { type: "text", label: "Text Input", icon: <Text className="w-4 h-4" /> },
  {
    type: "email_field",
    label: "Email Field",
    icon: <Mail className="w-4 h-4" />,
  },
  {
    type: "phone_field",
    label: "Phone Field",
    icon: <Phone className="w-4 h-4" />,
  },
  { type: "country", label: "Country", icon: <Globe className="w-4 h-4" /> },
  {
    type: "textarea",
    label: "Textarea",
    icon: <FileText className="w-4 h-4" />,
  },
  { type: "select", label: "Dropdown", icon: <List className="w-4 h-4" /> },
  {
    type: "radio",
    label: "Radio Buttons",
    icon: <Radio className="w-4 h-4" />,
  },
  {
    type: "checkbox",
    label: "Checkboxes",
    icon: <CheckSquare className="w-4 h-4" />,
  },
  { type: "number", label: "Number", icon: <Hash className="w-4 h-4" /> },
  { type: "date", label: "Date", icon: <Calendar className="w-4 h-4" /> },
  { type: "url", label: "URL", icon: <Link className="w-4 h-4" /> },
  {
    type: "meeting",
    label: "Book Meeting",
    icon: <Clock className="w-4 h-4" />,
  },
] as const;

export function FieldEditor() {
  const { formData, addField, updateField, removeField, reorderFields } =
    useFormStore();
  const [selectedField, setSelectedField] = useState<string | null>(null);

  const addNewField = (type: FormField["type"]) => {
    const newField: FormField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      label: `New ${fieldTypes.find((f) => f.type === type)?.label || "Field"}`,
      required: false,
      options: ["Option 1", "Option 2"],
    };
    addField(newField);
    setSelectedField(newField.id);
  };

  const duplicateField = (field: FormField) => {
    const newField: FormField = {
      ...field,
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      label: `${field.label} (Copy)`,
    };
    addField(newField);
    setSelectedField(newField.id);
  };

  const moveField = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < formData.fields.length) {
      reorderFields(index, newIndex);
    }
  };

  return (
    <div className="space-y-6 pb-4">
      {/* Add Field Buttons */}
      <div className="grid grid-cols-3 gap-2">
        {fieldTypes.map((fieldType) => (
          <Button
            key={fieldType.type}
            variant="outline"
            size="sm"
            onClick={() => addNewField(fieldType.type)}
            className="flex items-center gap-2 h-auto p-3"
          >
            {fieldType.icon}
            <span className="text-xs">{fieldType.label}</span>
          </Button>
        ))}
      </div>

      {/* Fields List */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">
          Form Fields ({formData.fields.length})
        </h3>

        <AnimatePresence>
          {formData.fields.map((field, index) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className={`p-4 transition-all duration-200 ${
                  selectedField === field.id
                    ? "ring-2 ring-primary bg-primary/5"
                    : "hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveField(index, "up")}
                      disabled={index === 0}
                      className="h-6 w-6 p-0"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveField(index, "down")}
                      disabled={index === formData.fields.length - 1}
                      className="h-6 w-6 p-0"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </Button>
                  </div>

                  <GripVertical className="w-4 h-4 text-muted-foreground" />

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {fieldTypes.find((f) => f.type === field.type)?.icon}
                      <Input
                        value={field.label}
                        onChange={(e) =>
                          updateField(field.id, { label: e.target.value })
                        }
                        className="font-medium"
                        placeholder="Field label"
                      />
                      <Badge variant="outline" className="text-xs">
                        {fieldTypes.find((f) => f.type === field.type)?.label}
                      </Badge>
                    </div>

                    {field.type === "select" ||
                    field.type === "radio" ||
                    field.type === "checkbox" ? (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Options
                        </Label>
                        {field.options?.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="flex items-center gap-2"
                          >
                            <Input
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...(field.options || [])];
                                newOptions[optionIndex] = e.target.value;
                                updateField(field.id, { options: newOptions });
                              }}
                              className="text-sm"
                              placeholder="Option"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newOptions =
                                  field.options?.filter(
                                    (_, i) => i !== optionIndex,
                                  ) || [];
                                updateField(field.id, { options: newOptions });
                              }}
                              className="h-6 w-6 p-0 text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newOptions = [
                              ...(field.options || []),
                              "New Option",
                            ];
                            updateField(field.id, { options: newOptions });
                          }}
                          className="w-full"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Option
                        </Button>
                      </div>
                    ) : field.type === "textarea" ? (
                      <Textarea
                        placeholder={
                          field.placeholder || "Enter your message..."
                        }
                        onChange={(e) =>
                          updateField(field.id, { placeholder: e.target.value })
                        }
                        className="text-sm"
                        rows={3}
                      />
                    ) : field.type === "meeting" ? (
                      <div className="space-y-4">
                        <Input
                          placeholder={
                            field.placeholder || "Select meeting time..."
                          }
                          onChange={(e) =>
                            updateField(field.id, {
                              placeholder: e.target.value,
                            })
                          }
                          className="text-sm"
                        />

                        {/* Meeting Duration */}
                        <div>
                          <Label className="text-sm mb-2">
                            Meeting Duration
                          </Label>
                          <select
                            value={field.meetingSettings?.duration || 30}
                            onChange={(e) =>
                              updateField(field.id, {
                                meetingSettings: {
                                  ...field.meetingSettings,
                                  duration: Number(e.target.value),
                                },
                              })
                            }
                            className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                          >
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={45}>45 minutes</option>
                            <option value={60}>1 hour</option>
                            <option value={90}>1.5 hours</option>
                            <option value={120}>2 hours</option>
                          </select>
                        </div>

                        {/* Buffer Time */}
                        <div>
                          <Label className="text-sm mb-2">
                            Buffer Time Between Meetings
                          </Label>
                          <select
                            value={field.meetingSettings?.bufferTime || 0}
                            onChange={(e) =>
                              updateField(field.id, {
                                meetingSettings: {
                                  ...field.meetingSettings,
                                  bufferTime: Number(e.target.value),
                                },
                              })
                            }
                            className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                          >
                            <option value={0}>No buffer</option>
                            <option value={5}>5 minutes</option>
                            <option value={10}>10 minutes</option>
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                          </select>
                        </div>

                        {/* Calendar Selection - Will be populated during publish */}
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            📅 Calendar will be selected when you publish this
                            form
                          </p>
                        </div>
                      </div>
                    ) : field.type === "email_field" ? (
                      <Input
                        placeholder={
                          field.placeholder || "Enter email address..."
                        }
                        onChange={(e) =>
                          updateField(field.id, { placeholder: e.target.value })
                        }
                        className="text-sm"
                      />
                    ) : field.type === "phone_field" ? (
                      <Input
                        placeholder={field.placeholder || "+1 (555) 123-4567"}
                        onChange={(e) =>
                          updateField(field.id, { placeholder: e.target.value })
                        }
                        className="text-sm"
                      />
                    ) : field.type === "country" ? (
                      <Input
                        placeholder={
                          field.placeholder || "Select your country..."
                        }
                        onChange={(e) =>
                          updateField(field.id, { placeholder: e.target.value })
                        }
                        className="text-sm"
                      />
                    ) : (
                      <Input
                        placeholder={field.placeholder || "Enter text..."}
                        onChange={(e) =>
                          updateField(field.id, { placeholder: e.target.value })
                        }
                        className="text-sm"
                      />
                    )}

                    <div className="flex items-center justify-between mt-3 p-2 bg-background-secondary rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Star
                          className={`w-4 h-4 ${field.required ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`}
                        />
                        <Label
                          htmlFor={`required-${field.id}`}
                          className={`text-sm font-medium ${field.required ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {field.required ? "Required Field" : "Optional Field"}
                        </Label>
                      </div>
                      <Switch
                        id={`required-${field.id}`}
                        checked={field.required}
                        onCheckedChange={(checked) =>
                          updateField(field.id, { required: checked })
                        }
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setSelectedField(
                          selectedField === field.id ? null : field.id,
                        )
                      }
                      className="h-8 w-8 p-0"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {selectedField === field.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-border"
                  >
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => duplicateField(field)}
                        className="flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Duplicate
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          removeField(field.id);
                          setSelectedField(null);
                        }}
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </Button>
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {formData.fields.length === 0 && (
          <Card className="p-8 text-center border-dashed">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-2">No fields yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first field to start building your form
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
