import { NextRequest, NextResponse } from 'next/server'
import { getGoogleClient } from '@/lib/google'
import { GoogleSheetsService } from '@/lib/googleSheets'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId, title, headers, formId } = await request.json()

    if (!userId || !title) {
      return NextResponse.json(
        { error: 'User ID and title are required' },
        { status: 400 }
      )
    }

    // Get Google client
    const googleClient = await getGoogleClient(userId)
    if (!googleClient) {
      return NextResponse.json(
        { error: 'Google authentication required. Please connect your Google account.' },
        { status: 401 }
      )
    }

    // Create the sheet
    const sheetsService = new GoogleSheetsService(googleClient)
    const { spreadsheetId, spreadsheetUrl } = await sheetsService.createSheet(title, headers)

    // Save sheet connection to database
    const { data: connection, error: dbError } = await supabase
      .from('sheet_connections')
      .insert({
        user_id: userId,
        sheet_id: spreadsheetId,
        sheet_url: spreadsheetUrl,
        sheet_name: title,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Error saving sheet connection:', dbError)
      throw dbError
    }

    // If formId provided, link the sheet to the form
    if (formId && connection) {
      await supabase
        .from('forms')
        .update({ default_sheet_connection_id: connection.id })
        .eq('id', formId)
        .eq('user_id', userId)
    }

    return NextResponse.json({
      success: true,
      spreadsheetId,
      spreadsheetUrl,
      connectionId: connection.id,
    })
  } catch (error: any) {
    console.error('Error in create sheet API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create Google Sheet' },
      { status: 500 }
    )
  }
}

