import { type NextRequest, NextResponse } from "next/server";
import { getGoogleClient } from "@/lib/google";
import { GoogleSheetsService } from "@/lib/googleSheets";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const { userId, title, headers, formId } = await request.json();

    if (!userId || !title) {
      return NextResponse.json(
        { error: "User ID and title are required" },
        { status: 400 },
      );
    }

    // Get Google client
    const googleClient = await getGoogleClient(userId);
    if (!googleClient) {
      return NextResponse.json(
        {
          error:
            "Google authentication required. Please connect your Google account.",
        },
        { status: 401 },
      );
    }

    // Create the sheet
    const sheetsService = new GoogleSheetsService(googleClient);
    const { spreadsheetId, spreadsheetUrl } = await sheetsService.createSheet(
      title,
      headers,
    );

    // Save sheet connection to database
    const { data: connection, error: dbError } = await supabaseAdmin
      .from("sheet_connections")
      .insert({
        user_id: userId,
        sheet_id: spreadsheetId,
        sheet_name: title,
        sheet_url: spreadsheetUrl,
        form_id: "", // Placeholder - this will be updated when linked to a form
      })
      .select()
      .single();

    if (dbError) {
      const message =
        typeof dbError?.message === "string" ? dbError.message : "";
      const details =
        typeof dbError?.details === "string" ? dbError.details : "";
      const isSchemaCacheIssue =
        `${message} ${details}`.toLowerCase().includes("schema cache");

      console.error("Error saving sheet connection:", dbError);

      // If PostgREST schema cache is broken, fall back to storing on the form settings.
      if (isSchemaCacheIssue && formId) {
        console.warn(
          "⚠️ Schema cache issue saving sheet_connections; storing on form settings instead.",
        );

        const { data: form } = await supabaseAdmin
          .from("forms")
          .select("settings")
          .eq("id", formId)
          .eq("user_id", userId)
          .maybeSingle();

        const existingSettings = (form?.settings ?? {}) as Record<string, unknown>;
        const nextSettings = {
          ...existingSettings,
          google: {
            ...((existingSettings as any).google ?? {}),
            sheet: {
              spreadsheetId,
              spreadsheetUrl,
              sheetName: title,
              createdAt: new Date().toISOString(),
            },
          },
        };

        await supabaseAdmin
          .from("forms")
          .update({ settings: nextSettings })
          .eq("id", formId)
          .eq("user_id", userId);

        return NextResponse.json({
          success: true,
          spreadsheetId,
          spreadsheetUrl,
          connectionId: null,
          storedOnFormSettings: true,
        });
      }

      throw dbError;
    }

    // If formId provided, link the sheet to the form
    if (formId && connection) {
      await supabaseAdmin
        .from("forms")
        .update({ default_sheet_connection_id: connection.id })
        .eq("id", formId)
        .eq("user_id", userId);
    }

    return NextResponse.json({
      success: true,
      spreadsheetId,
      spreadsheetUrl,
      connectionId: connection.id,
    });
  } catch (error: unknown) {
    console.error("Error in create sheet API:", error);
    const message =
      (error as { message?: string })?.message ||
      "Failed to create Google Sheet";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
