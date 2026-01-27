import type { GoogleAPIClient } from "./google";

export class GoogleSheetsService {
  private client: GoogleAPIClient;

  constructor(client: GoogleAPIClient) {
    this.client = client;
  }

  /**
   * Create a new Google Sheet
   */
  async createSheet(title: string, headers?: string[]) {
    try {
      console.log("🔵 Starting Google Sheet creation...");
      console.log("📝 Sheet title:", title);
      console.log("📊 Headers:", headers);

      const drive = this.client.getDrive();
      console.log("✅ Google Drive API client initialized");

      // Create a new spreadsheet using Drive API
      console.log("🚀 Creating spreadsheet with Drive API...");
      const response = await drive.files.create({
        requestBody: {
          name: title,
          mimeType: "application/vnd.google-apps.spreadsheet",
        },
        fields: "id, name, webViewLink",
      });

      const spreadsheetId = response.data.id ?? null;
      const spreadsheetUrl =
        response.data.webViewLink ??
        (spreadsheetId
          ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
          : null);

      console.log("✅ Spreadsheet created:", spreadsheetId);

      if (!spreadsheetId || !spreadsheetUrl) {
        throw new Error(
          "Google Drive API did not return spreadsheet identifiers.",
        );
      }

      // If headers provided, add them as the first row using Sheets API
      // Files created by the app are automatically accessible with drive.file scope
      if (headers && headers.length > 0 && spreadsheetId) {
        console.log("📝 Adding headers to sheet...");
        try {
          const sheets = this.client.getSheets();
          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: "Sheet1!A1",
            valueInputOption: "RAW",
            requestBody: {
              values: [["Submitted at", ...headers]],
            },
          });
          console.log("✅ Headers added successfully");
        } catch (headerError: any) {
          // Log but don't fail - spreadsheet is created, headers can be added later
          console.warn(
            "⚠️ Failed to write headers (may need spreadsheets scope or file access):",
            headerError?.message || headerError,
          );
          // Continue - spreadsheet is still usable, headers can be added manually if needed
        }
      }

      console.log("✅ Google Sheet creation complete");
      return {
        spreadsheetId,
        spreadsheetUrl,
      };
    } catch (error: unknown) {
      console.error("❌ Error creating Google Sheet:", error);

      // Log detailed error information
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (
          error as {
            response?: { status?: number; statusText?: string; data?: unknown };
          }
        ).response
      ) {
        const response = (
          error as {
            response: { status?: number; statusText?: string; data?: unknown };
          }
        ).response;
        console.error("Google API Error:", {
          status: response.status,
          statusText: response.statusText,
          data: response.data,
        });
      }

      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: string }).message === "string"
      ) {
        console.error("Error message:", (error as { message: string }).message);
      }

      throw error;
    }
  }

  /**
   * Append data to a Google Sheet
   */
  async append(
    spreadsheetId: string,
    data: unknown[],
    options: {
      sheetName?: string;
      timeZone?: string;
    } = {},
  ) {
    try {
      // Files created by the app are automatically accessible with drive.file scope
      // No need to verify access - directly use Sheets API
      const sheets = this.client.getSheets();
      const sheetName = options.sheetName ?? "Sheet1";
      const timeZone =
        options.timeZone ??
        process.env.FORM_SUBMISSION_TIMEZONE ??
        process.env.TZ ??
        Intl.DateTimeFormat().resolvedOptions().timeZone ??
        "UTC";

      // Add timestamp as first column in DD/MM/YYYY format
      const timestampFormatter = new Intl.DateTimeFormat("en-GB", {
        timeZone,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const timestamp = timestampFormatter.format(new Date());
      const rowData = [timestamp, ...data];

      const response = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:A`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: [rowData],
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error appending to Google Sheet:", error);
      throw error;
    }
  }

  /**
   * Get spreadsheet details
   */
  async getSpreadsheetDetails(spreadsheetId: string) {
    try {
      const sheets = this.client.getSheets();

      const response = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: "properties,sheets.properties",
      });

      return response.data;
    } catch (error) {
      console.error("Error getting spreadsheet details:", error);
      throw error;
    }
  }

  /**
   * Update sheet headers based on form fields
   */
  async updateHeaders(
    spreadsheetId: string,
    headers: string[],
    sheetName: string = "Sheet1",
  ) {
    try {
      const sheets = this.client.getSheets();

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: "RAW",
        requestBody: {
          values: [["Submitted at", ...headers]],
        },
      });

      return true;
    } catch (error) {
      console.error("Error updating sheet headers:", error);
      throw error;
    }
  }
}
