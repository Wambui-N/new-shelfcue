import type { GoogleAPIClient } from "./google";
import { getSupabaseAdmin } from "./supabase/admin";

interface CalendarEvent {
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: Array<{ email: string }>;
}

export class GoogleCalendarService {
  private client: GoogleAPIClient;

  constructor(client: GoogleAPIClient) {
    this.client = client;
  }

  /**
   * Get list of user's calendars
   */
  async getUserCalendars() {
    try {
      const calendar = this.client.getCalendar();

      const response = await calendar.calendarList.list({
        maxResults: 50,
        showHidden: false,
      });

      return response.data.items || [];
    } catch (error) {
      console.error("Error fetching calendars:", error);
      throw error;
    }
  }

  /**
   * Create a calendar event
   */
  async createCalendarEvent(calendarId: string, event: CalendarEvent) {
    try {
      const calendar = this.client.getCalendar();

      const response = await calendar.events.insert({
        calendarId,
        requestBody: event,
      });

      return response.data;
    } catch (error) {
      console.error("Error creating calendar event:", error);
      throw error;
    }
  }

  /**
   * Create calendar event from form submission
   */
  async createCalendarEventFromSubmission(
    formId: string,
    submissionData: Record<string, unknown>,
    calendarId: string,
  ) {
    try {
      // Get form calendar settings
      const supabase = getSupabaseAdmin();
      const { data: form, error } = await supabase
        .from("forms")
        .select("calendar_settings")
        .eq("id", formId)
        .single();

      if (error || !form) {
        throw new Error("Form not found or no calendar settings");
      }

      const calendarSettings = form.calendar_settings || {};

      // Extract date/time from submission based on field mappings
      const startDateField = calendarSettings.startDateField;
      const startTimeField = calendarSettings.startTimeField;
      const endDateField = calendarSettings.endDateField;
      const endTimeField = calendarSettings.endTimeField;
      const titleTemplate = calendarSettings.titleTemplate || "New Event";
      const descriptionTemplate = calendarSettings.descriptionTemplate || "";

      // Parse start date/time
      const startDate =
        submissionData[startDateField] ||
        new Date().toISOString().split("T")[0];
      const startTime = submissionData[startTimeField] || "09:00";
      const startDateTime = `${startDate}T${startTime}:00`;

      // Parse end date/time (default to 1 hour after start)
      let endDateTime: string;
      if (endDateField && endTimeField) {
        const endDate = submissionData[endDateField] || startDate;
        const endTime = submissionData[endTimeField] || "10:00";
        endDateTime = `${endDate}T${endTime}:00`;
      } else {
        const endDate = new Date(startDateTime);
        endDate.setHours(endDate.getHours() + 1);
        endDateTime = endDate.toISOString();
      }

      // Replace template variables with submission data
      const replaceTemplate = (template: string) => {
        let result = template;
        Object.entries(submissionData).forEach(([key, value]) => {
          result = result.replace(new RegExp(`{{${key}}}`, "g"), String(value));
        });
        return result;
      };

      const eventTitle = replaceTemplate(titleTemplate);
      const eventDescription = replaceTemplate(descriptionTemplate);

      // Get attendee emails
      const attendeeField = calendarSettings.attendeeField;
      const attendees =
        attendeeField && submissionData[attendeeField]
          ? [{ email: submissionData[attendeeField] }]
          : [];

      // Create the event
      const event: CalendarEvent = {
        summary: eventTitle,
        description: eventDescription,
        start: {
          dateTime: startDateTime,
          timeZone: calendarSettings.timeZone || "UTC",
        },
        end: {
          dateTime: endDateTime,
          timeZone: calendarSettings.timeZone || "UTC",
        },
        attendees,
      };

      return await this.createCalendarEvent(calendarId, event);
    } catch (error) {
      console.error("Error creating calendar event from submission:", error);
      throw error;
    }
  }
}

/**
 * Helper function to create calendar event from submission with meeting field
 */
