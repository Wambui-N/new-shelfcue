import { type NextRequest, NextResponse } from "next/server";
import { getGoogleClient } from "@/lib/google";
import { createCalendarEventFromSubmission } from "@/lib/googleCalendar";
import { GoogleSheetsService } from "@/lib/googleSheets";
import { EmailService } from "@/lib/resend";
import { canPerformAction, incrementUsage } from "@/lib/subscriptionLimits";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type FormFieldDefinition = { id: string; type?: string | null };

type SheetConnectionRecord = {
  sheet_id: string | null;
};

type FormRecord = {
  id: string;
  title: string;
  status: string;
  user_id: string;
  fields: FormFieldDefinition[];
  settings?: Record<string, unknown> | null;
  default_sheet_connection_id?: string | null;
  default_calendar_id?: string | null;
};

type SubmissionRecord = {
  id: string;
  created_at: string;
};

export async function POST(request: NextRequest) {
  try {
    const { formId, data } = await request.json();

    if (!formId || !data) {
      return NextResponse.json(
        { error: "Form ID and data are required" },
        { status: 400 },
      );
    }

    // Use admin client to bypass RLS for public form access
    const supabaseAdmin = getSupabaseAdmin();
    const supabaseAdminClient = supabaseAdmin as any;

    // Verify the form exists and is published
    const { data: form, error: formError } = await supabaseAdminClient
      .from("forms")
      .select(`
        id, 
        title,
        status, 
        user_id, 
        fields,
        settings,
        default_sheet_connection_id,
        default_calendar_id
      `)
      .eq("id", formId)
      .eq("status", "published")
      .single();

    if (formError || !form) {
      return NextResponse.json(
        { error: "Form not found or not published" },
        { status: 404 },
      );
    }

    const formRecord = form as FormRecord;

    // Check submission limit for form owner
    console.log("Checking submission limit for user:", formRecord.user_id);
    const limitCheck = await canPerformAction(
      formRecord.user_id,
      "submissions_per_month",
    );
    console.log("Limit check result:", limitCheck);

    if (!limitCheck.allowed) {
      console.error("Submission limit reached:", {
        userId: formRecord.user_id,
        limit: limitCheck.limit,
        usage: limitCheck.usage,
      });
      return NextResponse.json(
        {
          error: "Submission limit reached",
          message:
            "This form has reached its submission limit for this month. Please contact the form owner.",
        },
        { status: 429 },
      );
    }

    const formSettings = formRecord.settings ?? {};
    const formTimeZone =
      (typeof formSettings?.timezone === "string" &&
      formSettings.timezone.trim().length > 0
        ? formSettings.timezone.trim()
        : null) ||
      (typeof formSettings?.time_zone === "string" &&
      formSettings.time_zone.trim().length > 0
        ? formSettings.time_zone.trim()
        : null) ||
      process.env.FORM_SUBMISSION_TIMEZONE ||
      process.env.TZ ||
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      "UTC";

    // Get client IP and user agent
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Save the submission
    const { data: submission, error: submissionError } =
      await supabaseAdminClient
        .from("submissions")
        .insert({
          form_id: formId,
          data: data,
          ip_address: ipAddress,
          user_agent: userAgent,
        })
        .select()
        .single();

    if (submissionError) {
      console.error("Error saving submission:", submissionError);
      return NextResponse.json(
        { error: "Failed to save submission" },
        { status: 500 },
      );
    }

    // Sequentially handle Google integrations
    const submissionRecord = submission as SubmissionRecord;

    let calendarEventLink: string | null = null;

    // 1. Create Calendar Event if applicable
    try {
      console.log("📅 Checking calendar configuration...");
      if (formRecord.default_calendar_id && formRecord.user_id) {
        console.log("📅 Creating calendar event...");
        const calendarEvent = await createCalendarEventFromSubmission(
          formRecord.user_id,
          formId,
          data,
          formTimeZone,
        );
        if (calendarEvent?.htmlLink) {
          calendarEventLink = calendarEvent.htmlLink;
          console.log("✓ Created calendar event:", calendarEvent.id);
        }
      } else {
        console.log("⚠️ Calendar not configured for this form.");
      }
    } catch (error) {
      console.error("❌ Error creating calendar event:", error);
      // Don't fail the submission if calendar creation fails
    }

    // 2. Sync to Google Sheets
    try {
      // Get sheet connection - try from join first, then fallback to direct query
      let sheetConnection: { sheet_id: string | null } | null = null;

      // Primary: read from form settings (works even if PostgREST schema cache breaks sheet_connections)
      const settingsSheet = (formSettings as any)?.google?.sheet ?? null;
      const settingsSpreadsheetId =
        typeof settingsSheet?.spreadsheetId === "string"
          ? settingsSheet.spreadsheetId
          : typeof settingsSheet?.sheet_id === "string"
            ? settingsSheet.sheet_id
            : null;

      if (settingsSpreadsheetId) {
        sheetConnection = { sheet_id: settingsSpreadsheetId };
      }

      // Fallback: Query directly using default_sheet_connection_id
      if (
        !sheetConnection?.sheet_id &&
        formRecord.default_sheet_connection_id
      ) {
        const { data: connectionData, error: connectionError } =
          await supabaseAdminClient
            .from("sheet_connections")
            .select("sheet_id")
            .eq("id", formRecord.default_sheet_connection_id)
            .single();

        if (!connectionError && connectionData?.sheet_id) {
          sheetConnection = { sheet_id: connectionData.sheet_id };
        }
      }

      if (sheetConnection?.sheet_id && formRecord.user_id) {
        const googleClient = await getGoogleClient(formRecord.user_id);
        if (googleClient) {
          const sheetsService = new GoogleSheetsService(googleClient);

          // Create formatters for date/time fields with user's timezone
          const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
            timeZone: formTimeZone,
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          const dateFormatter = new Intl.DateTimeFormat("en-GB", {
            timeZone: formTimeZone,
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });

          const rowData = formRecord.fields.map((field) => {
            const value = data[field.id as keyof typeof data];

            // Handle different field types
            if (field.type === "checkbox") return value ? "Yes" : "No";

            // Format date/time fields with timezone
            if (field.type === "meeting" && value) {
              try {
                const date = new Date(value);
                return dateTimeFormatter.format(date);
              } catch {
                return value;
              }
            }

            // Format date fields with timezone
            if (field.type === "date" && value) {
              try {
                const date = new Date(value);
                // If it's a date-only field, format without time
                return dateFormatter.format(date);
              } catch {
                return value;
              }
            }

            return value || "";
          });

          // Add the calendar link if it was created
          if (calendarEventLink) {
            rowData.push(calendarEventLink);
          }

          const tryAppend = async (spreadsheetId: string) => {
            await sheetsService.append(spreadsheetId, rowData, {
              timeZone: formTimeZone,
            });
          };

          try {
            await tryAppend(sheetConnection.sheet_id);
            console.log("✓ Synced to Google Sheets");
          } catch (appendError: any) {
            const status = appendError?.response?.status;
            const dataMsg =
              typeof appendError?.response?.data === "object"
                ? JSON.stringify(appendError.response.data)
                : String(appendError?.response?.data ?? "");

            console.error("❌ Sheets append failed:", {
              status,
              message: appendError?.message,
              data: dataMsg,
            });

            // Self-heal: if the stored sheet id is invalid (e.g. sheet was deleted),
            // create a new sheet and update form.settings.google.sheet, then retry once.
            if (status === 404 || status === 410) {
              console.warn(
                "⚠️ Stored spreadsheet not found. Creating a new one and retrying append...",
              );

              const fieldsAny = Array.isArray(formRecord.fields)
                ? (formRecord.fields as any[])
                : [];
              const headers = fieldsAny.map((f) =>
                typeof f?.label === "string" && f.label.trim().length > 0
                  ? f.label
                  : typeof f?.id === "string"
                    ? f.id
                    : "Field",
              );
              const hasMeetingField = fieldsAny.some((f) => f?.type === "meeting");
              if (hasMeetingField) headers.push("Meeting Link");

              const created = await sheetsService.createSheet(
                `${formRecord.title || "Form"} - Responses`,
                headers,
              );

              const nextSettings = {
                ...(formSettings ?? {}),
                google: {
                  ...((formSettings as any)?.google ?? {}),
                  sheet: {
                    spreadsheetId: created.spreadsheetId,
                    spreadsheetUrl: created.spreadsheetUrl,
                    sheetName: `${formRecord.title || "Form"} - Responses`,
                    updatedAt: new Date().toISOString(),
                  },
                },
              };

              await supabaseAdminClient
                .from("forms")
                .update({ settings: nextSettings })
                .eq("id", formId);

              await tryAppend(created.spreadsheetId);
              console.log("✓ Synced to Google Sheets (after repairing sheet link)");
            }
          }
        }
      }
    } catch (error) {
      console.error("Error syncing to Google Sheets:", error);
      // Don't fail the submission if Sheets sync fails
    }

    // Background tasks (don't block response) - Now only for email
    (async () => {
      // Send email notification to form owner
      try {
        const { data: profile } = await supabaseAdminClient
          .from("profiles")
          .select("email, full_name")
          .eq("id", formRecord.user_id)
          .single();

        const profileRecord = profile as {
          email?: string | null;
          full_name?: string | null;
        };

        if (profileRecord?.email) {
          await EmailService.sendFormSubmissionNotification(
            profileRecord.email,
            {
              formName: formRecord.title || "Untitled Form",
              formId: formId,
              submissionId: submissionRecord.id,
              submittedAt: submissionRecord.created_at,
              submitterData: data,
            },
          );
          console.log("✓ Sent email notification to form owner");
        }
      } catch (error) {
        console.error("Error sending email notification:", error);
      }
    })().catch((error) => {
      console.error("Error in background email task:", error);
    });

    // Increment submission usage counter
    await incrementUsage(formRecord.user_id, "submissions", 1);

    return NextResponse.json({
      success: true,
      submissionId: submissionRecord.id,
    });
  } catch (error) {
    console.error("Error in submit API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
