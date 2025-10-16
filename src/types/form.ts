export interface FormField {
  id: string;
  type:
    | "text"
    | "email"
    | "textarea"
    | "select"
    | "radio"
    | "checkbox"
    | "number"
    | "date"
    | "phone"
    | "url"
    | "meeting"
    | "email_field"
    | "phone_field"
    | "country";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select, radio, checkbox
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  // Meeting booking specific
  meetingSettings?: {
    calendarId?: string;
    duration?: number; // minutes
    timeSlots?: string[]; // available time slots
    bufferTime?: number; // minutes between meetings
  };
  // Country field specific
  countrySettings?: {
    allowMultiple?: boolean;
    defaultCountry?: string;
    restrictedCountries?: string[]; // ISO country codes to exclude
  };
}

export interface FormData {
  id?: string;
  title: string;
  description?: string;
  status: "draft" | "published";
  fields: FormField[];
  theme: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    borderRadius: number;
    fontFamily: string;
  };
  settings: {
    showTitle: boolean;
    showDescription: boolean;
    submitButtonText: string;
    successMessage: string;
    redirectUrl?: string;
    collectEmail: boolean;
    allowMultipleSubmissions: boolean;
    showWatermark?: boolean;
  };
  default_calendar_id?: string;
  lastSaved?: Date;
}

export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, any>;
  createdAt: string;
  ipAddress?: string;
  userAgent?: string;
}