export async function createCalendarEventFromSubmission(
  userId: string,
  formId: string,
  submissionData: Record<string, unknown>,
) {
  try {
    console.log("📅 [Calendar] Starting calendar event creation...");
    console.log("📅 [Calendar] User ID:", userId);
    console.log("📅 [Calendar] Form ID:", formId);

    // Get Google client
    const { getGoogleClient } = await import("./google");
    const googleClient = await getGoogleClient(userId);

    if (!googleClient) {
      console.error(
        "❌ [Calendar] Google client not available for user:",
        userId,
      );
      throw new Error("Google client not available");
    }

    console.log("✓ [Calendar] Google client obtained");

    // Get form's default calendar ID and fields using admin client
    const supabase = getSupabaseAdmin();
    const { data: form } = await supabase
      .from("forms")
      .select("default_calendar_id, fields, title, meeting_settings")
      .eq("id", formId)
      .single();

    console.log("📅 [Calendar] Form data:", {
      hasForm: !!form,
      calendarId: form?.default_calendar_id,
      title: form?.title,
      fieldsCount: (form?.fields as FormField[])?.length,
    });

    if (!form || !form.default_calendar_id) {
      console.log("⚠️ [Calendar] No calendar configured for this form");
      return null;
    }

    // Find meeting field in submission
    const meetingField = (form.fields as FormField[])?.find(
      (f) => f.type === "meeting",
    );

    console.log("📅 [Calendar] Meeting field:", meetingField);

    if (!meetingField) {
      console.log("⚠️ [Calendar] No meeting field found in form");
      return null;
    }

    const meetingDateTime = submissionData[meetingField.id];

    console.log("📅 [Calendar] Meeting time from submission:", {
      fieldId: meetingField.id,
      value: meetingDateTime,
    });

    if (!meetingDateTime) {
      console.log("⚠️ [Calendar] No meeting time selected in submission");
      return null;
    }

    // Get meeting duration from field settings or form settings (default 60 minutes)
    const duration =
      meetingField.meetingSettings?.duration ||
      (form.meeting_settings as { duration?: number })?.duration ||
      60;

    // Calculate end time
    const startDate = new Date(meetingDateTime as string);
    const endDate = new Date(startDate.getTime() + duration * 60000);

    // Get attendee email from submission (look for email fields)
    const emailField = (form.fields as FormField[])?.find(
      (f) => f.type === "email" || f.type === "email_field",
    );
    const attendeeEmail = emailField ? submissionData[emailField.id] : null;

    // Create event title from form title and attendee info
    const attendeeName = attendeeEmail ? ` with ${attendeeEmail}` : "";
    const eventTitle = `${form.title}${attendeeName}`;

    // Create the event
    const calendar = googleClient.getCalendar();
    const event: CalendarEvent = {
      summary: eventTitle,
      description: `Form submission for: ${form.title}`,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      attendees: attendeeEmail ? [{ email: attendeeEmail }] : [],
    };

    console.log("📅 [Calendar] Creating event:", {
      calendarId: form.default_calendar_id,
      summary: event.summary,
      start: event.start.dateTime,
      end: event.end.dateTime,
      attendees: event.attendees,
    });

    const response = await calendar.events.insert({
      calendarId: form.default_calendar_id,
      requestBody: event,
    });

    console.log("✓ [Calendar] Event created successfully:", {
      eventId: response.data.id,
      htmlLink: response.data.htmlLink,
    });

    return response.data;
  } catch (error) {
    console.error(
      "❌ [Calendar] Error in createCalendarEventFromSubmission:",
      error,
    );
    console.error(
      "❌ [Calendar] Error details:",
      error instanceof Error ? error.message : error,
    );
    if (error instanceof Error && "response" in error) {
      console.error(
        "❌ [Calendar] API Response:",
        (error as { response?: { data?: unknown } }).response?.data,
      );
    }
    throw error;
  }
}
