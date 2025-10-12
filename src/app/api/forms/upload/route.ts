import { NextRequest, NextResponse } from 'next/server';
import { getGoogleClient } from '@/lib/google';
import { GoogleDriveService } from '@/lib/googleDrive';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const formId = formData.get('formId') as string;
    const submissionId = formData.get('submissionId') as string;
    const userEmail = formData.get('userEmail') as string;

    if (!file || !formId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get form data to find the user and drive folder
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('user_id, drive_folder_id, title')
      .eq('id', formId)
      .single();

    if (formError || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    if (!form.drive_folder_id) {
      return NextResponse.json({ error: 'Drive folder not configured for this form' }, { status: 400 });
    }

    // Get Google client
    const googleClient = await getGoogleClient(form.user_id);
    if (!googleClient) {
      return NextResponse.json({ error: 'Google client not authenticated' }, { status: 401 });
    }

    const driveService = new GoogleDriveService(googleClient);

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload file to Google Drive
    const driveFile = await driveService.uploadFile(
      form.drive_folder_id,
      file.name,
      buffer,
      file.type
    );

    if (!driveFile.id || !driveFile.webViewLink) {
      return NextResponse.json({ error: 'Failed to upload file to Drive' }, { status: 500 });
    }

    // Store file record in database
    const { data: fileRecord, error: fileError } = await supabase
      .from('form_files')
      .insert({
        form_id: formId,
        submission_id: submissionId || null,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        drive_file_id: driveFile.id,
        drive_file_url: driveFile.webViewLink,
        uploaded_by_email: userEmail || null,
      })
      .select()
      .single();

    if (fileError) {
      console.error('Error saving file record:', fileError);
      return NextResponse.json({ error: 'Failed to save file record' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      file: {
        id: fileRecord.id,
        name: file.name,
        size: file.size,
        type: file.type,
        url: driveFile.webViewLink,
        driveId: driveFile.id
      }
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
