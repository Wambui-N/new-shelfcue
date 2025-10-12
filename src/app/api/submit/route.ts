import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getGoogleClient } from '@/lib/google'
import { GoogleSheetsService } from '@/lib/googleSheets'
import { createCalendarEventFromSubmission } from '@/lib/googleCalendar'

export async function POST(request: NextRequest) {
  try {
    const { formId, data } = await request.json()

    if (!formId || !data) {
      return NextResponse.json(
        { error: 'Form ID and data are required' },
        { status: 400 }
      )
    }

    // Verify the form exists and is published
    const { data: form, error: formError } = await supabase
      .from('forms')
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
      .eq('id', formId)
      .eq('status', 'published')
      .single()

    if (formError || !form) {
      return NextResponse.json(
        { error: 'Form not found or not published' },
        { status: 404 }
      )
    }

    // Get client IP and user agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Save the submission
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .insert({
        form_id: formId,
        data: data,
        ip_address: ipAddress,
        user_agent: userAgent
      })
      .select()
      .single()

    if (submissionError) {
      console.error('Error saving submission:', submissionError)
      return NextResponse.json(
        { error: 'Failed to save submission' },
        { status: 500 }
      )
    }

    // Handle file uploads if any
    const fileFields = form.fields.filter((field: any) => field.type === 'file')
    const uploadedFiles = []
    
    if (fileFields.length > 0) {
      // Note: In a real implementation, files would be uploaded via multipart form data
      // For now, we'll assume files are already uploaded and we have file IDs
      console.log('Form has file fields:', fileFields.map(f => f.label))
    }

    // Background tasks (don't block response)
    Promise.all([
      // Sync to Google Sheets
      (async () => {
        try {
          if (form.sheet_connections && form.user_id) {
            const sheetConnection = Array.isArray(form.sheet_connections)
              ? form.sheet_connections[0]
              : form.sheet_connections

            if (sheetConnection?.sheet_id) {
              const googleClient = await getGoogleClient(form.user_id)
              if (googleClient) {
                const sheetsService = new GoogleSheetsService(googleClient)
                
                // Convert submission data to array based on form fields order
                const rowData = form.fields.map((field: any) => 
                  data[field.id] || ''
                )
                
                await sheetsService.append(sheetConnection.sheet_id, rowData)
                console.log('✓ Synced to Google Sheets')
              }
            }
          }
        } catch (error) {
          console.error('Error syncing to Google Sheets:', error)
          // Don't fail the submission if Sheets sync fails
        }
      })(),

      // Create Calendar Event
      (async () => {
        try {
          if (form.default_calendar_id && form.user_id) {
            await createCalendarEventFromSubmission(form.user_id, formId, data)
            console.log('✓ Created calendar event')
          }
        } catch (error) {
          console.error('Error creating calendar event:', error)
          // Don't fail the submission if calendar creation fails
        }
      })()
    ]).catch(error => {
      console.error('Error in background tasks:', error)
    })

    return NextResponse.json({ 
      success: true, 
      submissionId: submission.id 
    })

  } catch (error) {
    console.error('Error in submit API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
