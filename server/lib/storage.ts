import fs from 'fs';
import path from 'path';

export interface UploadedFileResult {
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

export class StorageService {
  private static uploadDir = path.join(process.cwd(), 'uploads');

  static ensureUploadDirExists() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  static async saveLocalFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<UploadedFileResult> {
    this.ensureUploadDirExists();
    
    // Sanitize filename
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${Date.now()}_${baseName}${ext}`;
    const filePath = path.join(this.uploadDir, fileName);

    await fs.promises.writeFile(filePath, fileBuffer);

    return {
      url: `/uploads/${fileName}`,
      name: originalName,
      size: fileBuffer.length,
      mimeType,
    };
  }

  static async deleteLocalFile(fileUrl: string): Promise<boolean> {
    try {
      if (!fileUrl.startsWith('/uploads/')) return false;
      const fileName = path.basename(fileUrl);
      const filePath = path.join(this.uploadDir, fileName);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
    } catch (err) {
      console.error('Error deleting file:', err);
    }
    return false;
  }

  static validateFile(fileSize: number, mimeType: string, expectedType: 'IMAGE' | 'VIDEO' | 'PDF') {
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
    const MAX_PDF_SIZE = 25 * 1024 * 1024;   // 25MB
    const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

    if (expectedType === 'IMAGE') {
      if (!mimeType.startsWith('image/')) {
        throw new Error('Invalid image file type. Supported: PNG, JPG, JPEG, WEBP');
      }
      if (fileSize > MAX_IMAGE_SIZE) {
        throw new Error('Image file size exceeds 10MB limit.');
      }
    } else if (expectedType === 'VIDEO') {
      if (!mimeType.startsWith('video/')) {
        throw new Error('Invalid video file type. Supported: MP4, WEBM, MOV');
      }
      if (fileSize > MAX_VIDEO_SIZE) {
        throw new Error('Video file size exceeds 100MB limit.');
      }
    } else if (expectedType === 'PDF') {
      if (mimeType !== 'application/pdf') {
        throw new Error('Invalid file type. Must be a PDF document.');
      }
      if (fileSize > MAX_PDF_SIZE) {
        throw new Error('PDF file size exceeds 25MB limit.');
      }
    }
  }
}
