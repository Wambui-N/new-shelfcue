import { type NextRequest, NextResponse } from "next/server";
import { getGoogleClient } from "@/lib/google";
import { GoogleSheetsService } from "@/lib/googleSheets";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const { formId, userId } = await request.json();

    if (!formId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get admin client (server-side only)
    const supabaseAdmin = getSupabaseAdmin();

    console.log("Publishing form:", { formId, userId });
    console.log("Using Supabase Admin Client:", !!supabaseAdmin);

    // Get form data with retry logic for database consistency
    let form = null;
    let formError = null;
    let retries = 5; // Try 5 times

    while (retries > 0 && !form) {
      const result = await (supabaseAdmin as any)
        .from("forms")
        .select("*")
        .eq("id", formId)
        .eq("user_id", userId)
        .maybeSingle();

      form = result.data;
      formError = result.error;

      if (form) {
        console.log("✓ Form found in database");
        break;
      }

      if (formError && formError.code !== "PGRST116") {
        // If it's not a "not found" error, break immediately
        break;
      }

      // Wait before retry
      retries--;
      if (retries > 0) {
        console.log(
          `Form not found yet, retrying... (${retries} attempts left)`,
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (formError) {
      console.error("Database error finding form:", {
        formId,
        userId,
        error: formError,
        code: formError.code,
        message: formError.message,
        details: formError.details,
      });

      // Check if it's a "no rows" error which means form doesn't exist
      if (formError.code === "PGRST116") {
        return NextResponse.json(
          {
            error: "Form not found",
            details:
              "The form could not be found after multiple attempts. Please try saving the form again.",
            code: "FORM_NOT_FOUND_AFTER_RETRIES",
          },
          { status: 404 },
        );
      }

      return NextResponse.json(
        {
          error: "Database error finding form",
          details: formError.message,
        },
        { status: 500 },
      );
    }

    if (!form) {
      console.error("Form not found:", { formId, userId });
      return NextResponse.json(
        {
          error: "Form not found",
          details: `Form ${formId} not found for user ${userId}`,
        },
        { status: 404 },
      );
    }

    console.log("✓ Form found:", (form as any).title);

    // Get Google client - REQUIRED for publishing
    let googleClient;
    try {
      googleClient = await getGoogleClient(userId);
    } catch (error) {
      console.log("❌ Google not connected");
      return NextResponse.json(
        {
          error: "Google Sheets connection required",
          code: "GOOGLE_NOT_CONNECTED",
          details:
            "Please connect your Google account to publish forms. This allows automatic syncing of form submissions to Google Sheets.",
          action: "connect_google",
        },
        { status: 403 },
      );
    }

    if (!googleClient) {
      return NextResponse.json(
        {
          error: "Google Sheets connection required",
          code: "GOOGLE_NOT_CONNECTED",
          details: "Please connect your Google account to publish forms.",
          action: "connect_google",
        },
        { status: 403 },
      );
    }

    const sheetsService = new GoogleSheetsService(googleClient);

    // Check if form has meeting fields
    const hasMeetingField = (form as any).fields.some(
      (field: any) => field.type === "meeting",
    );

    // Check if user has enabled meeting booking in form settings
    const meetingBookingEnabled =
      (form as any).settings?.meetingBookingEnabled || false;

    const results: any = {};

    // 1. Create Google Sheet (REQUIRED - core feature)
    if (!(form as any).default_sheet_connection_id) {
      try {
        console.log("Creating Google Sheet for form submissions...");
        const headers = (form as any).fields.map((f: any) => f.label);
        const newSheet = await sheetsService.createSheet(
          `${(form as any).title} - Responses`,
          headers,
        );

        if (newSheet.spreadsheetId && newSheet.spreadsheetUrl) {
          const { data: connection, error: connectionError } = await (
            supabaseAdmin as any
          )
            .from("sheet_connections")
            .insert({
              user_id: userId,
              sheet_id: newSheet.spreadsheetId,
              sheet_url: newSheet.spreadsheetUrl,
              sheet_name: `${(form as any).title} - Responses`,
            })
            .select()
            .single();

          if (connectionError) {
            console.error("Failed to save sheet connection:", connectionError);
            throw connectionError;
          }

          await (supabaseAdmin as any)
            .from("forms")
            .update({ default_sheet_connection_id: (connection as any).id })
            .eq("id", formId);

          results.sheet = {
            id: newSheet.spreadsheetId,
            url: newSheet.spreadsheetUrl,
            created: true,
          };
          console.log("✅ Google Sheet created:", newSheet.spreadsheetUrl);
        } else {
          throw new Error("Failed to create Google Sheet");
        }
      } catch (error) {
        console.error("❌ Error creating Google Sheet:", error);
        return NextResponse.json(
          {
            error: "Failed to create Google Sheet",
            details: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 },
        );
      }
    } else {
      results.sheet = {
        connected: true,
        message: "Sheet already connected",
      };
      console.log("ℹ️ Sheet already connected to form");
    }

    // 2. Enable meeting booking if meeting field exists
    if (hasMeetingField) {
      const meetingSettings = {
        enabled: true,
        calendarId: (form as any).default_calendar_id || null,
        duration: 60, // Default 60 minutes
        bufferTime: 15, // Default 15 minutes buffer
        timeSlots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"], // Default slots
      };

      await (supabaseAdmin as any)
        .from("forms")
        .update({
          meeting_settings: meetingSettings,
          status: "published",
        })
        .eq("id", formId);

      results.meeting = {
        enabled: true,
        settings: meetingSettings,
      };
      console.log("✓ Meeting booking enabled");
    }

    // 4. Update form status to published
    if (!hasMeetingField) {
      await (supabaseAdmin as any)
        .from("forms")
        .update({ status: "published" })
        .eq("id", formId);
    }

    console.log("✓ Form status updated to published");

    return NextResponse.json({
      success: true,
      message: "Form published successfully with Google integrations",
      results,
    });
  } catch (error) {
    console.error("Error publishing form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
