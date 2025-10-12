import { GoogleAPIClient } from './google'

export class GoogleSheetsService {
  private client: GoogleAPIClient

  constructor(client: GoogleAPIClient) {
    this.client = client
  }

  /**
   * Create a new Google Sheet
   */
  async createSheet(title: string, headers?: string[]) {
    try {
      const sheets = this.client.getSheets()

      // Create a new spreadsheet
      const response = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: title,
          },
          sheets: [
            {
              properties: {
                title: 'Form Responses',
              },
            },
          ],
        },
      })

      const spreadsheetId = response.data.spreadsheetId

      // If headers provided, add them as the first row
      if (headers && headers.length > 0 && spreadsheetId) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: 'Form Responses!A1',
          valueInputOption: 'RAW',
          requestBody: {
            values: [['Timestamp', ...headers]],
          },
        })
      }

      return {
        spreadsheetId: spreadsheetId!,
        spreadsheetUrl: response.data.spreadsheetUrl!,
      }
    } catch (error) {
      console.error('Error creating Google Sheet:', error)
      throw error
    }
  }

  /**
   * Get list of user's spreadsheets
   */
  async getSheets() {
    try {
      const drive = this.client.getDrive()

      const response = await drive.files.list({
        q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
        fields: 'files(id, name, createdTime, modifiedTime, webViewLink)',
        orderBy: 'modifiedTime desc',
        pageSize: 50,
      })

      return response.data.files || []
    } catch (error) {
      console.error('Error fetching Google Sheets:', error)
      throw error
    }
  }

  /**
   * Append data to a Google Sheet
   */
  async append(spreadsheetId: string, data: any[], sheetName: string = 'Form Responses') {
    try {
      const sheets = this.client.getSheets()

      // Add timestamp as first column
      const timestamp = new Date().toISOString()
      const rowData = [timestamp, ...data]

      const response = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:A`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [rowData],
        },
      })

      return response.data
    } catch (error) {
      console.error('Error appending to Google Sheet:', error)
      throw error
    }
  }

  /**
   * Get spreadsheet details
   */
  async getSpreadsheetDetails(spreadsheetId: string) {
    try {
      const sheets = this.client.getSheets()

      const response = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: 'properties,sheets.properties',
      })

      return response.data
    } catch (error) {
      console.error('Error getting spreadsheet details:', error)
      throw error
    }
  }

  /**
   * Update sheet headers based on form fields
   */
  async updateHeaders(spreadsheetId: string, headers: string[], sheetName: string = 'Form Responses') {
    try {
      const sheets = this.client.getSheets()

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Timestamp', ...headers]],
        },
      })

      return true
    } catch (error) {
      console.error('Error updating sheet headers:', error)
      throw error
    }
  }
}

