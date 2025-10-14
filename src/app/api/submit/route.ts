import { type NextRequest, NextResponse } from "next/server";
import { getGoogleClient } from "@/lib/google";
import { createCalendarEventFromSubmission } from "@/lib/googleCalendar";
import { GoogleSheetsService } from "@/lib/googleSheets";
import { getSupabaseAdmin } from "@/lib/supabase";

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
    const { data: form, error: formError } = await (supabaseAdmin as any)
      .from("forms")
      .select(`
        id, 
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

    // Get client IP and user agent
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Save the submission
    const { data: submission, error: submissionError } = await (
      supabaseAdmin as any
    )
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

    // Background tasks (don't block response)
    Promise.all([
      // Sync to Google Sheets
      (async () => {
        try {
          if ((form as any).sheet_connections && (form as any).user_id) {
            const sheetConnection = Array.isArray(
              (form as any).sheet_connections,
            )
              ? (form as any).sheet_connections[0]
              : (form as any).sheet_connections;

            if (sheetConnection?.sheet_id) {
              const googleClient = await getGoogleClient((form as any).user_id);
              if (googleClient) {
                const sheetsService = new GoogleSheetsService(googleClient);

                // Convert submission data to array based on form fields order
                // Leave blank fields truly empty in the sheet
                const rowData = (form as any).fields.map((field: any) => {
                  const value = data[field.id];

                  // Handle different field types
                  if (field.type === "checkbox") {
                    return value ? "Yes" : "No";
                  }

                  if (field.type === "meeting" && value) {
                    // Format meeting datetime to DD/MM/YYYY HH:MM
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

                  // For other fields, return the value or leave blank
                  return value || "";
                });

                await sheetsService.append(sheetConnection.sheet_id, rowData);
                console.log("✓ Synced to Google Sheets");
              }
            }
          }
        } catch (error) {
          console.error("Error syncing to Google Sheets:", error);
          // Don't fail the submission if Sheets sync fails
        }
      })(),

      // Create Calendar Event
      (async () => {
        try {
          if ((form as any).default_calendar_id && (form as any).user_id) {
            await createCalendarEventFromSubmission(
              (form as any).user_id,
              formId,
              data,
            );
            console.log("✓ Created calendar event");
          }
        } catch (error) {
          console.error("Error creating calendar event:", error);
          // Don't fail the submission if calendar creation fails
        }
      })(),
    ]).catch((error) => {
      console.error("Error in background tasks:", error);
    });

    return NextResponse.json({
      success: true,
      submissionId: (submission as any).id,
    });
  } catch (error) {
    console.error("Error in submit API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
