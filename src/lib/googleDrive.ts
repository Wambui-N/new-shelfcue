import { google, Auth } from 'googleapis';

export class GoogleDriveService {
  private drive: ReturnType<typeof google.drive>;

  constructor(auth: Auth.OAuth2Client) {
    this.drive = google.drive({ version: 'v3', auth });
  }

  async createFolder(name: string, parentId?: string) {
    const resource = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      ...(parentId && { parents: [parentId] }),
    };

    const { data } = await this.drive.files.create({
      resource,
      fields: 'id,name,webViewLink',
    });

    return data;
  }

  async getFolderContents(folderId: string) {
    const { data } = await this.drive.files.list({
      q: `'${folderId}' in parents`,
      fields: 'files(id,name,mimeType,createdTime)',
    });

    return data.files;
  }

  async uploadFile(folderId: string, fileName: string, fileContent: Buffer, mimeType: string) {
    const resource = {
      name: fileName,
      parents: [folderId],
    };

    const { data } = await this.drive.files.create({
      resource,
      media: {
        mimeType,
        body: fileContent,
      },
      fields: 'id,name,webViewLink',
    });

    return data;
  }

  async setFolderPermissions(folderId: string, emailAddress: string, role: 'reader' | 'writer' = 'writer') {
    const { data } = await this.drive.permissions.create({
      fileId: folderId,
      resource: {
        role,
        type: 'user',
        emailAddress,
      },
    });

    return data;
  }
}
