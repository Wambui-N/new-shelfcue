import { NextRequest, NextResponse } from 'next/server';
import { getGoogleClient } from '@/lib/google';
import { GoogleSheetsService } from '@/lib/googleSheets';
import { GoogleDriveService } from '@/lib/googleDrive';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { formId, userId } = await request.json();

    if (!formId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get form data
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('*')
      .eq('id', formId)
      .eq('user_id', userId)
      .single();

    if (formError || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Get Google client
    const googleClient = await getGoogleClient(userId);
    if (!googleClient) {
      return NextResponse.json({ error: 'Google client not authenticated' }, { status: 401 });
    }

    const sheetsService = new GoogleSheetsService(googleClient);
    const driveService = new GoogleDriveService(googleClient);

    // Check if form has meeting or file fields
    const hasMeetingField = form.fields.some((field: any) => field.type === 'meeting');
    const hasFileField = form.fields.some((field: any) => field.type === 'file');

    // Check if user has enabled meeting booking in form settings
    const meetingBookingEnabled = form.settings?.meetingBookingEnabled || false;

    const results: any = {};

    // 1. Create Google Sheet if not already connected
    if (!form.default_sheet_connection_id) {
      try {
        const headers = ['Timestamp', ...form.fields.map((f: any) => f.label)];
        const newSheet = await sheetsService.createSheet(`${form.title} - Responses`, headers);

        if (newSheet.spreadsheetId && newSheet.spreadsheetUrl) {
          const { data: connection, error: connectionError } = await supabase
            .from('sheet_connections')
            .insert({
              user_id: userId,
              sheet_id: newSheet.spreadsheetId,
              sheet_url: newSheet.spreadsheetUrl,
              sheet_name: `${form.title} - Responses`,
            })
            .select()
            .single();

          if (!connectionError) {
            await supabase
              .from('forms')
              .update({ default_sheet_connection_id: connection.id })
              .eq('id', formId);

            results.sheet = {
              id: newSheet.spreadsheetId,
              url: newSheet.spreadsheetUrl,
              created: true
            };
          }
        }
      } catch (error) {
        console.error('Error creating Google Sheet:', error);
        results.sheet = { error: 'Failed to create sheet' };
      }
    } else {
      results.sheet = { connected: true };
    }

    // 2. Create Google Drive folder ONLY if form has file upload fields
    if (hasFileField && !form.drive_folder_id) {
      try {
        const folder = await driveService.createFolder(`${form.title} - Files`);

        if (folder.id) {
          await supabase
            .from('forms')
            .update({ drive_folder_id: folder.id })
            .eq('id', formId);

          results.drive = {
            id: folder.id,
            url: folder.webViewLink,
            created: true
          };
          console.log('✓ Google Drive folder created for file uploads');
        }
      } catch (error) {
        console.error('Error creating Drive folder:', error);
        results.drive = { error: 'Failed to create folder' };
      }
    } else if (hasFileField && form.drive_folder_id) {
      results.drive = { connected: true };
    } else {
      console.log('ℹ️ No file upload fields found - skipping Drive folder creation');
    }

    // 3. Enable meeting booking if meeting field exists
    if (hasMeetingField) {
      const meetingSettings = {
        enabled: true,
        calendarId: form.default_calendar_id || null,
        duration: 60, // Default 60 minutes
        bufferTime: 15, // Default 15 minutes buffer
        timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'], // Default slots
      };

      await supabase
        .from('forms')
        .update({ 
          meeting_settings: meetingSettings,
          status: 'published'
        })
        .eq('id', formId);

      results.meeting = {
        enabled: true,
        settings: meetingSettings
      };
    }

    // 4. Update form status to published
    if (!hasMeetingField) {
      await supabase
        .from('forms')
        .update({ status: 'published' })
        .eq('id', formId);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Form published successfully with Google integrations',
      results
    });

  } catch (error) {
    console.error('Error publishing form:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
