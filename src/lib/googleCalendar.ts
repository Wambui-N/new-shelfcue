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
   * Check calendar availability and return free time slots
   */
  async checkAvailability(
    calendarId: string,
    startDate: Date,
    endDate: Date,
    duration: number = 60,
    bufferTime: number = 0,
    startHour: number = 9,
    endHour: number = 17,
    timeZone?: string,
  ): Promise<string[]> {
    try {
      const calendar = this.client.getCalendar();

      console.log("📅 Querying FreeBusy API:", {
        calendarId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        duration,
        bufferTime,
        startHour,
        endHour,
      });

      // Query FreeBusy API for existing events
      const freebusyResponse = await calendar.freebusy.query({
        requestBody: {
          timeMin: startDate.toISOString(),
          timeMax: endDate.toISOString(),
          items: [{ id: calendarId }],
        },
      });

      const busyPeriods =
        freebusyResponse.data.calendars?.[calendarId]?.busy || [];

      console.log("📅 Found busy periods:", busyPeriods.length);

      // Generate candidate time slots
      const candidateSlots = this.generateCandidateSlots(
        startDate,
        endDate,
        duration,
        bufferTime,
        startHour,
        endHour,
        timeZone,
      );

      console.log("📅 Generated candidate slots:", candidateSlots.length);

      // Filter slots that don't conflict with busy periods
      const availableSlots = candidateSlots.filter((slotStart) => {
        const slotStartTime = new Date(slotStart);
        const slotEndTime = new Date(slotStartTime.getTime() + duration * 60000);

        // Check if slot overlaps with any busy period
        for (const busy of busyPeriods) {
          const busyStart = new Date(busy.start || "");
          const busyEnd = new Date(busy.end || "");

          // Apply buffer time: check if slot would conflict with busy period + buffer
          const busyStartWithBuffer = new Date(
            busyStart.getTime() - bufferTime * 60000,
          );
          const busyEndWithBuffer = new Date(
            busyEnd.getTime() + bufferTime * 60000,
          );

          // Check for overlap
          if (
            slotStartTime < busyEndWithBuffer &&
            slotEndTime > busyStartWithBuffer
          ) {
            return false; // Slot conflicts with busy period
          }
        }

        return true; // Slot is available
      });

      console.log("📅 Available slots after filtering:", availableSlots.length);

      return availableSlots;
    } catch (error) {
      console.error("❌ Error checking calendar availability:", error);
      throw error;
    }
  }

  /**
   * Generate candidate time slots for a given date range
   * Uses timezone-aware date manipulation to ensure hours are in the correct timezone
   */
  private generateCandidateSlots(
    startDate: Date,
    endDate: Date,
    duration: number,
    bufferTime: number,
    startHour: number,
    endHour: number,
    timeZone?: string,
  ): string[] {
    const slots: string[] = [];
    const currentDate = new Date(startDate);
    const now = new Date();
    
    // Use provided timezone or fallback to UTC
    const tz = timeZone || "UTC";

    // Helper function to create a UTC date that represents a specific hour in the target timezone
    const createDateInTimezone = (year: number, month: number, day: number, hour: number, minute: number): Date => {
      // Start with midnight UTC for this date
      const baseDate = new Date(Date.UTC(year, month, day, 0, 0, 0));
      
      // Find the UTC hour that, when displayed in target timezone, shows the desired hour
      // We'll search through UTC hours to find the right one
      for (let utcHour = 0; utcHour < 24; utcHour++) {
        const testDate = new Date(Date.UTC(year, month, day, utcHour, minute, 0));
        const hourInTz = parseInt(new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          hour: '2-digit',
          hour12: false,
        }).format(testDate));
        
        if (hourInTz === hour) {
          // Also verify the date components match (handle day rollover)
          const dateParts = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }).formatToParts(testDate);
          
          const tzYear = parseInt(dateParts.find(p => p.type === 'year')!.value);
          const tzMonth = parseInt(dateParts.find(p => p.type === 'month')!.value) - 1;
          const tzDay = parseInt(dateParts.find(p => p.type === 'day')!.value);
          
          if (tzYear === year && tzMonth === month && tzDay === day) {
            return testDate;
          }
        }
      }
      
      // Fallback: try with day adjustments for edge cases
      for (let dayOffset = -1; dayOffset <= 1; dayOffset++) {
        const adjustedDate = new Date(Date.UTC(year, month, day + dayOffset, 12, 0, 0));
        const dateParts = new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          hour12: false,
        }).formatToParts(adjustedDate);
        
        const tzYear = parseInt(dateParts.find(p => p.type === 'year')!.value);
        const tzMonth = parseInt(dateParts.find(p => p.type === 'month')!.value) - 1;
        const tzDay = parseInt(dateParts.find(p => p.type === 'day')!.value);
        const tzHour = parseInt(dateParts.find(p => p.type === 'hour')!.value);
        
        if (tzYear === year && tzMonth === month && tzDay === day && tzHour === hour) {
          // Calculate the correct UTC time
          const offset = adjustedDate.getTime() - new Date(Date.UTC(tzYear, tzMonth, tzDay, hour, minute, 0)).getTime();
          return new Date(adjustedDate.getTime() - offset);
        }
      }
      
      // Final fallback: use local timezone (shouldn't happen)
      return new Date(year, month, day, hour, minute);
    };

    // Iterate through each day in the range
    while (currentDate <= endDate) {
      // Skip weekends
      if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // Get date components in target timezone
      const dateInTz = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).formatToParts(currentDate);
      
      const year = parseInt(dateInTz.find(p => p.type === 'year')!.value);
      const month = parseInt(dateInTz.find(p => p.type === 'month')!.value) - 1;
      const day = parseInt(dateInTz.find(p => p.type === 'day')!.value);

      // Create start of day in target timezone
      const dayStart = createDateInTimezone(year, month, day, startHour, 0);

      // If it's today, start from next available slot
      let slotTime = new Date(dayStart);
      
      // Check if this is today in the target timezone
      const todayInTz = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(now);
      const slotDayStr = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(dayStart);
      
      if (todayInTz === slotDayStr) {
        // Get current time in target timezone
        const nowInTz = new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(now);
        const [nowHour, nowMinute] = nowInTz.split(':').map(Number);
        
        // Calculate next slot
        const nextMinute = Math.ceil(nowMinute / duration) * duration;
        let nextHour = nowHour;
        let finalMinute = nextMinute;
        if (nextMinute >= 60) {
          nextHour = nowHour + 1;
          finalMinute = 0;
        }
        
        if (nextHour >= startHour && nextHour < endHour) {
          slotTime = createDateInTimezone(year, month, day, nextHour, finalMinute);
        } else {
          // Move to next day if no slots available today
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }
      }

      // Generate slots for this day
      let currentSlotTime = new Date(slotTime);
      while (true) {
        // Get hour in target timezone
        const slotHourInTz = parseInt(new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          hour: '2-digit',
          hour12: false,
        }).format(currentSlotTime));
        
        if (slotHourInTz >= endHour) break;
        
        // Make sure the entire meeting fits within working hours
        const slotEnd = new Date(currentSlotTime.getTime() + duration * 60000);
        const slotEndHourInTz = parseInt(new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          hour: '2-digit',
          hour12: false,
        }).format(slotEnd));
        
        if (slotEndHourInTz <= endHour) {
          slots.push(currentSlotTime.toISOString());
        }
        
        // Move to next slot (duration + bufferTime minutes ahead)
        currentSlotTime = new Date(
          currentSlotTime.getTime() + (duration + bufferTime) * 60000,
        );
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return slots;
  }

  /**
   * Create calendar event from form submission
   */
  async createCalendarEventFromSubmission(
    formId: string,
    submissionData: Record<string, any>,
    calendarId: string,
  ) {
    try {
      // Get form calendar settings
      const supabase = getSupabaseAdmin();
      const { data: form, error } = await (supabase as any)
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

// Helper to consistently resolve meeting duration (in minutes)
function getMeetingDuration(
  meetingField: any | undefined,
  form: any | undefined,
  fallback: number = 60,
): number {
  const fieldDuration = meetingField?.meetingSettings?.duration;
  const formDuration = form?.meeting_settings?.duration;

  if (typeof fieldDuration === "number" && fieldDuration > 0) {
    return fieldDuration;
  }
  if (typeof formDuration === "number" && formDuration > 0) {
    return formDuration;
  }
  return fallback;
}

/**
 * Helper function to create calendar event from submission with meeting field
 */
export async function createCalendarEventFromSubmission(
  userId: string,
  formId: string,
  submissionData: Record<string, any>,
  timeZone?: string,
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
    const { data: form } = await (supabase as any)
      .from("forms")
      .select("default_calendar_id, fields, title, meeting_settings")
      .eq("id", formId)
      .single();

    console.log("📅 [Calendar] Form data:", {
      hasForm: !!form,
      calendarId: form?.default_calendar_id,
      title: form?.title,
      fieldsCount: (form?.fields as any[])?.length,
    });

    if (!form || !form.default_calendar_id) {
      console.log("⚠️ [Calendar] No calendar configured for this form");
      return null;
    }

    // Find meeting field in submission
    const meetingField = (form.fields as any[])?.find(
      (f: any) => f.type === "meeting",
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

    // Get meeting duration/buffer from field settings or form settings
    const duration = getMeetingDuration(meetingField, form, 60);

    const bufferTime =
      (meetingField.meetingSettings as any)?.bufferTime ??
      (form.meeting_settings as any)?.bufferTime ??
      0;

    console.log("📅 [Calendar] Duration & buffer calculation:", {
      fieldDuration: meetingField.meetingSettings?.duration,
      formSettingsDuration: (form.meeting_settings as any)?.duration,
      finalDuration: duration,
      meetingFieldSettings: meetingField.meetingSettings,
      bufferFromField: meetingField.meetingSettings?.bufferTime,
      bufferFromFormSettings: (form.meeting_settings as any)?.bufferTime,
      finalBufferTime: bufferTime,
    });

    // Calculate end time
    const startDate = new Date(meetingDateTime);
    const endDate = new Date(startDate.getTime() + duration * 60000);

    console.log("📅 [Calendar] Event times:", {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      durationMinutes: duration,
    });

    // Get attendee email from submission (look for email fields)
    const emailField = (form.fields as any[])?.find(
      (f: any) => f.type === "email" || f.type === "email_field",
    );
    const attendeeEmail = emailField ? submissionData[emailField.id] : null;

    // Create event title from form title and attendee info
    const attendeeName = attendeeEmail ? ` with ${attendeeEmail}` : "";
    const eventTitle = `${form.title}${attendeeName}`;

    // Use provided timezone or fallback to system timezone
    const eventTimeZone =
      timeZone ||
      process.env.FORM_SUBMISSION_TIMEZONE ||
      process.env.TZ ||
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      "UTC";

    const calendar = googleClient.getCalendar();

    // Before creating the event, ensure the selected slot is still available
    // by checking for any conflicting events (including buffer) via FreeBusy.
    if (duration > 0) {
      const checkStart = new Date(
        startDate.getTime() - bufferTime * 60000,
      ).toISOString();
      const checkEnd = new Date(
        endDate.getTime() + bufferTime * 60000,
      ).toISOString();

      console.log("📅 [Calendar] Verifying slot availability before booking:", {
        calendarId: form.default_calendar_id,
        checkStart,
        checkEnd,
        durationMinutes: duration,
        bufferMinutes: bufferTime,
      });

      const freebusyResponse = await calendar.freebusy.query({
        requestBody: {
          timeMin: checkStart,
          timeMax: checkEnd,
          items: [{ id: form.default_calendar_id }],
        },
      });

      const busy =
        freebusyResponse.data.calendars?.[form.default_calendar_id]?.busy || [];

      if (busy.length > 0) {
        console.warn(
          "⚠️ [Calendar] Selected time slot is no longer available",
          { busy },
        );
        const error: any = new Error(
          "Selected time slot is no longer available. Please pick another time.",
        );
        error.code = "TIME_SLOT_UNAVAILABLE";
        throw error;
      }
    }

    // Create the event
    const event: CalendarEvent = {
      summary: eventTitle,
      description: `Form submission for: ${form.title}`,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: eventTimeZone,
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: eventTimeZone,
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

    let response: any;
    let eventCreated = false;

    try {
      console.log(
        "📅 [Calendar] Attempting to create event in calendar:",
        form.default_calendar_id,
      );
      response = await calendar.events.insert({
        calendarId: form.default_calendar_id,
        requestBody: event,
      });
      eventCreated = true;
      console.log("✅ [Calendar] Event created successfully in calendar:", form.default_calendar_id);
    } catch (error: any) {
      const status = error?.response?.status;
      const errorCode = error?.response?.data?.error?.code;
      const isPermissionOrNotFound = status === 403 || status === 404;
      const currentCalendarId = form.default_calendar_id;

      console.error("❌ [Calendar] Event insert failed:", {
        status,
        errorCode,
        calendarId: currentCalendarId,
        message: error?.message,
        data: error?.response?.data,
        eventCreated,
      });

      // Only fallback to primary if:
      // 1. The first insert actually failed (not if it succeeded but threw a different error)
      // 2. It's a permission/not found error (403/404)
      // 3. The selected calendar is not already "primary"
      // 4. We haven't already created an event
      if (!eventCreated && isPermissionOrNotFound && currentCalendarId !== "primary") {
        console.warn(
          "⚠️ [Calendar] Retrying event insert using primary calendar (fallback)...",
        );

        try {
          response = await calendar.events.insert({
            calendarId: "primary",
            requestBody: event,
          });
          console.log("✅ [Calendar] Event created in primary calendar as fallback");
        } catch (fallbackError: any) {
          console.error("❌ [Calendar] Fallback to primary also failed:", fallbackError);
          throw fallbackError; // Re-throw if fallback also fails
        }

        // Best-effort: update form to use primary calendar going forward.
        try {
          await (supabase as any)
            .from("forms")
            .update({ default_calendar_id: "primary" })
            .eq("id", formId);
        } catch (updateError) {
          console.warn(
            "⚠️ [Calendar] Failed to update form default_calendar_id:",
            updateError,
          );
        }
      } else {
        // If event was created but there's still an error, log it but don't create duplicate
        if (eventCreated) {
          console.warn(
            "⚠️ [Calendar] Event was created but an error occurred afterward. Not creating duplicate.",
          );
        }
        // Re-throw the error if we're not handling it
        throw error;
      }
    }

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
        (error as any).response?.data,
      );
    }
    throw error;
  }
}
