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
    startHour?: number; // Start hour (0-23), default 9
    endHour?: number; // End hour (0-23), default 17
    availableDays?: number[]; // 0=Sun .. 6=Sat; when absent/empty, treat as weekdays [1,2,3,4,5]
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
  header?: string; // Separate from title, auto-syncs initially
  description?: string;
  status: "draft" | "published";
  fields: FormField[];
  theme: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    descriptionColor?: string;
    borderRadius: number;
    fontFamily: string;
    logoUrl?: string;
    backgroundImageUrl?: string; // For photo background upload
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
    mode?: "standalone" | "embed";
    layout?: "simple" | "compact" | "conversational" | "hero";
    leftSectionHeadline?: string; // Optional headline for left branding section
    leftSectionDescription?: string; // Description text for left branding section
    leftSectionLink?: string; // Optional link/CTA for left section
    timezone?: string; // IANA timezone, e.g. "America/New_York"
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
