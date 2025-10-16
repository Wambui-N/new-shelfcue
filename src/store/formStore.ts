import { create } from "zustand";
import type { FormData, FormField } from "@/types/form";

interface FormStore {
  formData: FormData;
  isDirty: boolean;
  isSaving: boolean;

  // Actions
  updateForm: (updates: Partial<FormData>) => void;
  addField: (field: FormField) => void;
  updateField: (fieldId: string, updates: Partial<FormField>) => void;
  removeField: (fieldId: string) => void;
  reorderFields: (fromIndex: number, toIndex: number) => void;
  loadForm: (form: FormData) => void;
  resetForm: () => void;
  setDirty: (dirty: boolean) => void;
  setSaving: (saving: boolean) => void;
}

const defaultForm: FormData = {
  title: "",
  description: "",
  status: "draft",
  fields: [],
  theme: {
    primaryColor: "#151419",
    backgroundColor: "#fafafa",
    textColor: "#151419",
    borderRadius: 8,
    fontFamily: "Satoshi",
  },
  settings: {
    showTitle: true,
    showDescription: true,
    submitButtonText: "Submit",
    successMessage: "Thank you for your submission!",
    collectEmail: false,
    allowMultipleSubmissions: true,
    showWatermark: true,
  },
};

export const useFormStore = create<FormStore>((set, get) => ({
  formData: defaultForm,
  isDirty: false,
  isSaving: false,

  updateForm: (updates) => {
    set((state) => ({
      formData: { ...state.formData, ...updates },
      isDirty: true,
    }));
  },

  addField: (field) => {
    set((state) => ({
      formData: {
        ...state.formData,
        fields: [...state.formData.fields, field],
      },
      isDirty: true,
    }));
  },

  updateField: (fieldId, updates) => {
    set((state) => ({
      formData: {
        ...state.formData,
        fields: state.formData.fields.map((field) =>
          field.id === fieldId ? { ...field, ...updates } : field,
        ),
      },
      isDirty: true,
    }));
  },

  removeField: (fieldId) => {
    set((state) => ({
      formData: {
        ...state.formData,
        fields: state.formData.fields.filter((field) => field.id !== fieldId),
      },
      isDirty: true,
    }));
  },

  reorderFields: (fromIndex, toIndex) => {
    set((state) => {
      const fields = [...state.formData.fields];
      const [movedField] = fields.splice(fromIndex, 1);
      fields.splice(toIndex, 0, movedField);

      return {
        formData: {
          ...state.formData,
          fields,
        },
        isDirty: true,
      };
    });
  },

  loadForm: (form) => {
    set({
      formData: form,
      isDirty: false,
    });
  },

  resetForm: () => {
    set({
      formData: defaultForm,
      isDirty: false,
      isSaving: false,
    });
  },

  setDirty: (dirty) => {
    set({ isDirty: dirty });
  },

  setSaving: (saving) => {
    set({ isSaving: saving });
  },
}));
