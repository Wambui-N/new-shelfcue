import { type NextRequest, NextResponse } from "next/server";
import { getGoogleClient } from "@/lib/google";
import { createCalendarEventFromSubmission } from "@/lib/googleCalendar";
import { GoogleSheetsService } from "@/lib/googleSheets";
import { EmailService } from "@/lib/resend";
import { canPerformAction, incrementUsage } from "@/lib/subscriptionLimits";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

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

    // Verify the form exists and is published
    const { data: form, error: formError } = await supabaseAdmin
      .from("forms")
      .select(`
        id, 
        title,
        status, 
        user_id, 
        fields,
        default_sheet_connection_id,
        default_calendar_id,
        sheet_connections (
          sheet_id,
          sheet_url
        )
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

    // Check submission limit for form owner
    console.log("Checking submission limit for user:", form.user_id);
    const limitCheck = await canPerformAction(
      form.user_id,
      "submissions_per_month",
    );
    console.log("Limit check result:", limitCheck);

    if (!limitCheck.allowed) {
      console.error("Submission limit reached:", {
        userId: form.user_id,
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

    // Get client IP and user agent
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Save the submission
    const { data: submission, error: submissionError } = await supabaseAdmin
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
    let calendarEventLink: string | null = null;

    // 1. Create Calendar Event if applicable
    try {
      console.log("📅 Checking calendar configuration...");
      if (form.default_calendar_id && form.user_id) {
        console.log("📅 Creating calendar event...");
        const calendarEvent = await createCalendarEventFromSubmission(
          form.user_id,
          formId,
          data,
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
      if (form.sheet_connections && form.user_id) {
        // @ts-ignore
        const sheetConnection = Array.isArray(form.sheet_connections)
          ? (form.sheet_connections as any)[0]
          : (form.sheet_connections as any);

        if (sheetConnection?.sheet_id) {
          const googleClient = await getGoogleClient(form.user_id);
          if (googleClient) {
            const sheetsService = new GoogleSheetsService(googleClient);

            const rowData = form.fields.map((field) => {
              const value = data[field.id];
              // Handle different field types
              if (field.type === "checkbox") return value ? "Yes" : "No";
              if (field.type === "meeting" && value) {
                try {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
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

            await sheetsService.append(sheetConnection.sheet_id, rowData);
            console.log("✓ Synced to Google Sheets");
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
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("email, full_name")
          .eq("id", form.user_id)
          .single();

        if (profile?.email) {
          await EmailService.sendFormSubmissionNotification(
            profile.email,
            {
              formName: form.title || "Untitled Form",
              formId: formId,
              submissionId: submission.id,
              submittedAt: submission.created_at,
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
    await incrementUsage(form.user_id, "submissions", 1);

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
    });
  } catch (error) {
    console.error("Error in submit API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
