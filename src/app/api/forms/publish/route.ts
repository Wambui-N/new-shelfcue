import { type NextRequest, NextResponse } from "next/server";
import { canPerformAction } from "@/lib/subscriptionLimits";
import { getGoogleClient } from "@/lib/google";
import { GoogleSheetsService } from "@/lib/googleSheets";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getPostHogClient } from "@/lib/posthog-server";

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

    // Optimized: Use shorter delays and fewer attempts for better performance
    // Reduced from 2000 * attempt to 1000 * attempt, max from 12000 to 6000
    const delayMs = Math.min(1000 * attempt, 6000);
    console.log(
      `⚠️ [${opts.label}] Schema cache issue (attempt ${attempt}/${opts.maxAttempts}). Waiting ${delayMs}ms then retrying...`,
    );
    await sleep(delayMs);
  }

  return { data: null, error: lastError };
}

export async function POST(request: NextRequest) {
  const apiStartTime = Date.now();
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

    // Get form data with retry logic for database consistency and schema cache errors
    const formFetchStartTime = Date.now();
    const formResult = await withSchemaCacheRetry<any>({
      label: "forms.get.for_publish",
      maxAttempts: 5,
      fn: async () =>
        (supabaseAdmin as any)
          .from("forms")
          .select("*")
          .eq("id", formId)
          .eq("user_id", userId)
          .maybeSingle(),
    });

    const form = formResult.data;
    const formError = formResult.error;

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
    const formFetchEndTime = Date.now();
    console.log(`⏱️ Form fetch took ${formFetchEndTime - formFetchStartTime}ms`);

    // Get Google client - REQUIRED for publishing
    console.log("🔍 Getting Google client for user:", userId);
    const googleClientStartTime = Date.now();
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
    const googleClientEndTime = Date.now();
    console.log(`⏱️ Google client fetch took ${googleClientEndTime - googleClientStartTime}ms`);

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
    const existingSettings = ((form as any).settings ?? {}) as Record<
      string,
      unknown
    >;
    const existingSheetFromSettings =
      (existingSettings as any)?.google?.sheet ?? null;

    const existingSpreadsheetId =
      typeof existingSheetFromSettings?.spreadsheetId === "string"
        ? existingSheetFromSettings.spreadsheetId
        : typeof existingSheetFromSettings?.sheet_id === "string"
          ? existingSheetFromSettings.sheet_id
          : null;

    const existingSpreadsheetUrl =
      typeof existingSheetFromSettings?.spreadsheetUrl === "string"
        ? existingSheetFromSettings.spreadsheetUrl
        : typeof existingSheetFromSettings?.sheet_url === "string"
          ? existingSheetFromSettings.sheet_url
          : null;

    if (!(form as any).default_sheet_connection_id && !existingSpreadsheetId) {
      const sheetCreationStartTime = Date.now();
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
          // Always store a copy on the form settings so we can operate even if
          // PostgREST schema cache breaks access to `sheet_connections`.
          const nextSettings = {
            ...existingSettings,
            google: {
              ...((existingSettings as any).google ?? {}),
              sheet: {
                spreadsheetId: newSheet.spreadsheetId,
                spreadsheetUrl: newSheet.spreadsheetUrl,
                sheetName: `${(form as any).title} - Responses`,
                createdAt: new Date().toISOString(),
              },
            },
          };

          const settingsUpdateResult = await withSchemaCacheRetry<any>({
            label: "forms.update.settings.google.sheet",
            maxAttempts: 5,
            fn: async () =>
              (supabaseAdmin as any)
                .from("forms")
                .update({ settings: nextSettings })
                .eq("id", formId)
                .select("id, settings")
                .maybeSingle(),
          });

          if (settingsUpdateResult.error) {
            console.error(
              "❌ Failed to save sheet info on form settings:",
              settingsUpdateResult.error,
            );
          } else if (settingsUpdateResult.data) {
            // Verify the settings were actually saved
            const savedSettings = settingsUpdateResult.data.settings as any;
            const savedSheet = savedSettings?.google?.sheet;
            console.log("✅ Settings update result:", {
              formId: settingsUpdateResult.data.id,
              hasGoogleSheet: !!savedSheet,
              spreadsheetId: savedSheet?.spreadsheetId || savedSheet?.sheet_id,
            });
            
            if (!savedSheet?.spreadsheetId && !savedSheet?.sheet_id) {
              console.error("❌ WARNING: Settings update succeeded but sheet info not found in saved data!");
              console.error("Expected settings:", JSON.stringify(nextSettings, null, 2));
              console.error("Actual saved settings:", JSON.stringify(savedSettings, null, 2));
            }
          }

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
            maxAttempts: 5,
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
              // If schema cache is broken for `sheet_connections`, continue anyway:
              // we already stored spreadsheetId/url on the form settings.
              console.warn(
                "⚠️ Schema cache issue writing sheet_connections; continuing using form.settings.google.sheet fallback.",
              );

              results.sheet = {
                id: newSheet.spreadsheetId,
                url: newSheet.spreadsheetUrl,
                created: true,
                storedOnFormSettings: true,
              };
              console.log(
                "✅ Google Sheet created (fallback stored on form settings):",
                newSheet.spreadsheetUrl,
              );
              // Skip the rest of the DB linkage steps.
              connectionError.message = "";
              connectionError.details = "";
              // Continue execution (do not throw).
              // eslint-disable-next-line no-empty
              {
              }
            } else {
              throw connectionError;
            }
          }

          if (connection) {
            console.log("✅ Sheet connection saved:", connection);

            console.log("📝 Updating form with sheet connection ID...");
            const formUpdateResult = await withSchemaCacheRetry<any>({
              label: "forms.update.default_sheet_connection_id",
              maxAttempts: 5,
              fn: async () =>
                (supabaseAdmin as any)
                  .from("forms")
                  .update({
                    default_sheet_connection_id: (connection as any).id,
                  })
                  .eq("id", formId)
                  .select("id")
                  .maybeSingle(),
            });

            const formUpdateError = formUpdateResult.error;

            if (formUpdateError) {
              console.error("❌ Failed to update form:", formUpdateError);
              // Do not fail publish if we at least stored the sheet on settings.
            } else {
              console.log("✅ Form updated with sheet connection");
              
              // Verify the update was successful
              const verifyResult = await (supabaseAdmin as any)
                .from("forms")
                .select("id, default_sheet_connection_id, settings")
                .eq("id", formId)
                .maybeSingle();
              
              if (verifyResult.data) {
                console.log("🔍 Verification - Form data after update:", {
                  default_sheet_connection_id: verifyResult.data.default_sheet_connection_id,
                  hasSettingsGoogleSheet: !!(verifyResult.data.settings as any)?.google?.sheet,
                  settingsGoogleSheetId: (verifyResult.data.settings as any)?.google?.sheet?.spreadsheetId,
                });
              }
            }

            results.sheet = {
              id: newSheet.spreadsheetId,
              url: newSheet.spreadsheetUrl,
              created: true,
            };
            const sheetCreationEndTime = Date.now();
            console.log("✅ Google Sheet created:", newSheet.spreadsheetUrl);
            console.log(`⏱️ Sheet creation took ${sheetCreationEndTime - sheetCreationStartTime}ms`);
          }

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
        ...(existingSpreadsheetId
          ? {
              id: existingSpreadsheetId,
              url: existingSpreadsheetUrl,
              from: "form_settings",
            }
          : {}),
      };
      console.log("ℹ️ Sheet already connected to form");
    }

    // 2. Enable meeting booking if meeting field exists
    if (hasMeetingField) {
      // Get duration and bufferTime from the meeting field settings
      const meetingField = (form.fields as any[])?.find(
        (f: any) => f.type === "meeting",
      );
      
      console.log("📅 Meeting field found:", {
        fieldId: meetingField?.id,
        fieldType: meetingField?.type,
        meetingSettings: meetingField?.meetingSettings,
        fullField: JSON.stringify(meetingField, null, 2),
      });
      
      const fieldDuration = meetingField?.meetingSettings?.duration || 60;
      const fieldBufferTime = meetingField?.meetingSettings?.bufferTime || 0;
      const fieldStartHour = meetingField?.meetingSettings?.startHour ?? 9;
      const fieldEndHour = meetingField?.meetingSettings?.endHour ?? 17;

      console.log("📅 Duration, buffer, and time range values:", {
        fieldDuration,
        fieldBufferTime,
        fieldStartHour,
        fieldEndHour,
        usingDefaults: !meetingField?.meetingSettings,
      });

      const formSettings = ((form as any).settings ?? {}) as Record<
        string,
        unknown
      >;
      const formTimezone =
        (formSettings as any)?.timezone ||
        (formSettings as any)?.time_zone ||
        null;

      const meetingSettings = {
        enabled: true,
        calendarId: (form as any).default_calendar_id || null,
        duration: fieldDuration,
        bufferTime: fieldBufferTime,
        timeZone: formTimezone,
        startHour: fieldStartHour,
        endHour: fieldEndHour,
      };

      console.log("📅 Saving meeting settings:", meetingSettings);

      const meetingUpdateResult = await withSchemaCacheRetry<any>({
        label: "forms.update.meeting_settings",
        maxAttempts: 5,
        fn: async () =>
          (supabaseAdmin as any)
            .from("forms")
            .update({
              meeting_settings: meetingSettings,
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

    // 4. Always update form status to published at the end (unified for all forms)
    console.log("📝 Updating form status to published...");
    const statusUpdateResult = await withSchemaCacheRetry<any>({
      label: "forms.update.status.published",
      maxAttempts: 5,
      fn: async () =>
        (supabaseAdmin as any)
          .from("forms")
          .update({ status: "published" })
          .eq("id", formId)
          .select("id, status")
          .maybeSingle(),
    });

    if (statusUpdateResult.error || !statusUpdateResult.data) {
      const errorMsg = statusUpdateResult.error?.message || "Unknown error";
      console.error("❌ Failed to update form status:", statusUpdateResult.error);
      throw new Error(`Failed to update form status: ${errorMsg}`);
    }

    // Verify status was actually updated
    if (statusUpdateResult.data.status !== "published") {
      console.error(
        "❌ Form status verification failed:",
        statusUpdateResult.data.status,
      );
      throw new Error(
        "Form status verification failed after update. The form may not be fully published.",
      );
    }

    console.log("✓ Form status updated to published and verified");
    
    // Final verification: Fetch the complete form to verify all data is saved
    const finalVerifyResult = await withSchemaCacheRetry<any>({
      label: "forms.get.final_verification",
      maxAttempts: 3,
      fn: async () =>
        (supabaseAdmin as any)
          .from("forms")
          .select("id, status, default_sheet_connection_id, settings")
          .eq("id", formId)
          .maybeSingle(),
    });
    
    if (finalVerifyResult.data) {
      const finalForm = finalVerifyResult.data;
      const finalSettings = (finalForm.settings as any) ?? {};
      const finalSheet = finalSettings?.google?.sheet;
      
      console.log("🔍 Final verification - Complete form data:", {
        id: finalForm.id,
        status: finalForm.status,
        default_sheet_connection_id: finalForm.default_sheet_connection_id,
        hasGoogleSheetInSettings: !!finalSheet,
        spreadsheetId: finalSheet?.spreadsheetId || finalSheet?.sheet_id || "NOT FOUND",
        spreadsheetUrl: finalSheet?.spreadsheetUrl || finalSheet?.sheet_url || "NOT FOUND",
      });
      
      if (!finalSheet?.spreadsheetId && !finalSheet?.sheet_id && !finalForm.default_sheet_connection_id) {
        console.error("❌ CRITICAL: No sheet connection found in final verification!");
        console.error("This means the sheet was not properly saved to the database.");
      }
    } else {
      console.error("❌ Failed to verify form data after publish:", finalVerifyResult.error);
    }
    const apiEndTime = Date.now();
    console.log(`⏱️ Total publish API time: ${apiEndTime - apiStartTime}ms`);

    // PostHog: Capture form_published event (server-side)
    try {
      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: userId,
        event: "form_published",
        properties: {
          form_id: formId,
          form_title: (form as any).title,
          has_meeting_field: hasMeetingField,
          field_count: (form as any).fields.length,
          has_google_sheet: !!results.sheet?.id || !!results.sheet?.connected,
        },
      });
      await posthog.shutdown();
    } catch (posthogError) {
      console.warn("PostHog capture failed:", posthogError);
    }

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
