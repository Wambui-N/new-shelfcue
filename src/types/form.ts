export interface FormField {
  id: string;
  type: 'text' | 'email' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'date' | 'phone' | 'url' | 'meeting' | 'file' | 'email_field' | 'phone_field' | 'country';
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
  // File upload specific
  fileSettings?: {
    allowedTypes?: string[]; // e.g., ['image/*', 'application/pdf']
    maxSize?: number; // MB
    multiple?: boolean;
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
  status: 'draft' | 'published';
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
  };
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
