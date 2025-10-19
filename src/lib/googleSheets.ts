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
      
      const sheets = this.client.getSheets();
      console.log("✅ Google Sheets API client initialized");

      // Create a new spreadsheet
      console.log("🚀 Creating spreadsheet...");
      const response = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: title,
          },
          sheets: [
            {
              properties: {
                title: "Form Responses",
              },
            },
          ],
        },
      });

      console.log("✅ Spreadsheet created:", response.data.spreadsheetId);
      const spreadsheetId = response.data.spreadsheetId;

      // If headers provided, add them as the first row
      if (headers && headers.length > 0 && spreadsheetId) {
        console.log("📝 Adding headers to sheet...");
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: "Form Responses!A1",
          valueInputOption: "RAW",
          requestBody: {
            values: [["Submitted at", ...headers]],
          },
        });
        console.log("✅ Headers added successfully");
      }

      console.log("✅ Google Sheet creation complete");
      return {
        spreadsheetId: spreadsheetId!,
        spreadsheetUrl: response.data.spreadsheetUrl!,
      };
    } catch (error: any) {
      console.error("❌ Error creating Google Sheet:", error);
      
      // Log detailed error information
      if (error.response) {
        console.error("Google API Error:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });
      }
      
      if (error.message) {
        console.error("Error message:", error.message);
      }
      
      throw error;
    }
  }

  /**
   * Get list of user's spreadsheets
   */
  async getSheets() {
    try {
      const drive = this.client.getDrive();

      const response = await drive.files.list({
        q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
        fields: "files(id, name, createdTime, modifiedTime, webViewLink)",
        orderBy: "modifiedTime desc",
        pageSize: 50,
      });

      return response.data.files || [];
    } catch (error) {
      console.error("Error fetching Google Sheets:", error);
      throw error;
    }
  }

  /**
   * Append data to a Google Sheet
   */
  async append(
    spreadsheetId: string,
    data: any[],
    sheetName: string = "Form Responses",
  ) {
    try {
      const sheets = this.client.getSheets();

      // Add timestamp as first column in DD/MM/YYYY format
      const timestamp = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
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
    sheetName: string = "Form Responses",
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
