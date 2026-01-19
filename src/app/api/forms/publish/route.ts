import { type NextRequest, NextResponse } from "next/server";
import { canPerformAction } from "@/lib/subscriptionLimits";
import { getGoogleClient } from "@/lib/google";
import { GoogleSheetsService } from "@/lib/googleSheets";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

function isSchemaCacheError(
  error: { message?: string; details?: string } | null,
) {
  if (!error) return false;
  return (
    error.message?.toLowerCase().includes("schema cache") ||
    error.details?.toLowerCase().includes("schema cache")
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withSchemaCacheRetry<T>(opts: {
  label: string;
  maxAttempts: number;
  fn: () => Promise<{ data: T | null; error: any }>;
}) {
  let lastError: any = null;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    const result = await opts.fn();
    if (result.data) return result;
    lastError = result.error;

    if (!isSchemaCacheError(lastError)) {
      return { data: null, error: lastError };
    }

    const delayMs = Math.min(2000 * attempt, 12000);
    console.log(
      `⚠️ [${opts.label}] Schema cache issue (attempt ${attempt}/${opts.maxAttempts}). Waiting ${delayMs}ms then retrying...`,
    );
    await sleep(delayMs);
  }

  return { data: null, error: lastError };
}

export async function POST(request: NextRequest) {
  try {
    const { formId, userId } = await request.json();

    if (!formId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if user can receive submissions (subscription check)
    const limitCheck = await canPerformAction(userId, "submissions_per_month");
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: "Subscription required",
          message:
            limitCheck.message ||
            "Your trial has expired. Please subscribe to publish forms and receive submissions.",
        },
        { status: 403 },
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
    console.log("🔍 Getting Google client for user:", userId);
    let googleClient: Awaited<ReturnType<typeof getGoogleClient>> | null = null;
    try {
      googleClient = await getGoogleClient(userId);
      console.log("🔍 Google client result:", !!googleClient);
    } catch (error) {
      console.log("❌ Google not connected - exception:", error);
      return NextResponse.json(
        {
          error: "Google Sheets connection required",
          code: "GOOGLE_NOT_CONNECTED",
          details:
            "Please reconnect your Google account to publish forms. This allows automatic syncing of form submissions to Google Sheets.",
          action: "reconnect_google",
        },
        { status: 403 },
      );
    }

    if (!googleClient) {
      console.log("❌ Google client is null - tokens not found");
      return NextResponse.json(
        {
          error: "Google authentication expired or missing",
          code: "GOOGLE_TOKENS_MISSING",
          details:
            "Your Google authentication has expired or is missing. Please reconnect your Google account to continue.",
          action: "reconnect_google",
        },
        { status: 403 },
      );
    }

    console.log("✅ Google client obtained successfully");

    const sheetsService = new GoogleSheetsService(googleClient);

    // Check if form has meeting fields
    const hasMeetingField = (form as any).fields.some(
      (field: any) => field.type === "meeting",
    );

    // Check if user has enabled meeting booking in form settings
    const _meetingBookingEnabled =
      (form as any).settings?.meetingBookingEnabled || false;

    const results: any = {};

    // 1. Create Google Sheet (REQUIRED - core feature)
    if (!(form as any).default_sheet_connection_id) {
      try {
        console.log("🔵 Creating Google Sheet for form submissions...");
        console.log("📊 Form fields:", (form as any).fields);

        const headers = (form as any).fields.map((f: any) => f.label);
        console.log("📋 Headers to create:", headers);

        if (hasMeetingField) {
          headers.push("Meeting Link");
          console.log("📅 Added Meeting Link header");
        }

        console.log("🚀 Calling sheetsService.createSheet...");
        const newSheet = await sheetsService.createSheet(
          `${(form as any).title} - Responses`,
          headers,
        );

        console.log("✅ Google Sheet created:", newSheet);

        if (newSheet.spreadsheetId && newSheet.spreadsheetUrl) {
          console.log("💾 Saving sheet connection to database...");
          console.log("📝 Connection data:", {
            user_id: userId,
            form_id: formId,
            sheet_id: newSheet.spreadsheetId,
            sheet_name: `${(form as any).title} - Responses`,
            sheet_url: newSheet.spreadsheetUrl,
          });

          // Try inserting with retry logic in case of schema cache issues
          const insertResult = await withSchemaCacheRetry<any>({
            label: "sheet_connections.insert",
            maxAttempts: 8,
            fn: async () =>
              (supabaseAdmin as any)
                .from("sheet_connections")
                .insert({
                  user_id: userId,
                  form_id: formId,
                  sheet_id: newSheet.spreadsheetId,
                  sheet_name: `${(form as any).title} - Responses`,
                  sheet_url: newSheet.spreadsheetUrl,
                })
                .select()
                .single(),
          });

          const connection = insertResult.data;
          const connectionError = insertResult.error;

          if (connectionError || !connection) {
            console.error(
              "❌ Failed to save sheet connection:",
              connectionError,
            );
            console.error("Connection error details:", {
              message: connectionError.message,
              details: connectionError.details,
              hint: connectionError.hint,
              code: connectionError.code,
            });

            // Provide helpful error message for schema cache issues
            if (isSchemaCacheError(connectionError)) {
              // Best-effort cleanup: avoid leaving orphan Sheets if DB write can't complete.
              try {
                console.log(
                  "🧹 Cleaning up orphaned Google Sheet due to DB failure...",
                );
                const drive = googleClient.getDrive();
                await drive.files.delete({ fileId: newSheet.spreadsheetId });
                console.log("✅ Orphaned Google Sheet deleted");
              } catch (cleanupError) {
                console.warn(
                  "⚠️ Failed to delete orphaned Google Sheet (continuing):",
                  cleanupError,
                );
              }

              throw new Error(
                "Database schema cache is out of sync. Please try again in a few moments, or contact support if the issue persists.",
              );
            }

            throw connectionError;
          }

          console.log("✅ Sheet connection saved:", connection);

          console.log("📝 Updating form with sheet connection ID...");
          const formUpdateResult = await withSchemaCacheRetry<any>({
            label: "forms.update.default_sheet_connection_id",
            maxAttempts: 6,
            fn: async () =>
              (supabaseAdmin as any)
                .from("forms")
                .update({ default_sheet_connection_id: (connection as any).id })
                .eq("id", formId)
                .select("id")
                .maybeSingle(),
          });

          const formUpdateError = formUpdateResult.error;

          if (formUpdateError) {
            console.error("❌ Failed to update form:", formUpdateError);
            throw formUpdateError;
          }

          console.log("✅ Form updated with sheet connection");

          results.sheet = {
            id: newSheet.spreadsheetId,
            url: newSheet.spreadsheetUrl,
            created: true,
          };
          console.log("✅ Google Sheet created:", newSheet.spreadsheetUrl);
        } else {
          throw new Error("Failed to create Google Sheet");
        }
      } catch (error: any) {
        console.error("❌ Error creating Google Sheet:", error);

        // Log more details about the error
        if (error.response) {
          console.error("Google API Error Response:", {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
          });
        }

        // Check if it's an authentication error
        if (error.response?.status === 401 || error.response?.status === 403) {
          return NextResponse.json(
            {
              error: "Google authentication failed",
              code: "GOOGLE_AUTH_FAILED",
              details:
                "Your Google authentication is invalid or expired. Please reconnect your Google account.",
              action: "reconnect_google",
            },
            { status: 403 },
          );
        }

        return NextResponse.json(
          {
            error: "Failed to create Google Sheet",
            details: error instanceof Error ? error.message : "Unknown error",
            errorDetails:
              error.response?.data || error.message || "No additional details",
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

      const meetingUpdateResult = await withSchemaCacheRetry<any>({
        label: "forms.update.meeting_settings",
        maxAttempts: 6,
        fn: async () =>
          (supabaseAdmin as any)
            .from("forms")
            .update({
              meeting_settings: meetingSettings,
              status: "published",
            })
            .eq("id", formId)
            .select("id")
            .maybeSingle(),
      });

      const meetingUpdateError = meetingUpdateResult.error;

      if (meetingUpdateError) {
        console.error(
          "❌ Failed to update form with meeting settings:",
          meetingUpdateError,
        );
        throw new Error(`Failed to update form: ${meetingUpdateError.message}`);
      }

      results.meeting = {
        enabled: true,
        settings: meetingSettings,
      };
      console.log("✓ Meeting booking enabled");
    }

    // 4. Update form status to published
    if (!hasMeetingField) {
      const statusUpdateResult = await withSchemaCacheRetry<any>({
        label: "forms.update.status",
        maxAttempts: 6,
        fn: async () =>
          (supabaseAdmin as any)
            .from("forms")
            .update({ status: "published" })
            .eq("id", formId)
            .select("id")
            .maybeSingle(),
      });

      const statusUpdateError = statusUpdateResult.error;

      if (statusUpdateError) {
        console.error("❌ Failed to update form status:", statusUpdateError);
        throw new Error(
          `Failed to update form status: ${statusUpdateError.message}`,
        );
      }
    }

    console.log("✓ Form status updated to published");

    return NextResponse.json({
      success: true,
      message: "Form published successfully with Google integrations",
      results,
    });
  } catch (error) {
    console.error("Error publishing form:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorDetails = error instanceof Error ? error.stack : String(error);
    console.error("Error details:", errorDetails);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: errorMessage,
        details:
          process.env.NODE_ENV === "development" ? errorDetails : undefined,
      },
      { status: 500 },
    );
  }
}
